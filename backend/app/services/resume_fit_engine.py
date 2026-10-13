"""
VeriSync AI — Resume Fit Engine

Deterministic scoring engine that compares extracted resume evidence against
job requirements to produce a reproducible, explainable fit score.

Scoring Algorithm (Version 1.0)
--------------------------------
The overall fit score is a weighted average of four dimensions:

  Dimension                Weight  Rationale
  ─────────────────────────────────────────────────────────────────────────
  Required skills match     0.45   Core role requirements are the primary gate.
  Preferred skills match    0.20   Nice-to-haves differentiate strong candidates.
  Experience adequacy       0.25   Seniority proxy for role expectations.
  Qualifications match      0.10   Formal credentials (when required).
  ─────────────────────────────────────────────────────────────────────────

Dimension formulas (all produce values 0.0 – 100.0):

  required_skills_score =
      If total_required == 0 → 50.0  (neutral; job desc not provided)
      Else → (matched_required / total_required) * 100

  preferred_skills_score =
      If total_preferred == 0 → 100.0  (full marks; no preferred specified)
      Else → (matched_preferred / total_preferred) * 100

  experience_score =
      If required_experience_months == 0 → 100.0  (no requirement stated)
      Else → min(candidate_months / required_months, 1.2) / 1.2 * 100
      (Capped at 100; 20% over-qualification headroom before diminishing.)

  qualifications_score =
      If required_qualifications == 0 → 100.0
      Else → (matched / required) * 100

weighted_score = sum(dimension * weight for each dimension)

Uncertainty penalty:
  Each skill counted as matched but with "inferred" or "uncertain" confidence
  represents a weaker signal. The penalty is:
    penalty = min(uncertain_count / max(total_required, 1), 0.15) * 100
    (Capped at 15 points.)

final_score = round(max(0, weighted_score - penalty))

Job description parsing
-----------------------
Required vs preferred requirements are extracted from free text using keyword
heuristics ("required:", "must have:", "nice to have:", "preferred:").
If no job description is provided, the domain taxonomy's required_skills list
is used as the implicit requirement baseline.

Demo vacancies
--------------
Two demo vacancies are generated per domain. Their match scores are computed
deterministically from the candidate's explicit skills against the vacancy's
skill list — they are NOT invented by an LLM. All records carry is_demo_data=True
and demo_label="[Demo Vacancy]".
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Tuple

from app.schemas.resume import (
    DemoJobMatch,
    ExperienceRecord,
    FitScoreBreakdown,
    MatchStatus,
    QualificationRecord,
    ResumeAnalysisResponse,
    SkillConfidence,
    SkillEvidence,
    SkillMatch,
)
from app.services.resume_extractor import (
    RawExperienceRecord,
    RawQualification,
    RawSkillToken,
    ResumeExtractionResult,
)
from app.services.skill_taxonomy import (
    DomainTaxonomy,
    get_required_skills_set,
    get_preferred_skills_set,
    get_taxonomy,
    normalize_skill_name,
)

logger = logging.getLogger("verisync.resume_fit_engine")

# ---------------------------------------------------------------------------
# Algorithm weights (documented; configurable via constants)
# ---------------------------------------------------------------------------

WEIGHT_REQUIRED_SKILLS: float = 0.45
WEIGHT_PREFERRED_SKILLS: float = 0.20
WEIGHT_EXPERIENCE: float = 0.25
WEIGHT_QUALIFICATIONS: float = 0.10

# Maximum uncertainty penalty (fraction of 100 points)
MAX_UNCERTAINTY_PENALTY_POINTS: float = 15.0


# ---------------------------------------------------------------------------
# Experience level derivation
# ---------------------------------------------------------------------------

def _derive_experience_level(total_months: int) -> str:
    """Derive an experience level label from total experience months."""
    if total_months < 18:
        return "Entry Level (< 1.5 Years)"
    elif total_months < 36:
        return "Junior Level (1.5 – 3 Years)"
    elif total_months < 60:
        return "Mid-level (3 – 5 Years)"
    elif total_months < 120:
        return "Senior Level (5 – 10 Years)"
    else:
        return "Lead / Principal (10+ Years)"


# ---------------------------------------------------------------------------
# Job description parser
# ---------------------------------------------------------------------------

_REQUIRED_SECTION_PATTERN = re.compile(
    r"""
    (?:required|must[\s\-]have|required\s+skills|requirements|
       key\s+requirements|minimum\s+qualifications)
    \s*:?\s*
    (.*?)
    (?=\n\n|\Z|preferred|nice[\s\-]to|optional|bonus)
    """,
    re.VERBOSE | re.IGNORECASE | re.DOTALL,
)

_PREFERRED_SECTION_PATTERN = re.compile(
    r"""
    (?:preferred|nice[\s\-]to[\s\-]have|bonus|plus|good\s+to\s+have|advantageous)
    \s*:?\s*
    (.*?)
    (?=\n\n|\Z|required|must[\s\-]have)
    """,
    re.VERBOSE | re.IGNORECASE | re.DOTALL,
)

_EXPERIENCE_REQUIREMENT_PATTERN = re.compile(
    r"""
    (?:\d+\+?\s*(?:to\s+\d+)?\s*(?:year|yr)s?\s*(?:of\s+)?(?:experience|exp))
    |
    (?:(?:minimum|min|at\s+least)\s+\d+\s*(?:year|yr)s?)
    """,
    re.VERBOSE | re.IGNORECASE,
)

_JD_SKILL_PATTERN = re.compile(
    r"\b(?:[A-Z][a-zA-Z0-9\.\-\+\#/]{1,25}|[a-z]{2,15})\b"
)

# Noise words to filter from JD skill extraction
_JD_NOISE_WORDS: Set[str] = {
    "and", "or", "the", "a", "an", "in", "with", "for", "of", "to",
    "on", "is", "are", "as", "at", "by", "be", "we", "our", "you",
    "your", "will", "have", "has", "from", "that", "this", "their",
    "strong", "experience", "knowledge", "skills", "ability", "proficiency",
    "understanding", "familiarity", "working", "using", "systems", "system",
    "including", "such", "other", "related", "relevant", "applicable",
    "preferred", "required", "minimum", "plus", "good", "excellent",
    "nice", "bonus", "must", "need", "needs", "equivalent",
}


class JDRequirements:
    """Parsed job description requirements."""
    __slots__ = ("required_skills", "preferred_skills", "required_experience_months",
                 "required_qualifications", "raw_required_text", "raw_preferred_text")

    def __init__(self) -> None:
        self.required_skills: List[str] = []
        self.preferred_skills: List[str] = []
        self.required_experience_months: int = 0
        self.required_qualifications: int = 0
        self.raw_required_text: str = ""
        self.raw_preferred_text: str = ""


def _extract_tokens_from_text(text: str, taxonomy: DomainTaxonomy) -> List[str]:
    """Extract and normalize skill-like tokens from JD section text."""
    skills: List[str] = []
    seen: Set[str] = set()
    for match in _JD_SKILL_PATTERN.finditer(text):
        raw = match.group(0)
        if raw.lower() in _JD_NOISE_WORDS:
            continue
        if len(raw) < 2 or len(raw) > 35:
            continue
        normalized = normalize_skill_name(raw, taxonomy)
        if normalized.lower() not in seen:
            seen.add(normalized.lower())
            skills.append(normalized)
    return skills


def parse_job_description(
    jd_text: str,
    taxonomy: DomainTaxonomy,
) -> JDRequirements:
    """
    Parse a free-text job description into structured requirements.

    Strategy:
    1. Try to find "Required:" and "Preferred:" sections.
    2. Extract experience requirement (N years).
    3. If no structured sections found, treat all skills as "required".
    """
    req = JDRequirements()

    if not jd_text or not jd_text.strip():
        return req

    # Experience requirement
    exp_match = _EXPERIENCE_REQUIREMENT_PATTERN.search(jd_text)
    if exp_match:
        years_match = re.search(r"(\d+)", exp_match.group(0))
        if years_match:
            req.required_experience_months = int(years_match.group(1)) * 12

    # Required section
    req_match = _REQUIRED_SECTION_PATTERN.search(jd_text)
    if req_match:
        req.raw_required_text = req_match.group(1).strip()
        req.required_skills = _extract_tokens_from_text(req.raw_required_text, taxonomy)

    # Preferred section
    pref_match = _PREFERRED_SECTION_PATTERN.search(jd_text)
    if pref_match:
        req.raw_preferred_text = pref_match.group(1).strip()
        req.preferred_skills = _extract_tokens_from_text(req.raw_preferred_text, taxonomy)

    # Fallback: if no structured sections found, use entire JD
    if not req.required_skills and not req.preferred_skills:
        req.required_skills = _extract_tokens_from_text(jd_text, taxonomy)

    # Cross-filter: remove overlapping terms
    preferred_lower = {s.lower() for s in req.preferred_skills}
    req.required_skills = [s for s in req.required_skills if s.lower() not in preferred_lower]

    # Qualification count: count degree/certification mentions
    qual_count = len(re.findall(
        r"\b(?:bachelor|master|degree|phd|mba|certification|certificate)\b",
        jd_text,
        re.IGNORECASE,
    ))
    req.required_qualifications = min(qual_count, 3)  # cap at 3

    logger.debug(
        "JD parsing: %d required, %d preferred, %d months exp, %d quals",
        len(req.required_skills),
        len(req.preferred_skills),
        req.required_experience_months,
        req.required_qualifications,
    )
    return req


# ---------------------------------------------------------------------------
# Skill matching
# ---------------------------------------------------------------------------

def _build_skill_matches(
    raw_tokens: List[RawSkillToken],
    taxonomy: DomainTaxonomy,
    required_skills: List[str],
    preferred_skills: List[str],
) -> Tuple[List[SkillMatch], List[SkillMatch], List[SkillMatch], Set[str], Set[str]]:
    """
    Match raw resume skill tokens against job requirements.

    Returns
    -------
    explicit_matches : SkillMatch list with confidence=explicit
    inferred_matches : empty list (AI layer adds these; deterministic engine doesn't infer)
    partial_matches  : SkillMatch list with confidence=uncertain
    matched_required_names : Set of required skill names satisfied by the resume
    matched_preferred_names : Set of preferred skill names satisfied by the resume
    """
    required_lower = {s.lower(): s for s in required_skills}
    preferred_lower = {s.lower(): s for s in preferred_skills}
    required_taxonomy = get_required_skills_set(taxonomy)
    preferred_taxonomy = get_preferred_skills_set(taxonomy)

    explicit_matches: List[SkillMatch] = []
    partial_matches: List[SkillMatch] = []
    matched_required: Set[str] = set()
    matched_preferred: Set[str] = set()

    seen_matched: Set[str] = set()

    for tok in raw_tokens:
        normalized = normalize_skill_name(tok.token, taxonomy)
        normalized_lower = normalized.lower()

        # Build evidence
        evidence = SkillEvidence(
            source_text=tok.source_text,
            page=tok.page,
            paragraph_index=tok.paragraph_index,
            section_heading=tok.section_heading,
        )

        # Check against JD required skills
        if normalized_lower in required_lower and normalized_lower not in seen_matched:
            seen_matched.add(normalized_lower)
            matched_required.add(required_lower[normalized_lower])
            explicit_matches.append(SkillMatch(
                skill=normalized,
                status=MatchStatus.matched,
                confidence=SkillConfidence.explicit,
                evidence=evidence,
                matched_requirement=required_lower[normalized_lower],
            ))
            continue

        # Check against JD preferred skills
        if normalized_lower in preferred_lower and normalized_lower not in seen_matched:
            seen_matched.add(normalized_lower)
            matched_preferred.add(preferred_lower[normalized_lower])
            explicit_matches.append(SkillMatch(
                skill=normalized,
                status=MatchStatus.matched,
                confidence=SkillConfidence.explicit,
                evidence=evidence,
                matched_requirement=preferred_lower[normalized_lower],
            ))
            continue

        # Check against taxonomy required (partial: relevant but not in JD)
        if normalized_lower in required_taxonomy and normalized_lower not in seen_matched:
            seen_matched.add(normalized_lower)
            partial_matches.append(SkillMatch(
                skill=normalized,
                status=MatchStatus.partial,
                confidence=SkillConfidence.uncertain,
                evidence=evidence,
                matched_requirement=None,
            ))

    return explicit_matches, [], partial_matches, matched_required, matched_preferred


# ---------------------------------------------------------------------------
# Score computation
# ---------------------------------------------------------------------------

def _compute_score(
    matched_required: int,
    total_required: int,
    matched_preferred: int,
    total_preferred: int,
    candidate_months: int,
    required_months: int,
    matched_qualifications: int,
    required_qualifications: int,
    uncertain_count: int,
) -> FitScoreBreakdown:
    """
    Compute the documented fit score and return a fully-populated breakdown.

    All formula steps are inline-documented in FitScoreBreakdown docstring.
    """
    # Dimension 1: Required skills
    if total_required == 0:
        req_score = 50.0
    else:
        req_score = (matched_required / total_required) * 100.0

    # Dimension 2: Preferred skills
    if total_preferred == 0:
        pref_score = 100.0
    else:
        pref_score = (matched_preferred / total_preferred) * 100.0

    # Dimension 3: Experience
    if required_months == 0:
        exp_score = 100.0
    else:
        ratio = candidate_months / required_months
        # Allow up to 20% over-requirement before plateau
        capped_ratio = min(ratio, 1.2) / 1.2
        exp_score = capped_ratio * 100.0

    # Dimension 4: Qualifications
    if required_qualifications == 0:
        qual_score = 100.0
    else:
        qual_score = min(matched_qualifications / required_qualifications, 1.0) * 100.0

    # Weighted average
    weighted = (
        req_score * WEIGHT_REQUIRED_SKILLS
        + pref_score * WEIGHT_PREFERRED_SKILLS
        + exp_score * WEIGHT_EXPERIENCE
        + qual_score * WEIGHT_QUALIFICATIONS
    )

    # Uncertainty penalty
    denom = max(total_required, 1)
    penalty = min((uncertain_count / denom) * 100.0, MAX_UNCERTAINTY_PENALTY_POINTS)

    return FitScoreBreakdown(
        total_required_skills=total_required,
        matched_required_skills=matched_required,
        total_preferred_skills=total_preferred,
        matched_preferred_skills=matched_preferred,
        candidate_experience_months=candidate_months,
        required_experience_months=required_months,
        matched_qualifications=matched_qualifications,
        required_qualifications=required_qualifications,
        required_skills_score=round(req_score, 2),
        preferred_skills_score=round(pref_score, 2),
        experience_score=round(exp_score, 2),
        qualifications_score=round(qual_score, 2),
        weight_required_skills=WEIGHT_REQUIRED_SKILLS,
        weight_preferred_skills=WEIGHT_PREFERRED_SKILLS,
        weight_experience=WEIGHT_EXPERIENCE,
        weight_qualifications=WEIGHT_QUALIFICATIONS,
        uncertain_skill_count=uncertain_count,
        uncertainty_penalty=round(penalty, 2),
        weighted_score=round(weighted, 2),
    )


# ---------------------------------------------------------------------------
# Demo vacancy generation
# ---------------------------------------------------------------------------

# Static demo vacancies per domain — match scores computed dynamically from skills
_DEMO_VACANCIES_BY_DOMAIN: Dict[str, List[Dict]] = {
    "software-engineering": [
        {
            "id": "demo-job-se-1",
            "title": "Senior Full Stack Engineer",
            "company": "NovaCloud Technologies",
            "location": "Bangalore, India (Hybrid)",
            "salary_range": "₹28,00,000 – ₹35,00,000 PA",
            "work_type": "Hybrid",
            "description": "Build scalable enterprise dashboards using React, TypeScript, and Node.js. Collaborate with platform infrastructure teams on cloud deployments.",
            "required_skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
            "preferred_skills": ["Kubernetes", "AWS", "GraphQL", "Redis"],
            "department": "Core Infrastructure",
            "posted_date": "3 days ago",
        },
        {
            "id": "demo-job-se-2",
            "title": "Backend Platform Engineer",
            "company": "Finbridge Systems",
            "location": "Mumbai, India (Remote)",
            "salary_range": "₹22,00,000 – ₹30,00,000 PA",
            "work_type": "Remote",
            "description": "Design and maintain high-throughput payment APIs in Python. Own CI/CD pipelines and contribute to API gateway architecture.",
            "required_skills": ["Python", "REST APIs", "SQL", "Docker", "Git"],
            "preferred_skills": ["Kubernetes", "Redis", "AWS", "CI/CD"],
            "department": "Payments Engineering",
            "posted_date": "1 week ago",
        },
    ],
    "data-ai": [
        {
            "id": "demo-job-da-1",
            "title": "Senior ML Engineer",
            "company": "Quantix Analytics",
            "location": "Hyderabad, India (Hybrid)",
            "salary_range": "₹25,00,000 – ₹38,00,000 PA",
            "work_type": "Hybrid",
            "description": "Develop and productionize machine learning models for real-time fraud detection and customer segmentation.",
            "required_skills": ["Python", "Machine Learning", "Scikit-learn", "SQL", "Data Analysis"],
            "preferred_skills": ["TensorFlow", "PyTorch", "Spark", "Airflow", "MLflow"],
            "department": "AI Platform",
            "posted_date": "5 days ago",
        },
        {
            "id": "demo-job-da-2",
            "title": "Data Scientist — NLP",
            "company": "LinguaAI Labs",
            "location": "Pune, India (Remote)",
            "salary_range": "₹20,00,000 – ₹32,00,000 PA",
            "work_type": "Remote",
            "description": "Build NLP models for document understanding, entity extraction, and semantic search across multilingual corpora.",
            "required_skills": ["Python", "NLP", "Machine Learning", "Statistics", "Pandas"],
            "preferred_skills": ["PyTorch", "TensorFlow", "Spark", "Jupyter"],
            "department": "Research & Development",
            "posted_date": "2 weeks ago",
        },
    ],
    "finance-fintech": [
        {
            "id": "demo-job-ff-1",
            "title": "Financial Analyst — Fintech",
            "company": "Auxora Capital",
            "location": "Mumbai, India (On-site)",
            "salary_range": "₹12,00,000 – ₹18,00,000 PA",
            "work_type": "Full-time",
            "description": "Analyse portfolio performance, develop financial models, and prepare investor reporting dashboards.",
            "required_skills": ["Financial Analysis", "Excel", "Financial Modeling", "SQL", "Reporting"],
            "preferred_skills": ["Python", "Tableau", "Bloomberg", "Risk Management"],
            "department": "Finance Operations",
            "posted_date": "4 days ago",
        },
        {
            "id": "demo-job-ff-2",
            "title": "Risk & Compliance Analyst",
            "company": "SecureBank FinTech",
            "location": "Chennai, India (Hybrid)",
            "salary_range": "₹14,00,000 – ₹20,00,000 PA",
            "work_type": "Hybrid",
            "description": "Identify, assess, and mitigate regulatory and operational risks across payments infrastructure.",
            "required_skills": ["Risk Management", "Compliance", "Accounting", "Excel", "Reporting"],
            "preferred_skills": ["SQL", "Python", "Audit"],
            "department": "Risk & Governance",
            "posted_date": "1 week ago",
        },
    ],
    "product-design": [
        {
            "id": "demo-job-pd-1",
            "title": "Senior Product Manager",
            "company": "Optix Labs",
            "location": "Bengaluru, India (Hybrid)",
            "salary_range": "₹24,00,000 – ₹36,00,000 PA",
            "work_type": "Hybrid",
            "description": "Own the product roadmap for our B2B SaaS suite. Partner with design and engineering to ship user-centred features.",
            "required_skills": ["Product Management", "Agile", "Roadmapping", "User Research"],
            "preferred_skills": ["Figma", "SQL", "A/B Testing", "OKRs"],
            "department": "Product",
            "posted_date": "6 days ago",
        },
        {
            "id": "demo-job-pd-2",
            "title": "UX / Product Designer",
            "company": "Designify Studio",
            "location": "Remote",
            "salary_range": "₹14,00,000 – ₹22,00,000 PA",
            "work_type": "Remote",
            "description": "Create end-to-end product experiences from research and wireframing through to high-fidelity prototypes.",
            "required_skills": ["UX Design", "Figma", "Wireframing", "Prototyping", "User Research"],
            "preferred_skills": ["Usability Testing", "Design Systems", "Adobe XD"],
            "department": "Design",
            "posted_date": "3 days ago",
        },
    ],
    "healthcare-biotech": [
        {
            "id": "demo-job-hb-1",
            "title": "Clinical Research Associate",
            "company": "BioPath Pharma",
            "location": "Hyderabad, India (On-site)",
            "salary_range": "₹8,00,000 – ₹14,00,000 PA",
            "work_type": "Full-time",
            "description": "Monitor Phase II/III clinical trials in compliance with ICH-GCP guidelines and manage CTMS data integrity.",
            "required_skills": ["Clinical Research", "GCP", "ICH Guidelines", "CTMS", "Regulatory Affairs"],
            "preferred_skills": ["CDISC", "SAS", "Medical Writing", "Biostatistics"],
            "department": "Clinical Operations",
            "posted_date": "1 week ago",
        },
        {
            "id": "demo-job-hb-2",
            "title": "Regulatory Affairs Specialist",
            "company": "MedCore Solutions",
            "location": "Mumbai, India (Hybrid)",
            "salary_range": "₹12,00,000 – ₹18,00,000 PA",
            "work_type": "Hybrid",
            "description": "Prepare and submit regulatory dossiers for new drug applications and Class II medical devices.",
            "required_skills": ["Regulatory Affairs", "GCP", "Medical Writing", "ICH Guidelines"],
            "preferred_skills": ["FDA Submissions", "HIPAA Compliance", "EHR Systems", "R"],
            "department": "Regulatory",
            "posted_date": "5 days ago",
        },
    ],
    "operations-hr": [
        {
            "id": "demo-job-hr-1",
            "title": "Senior HR Business Partner",
            "company": "Talent Nexus India",
            "location": "Delhi, India (Hybrid)",
            "salary_range": "₹14,00,000 – ₹22,00,000 PA",
            "work_type": "Hybrid",
            "description": "Partner with business units to drive talent acquisition, performance management, and employee engagement programmes.",
            "required_skills": ["HR Management", "Recruitment", "Performance Management", "Employee Relations", "Compliance"],
            "preferred_skills": ["Workday", "HRIS", "Labor Law", "Change Management"],
            "department": "People & Culture",
            "posted_date": "2 days ago",
        },
        {
            "id": "demo-job-hr-2",
            "title": "HR Operations Analyst",
            "company": "PeopleFirst Corp",
            "location": "Pune, India (Remote)",
            "salary_range": "₹8,00,000 – ₹14,00,000 PA",
            "work_type": "Remote",
            "description": "Manage end-to-end payroll processing, HRIS data integrity, and HR reporting for a 2,000-person organization.",
            "required_skills": ["Payroll", "HRIS", "Reporting", "Excel", "Compliance"],
            "preferred_skills": ["SAP HR", "BambooHR", "Talent Acquisition"],
            "department": "HR Operations",
            "posted_date": "1 week ago",
        },
    ],
}


def _compute_demo_vacancy_scores(
    identified_skill_names_lower: Set[str],
    domain_id: str,
) -> List[DemoJobMatch]:
    """
    Generate demo vacancies with deterministically computed match scores.

    Match score formula for each vacancy:
        score = (matched_required / total_required) * 70
              + (matched_preferred / max(total_preferred, 1)) * 30
        (Rounded to integer, capped 0–100.)
    """
    vacancies_spec = _DEMO_VACANCIES_BY_DOMAIN.get(
        domain_id,
        _DEMO_VACANCIES_BY_DOMAIN["software-engineering"],
    )
    results: List[DemoJobMatch] = []

    for spec in vacancies_spec:
        req_skills = spec["required_skills"]
        pref_skills = spec["preferred_skills"]

        matched_req = [s for s in req_skills if s.lower() in identified_skill_names_lower]
        matched_pref = [s for s in pref_skills if s.lower() in identified_skill_names_lower]
        missing = [s for s in req_skills if s.lower() not in identified_skill_names_lower]

        req_score = (len(matched_req) / max(len(req_skills), 1)) * 70
        pref_score = (len(matched_pref) / max(len(pref_skills), 1)) * 30
        match_score = min(100, round(req_score + pref_score))

        results.append(DemoJobMatch(
            id=spec["id"],
            title=spec["title"],
            company=spec["company"],
            location=spec["location"],
            match_score=match_score,
            salary_range=spec["salary_range"],
            work_type=spec["work_type"],
            description=spec["description"],
            matched_skills=matched_req + matched_pref,
            missing_skills=missing,
            department=spec["department"],
            posted_date=spec["posted_date"],
        ))

    return results


# ---------------------------------------------------------------------------
# Summary generation (deterministic — no LLM)
# ---------------------------------------------------------------------------

def _build_summary(
    candidate_name: str,
    experience_level: str,
    overall_score: int,
    matched_skills: List[str],
    missing_skills: List[str],
    target_role: Optional[str],
    ai_assistance_used: bool,
) -> str:
    """Build a deterministic narrative summary. No LLM output."""
    name_part = candidate_name if candidate_name and "not extracted" not in candidate_name else "The candidate"
    role_part = f' for the "{target_role}" role' if target_role else ""
    skill_part = (
        f", with strong evidence for {', '.join(matched_skills[:4])}"
        if matched_skills
        else ""
    )
    gap_part = (
        f" Key areas not evidenced in the document: {', '.join(missing_skills[:3])}."
        if missing_skills
        else " No critical skill gaps detected relative to stated requirements."
    )
    ai_part = " Some skills were additionally identified via AI-assisted inference." if ai_assistance_used else ""
    score_label = (
        "Strong" if overall_score >= 75
        else "Moderate" if overall_score >= 50
        else "Partial"
    )
    return (
        f"{name_part} ({experience_level}) achieved a {score_label} fit score of {overall_score}%{role_part}"
        f"{skill_part}.{gap_part}{ai_part}"
    )


# ---------------------------------------------------------------------------
# Recommended roles (deterministic)
# ---------------------------------------------------------------------------

def _recommend_roles(
    domain_id: str,
    experience_level: str,
    matched_skills: List[str],
    total_months: int,
) -> List[str]:
    """Derive recommended role titles from domain + experience level."""
    _ROLE_SUGGESTIONS: Dict[str, List[str]] = {
        "software-engineering": [
            "Full Stack Engineer", "Backend Engineer", "Frontend Engineer",
            "Software Engineer II", "Senior Software Engineer", "Lead Engineer",
            "Platform Engineer", "Staff Engineer",
        ],
        "data-ai": [
            "Data Analyst", "Data Scientist", "ML Engineer",
            "Senior Data Scientist", "Applied Scientist", "AI Research Engineer",
        ],
        "finance-fintech": [
            "Financial Analyst", "Risk Analyst", "Fintech Product Analyst",
            "Senior Financial Analyst", "Finance Business Partner",
        ],
        "product-design": [
            "Product Designer", "UX Designer", "Junior Product Manager",
            "Product Manager", "Senior Product Manager", "Principal PM",
        ],
        "healthcare-biotech": [
            "Clinical Research Associate", "Regulatory Affairs Associate",
            "Senior CRA", "Regulatory Affairs Manager", "Clinical Trial Manager",
        ],
        "operations-hr": [
            "HR Coordinator", "HR Business Partner", "Talent Acquisition Specialist",
            "Senior HR Manager", "People Operations Lead",
        ],
    }

    roles = _ROLE_SUGGESTIONS.get(domain_id, _ROLE_SUGGESTIONS["software-engineering"])

    # Select top 3 based on experience
    if total_months < 18:
        return roles[:2]
    elif total_months < 60:
        return roles[1:4]
    else:
        return roles[3:6] if len(roles) > 3 else roles[-3:]


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def run_resume_fit_analysis(
    extraction_result: ResumeExtractionResult,
    file_name: str,
    file_size_bytes: int,
    career_domain: str = "software-engineering",
    target_role: Optional[str] = None,
    target_company: Optional[str] = None,
    job_description: Optional[str] = None,
    ai_assistance_used: bool = False,
    inferred_skill_matches: Optional[List[SkillMatch]] = None,
) -> ResumeAnalysisResponse:
    """
    Execute the full deterministic resume fit analysis.

    Parameters
    ----------
    extraction_result   : Output from resume_extractor.extract_resume().
    file_name           : Original filename.
    file_size_bytes     : Raw file size.
    career_domain       : Domain ID matching CareerDomain in the frontend.
    target_role         : Optional role title for context.
    target_company      : Optional company (not used in scoring; metadata only).
    job_description     : Optional free-text JD for requirement extraction.
    ai_assistance_used  : Whether AI inferred any skills.
    inferred_skill_matches : AI-inferred skills (separately listed, not from this engine).

    Returns
    -------
    ResumeAnalysisResponse — fully populated, reproducible.
    """
    taxonomy = get_taxonomy(career_domain)
    inferred = inferred_skill_matches or []

    # -----------------------------------------------------------------------
    # 1. Parse job description requirements
    # -----------------------------------------------------------------------
    jd_req = parse_job_description(job_description or "", taxonomy)
    jd_provided = bool(job_description and job_description.strip())

    # Fallback: if no JD, use domain taxonomy required skills as implicit baseline
    required_skills = jd_req.required_skills if jd_req.required_skills else taxonomy.required_skills[:]
    preferred_skills = jd_req.preferred_skills if jd_req.preferred_skills else taxonomy.preferred_skills[:]

    # -----------------------------------------------------------------------
    # 2. Match resume tokens against requirements
    # -----------------------------------------------------------------------
    explicit_matches, _, partial_matches, matched_required_set, matched_preferred_set = (
        _build_skill_matches(
            raw_tokens=extraction_result.raw_skill_tokens,
            taxonomy=taxonomy,
            required_skills=required_skills,
            preferred_skills=preferred_skills,
        )
    )

    # Merge inferred matches (from AI layer) — they contribute to matched_required
    for inf_match in inferred:
        if (
            inf_match.matched_requirement
            and inf_match.matched_requirement not in matched_required_set
        ):
            matched_required_set.add(inf_match.matched_requirement)

    # -----------------------------------------------------------------------
    # 3. Build skill name lists
    # -----------------------------------------------------------------------
    matched_skill_names = sorted({m.skill for m in explicit_matches if m.matched_requirement})
    identified_skill_names = sorted({m.skill for m in explicit_matches} | {m.skill for m in inferred})
    identified_lower: Set[str] = {s.lower() for s in identified_skill_names}

    missing_skill_names = sorted(
        s for s in required_skills if s.lower() not in identified_lower
    )

    # -----------------------------------------------------------------------
    # 4. Experience totals
    # -----------------------------------------------------------------------
    total_months = sum(
        r.duration_months for r in extraction_result.experience_records if r.duration_months
    )
    experience_level = _derive_experience_level(total_months)

    # -----------------------------------------------------------------------
    # 5. Qualification matching
    # -----------------------------------------------------------------------
    matched_quals = min(len(extraction_result.qualification_records), jd_req.required_qualifications or 0)
    if jd_req.required_qualifications == 0:
        matched_quals = len(extraction_result.qualification_records)

    # -----------------------------------------------------------------------
    # 6. Uncertainty count
    # -----------------------------------------------------------------------
    uncertain_count = sum(
        1 for m in inferred
        if m.confidence in (SkillConfidence.inferred, SkillConfidence.uncertain)
        and m.matched_requirement
    )

    # -----------------------------------------------------------------------
    # 7. Score computation
    # -----------------------------------------------------------------------
    breakdown = _compute_score(
        matched_required=len(matched_required_set),
        total_required=len(required_skills),
        matched_preferred=len(matched_preferred_set),
        total_preferred=len(preferred_skills),
        candidate_months=total_months,
        required_months=jd_req.required_experience_months,
        matched_qualifications=matched_quals,
        required_qualifications=jd_req.required_qualifications,
        uncertain_count=uncertain_count,
    )
    overall_score = max(0, min(100, round(breakdown.weighted_score - breakdown.uncertainty_penalty)))

    # -----------------------------------------------------------------------
    # 8. Demo vacancies (deterministic match scores)
    # -----------------------------------------------------------------------
    demo_jobs = _compute_demo_vacancy_scores(identified_lower, career_domain)

    # -----------------------------------------------------------------------
    # 9. Convert raw records to schema objects
    # -----------------------------------------------------------------------
    exp_records = [
        ExperienceRecord(
            role_title=r.role_title,
            employer=r.employer,
            duration_months=r.duration_months,
            raw_duration_text=r.raw_duration_text,
            evidence=SkillEvidence(
                source_text=r.source_text,
                page=r.page,
                paragraph_index=r.paragraph_index,
                section_heading=r.section_heading,
            ) if r.source_text else None,
        )
        for r in extraction_result.experience_records
    ]

    qual_records = [
        QualificationRecord(
            credential_name=q.credential_name,
            institution=q.institution,
            year=q.year,
            evidence=SkillEvidence(
                source_text=q.source_text,
                page=q.page,
                paragraph_index=q.paragraph_index,
                section_heading=q.section_heading,
            ) if q.source_text else None,
        )
        for q in extraction_result.qualification_records
    ]

    # -----------------------------------------------------------------------
    # 10. Build summary and role recommendations
    # -----------------------------------------------------------------------
    candidate_name = extraction_result.candidate_name or "Candidate (name not extracted)"
    summary = _build_summary(
        candidate_name=candidate_name,
        experience_level=experience_level,
        overall_score=overall_score,
        matched_skills=matched_skill_names,
        missing_skills=missing_skill_names,
        target_role=target_role,
        ai_assistance_used=ai_assistance_used,
    )
    recommended_roles = _recommend_roles(career_domain, experience_level, matched_skill_names, total_months)

    file_size_str = (
        f"{file_size_bytes / (1024 * 1024):.1f} MB"
        if file_size_bytes > 0
        else "Unknown"
    )

    logger.info(
        "Resume fit: file='%s' domain='%s' score=%d required=%d/%d preferred=%d/%d "
        "exp_months=%d uncertainty_penalty=%.1f",
        file_name, career_domain, overall_score,
        len(matched_required_set), len(required_skills),
        len(matched_preferred_set), len(preferred_skills),
        total_months, breakdown.uncertainty_penalty,
    )

    return ResumeAnalysisResponse(
        candidate_name=candidate_name,
        file_name=file_name,
        file_size=file_size_str,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
        experience_level=experience_level,
        summary=summary,
        overall_fit_score=overall_score,
        score_breakdown=breakdown,
        identified_skills=identified_skill_names,
        explicit_skills=explicit_matches,
        inferred_skills=inferred,
        matched_skills=matched_skill_names,
        missing_skills=missing_skill_names,
        partial_matches=partial_matches,
        experience_records=exp_records,
        total_experience_months=total_months,
        qualification_records=qual_records,
        recommended_roles=recommended_roles,
        job_matches=demo_jobs,
        is_simulated=False,
        job_description_provided=jd_provided,
        ai_assistance_used=ai_assistance_used,
        extraction_warnings=extraction_result.warnings,
    )
