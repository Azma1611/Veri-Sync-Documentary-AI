"""
VeriSync AI — Skill Taxonomy

Career-domain-specific skill lists used by the resume fit engine.

Design decisions
----------------
* Skills are stored as lowercase sets for O(1) lookup.
* Each domain has: required_skills (common must-haves) and preferred_skills
  (nice-to-haves that boost the score but are not required).
* Experience synonyms map related skill names so "ReactJS" matches "React",
  "ML" matches "Machine Learning", etc. All synonyms are lowercased.
* This module contains ONLY static data — no LLM, no network calls.
* Domain taxonomy keys match the CareerDomain enum in the frontend:
    software-engineering | data-ai | finance-fintech |
    product-design | healthcare-biotech | operations-hr
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Set


@dataclass
class DomainTaxonomy:
    """Skill taxonomy for a single career domain."""
    domain_id: str
    display_name: str
    # Ordered lists preserved for deterministic iteration
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    # Maps alias → canonical skill name (all lowercase keys)
    synonyms: Dict[str, str] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Taxonomy definitions
# ---------------------------------------------------------------------------

_TAXONOMIES: List[DomainTaxonomy] = [

    DomainTaxonomy(
        domain_id="software-engineering",
        display_name="Software Engineering",
        required_skills=[
            "Python", "JavaScript", "TypeScript", "Java", "C#", "C++",
            "React", "Node.js", "SQL", "Git", "REST APIs", "Docker",
            "Unit Testing", "Object-Oriented Programming",
        ],
        preferred_skills=[
            "Kubernetes", "GraphQL", "AWS", "Azure", "GCP",
            "CI/CD", "Microservices", "Redis", "PostgreSQL",
            "MongoDB", "Terraform", "Linux", "System Design",
        ],
        synonyms={
            "reactjs": "React",
            "react.js": "React",
            "nodejs": "Node.js",
            "node": "Node.js",
            "js": "JavaScript",
            "ts": "TypeScript",
            "oop": "Object-Oriented Programming",
            "object oriented": "Object-Oriented Programming",
            "postgres": "PostgreSQL",
            "k8s": "Kubernetes",
            "gcp": "GCP",
            "amazon web services": "AWS",
            "microsoft azure": "Azure",
            "google cloud": "GCP",
            "continuous integration": "CI/CD",
            "continuous delivery": "CI/CD",
            "rest api": "REST APIs",
            "restful": "REST APIs",
            "mysql": "SQL",
            "mssql": "SQL",
            "sqlite": "SQL",
            "unit test": "Unit Testing",
            "pytest": "Unit Testing",
            "jest": "Unit Testing",
        },
    ),

    DomainTaxonomy(
        domain_id="data-ai",
        display_name="Data & AI",
        required_skills=[
            "Python", "Machine Learning", "SQL", "Statistics",
            "Data Analysis", "Pandas", "NumPy", "Scikit-learn",
            "Data Visualization", "Jupyter",
        ],
        preferred_skills=[
            "TensorFlow", "PyTorch", "Deep Learning", "NLP",
            "Spark", "Airflow", "Databricks", "MLflow",
            "Big Data", "R", "Tableau", "Power BI",
        ],
        synonyms={
            "ml": "Machine Learning",
            "ai": "Machine Learning",
            "artificial intelligence": "Machine Learning",
            "dl": "Deep Learning",
            "deep-learning": "Deep Learning",
            "natural language processing": "NLP",
            "tensorflow": "TensorFlow",
            "pytorch": "PyTorch",
            "scikit learn": "Scikit-learn",
            "sklearn": "Scikit-learn",
            "matplotlib": "Data Visualization",
            "seaborn": "Data Visualization",
            "powerbi": "Power BI",
            "power-bi": "Power BI",
        },
    ),

    DomainTaxonomy(
        domain_id="finance-fintech",
        display_name="Finance & Fintech",
        required_skills=[
            "Financial Analysis", "Excel", "Accounting", "SQL",
            "Risk Management", "Financial Modeling", "Reporting",
        ],
        preferred_skills=[
            "Python", "Bloomberg", "Tableau", "Power BI", "Compliance",
            "Blockchain", "Payments", "Treasury", "Audit",
        ],
        synonyms={
            "ms excel": "Excel",
            "microsoft excel": "Excel",
            "financial model": "Financial Modeling",
            "risk assessment": "Risk Management",
            "regulatory compliance": "Compliance",
        },
    ),

    DomainTaxonomy(
        domain_id="product-design",
        display_name="Product & Design",
        required_skills=[
            "Product Management", "UX Design", "Figma", "User Research",
            "Wireframing", "Prototyping", "Agile", "Roadmapping",
        ],
        preferred_skills=[
            "Sketch", "Adobe XD", "Usability Testing", "A/B Testing",
            "OKRs", "SQL", "Python", "Design Systems",
        ],
        synonyms={
            "ux": "UX Design",
            "user experience": "UX Design",
            "ui": "UX Design",
            "user interface": "UX Design",
            "product roadmap": "Roadmapping",
            "scrum": "Agile",
        },
    ),

    DomainTaxonomy(
        domain_id="healthcare-biotech",
        display_name="Healthcare & Biotech",
        required_skills=[
            "Clinical Research", "GCP", "Regulatory Affairs", "Biostatistics",
            "Medical Writing", "CTMS", "ICH Guidelines",
        ],
        preferred_skills=[
            "Python", "R", "SAS", "CDISC", "FDA Submissions",
            "EHR Systems", "HIPAA Compliance",
        ],
        synonyms={
            "good clinical practice": "GCP",
            "ich": "ICH Guidelines",
            "clinical trial management": "CTMS",
            "biostat": "Biostatistics",
            "hipaa": "HIPAA Compliance",
        },
    ),

    DomainTaxonomy(
        domain_id="operations-hr",
        display_name="Operations & HR",
        required_skills=[
            "HR Management", "Recruitment", "Payroll", "Performance Management",
            "Employee Relations", "HRIS", "Compliance", "Training & Development",
        ],
        preferred_skills=[
            "Workday", "SAP HR", "BambooHR", "Excel", "Reporting",
            "Change Management", "Labor Law", "Talent Acquisition",
        ],
        synonyms={
            "human resources": "HR Management",
            "hrms": "HRIS",
            "hcm": "HRIS",
            "talent management": "Recruitment",
            "onboarding": "Recruitment",
            "l&d": "Training & Development",
            "learning and development": "Training & Development",
            "payroll processing": "Payroll",
        },
    ),
]


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

# Domain lookup by ID
TAXONOMY_BY_DOMAIN: Dict[str, DomainTaxonomy] = {t.domain_id: t for t in _TAXONOMIES}


def get_taxonomy(domain_id: str) -> DomainTaxonomy:
    """Return taxonomy for the given domain. Falls back to software-engineering."""
    return TAXONOMY_BY_DOMAIN.get(domain_id, TAXONOMY_BY_DOMAIN["software-engineering"])


def normalize_skill_name(raw: str, taxonomy: DomainTaxonomy) -> str:
    """
    Normalize a raw skill token to its canonical name.

    1. Check synonym map (case-insensitive).
    2. Check if the lowercase token matches (case-insensitively) any required
       or preferred skill — return that skill's canonical casing.
    3. Return title-cased token as fallback.
    """
    lowered = raw.lower().strip()

    # Direct synonym lookup
    if lowered in taxonomy.synonyms:
        return taxonomy.synonyms[lowered]

    # Case-insensitive match against known skills
    all_skills = taxonomy.required_skills + taxonomy.preferred_skills
    for skill in all_skills:
        if skill.lower() == lowered:
            return skill

    return raw.strip().title()


def get_required_skills_set(taxonomy: DomainTaxonomy) -> Set[str]:
    """Return lowercase set of required skill names for O(1) membership tests."""
    return {s.lower() for s in taxonomy.required_skills}


def get_preferred_skills_set(taxonomy: DomainTaxonomy) -> Set[str]:
    """Return lowercase set of preferred skill names for O(1) membership tests."""
    return {s.lower() for s in taxonomy.preferred_skills}
