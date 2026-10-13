"""
VeriSync AI — Resume Analysis Routes

POST /api/v1/resumes/analyze
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Form, HTTPException, UploadFile, status

from app.services.file_validator import FileValidationError, validate_file
from app.services.pdf_extractor import ExtractionError as PdfError
from app.services.pdf_extractor import extract_pdf
from app.services.docx_extractor import ExtractionError as DocxError
from app.services.docx_extractor import extract_docx
from app.services.resume_extractor import extract_resume
from app.services.resume_fit_engine import run_resume_fit_analysis

logger = logging.getLogger("verisync.routes.resumes")

router = APIRouter(prefix="/resumes", tags=["Resume & Career Fit"])


@router.post(
    "/analyze",
    summary="Analyze resume and compute career fit score",
    description=(
        "Upload a candidate resume (PDF or DOCX) with an optional job description "
        "and target role. Returns extracted skills, experience, qualifications, "
        "and a reproducible fit score with documented algorithm breakdown. "
        "Demo vacancy cards are included and clearly labeled as demonstration data."
    ),
    response_description="Resume analysis result with fit score and evidence references.",
)
async def analyze_resume(
    file: UploadFile,
    domain: str = Form(default="software-engineering", description="Career domain ID."),
    target_role: Optional[str] = Form(default=None, description="Target job title."),
    target_company: Optional[str] = Form(default=None, description="Target organization."),
    job_description: Optional[str] = Form(
        default=None,
        description=(
            "Free-text job description or requirements list. "
            "When provided, required/preferred skills are extracted from this text. "
            "When absent, the domain taxonomy is used as the implicit baseline."
        ),
    ),
) -> dict:
    """
    POST /api/v1/resumes/analyze

    Multipart form fields:
        file             : PDF or DOCX resume file (required)
        domain           : Career domain (default: software-engineering)
        target_role      : Optional target role title
        target_company   : Optional target company name
        job_description  : Optional job description text

    Returns the ApiResponse envelope expected by the frontend api.ts:
        { data: ResumeAnalysisResponse, isSimulated: false, backendConnected: true, message: str }
    """
    filename = file.filename or "resume"
    content_type = file.content_type or "application/octet-stream"

    # -----------------------------------------------------------------------
    # 1. Read and validate file
    # -----------------------------------------------------------------------
    content = await file.read()

    try:
        validate_file(filename, content_type, content)
    except FileValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    # -----------------------------------------------------------------------
    # 2. Extract text from PDF or DOCX
    # -----------------------------------------------------------------------
    ext = Path(filename).suffix.lower()
    try:
        if ext == ".pdf":
            full_text, page_count, evidence_blocks = extract_pdf(content, filename)
        elif ext == ".docx":
            full_text, para_count, evidence_blocks = extract_docx(content, filename)
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported file type '{ext}'. Only PDF and DOCX are accepted.",
            )
    except (PdfError, DocxError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    # -----------------------------------------------------------------------
    # 3. Parse resume structure
    # -----------------------------------------------------------------------
    extraction_result = extract_resume(
        full_text=full_text,
        evidence_blocks=evidence_blocks,
        filename=filename,
    )

    # -----------------------------------------------------------------------
    # 4. Run deterministic fit engine
    # -----------------------------------------------------------------------
    analysis = run_resume_fit_analysis(
        extraction_result=extraction_result,
        file_name=filename,
        file_size_bytes=len(content),
        career_domain=domain,
        target_role=target_role,
        target_company=target_company,
        job_description=job_description,
        ai_assistance_used=False,
        inferred_skill_matches=None,
    )

    # -----------------------------------------------------------------------
    # 5. Persist to history store (same pattern as verification engine)
    # -----------------------------------------------------------------------
    try:
        from app.services.history_store import history_store
        history_store.record_resume_analysis(analysis)
    except Exception as exc:
        logger.warning("Resume analysis: history persistence failed (skipped): %s", exc)

    # -----------------------------------------------------------------------
    # 6. Serialize to frontend API contract shape
    #    The frontend expects camelCase field names matching ResumeAnalysisResult
    # -----------------------------------------------------------------------
    return {
        "data": _to_frontend_shape(analysis),
        "isSimulated": False,
        "backendConnected": True,
        "message": f"Resume analyzed successfully. Fit score: {analysis.overall_fit_score}%.",
    }


def _to_frontend_shape(analysis) -> dict:
    """
    Convert ResumeAnalysisResponse to the camelCase shape expected by the
    frontend ResumeAnalysisResult interface in types/index.ts.

    Frontend interface (from types/index.ts):
        candidateName, overallFitScore, experienceLevel, summary,
        identifiedSkills, matchedSkills, missingSkills,
        recommendedRoles, jobMatches, analyzedAt, fileName, fileSize
    """
    # Serialize job matches to frontend JobMatchItem format
    job_matches = [
        {
            "id": job.id,
            "title": job.title,
            "company": f"{job.company} [Demo Vacancy]",
            "location": job.location,
            "matchScore": job.match_score,
            "salaryRange": job.salary_range,
            "workType": job.work_type,
            "description": job.description,
            "matchedSkills": job.matched_skills,
            "missingSkills": job.missing_skills,
            "department": job.department,
            "postedDate": job.posted_date,
        }
        for job in analysis.job_matches
    ]

    return {
        "candidateName": analysis.candidate_name,
        "overallFitScore": analysis.overall_fit_score,
        "experienceLevel": analysis.experience_level,
        "summary": analysis.summary,
        "identifiedSkills": analysis.identified_skills,
        "matchedSkills": analysis.matched_skills,
        "missingSkills": analysis.missing_skills,
        "recommendedRoles": analysis.recommended_roles,
        "jobMatches": job_matches,
        "analyzedAt": analysis.analyzed_at,
        "fileName": analysis.file_name,
        "fileSize": analysis.file_size,
        # Extended fields (used by enhanced UI or future expansions)
        "scoreBreakdown": analysis.score_breakdown.model_dump(),
        "explicitSkills": [s.model_dump() for s in analysis.explicit_skills],
        "inferredSkills": [s.model_dump() for s in analysis.inferred_skills],
        "partialMatches": [s.model_dump() for s in analysis.partial_matches],
        "experienceRecords": [r.model_dump() for r in analysis.experience_records],
        "totalExperienceMonths": analysis.total_experience_months,
        "qualificationRecords": [q.model_dump() for q in analysis.qualification_records],
        "jobDescriptionProvided": analysis.job_description_provided,
        "aiAssistanceUsed": analysis.ai_assistance_used,
        "extractionWarnings": analysis.extraction_warnings,
    }
