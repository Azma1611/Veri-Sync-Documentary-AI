"""
VeriSync AI — Resume Extractor

Extracts structured resume sections from raw document text produced by the
PDF or DOCX extractors.

What this module does
---------------------
* Identifies common resume sections: Summary/Objective, Experience, Education,
  Skills, Certifications, Projects, etc.
* Extracts candidate name from the document header.
* Extracts raw skill tokens (keyword search, not LLM).
* Extracts employment history: role titles + employers + duration strings.
* Extracts qualifications: degrees, certifications, courses.
* Returns source references (page or paragraph) for every extraction so the
  fit engine can attach verbatim evidence to each SkillMatch.

What this module does NOT do
-----------------------------
* It does not call any LLM or external service.
* It does not normalize skill names — that is the taxonomy layer's job.
* It does not compute scores.
* It does not validate evidence against ground truth.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger("verisync.resume_extractor")


# ---------------------------------------------------------------------------
# Output data structures (plain dataclasses — no Pydantic dependency here)
# ---------------------------------------------------------------------------

@dataclass
class RawSkillToken:
    """A raw skill term found in the resume text."""
    token: str                        # As found in text (pre-normalization)
    source_text: str                  # Surrounding sentence/line for evidence
    page: Optional[int] = None        # 1-indexed (PDF only)
    paragraph_index: Optional[int] = None  # 0-indexed (DOCX only)
    section_heading: Optional[str] = None


@dataclass
class RawExperienceRecord:
    """A single employment tenure extracted from the resume."""
    role_title: str
    employer: Optional[str] = None
    raw_duration_text: Optional[str] = None   # e.g. "Jan 2021 – Mar 2023"
    duration_months: Optional[int] = None     # estimated
    source_text: str = ""
    page: Optional[int] = None
    paragraph_index: Optional[int] = None
    section_heading: Optional[str] = None


@dataclass
class RawQualification:
    """A degree, certification, or course found in the resume."""
    credential_name: str
    institution: Optional[str] = None
    year: Optional[str] = None
    source_text: str = ""
    page: Optional[int] = None
    paragraph_index: Optional[int] = None
    section_heading: Optional[str] = None


@dataclass
class ResumeExtractionResult:
    """Parsed resume content before scoring."""
    candidate_name: Optional[str] = None
    raw_skill_tokens: List[RawSkillToken] = field(default_factory=list)
    experience_records: List[RawExperienceRecord] = field(default_factory=list)
    qualification_records: List[RawQualification] = field(default_factory=list)
    full_text: str = ""
    warnings: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Section heading patterns
# ---------------------------------------------------------------------------

_SECTION_PATTERNS: Dict[str, re.Pattern[str]] = {
    "experience": re.compile(
        r"(?:work\s+)?(?:experience|employment|history|career|professional\s+background)",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"(?:education|academic|qualification|degree|university|college)",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"(?:skill|technical|competenc|proficienc|technologies|tools|expertise|stack)",
        re.IGNORECASE,
    ),
    "certifications": re.compile(
        r"(?:certification|certificate|accreditation|license|credential)",
        re.IGNORECASE,
    ),
    "summary": re.compile(
        r"(?:summary|objective|profile|about|overview|introduction)",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"(?:project|portfolio|work\s+sample)",
        re.IGNORECASE,
    ),
}

# Comma/bullet-separated skill list patterns
_SKILL_LIST_PATTERN = re.compile(
    r"""
    (?:
        [A-Za-z][A-Za-z0-9\s\.\-\+\#/]{1,35}   # skill token (2–36 chars including spaces)
    )
    (?:\s*[,•|\t/]\s*)                            # delimiter: comma, bullet, pipe, tab, slash
    """,
    re.VERBOSE,
)

# Duration patterns for experience extraction
_DURATION_PATTERN = re.compile(
    r"""
    (?:
        # Month Year – Month Year  (e.g. "Jan 2021 – Mar 2023")
        (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}
        \s*[–\-—–to]+\s*
        (?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|present|current|now)
    |
        # "2020 – 2023" or "2020 - Present"
        \d{4}\s*[–\-—–to]+\s*(?:\d{4}|present|current|now)
    |
        # "3 years", "6 months"
        \d+\s*(?:year|yr|month|mo)s?
    )
    """,
    re.VERBOSE | re.IGNORECASE,
)

# Role title indicators
_ROLE_TITLE_PATTERN = re.compile(
    r"""
    (?:
        (?:senior|junior|lead|principal|staff|chief|head|associate|assistant)\s+
    )?
    (?:
        (?:software|data|product|ml|ai|backend|frontend|full\s*stack|devops|site\s+reliability)
        \s+
        (?:engineer|developer|scientist|analyst|architect|manager|specialist|consultant)
    |
        (?:engineer|developer|analyst|manager|consultant|director|vp|cto|ceo|coo|
           designer|researcher|coordinator|recruiter|administrator|specialist)
    )
    """,
    re.VERBOSE | re.IGNORECASE,
)

# Degree patterns
_DEGREE_PATTERN = re.compile(
    r"""
    (?:
        b\.?(?:tech|sc|e|a|com|eng)\.?|
        m\.?(?:tech|sc|e|a|com|eng|ba|s)\.?|
        bachelor|master|doctor|phd|mba|bba|bca|mca|
        diploma|certificate|certification|course|bootcamp|
        post.?graduate
    )
    (?:
        \s+(?:of|in|degree)\s+[\w\s,]{3,60}
    )?
    """,
    re.VERBOSE | re.IGNORECASE,
)

# Year pattern
_YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")

# Name extraction heuristic: first non-empty line of the first page,
# if it looks like a person's name (2–4 title-cased words, no digits)
_NAME_PATTERN = re.compile(
    r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$"
)


# ---------------------------------------------------------------------------
# Duration estimation helper
# ---------------------------------------------------------------------------

def _estimate_months(raw_duration: str) -> Optional[int]:
    """
    Estimate duration in months from a raw duration string.

    Examples handled:
        "Jan 2021 – Mar 2023"  → 26
        "2019 – 2022"          → 36
        "3 years"              → 36
        "6 months"             → 6
        "2020 - Present"       → months since 2020 (approx)
    """
    import datetime
    text = raw_duration.lower().strip()

    # "N years"
    m = re.search(r"(\d+)\s*(?:year|yr)s?", text)
    if m:
        years = int(m.group(1))
        return years * 12

    # "N months"
    m = re.search(r"(\d+)\s*(?:month|mo)s?", text)
    if m:
        return int(m.group(1))

    # "YYYY – YYYY" or "YYYY - Present"
    year_matches = re.findall(r"\b(19|20)(\d{2})\b", text)
    if year_matches:
        years = [int(f"{a}{b}") for a, b in year_matches]
        if len(years) >= 2:
            return max(0, (years[1] - years[0]) * 12)
        if len(years) == 1 and ("present" in text or "current" in text or "now" in text):
            current_year = datetime.datetime.now().year
            return max(0, (current_year - years[0]) * 12)

    return None


# ---------------------------------------------------------------------------
# Section splitter
# ---------------------------------------------------------------------------

def _split_into_sections(text: str) -> Dict[str, List[str]]:
    """
    Split full text into logical sections using heading heuristics.

    Returns a dict mapping section type → list of text lines in that section.
    An "unknown" key captures lines before any recognized heading.
    """
    sections: Dict[str, List[str]] = {"unknown": []}
    current_section = "unknown"
    lines = text.splitlines()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if this line is a section heading (short, often all-caps or title-case)
        if len(stripped) <= 60:
            matched_section = None
            for section_type, pattern in _SECTION_PATTERNS.items():
                if pattern.search(stripped):
                    matched_section = section_type
                    break
            if matched_section:
                current_section = matched_section
                sections.setdefault(current_section, [])
                continue

        sections.setdefault(current_section, []).append(stripped)

    return sections


# ---------------------------------------------------------------------------
# Skill extraction
# ---------------------------------------------------------------------------

_SKILL_PREFIX_PATTERN = re.compile(
    r"^(?:skills?|technologies|tech stack|tools|proficiencies|languages|frameworks)\s*:\s*",
    re.IGNORECASE,
)


def _extract_skill_tokens_from_text(
    text: str,
    page: Optional[int],
    paragraph_index: Optional[int],
    section_heading: Optional[str],
) -> List[RawSkillToken]:
    """
    Extract skill-like tokens from a block of text.

    Strategy:
    1. Scan lines for list-like structures (comma, bullet, pipe delimited).
    2. Scan text for technology patterns (CamelCase, acronyms, known extensions).
    """
    tokens: List[RawSkillToken] = []
    seen: set[str] = set()

    lines = text.splitlines()
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        # Strip prefixes like "Skills: " or "Tech Stack: "
        clean_line = _SKILL_PREFIX_PATTERN.sub("", line)

        # If line has delimiters, split into tokens
        if any(d in clean_line for d in (",", "•", "|", ";", "/")):
            parts = re.split(r"[,•|;/]", clean_line)
            for part in parts:
                tok = part.strip()
                if 2 <= len(tok) <= 35 and tok.lower() not in seen:
                    # Ignore purely numeric or noise tokens
                    if not tok.isdigit():
                        seen.add(tok.lower())
                        tokens.append(RawSkillToken(
                            token=tok,
                            source_text=line[:200],
                            page=page,
                            paragraph_index=paragraph_index,
                            section_heading=section_heading,
                        ))

    # Technology keyword scan for inline mentions
    word_pattern = re.compile(
        r"\b(?:"
        r"[A-Z][a-z]+(?:[A-Z][a-z]+)+"     # CamelCase
        r"|[A-Z]{2,10}"                      # ALL CAPS acronyms (SQL, API, etc.)
        r"|[a-z]+(?:\.[a-z]+)+"              # dotted (node.js, etc.)
        r"|[A-Za-z][A-Za-z0-9\+\#\-]{2,15}" # mixed (C++, C#, TypeScript, etc.)
        r")\b"
    )
    for match in word_pattern.finditer(text):
        tok = match.group(0)
        if tok.lower() not in seen and 2 <= len(tok) <= 35:
            # Skip noise / common English words
            if tok.lower() in {"and", "the", "for", "with", "from", "years", "senior", "engineer", "software", "corp"}:
                continue
            seen.add(tok.lower())
            start = max(0, match.start() - 60)
            end = min(len(text), match.end() + 60)
            context = text[start:end].replace("\n", " ").strip()
            tokens.append(RawSkillToken(
                token=tok,
                source_text=context,
                page=page,
                paragraph_index=paragraph_index,
                section_heading=section_heading,
            ))

    return tokens


# ---------------------------------------------------------------------------
# Name extraction
# ---------------------------------------------------------------------------

def _extract_candidate_name(evidence_blocks: List[dict], full_text: str) -> Optional[str]:
    """
    Heuristically extract the candidate's name.

    Tries the first 1–3 evidence blocks (typically the resume header),
    looks for a 2–4 word Title-Cased line with no digits.
    """
    for block in evidence_blocks[:3]:
        text = block.get("text", "").strip()
        for line in text.splitlines()[:5]:
            line = line.strip()
            m = _NAME_PATTERN.match(line)
            if m and len(line) > 4:
                return m.group(1)

    # Fallback: scan first 500 chars of full text
    for line in full_text[:500].splitlines()[:8]:
        line = line.strip()
        m = _NAME_PATTERN.match(line)
        if m and len(line) > 4:
            return m.group(1)

    return None


# ---------------------------------------------------------------------------
# Experience extraction
# ---------------------------------------------------------------------------

def _extract_experience(
    evidence_blocks: List[dict],
) -> List[RawExperienceRecord]:
    """
    Scan all evidence blocks for employment history patterns.

    Heuristic: blocks near an experience section heading that contain
    role title patterns and/or duration patterns are treated as employment
    records.
    """
    records: List[RawExperienceRecord] = []
    seen_roles: set[str] = set()

    for block in evidence_blocks:
        text = block.get("text", "")
        section = block.get("section_heading", "")
        page = block.get("page")
        para_idx = block.get("paragraph_index")

        # Only consider blocks plausibly in an experience section
        section_str = (section or "").lower()
        is_experience_section = bool(
            _SECTION_PATTERNS["experience"].search(section_str)
            or _SECTION_PATTERNS["experience"].search(text[:80])
        )

        # Look for duration strings anywhere in the block
        duration_match = _DURATION_PATTERN.search(text)
        raw_duration = duration_match.group(0) if duration_match else None
        duration_months = _estimate_months(raw_duration) if raw_duration else None

        # Look for role titles
        role_match = _ROLE_TITLE_PATTERN.search(text)
        role_title = role_match.group(0).strip().title() if role_match else None

        # Must have at least a duration or be in experience section + have a role
        if role_title and role_title.lower() not in seen_roles:
            if raw_duration or is_experience_section:
                seen_roles.add(role_title.lower())
                # Try to extract employer: first title-cased multi-word phrase
                # on the same line as the role title that doesn't look like the role
                employer = _extract_employer(text, role_title)
                records.append(RawExperienceRecord(
                    role_title=role_title,
                    employer=employer,
                    raw_duration_text=raw_duration,
                    duration_months=duration_months,
                    source_text=text[:200],
                    page=page,
                    paragraph_index=para_idx,
                    section_heading=section,
                ))

    return records


def _extract_employer(text: str, role_title: str) -> Optional[str]:
    """
    Heuristically extract an employer name from the context around a role.

    Looks for "@", "at", or capitalized sequences that aren't the role title.
    """
    # Pattern: "Software Engineer at Acme Corp" or "Software Engineer, Acme Corp"
    m = re.search(
        r"(?:at|@|,)\s+([A-Z][A-Za-z0-9\s&.,']{2,50}?)(?:\s*[|\n|•]|$)",
        text,
        re.MULTILINE,
    )
    if m:
        candidate = m.group(1).strip()
        if candidate.lower() != role_title.lower() and len(candidate) > 2:
            return candidate
    return None


# ---------------------------------------------------------------------------
# Qualification extraction
# ---------------------------------------------------------------------------

def _extract_qualifications(
    evidence_blocks: List[dict],
) -> List[RawQualification]:
    """
    Extract degree and certification records from evidence blocks.
    """
    records: List[RawQualification] = []
    seen: set[str] = set()

    for block in evidence_blocks:
        text = block.get("text", "")
        page = block.get("page")
        para_idx = block.get("paragraph_index")
        section = block.get("section_heading", "")

        degree_match = _DEGREE_PATTERN.search(text)
        if not degree_match:
            continue

        credential_raw = text[degree_match.start():degree_match.end() + 80].strip()[:100]
        credential_key = degree_match.group(0).lower().strip()
        if credential_key in seen:
            continue
        seen.add(credential_key)

        year_match = _YEAR_PATTERN.search(text)
        year = year_match.group(0) if year_match else None

        # Try to find institution
        institution = _extract_institution(text)

        records.append(RawQualification(
            credential_name=credential_raw,
            institution=institution,
            year=year,
            source_text=text[:200],
            page=page,
            paragraph_index=para_idx,
            section_heading=section,
        ))

    return records


def _extract_institution(text: str) -> Optional[str]:
    """Heuristically extract institution name (university, college, institute)."""
    m = re.search(
        r"(?:university|college|institute|school|iit|iim|nit|mit|iisc)\s+(?:of\s+)?[A-Za-z\s]{3,50}",
        text,
        re.IGNORECASE,
    )
    if m:
        return m.group(0).strip().title()
    return None


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def extract_resume(
    full_text: str,
    evidence_blocks: List[dict],
    filename: str = "resume",
) -> ResumeExtractionResult:
    """
    Parse a resume from extracted text and evidence blocks.

    Parameters
    ----------
    full_text       : Concatenated full text from PDF or DOCX extractor.
    evidence_blocks : Per-page/paragraph evidence blocks from the extractor.
    filename        : Original filename (for warnings).

    Returns
    -------
    ResumeExtractionResult with raw tokens ready for the fit engine.
    """
    result = ResumeExtractionResult(full_text=full_text)
    warnings: List[str] = []

    if not full_text.strip():
        warnings.append(f"'{filename}' produced no extractable text.")
        result.warnings = warnings
        return result

    # 1. Candidate name
    result.candidate_name = _extract_candidate_name(evidence_blocks, full_text)
    if not result.candidate_name:
        warnings.append("Candidate name could not be extracted from the document header.")

    # 2. Skill tokens — scan all evidence blocks
    all_skill_tokens: List[RawSkillToken] = []
    seen_tokens: set[str] = set()

    for block in evidence_blocks:
        tokens = _extract_skill_tokens_from_text(
            text=block.get("text", ""),
            page=block.get("page"),
            paragraph_index=block.get("paragraph_index"),
            section_heading=block.get("section_heading"),
        )
        for tok in tokens:
            if tok.token.lower() not in seen_tokens:
                seen_tokens.add(tok.token.lower())
                all_skill_tokens.append(tok)

    result.raw_skill_tokens = all_skill_tokens
    logger.info("'%s': %d raw skill tokens extracted", filename, len(all_skill_tokens))

    # 3. Experience records
    result.experience_records = _extract_experience(evidence_blocks)
    logger.info("'%s': %d experience records extracted", filename, len(result.experience_records))

    # 4. Qualification records
    result.qualification_records = _extract_qualifications(evidence_blocks)
    logger.info("'%s': %d qualification records extracted", filename, len(result.qualification_records))

    if not result.experience_records:
        warnings.append(
            "No experience records could be confidently extracted. "
            "The experience score will reflect zero-tenure."
        )

    result.warnings = warnings
    return result
