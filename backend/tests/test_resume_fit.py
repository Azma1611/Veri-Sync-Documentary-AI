"""
VeriSync AI — Resume & Career Fit Test Suite

Covers Step 8 requirements:
1. Matching, missing skills, and partial / uncertain matches.
2. Separation of explicit resume evidence from AI-inferred skills.
3. Reproducible, explainable scoring algorithm with documented weights and missing data handling.
4. Empty documents and extraction edge cases.
5. Source references and evidence citation preservation.
6. Demo vacancy cards labeling (no fabricated real job data).
7. POST /api/v1/resumes/analyze endpoint contract and format validation.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
import docx
import fitz  # PyMuPDF

from app.main import app
from app.services.resume_extractor import (
    extract_resume,
    RawSkillToken,
    RawExperienceRecord,
    RawQualification,
    ResumeExtractionResult,
)
from app.services.skill_taxonomy import (
    get_taxonomy,
    normalize_skill_name,
    get_required_skills_set,
)
from app.services.resume_fit_engine import (
    run_resume_fit_analysis,
    parse_job_description,
    WEIGHT_REQUIRED_SKILLS,
    WEIGHT_PREFERRED_SKILLS,
    WEIGHT_EXPERIENCE,
    WEIGHT_QUALIFICATIONS,
    MAX_UNCERTAINTY_PENALTY_POINTS,
)
from app.schemas.resume import (
    MatchStatus,
    SkillConfidence,
    SkillMatch,
    SkillEvidence,
)
from app.services.history_store import history_store


@pytest.fixture
def client():
    return TestClient(app)


def _create_sample_pdf(text: str) -> bytes:
    """Create a minimal single-page PDF containing the provided text."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def _create_sample_docx(paragraphs: list[str]) -> bytes:
    """Create a minimal DOCX containing the provided paragraphs."""
    doc = docx.Document()
    for p in paragraphs:
        doc.add_paragraph(p)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ===========================================================================
# 1. Skill Taxonomy & Extraction Tests
# ===========================================================================

class TestResumeExtractorAndTaxonomy:
    def test_taxonomy_retrieval_and_normalization(self):
        tax = get_taxonomy("software-engineering")
        assert tax is not None
        assert "Python" in tax.required_skills
        assert normalize_skill_name("js", tax) == "JavaScript"
        assert normalize_skill_name("k8s", tax) == "Kubernetes"
        assert normalize_skill_name("postgres", tax) == "PostgreSQL"

    def test_extractor_identifies_skills_and_preserves_evidence(self):
        sample_text = (
            "Alice Johnson\n"
            "Senior Backend Engineer\n\n"
            "Summary:\n"
            "Experienced software engineer with 6 years building distributed APIs in Python and FastAPI.\n\n"
            "Skills:\n"
            "Python, Docker, Kubernetes, PostgreSQL, TypeScript, Git\n\n"
            "Experience:\n"
            "Senior Engineer at Acme Corp (Jan 2021 - Present)\n"
            "Developed high-throughput microservices using Docker and PostgreSQL.\n\n"
            "Education:\n"
            "B.S. in Computer Science, State University, 2018\n"
        )
        evidence_blocks = [
            {"page": 1, "text": "Experienced software engineer with 6 years building distributed APIs in Python and FastAPI."},
            {"page": 1, "text": "Skills: Python, Docker, Kubernetes, PostgreSQL, TypeScript, Git"},
            {"page": 1, "text": "Senior Engineer at Acme Corp (Jan 2021 - Present)"},
            {"page": 1, "text": "B.S. in Computer Science, State University, 2018"},
        ]

        result = extract_resume(sample_text, evidence_blocks=evidence_blocks, filename="alice_resume.pdf")

        assert result.candidate_name is not None
        assert "Alice" in result.candidate_name

        skill_tokens = [tok.token.lower() for tok in result.raw_skill_tokens]
        assert "python" in skill_tokens
        assert "docker" in skill_tokens
        assert "postgresql" in skill_tokens

        # Check evidence citation
        py_tokens = [tok for tok in result.raw_skill_tokens if tok.token.lower() == "python"]
        assert len(py_tokens) > 0
        assert py_tokens[0].page == 1
        assert "Python" in py_tokens[0].source_text


