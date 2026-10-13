"""
VeriSync AI — Resume & Career Fit Schemas

Pydantic models for the POST /api/v1/resumes/analyze endpoint.

Design decisions
----------------
* Every SkillMatch carries an evidence reference (source text, location)
  so the UI can display verbatim excerpts rather than inferred assertions.
* Skill confidence uses a three-tier enum: explicit (direct text match),
  inferred (context-based AI), uncertain (low-confidence signal).
* FitScoreBreakdown documents each category's contribution to the overall
  score so the score is always explainable and reproducible.
* DemoJobMatch is clearly flagged with is_demo_data=True.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Skill confidence tier
# ---------------------------------------------------------------------------

class SkillConfidence(str, Enum):
    """
    Three-tier confidence for extracted skill evidence.

    explicit  : The skill keyword was found verbatim in the document text.
    inferred  : Derived from related context (e.g. "Django" → Python); only
                populated when AI assistance is enabled.
    uncertain : Pattern matched but context was ambiguous.
    """
    explicit = "explicit"
    inferred = "inferred"
    uncertain = "uncertain"


class MatchStatus(str, Enum):
    """Whether a job-requirement was matched, partially matched, or is missing."""
    matched = "matched"
    partial = "partial"
    missing = "missing"
    uncertain = "uncertain"


# ---------------------------------------------------------------------------
# Evidence reference for a single skill mention
# ---------------------------------------------------------------------------

class SkillEvidence(BaseModel):
    """Verbatim source reference for a single skill extraction."""
    source_text: str = Field(
        description="Verbatim excerpt from the resume where the skill was found."
    )
    page: Optional[int] = Field(
        default=None,
        description="1-indexed page number (PDF). None for DOCX."
    )
    paragraph_index: Optional[int] = Field(
        default=None,
        description="0-indexed paragraph index (DOCX). None for PDF."
    )
    section_heading: Optional[str] = Field(
        default=None,
        description="Inferred section heading at the point of extraction."
    )


# ---------------------------------------------------------------------------
# Per-skill match record
# ---------------------------------------------------------------------------

class SkillMatch(BaseModel):
    """A single skill matched between the resume and the job requirements."""
    skill: str = Field(description="Normalized skill name.")
    status: MatchStatus = Field(description="Match outcome against job requirements.")
    confidence: SkillConfidence = Field(
        description="Evidence confidence tier for the skill extraction."
    )
    evidence: Optional[SkillEvidence] = Field(
        default=None,
        description="Source reference. None when confidence is 'uncertain'."
    )
    matched_requirement: Optional[str] = Field(
        default=None,
        description="The job-requirement term this skill was matched against."
    )


# ---------------------------------------------------------------------------
# Experience record
# ---------------------------------------------------------------------------

class ExperienceRecord(BaseModel):
    """A single employment tenure extracted from the resume."""
    role_title: str = Field(description="Job title as written in the resume.")
    employer: Optional[str] = Field(default=None, description="Employer name.")
    duration_months: Optional[int] = Field(
        default=None,
        description="Estimated tenure in months. None when dates are absent."
    )
    raw_duration_text: Optional[str] = Field(
        default=None,
        description="Verbatim duration string from the resume (e.g. 'Jan 2021 – Mar 2023')."
    )
    evidence: Optional[SkillEvidence] = Field(
        default=None,
        description="Source reference for this employment record."
    )


# ---------------------------------------------------------------------------
# Qualification / certification record
# ---------------------------------------------------------------------------

class QualificationRecord(BaseModel):
    """An education or certification credential extracted from the resume."""
    credential_name: str = Field(description="Degree, certificate, or course name.")
    institution: Optional[str] = Field(default=None, description="Granting institution.")
    year: Optional[str] = Field(default=None, description="Graduation or certification year.")
    evidence: Optional[SkillEvidence] = Field(
        default=None,
        description="Source reference for this qualification."
    )


# ---------------------------------------------------------------------------
# Fit score breakdown — every dimension is documented
# ---------------------------------------------------------------------------

class FitScoreBreakdown(BaseModel):
    """
    Detailed score breakdown per matching dimension.

    Algorithm (documented):
    -----------------------
    Overall fit score = weighted average of four dimensions:

      required_skills_score  (weight 0.45) :
          matched_required / total_required * 100
          If total_required == 0: score = 50 (no requirements → neutral).

      preferred_skills_score (weight 0.20) :
          matched_preferred / total_preferred * 100
          If total_preferred == 0: score = 100 (no preferred → full marks).

      experience_score       (weight 0.25) :
          Comparison of candidate_experience_months vs required_experience_months.
          If required_experience_months == 0: score = 100.
          Else: min(candidate / required, 1.2) / 1.2 * 100 (capped at 100).

      qualifications_score   (weight 0.10) :
          matched_qualifications / required_qualifications * 100
          If required_qualifications == 0: score = 100.

    Uncertainty penalty:
        Any inferred or uncertain skills that were counted as matched reduce
        the score by (uncertain_count / total_required) * 10 points, capped
        at 15-point deduction. This is reported in uncertainty_penalty.

    Final overall_fit_score is rounded to an integer (0–100).
    """

    # Raw inputs
    total_required_skills: int = Field(
        description="Number of required skills extracted from the job description."
    )
    matched_required_skills: int = Field(
        description="Required skills with explicit or inferred resume evidence."
    )
    total_preferred_skills: int = Field(
        description="Number of preferred/nice-to-have skills from the job description."
    )
    matched_preferred_skills: int = Field(
        description="Preferred skills matched in the resume."
    )
    candidate_experience_months: int = Field(
        description="Estimated total professional experience in months."
    )
    required_experience_months: int = Field(
        description="Experience requirement extracted from job description (0 if not specified)."
    )
    matched_qualifications: int = Field(
        description="Candidate qualifications matching required credentials."
    )
    required_qualifications: int = Field(
        description="Required qualification count from job description (0 if not specified)."
    )

    # Per-dimension scores (0–100)
    required_skills_score: float = Field(description="Required skills dimension score (0–100).")
    preferred_skills_score: float = Field(description="Preferred skills dimension score (0–100).")
    experience_score: float = Field(description="Experience dimension score (0–100).")
    qualifications_score: float = Field(description="Qualifications dimension score (0–100).")

    # Weights (documented, configurable)
    weight_required_skills: float = Field(default=0.45, description="Weight for required skills dimension.")
    weight_preferred_skills: float = Field(default=0.20, description="Weight for preferred skills dimension.")
    weight_experience: float = Field(default=0.25, description="Weight for experience dimension.")
    weight_qualifications: float = Field(default=0.10, description="Weight for qualifications dimension.")

    # Penalty
    uncertain_skill_count: int = Field(
        default=0,
        description="Number of required-skill matches that relied on inferred/uncertain evidence."
    )
    uncertainty_penalty: float = Field(
        default=0.0,
        description="Score deduction applied due to uncertain matches (0–15 points)."
    )

    # Weighted score before rounding
    weighted_score: float = Field(description="Weighted average score before rounding and penalty.")


# ---------------------------------------------------------------------------
# Demo vacancy record
# ---------------------------------------------------------------------------

class DemoJobMatch(BaseModel):
    """
    A demo benchmark vacancy.

    These records are clearly labeled as demonstration data and must NOT be
    presented as live job listings. Vacancy match scores are computed from
    the resume's extracted skills — they are reproducible but based on demo
    vacancy specifications, not a live recruitment feed.
    """
    id: str
    title: str
    company: str
    location: str
    match_score: int = Field(
        description="Deterministic match score computed from extracted skills (0–100)."
    )
    salary_range: str
    work_type: str = Field(description="Full-time | Remote | Hybrid | Contract")
    description: str
    matched_skills: List[str]
    missing_skills: List[str]
    department: str
    posted_date: str
    is_demo_data: bool = Field(
        default=True,
        description="Always True. These are demonstration vacancies, not live listings."
    )
    demo_label: str = Field(
        default="[Demo Vacancy]",
        description="Explicit label ensuring demo status is visible in all serialized output."
    )


# ---------------------------------------------------------------------------
# Top-level analysis response
# ---------------------------------------------------------------------------

class ResumeAnalysisResponse(BaseModel):
    """
    Full resume analysis result returned by POST /api/v1/resumes/analyze.

    The overall_fit_score is computed solely from explicit evidence when
    the AI provider is unavailable. Inferred skills are always separately
    listed so the reviewer can assess AI-assisted matches independently.
    """

    # Candidate metadata
    candidate_name: str = Field(
        description="Name extracted from the resume, or 'Candidate (name not extracted)' if absent."
    )
    file_name: str = Field(description="Original uploaded filename.")
    file_size: str = Field(description="File size as a human-readable string (e.g. '1.2 MB').")
    analyzed_at: str = Field(description="ISO 8601 UTC timestamp of analysis.")

    # Experience level label
    experience_level: str = Field(
        description=(
            "Derived from total_experience_months. "
            "Entry Level: <18m | Junior: 18–36m | Mid-level: 37–60m | "
            "Senior: 61–120m | Lead/Principal: >120m"
        )
    )

    # Overview
    summary: str = Field(
        description="One-paragraph narrative summary of candidate fit. Never invented by LLM."
    )
    overall_fit_score: int = Field(
        ge=0, le=100,
        description="Deterministic overall fit percentage (0–100). See FitScoreBreakdown."
    )
    score_breakdown: FitScoreBreakdown = Field(
        description="Documented score algorithm inputs and per-dimension scores."
    )

    # Extracted skills
    identified_skills: List[str] = Field(
        description="All skills extracted from the resume (explicit + inferred names only)."
    )
    explicit_skills: List[SkillMatch] = Field(
        description="Skills found verbatim in the document with source references."
    )
    inferred_skills: List[SkillMatch] = Field(
        description=(
            "Skills inferred from context or related terms. Clearly separated from "
            "explicit evidence. Only populated when AI assistance is enabled."
        )
    )

    # Job requirement comparison
    matched_skills: List[str] = Field(
        description="Skill names from identified_skills that satisfy job requirements."
    )
    missing_skills: List[str] = Field(
        description="Job-required skills absent from the resume."
    )
    partial_matches: List[SkillMatch] = Field(
        description="Requirements matched with uncertain confidence."
    )

    # Experience & qualifications
    experience_records: List[ExperienceRecord] = Field(
        description="Extracted employment history entries."
    )
    total_experience_months: int = Field(
        description="Sum of estimated tenure months across all experience records."
    )
    qualification_records: List[QualificationRecord] = Field(
        description="Extracted education and certification credentials."
    )

    # Role fit suggestions
    recommended_roles: List[str] = Field(
        description="Job title suggestions derived from the extracted skill profile."
    )

    # Demo vacancies
    job_matches: List[DemoJobMatch] = Field(
        description=(
            "Demonstration benchmark vacancies only. "
            "Match scores computed from extracted skills. "
            "NOT live job listings."
        )
    )

    # Provenance
    is_simulated: bool = Field(
        default=False,
        description="True only when backend analysis could not be performed."
    )
    job_description_provided: bool = Field(
        default=False,
        description="Whether a job description was supplied for requirement extraction."
    )
    ai_assistance_used: bool = Field(
        default=False,
        description="Whether the AI provider contributed inferred skill matches."
    )
    extraction_warnings: List[str] = Field(
        default_factory=list,
        description="Non-fatal warnings from the extraction pipeline."
    )