# ===========================================================================
# 2. Deterministic Scoring & Matching Engine Tests
# ===========================================================================

class TestResumeFitEngine:
    def test_reproducible_scoring(self):
        """Fit score must be 100% deterministic and reproducible across multiple runs."""
        extraction = ResumeExtractionResult(
            candidate_name="Jane Doe",
            raw_skill_tokens=[
                RawSkillToken(token="python", source_text="Skilled in Python", page=1),
                RawSkillToken(token="sql", source_text="Skilled in SQL", page=1),
                RawSkillToken(token="docker", source_text="Skilled in Docker", page=1),
            ],
            experience_records=[
                RawExperienceRecord(role_title="Software Developer", employer="Corp A", duration_months=36, page=1)
            ],
            qualification_records=[
                RawQualification(credential_name="B.S. Computer Science", page=1)
            ]
        )
        jd_text = "Required: Python, SQL, Docker. Preferred: Kubernetes. 3 years experience required."

        score_1 = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="jane.pdf",
            file_size_bytes=1024,
            career_domain="software-engineering",
            job_description=jd_text,
        )
        score_2 = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="jane.pdf",
            file_size_bytes=1024,
            career_domain="software-engineering",
            job_description=jd_text,
        )

        assert score_1.overall_fit_score == score_2.overall_fit_score
        assert score_1.score_breakdown.model_dump() == score_2.score_breakdown.model_dump()
        assert score_1.matched_skills == score_2.matched_skills
        assert score_1.missing_skills == score_2.missing_skills

    def test_missing_skills_detection(self):
        """Engine correctly identifies missing requirements against JD."""
        extraction = ResumeExtractionResult(
            candidate_name="Bob Smith",
            raw_skill_tokens=[
                RawSkillToken(token="python", source_text="Proficient in Python", page=1),
            ],
            experience_records=[],
            qualification_records=[],
        )
        jd_text = "Requirements: Python, Kubernetes, Rust, GraphQL."

        analysis = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="bob.pdf",
            file_size_bytes=500,
            career_domain="software-engineering",
            job_description=jd_text,
        )

        # Python is matched
        assert "python" in [s.lower() for s in analysis.matched_skills]
        # Kubernetes, rust, graphql should be missing
        missing_lower = [s.lower() for s in analysis.missing_skills]
        assert "kubernetes" in missing_lower
        assert "rust" in missing_lower
        assert "graphql" in missing_lower

    def test_separation_of_explicit_and_inferred_skills_and_uncertainty(self):
        """Inferred skills must be separated and apply an uncertainty penalty."""
        extraction = ResumeExtractionResult(
            candidate_name="Charlie Brown",
            raw_skill_tokens=[
                RawSkillToken(token="python", source_text="Python programming", page=1),
            ],
        )
        jd_text = "Required: Python, Django."

        # Case 1: Pure explicit match
        analysis_explicit = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="charlie.pdf",
            file_size_bytes=500,
            career_domain="software-engineering",
            job_description=jd_text,
            ai_assistance_used=False,
        )

        # Case 2: Inferred match provided by AI assistant
        inferred_match = SkillMatch(
            skill="Django",
            status=MatchStatus.matched,
            confidence=SkillConfidence.inferred,
            matched_requirement="Django",
            evidence=SkillEvidence(
                source_text="Built web applications using MTV pattern in Python",
                page=1,
            ),
        )

        analysis_with_inferred = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="charlie.pdf",
            file_size_bytes=500,
            career_domain="software-engineering",
            job_description=jd_text,
            ai_assistance_used=True,
            inferred_skill_matches=[inferred_match],
        )

        assert len(analysis_with_inferred.explicit_skills) == 1
        assert len(analysis_with_inferred.inferred_skills) == 1
        assert analysis_with_inferred.inferred_skills[0].skill == "Django"
        assert analysis_with_inferred.inferred_skills[0].confidence == SkillConfidence.inferred
        assert analysis_with_inferred.score_breakdown.uncertainty_penalty > 0

    def test_empty_document_handling(self):
        """Completely empty resume yields 0/baseline score without exceptions or crash."""
        extraction = extract_resume("", evidence_blocks=[], filename="empty.pdf")
        jd_text = "Required: Python, Docker."

        analysis = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="empty.pdf",
            file_size_bytes=0,
            career_domain="software-engineering",
            job_description=jd_text,
        )

        assert analysis.overall_fit_score <= 40
        assert len(analysis.matched_skills) == 0
        assert len(analysis.missing_skills) >= 2
        assert len(analysis.extraction_warnings) > 0

    def test_demo_vacancies_labeling_and_deterministic_scores(self):
        """Demo vacancy cards must be clearly labeled and calculated deterministically."""
        extraction = ResumeExtractionResult(
            candidate_name="Demo Candidate",
            raw_skill_tokens=[
                RawSkillToken(token="python", source_text="Python", page=1),
                RawSkillToken(token="docker", source_text="Docker", page=1),
            ],
        )

        analysis = run_resume_fit_analysis(
            extraction_result=extraction,
            file_name="demo.pdf",
            file_size_bytes=1000,
            career_domain="software-engineering",
        )

        assert len(analysis.job_matches) > 0
        for job in analysis.job_matches:
            assert job.is_demo_data is True
            assert "[Demo Vacancy]" in job.demo_label
            assert 0 <= job.match_score <= 100


# ===========================================================================
# 3. API Route POST /api/v1/resumes/analyze Tests
# ===========================================================================

class TestResumeApiEndpoint:
    def test_analyze_pdf_success(self, client):
        pdf_content = (
            "Alex Morgan\n"
            "Full Stack Engineer\n"
            "Skills: Python, TypeScript, React, PostgreSQL, Docker\n"
            "Experience: 4 years as Software Engineer at InnoTech (2020-2024)\n"
            "Education: B.S. in Computer Engineering, 2020\n"
        )
        pdf_bytes = _create_sample_pdf(pdf_content)

        response = client.post(
            "/api/v1/resumes/analyze",
            data={
                "domain": "software-engineering",
                "target_role": "Backend Engineer",
                "job_description": "Required: Python, Docker, PostgreSQL. Preferred: Redis.",
            },
            files={"file": ("alex_resume.pdf", pdf_bytes, "application/pdf")},
        )

        assert response.status_code == 200
        payload = response.json()
        assert payload["backendConnected"] is True
        assert payload["isSimulated"] is False
        data = payload["data"]

        # Validate frontend-expected contract fields
        assert "overallFitScore" in data
        assert "candidateName" in data
        assert "identifiedSkills" in data
        assert "matchedSkills" in data
        assert "missingSkills" in data
        assert "jobMatches" in data
        assert "scoreBreakdown" in data

        # Python, Docker, PostgreSQL should be in matchedSkills
        matched_lower = [s.lower() for s in data["matchedSkills"]]
        assert "python" in matched_lower
        assert "docker" in matched_lower

        # Vacancies must indicate demo status in company name
        for match in data["jobMatches"]:
            assert "[Demo Vacancy]" in match["company"]

    def test_analyze_docx_success(self, client):
        docx_paragraphs = [
            "Taylor Swift",
            "Data Scientist",
            "Skills: Python, SQL, Machine Learning, Pandas, Scikit-learn",
            "Experience: 3 years Data Analyst at Analytics Corp",
            "Education: M.S. Data Science, 2021",
        ]
        docx_bytes = _create_sample_docx(docx_paragraphs)

        response = client.post(
            "/api/v1/resumes/analyze",
            data={
                "domain": "data-ai",
                "job_description": "Required: Python, SQL. Preferred: Scikit-learn.",
            },
            files={"file": ("taylor_resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        )

        assert response.status_code == 200
        payload = response.json()
        data = payload["data"]
        assert data["overallFitScore"] > 50
        matched_lower = [s.lower() for s in data["matchedSkills"]]
        assert "python" in matched_lower
        assert "sql" in matched_lower

    def test_unsupported_file_extension_rejected(self, client):
        response = client.post(
            "/api/v1/resumes/analyze",
            data={"domain": "software-engineering"},
            files={"file": ("test.txt", b"plain text content", "text/plain")},
        )
        assert response.status_code == 422
        assert "Unsupported file" in response.json()["detail"] or "Invalid file" in response.json()["detail"]

    def test_empty_file_rejected(self, client):
        response = client.post(
            "/api/v1/resumes/analyze",
            data={"domain": "software-engineering"},
            files={"file": ("empty.pdf", b"", "application/pdf")},
        )
        assert response.status_code == 422
