# VeriSync AI — Backend API Contract & Architecture Specification

> **Version:** 1.0.0  
> **Target Environment:** Python (FastAPI / Pydantic / Uvicorn)  
> **Base URL:** `http://localhost:8000/api/v1`  
> **Frontend Integration:** Configured via `VITE_API_BASE_URL` in `frontend/src/services/api.ts`  
> **Active Domain:** **Employment & HR** (All other 5 platform domains are designated as `coming_soon`)

---

## 1. Executive Summary & Purpose

This document provides the definitive API contract between the existing **VeriSync AI** frontend (React 18 + Vite + TypeScript) and the Python backend service. 

VeriSync AI is an **evidence-first, multi-domain document verification platform**. Rather than functioning merely as a resume parser, the platform performs:
1. **Multi-document clause reconciliation & cross-reference audits** (Offer Letters, Contracts, Job Descriptions, HR Policies).
2. **Document completeness and mandatory clause verification**.
3. **Source-grounded evidence citation** (exact quoted excerpts, section names, and page numbers).
4. **Human-in-the-loop auditor review workflows** (confirm, flag, or accept variations).
5. **Candidate credential & role specification evaluation** (within the Employment & HR domain).

---

## 2. Domain Support Matrix

| Domain ID | Display Name | Status | Supported Workflows | Target Document Types |
| :--- | :--- | :--- | :--- | :--- |
| `employment-hr` | **Employment & HR** | **ACTIVE** | `employment-verification`<br/>`resume-career` | Offer Letters, Contracts, Job Descriptions, HR Policies, Resumes |
| `education` | **Education** | *Coming Soon* | `edu-credentials`<br/>`edu-curriculum` | Transcripts, Degree Certificates, Syllabi |
| `government-public` | **Government & Public Services** | *Coming Soon* | `gov-identity` | Civil Registry Records, Permits, Licenses |
| `banking-finance` | **Banking & Finance** | *Coming Soon* | `fin-underwriting` | Loan Sanction Letters, Mortgages, Balance Sheets |
| `healthcare-admin` | **Healthcare Administration** | *Coming Soon* | `health-credentialing` | Medical Licenses, Hospital Privileging Packets |
| `business-legal` | **Business & Legal Documents** | *Coming Soon* | `legal-msa-sow` | MSAs, Statements of Work (SOWs), NDAs |

---

## 3. Existing Frontend API Functions Analysis

The frontend defines its communication layer in [`frontend/src/services/api.ts`](file:///c:/Users/Nishanth/Music/IDS/frontend/src/services/api.ts). Below is the audit of each function:

### 3.1. `verifyEmploymentDocuments(params: VerificationParams)`
* **Current UI Consumer:** [`DocumentVerificationPage.tsx`](file:///c:/Users/Nishanth/Music/IDS/frontend/src/pages/DocumentVerificationPage.tsx)
* **Frontend Input Parameters:**
  ```typescript
  interface VerificationParams {
    files: { file: File; docType: EmploymentDocType }[];
    domain: DocumentDomain; // 'employment-hr'
  }
  ```
  where `EmploymentDocType = 'offer_letter' | 'contract' | 'job_description' | 'hr_policy' | 'other'`.
* **Current Behavior:** Simulates network latency (1800ms) and returns `mockVerificationResult` updated with uploaded file names when `VITE_API_BASE_URL` is empty.
* **Target HTTP Route:** `POST /api/v1/documents/verify`

### 3.2. `analyzeResume(params: ResumeAnalysisParams)`
* **Current UI Consumer:** [`ResumeCareerPage.tsx`](file:///c:/Users/Nishanth/Music/IDS/frontend/src/pages/ResumeCareerPage.tsx)
* **Frontend Input Parameters:**
  ```typescript
  interface ResumeAnalysisParams {
    file: File;
    careerDomain: CareerDomain; // e.g. 'software-engineering'
    targetRole?: string;
    targetCompany?: string;
  }
  ```
* **Current Behavior:** Simulates network latency (1400ms) and returns `mockResumeAnalysis` customized with target role and candidate filename.
* **Target HTTP Route:** `POST /api/v1/resumes/analyze`

### 3.3. `getJobMatches(params: JobMatchParams)`
* **Current UI Consumer:** Helper function in `api.ts` (benchmark listings currently embedded in `ResumeAnalysisResult.jobMatches`).
* **Frontend Input Parameters:**
  ```typescript
  interface JobMatchParams {
    skills: string[];
    domain: CareerDomain;
    locationPreference?: string;
  }
  ```
* **Target HTTP Route:** `GET /api/v1/jobs/matches`

### 3.4. `fetchAnalysisHistory(filters?: HistoryFilterParams)`
* **Current UI Consumer:** Defined in `api.ts`, intended for [`HistoryPage.tsx`](file:///c:/Users/Nishanth/Music/IDS/frontend/src/pages/HistoryPage.tsx).
* **Frontend Input Parameters:**
  ```typescript
  interface HistoryFilterParams {
    type?: 'all' | 'resume' | 'verification';
    searchQuery?: string;
    status?: string;
  }
  ```
* **Target HTTP Route:** `GET /api/v1/history`

---

## 4. Required Backend Endpoints Specification

### 4.1. `POST /api/v1/documents/verify`
Performs multi-document parsing, clause boundary extraction, cross-document comparison, and mandatory clause validation.

* **Content-Type:** `multipart/form-data`
* **Request Fields:**
  * `files`: `List[UploadFile]` (Binary file streams: PDF or DOCX)
  * `doc_types`: `str` (JSON string array mapping each file index or filename to `EmploymentDocType`)
  * `domain`: `str` (Default: `'employment-hr'`)
* **Response Body (`200 OK`):**
  ```json
  {
    "data": {
      "domain": "Employment & HR",
      "totalDocuments": 2,
      "status": "inconsistencies_detected",
      "summaryNote": "High-priority discrepancies identified between compensation terms, probation duration, and notice stipulations.",
      "reviewedAt": "Oct 13, 2026",
      "documentsReviewed": [
        "Offer_Letter_Signed_2024.pdf (Candidate Copy)",
        "Employment_Contract_Standard_v2.pdf (Company Legal Copy)"
      ],
      "findings": [
        {
          "id": "finding-1",
          "title": "Monthly Base Compensation Discrepancy",
          "severity": "high",
          "category": "compensation",
          "explanation": "The candidate offer letter explicitly promises a monthly gross salary of ₹30,000 per month, while the countersigned employment contract specifies ₹25,000 per month in the compensation schedule.",
          "sourceA": {
            "documentName": "Offer_Letter_Signed_2024.pdf",
            "section": "Clause 3.1: Compensation Structure",
            "page": 2,
            "extractedValue": "Gross Remuneration: ₹30,000 / month (payable on the last working day)"
          },
          "sourceB": {
            "documentName": "Employment_Contract_Standard_v2.pdf",
            "section": "Annexure A: Salary Breakdown",
            "page": 5,
            "extractedValue": "Basic & Allowances Total: ₹25,000 / month gross"
          },
          "recommendedAction": "Immediate HR reconciliation required. Request an addendum or confirmation letter from Payroll before formal onboarding closure.",
          "status": "verified_inconsistency"
        }
      ],
      "missingFields": [
        {
          "id": "missing-1",
          "fieldName": "Annexure B: Intellectual Property & Inventions Assignment",
          "expectedIn": "Employment_Contract_Standard_v2.pdf",
          "severity": "critical",
          "detail": "Section 12 references Annexure B for proprietary invention assignments, but the attachment is missing in the uploaded file."
        }
      ]
    },
    "isSimulated": false,
    "backendConnected": true,
    "message": "Verification completed successfully"
  }
  ```

---

### 4.2. `POST /api/v1/resumes/analyze`
Extracts candidate skills, experience tenure, and education credentials, compares them against the role specification and requirements text, and generates role fit scores and vacancy recommendations.

* **Content-Type:** `multipart/form-data`
* **Request Fields:**
  * `file`: `UploadFile` (Candidate resume file)
  * `domain`: `str` (Career taxonomy: `software-engineering`, `data-ai`, etc.)
  * `target_role`: `Optional[str]` (e.g. `Senior Full Stack Engineer`)
  * `target_company`: `Optional[str]` (e.g. `NovaCloud Technologies`)
  * `job_description`: `Optional[str]` (Requirements text pasted in UI)
* **Response Body (`200 OK`):**
  ```json
  {
    "data": {
      "candidateName": "Alex Morgan",
      "overallFitScore": 86,
      "experienceLevel": "Senior Level (5+ Years)",
      "summary": "Demonstrated expertise in building scalable cloud web applications using modern React, TypeScript, and Node.js microservices.",
      "identifiedSkills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
      "matchedSkills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
      "missingSkills": ["Kubernetes (K8s)", "GraphQL", "AWS Cloud Architecture"],
      "recommendedRoles": [
        "Senior Full Stack Engineer",
        "Lead Frontend Engineer",
        "Platform Software Engineer II"
      ],
      "jobMatches": [
        {
          "id": "job-1",
          "title": "Senior Full Stack Engineer",
          "company": "NovaCloud Technologies",
          "location": "Bangalore, India (Hybrid)",
          "matchScore": 92,
          "salaryRange": "₹28,00,000 - ₹35,00,000 PA",
          "workType": "Hybrid",
          "description": "Looking for a senior engineer to drive our core collaborative enterprise dashboard.",
          "matchedSkills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
          "missingSkills": ["Kubernetes", "AWS"],
          "department": "Core Infrastructure",
          "postedDate": "3 days ago"
        }
      ],
      "analyzedAt": "Oct 13, 2026",
      "fileName": "Alex_Morgan_Senior_Engineer_Resume.pdf",
      "fileSize": "1.4 MB"
    },
    "isSimulated": false,
    "backendConnected": true,
    "message": "Resume analyzed successfully"
  }
  ```

---

### 4.3. `GET /api/v1/history`
Provides searchable and filterable audit trail records.

* **Query Parameters:**
  * `type`: `Optional[str]` (`all`, `resume`, `verification`)
  * `status`: `Optional[str]` (`all`, `Completed`, `Inconsistencies Found`, `Verified`, `Pending Review`)
  * `search`: `Optional[str]` (Free-text search across document title, candidate, and summary)
* **Response Body (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": "HIST-101",
        "documentName": "Offer_Letter_Signed_2024.pdf & Contract.pdf",
        "analysisType": "Employment Document Verification",
        "date": "Oct 12, 2026",
        "status": "Inconsistencies Found",
        "summary": "Salary discrepancy (₹30,000 vs ₹25,000) and probation period conflict identified.",
        "metricBadge": "3 Inconsistencies",
        "findingsCount": 3,
        "domain": "Employment & HR"
      }
    ],
    "isSimulated": false,
    "backendConnected": true
  }
  ```

---

### 4.4. `GET /api/v1/dashboard/stats` & `GET /api/v1/dashboard/recent-activity`
Provides platform analytics and real-time operational feeds for the Overview dashboard.

* **`GET /api/v1/dashboard/stats` Response:**
  ```json
  {
    "data": {
      "totalDocumentsReviewed": 1428,
      "potentialInconsistenciesFound": 184,
      "itemsRequiringReview": 36,
      "resumesAnalyzed": 892,
      "jobMatchesIdentified": 3410
    }
  }
  ```
* **`GET /api/v1/dashboard/recent-activity` Response:**
  ```json
  {
    "data": [
      {
        "id": "act-1",
        "title": "Employment Package Cross-Check",
        "subtitle": "Offer_Letter_2024.pdf vs Employment_Contract.pdf",
        "timestamp": "12 mins ago",
        "type": "verification",
        "status": "warning",
        "statusText": "2 Inconsistencies Flagged"
      }
    ]
  }
  ```

---

### 4.5. `POST /api/v1/documents/findings/{finding_id}/review`
Captures human reviewer determinations for audit accountability.

* **Path Parameter:** `finding_id: str`
* **Request Body (`application/json`):**
  ```json
  {
    "status": "Verified Inconsistency",
    "notes": "Reviewed with payroll director; amendment addendum required."
  }
  ```
  Supported status values from UI:
  * `"Verified Inconsistency"` (Confirm Inconsistency)
  * `"Acceptable Variation"` (Acceptable Variation)
  * `"Flagged for Legal Review"` (Flag for Legal)
* **Response Body (`200 OK`):**
  ```json
  {
    "success": true,
    "findingId": "finding-1",
    "status": "Verified Inconsistency",
    "recordedAt": "2026-10-13T23:25:00Z"
  }
  ```

---

### 4.6. `GET /api/v1/health`
System diagnostic and readiness probe.

* **Response Body (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "activeDomain": "employment-hr",
    "aiEngineReady": true
  }
  ```

---

## 5. Audit of Current Mock Data & Client-Side State

The following table documents where data currently originates in the frontend and how it transitions to the backend:

| UI View / Component | Current Implementation | Backend Transition Strategy |
| :--- | :--- | :--- |
| **`DashboardPage.tsx`** | Direct import of `mockStats` and `mockRecentActivity` from `data/mockData.ts` | Connect to `GET /dashboard/stats` and `GET /dashboard/recent-activity` with fallback to mock data if offline. |
| **`DocumentVerificationPage.tsx`** | Calls `verifyEmploymentDocuments()` which returns `mockVerificationResult` | Call live `POST /documents/verify`. Fallback to mock data if offline. |
| **Completeness Checklist** | Hardcoded array of 5 checklist items in component state (`chk-1` to `chk-5`) | Populate dynamically from `VerificationResult.checklist` or domain checklist template. |
| **Human Review Decisions** | Stored in component React state `reviewerDecisions[finding.id]` | Persist decisions to `POST /documents/findings/{id}/review`. |
| **Report Export Modal** | Pure client-side Markdown and JSON formatting via browser `Blob` | Keep client-side generator; optionally allow server-signed PDF / Audit export. |
| **`ResumeCareerPage.tsx`** | Calls `analyzeResume()` which returns `mockResumeAnalysis` | Call live `POST /resumes/analyze` sending file, target role, and job description text. |
| **`HistoryPage.tsx`** | Directly filters `mockHistoryItems` in-memory via `useMemo` | Hook into `fetchAnalysisHistory()` pointing to `GET /history`. |
| **`SettingsPage.tsx`** | Local React state for name, email, notification toggles | Can query `GET /health` and persist reviewer preferences in session/DB. |

---

## 6. Evidence, Citations, Severity, and Review Representation

### 6.1. Dual-Source Citation Structure
Every inconsistency finding requires side-by-side evidence to justify why a discrepancy was flagged:
```typescript
interface SourceCitation {
  documentName: string;    // e.g. "Offer_Letter_Signed_2024.pdf"
  section: string;         // e.g. "Clause 3.1: Compensation Structure"
  page: number;            // 1-indexed page integer, e.g. 2
  extractedValue: string;  // Verbatim clause excerpt, e.g. "Gross Remuneration: ₹30,000 / month"
}
```

### 6.2. Severity Classifications
* **`InconsistencyFinding.severity`**:
  * `'high'`: Direct contractual conflict in financial, tenure, or separation terms (e.g. ₹30k vs ₹25k).
  * `'medium'`: Variations in probation periods, evaluation criteria, or notice duration policies.
  * `'low'`: Formatting or minor administrative deviations.
* **`MissingFieldFinding.severity`**:
  * `'critical'`: Missing mandatory legal covenants (e.g. Missing IP Assignment Annexure).
  * `'moderate'`: Missing organizational metadata (e.g. Missing Designated Supervisor Title).
  * `'optional'`: Recommended supplementary documents.

### 6.3. Report Export Formats
The report exporter in `frontend/src/components/common/ExportReportModal.tsx` generates:
1. **Markdown Format (`.md`)**:
   * Header with Domain, Reviewed Timestamp, and Inspected Document List.
   * Executive Summary with mandatory human-review disclaimer.
   * Numbered Findings Matrix with side-by-side blockquoted excerpts, page numbers, and recommended auditor actions.
   * Completeness & Missing Fields list.
2. **Structured JSON Format (`.json`)**:
   * Complete serialized `VerificationResult` schema.

---

## 7. Contract Gaps & Inconsistencies Discovered

During inspection of the frontend code, four minor contract gaps were identified:

1. **Missing `jobDescription` in `ResumeAnalysisParams`**:
   * In `ResumeCareerPage.tsx`, users can input target requirements text in `jobDescriptionText`.
   * However, `ResumeAnalysisParams` in `frontend/src/services/api.ts` does not pass `jobDescriptionText`.
   * **Resolution for Backend:** The endpoint `POST /resumes/analyze` accepts an optional `job_description` form field.
2. **Checklist Items Origin**:
   * `CompletenessChecklist.tsx` expects `{ id, label, required, status, foundIn, note }[]`.
   * `VerificationResult` in `types/index.ts` only includes `missingFields`, so `DocumentVerificationPage.tsx` currently hardcodes present checklist items.
   * **Resolution for Backend:** Include an optional `checklist` array in `VerificationResult` so both present and missing clauses are dynamically returned by the backend.
3. **`DocumentDomain` Union**:
   * `types/index.ts` defines `DocumentDomain = 'employment-hr' | 'legal-contracts' | 'procurement-finance'`, while `domainData.ts` defines 6 domains.
   * **Resolution:** Ensure `DocumentDomain` string parameter accepts `employment-hr` as the active operational domain.
4. **History & Dashboard Pages Direct Mock Import**:
   * `DashboardPage.tsx` and `HistoryPage.tsx` import `mockStats` and `mockHistoryItems` directly from `mockData.ts` rather than invoking `fetchAnalysisHistory()`.
   * **Resolution:** In the next integration step, these views can optionally invoke API service hooks while retaining fallback defaults if the backend is offline.

---

## 8. Summary of Next Implementation Stage

With the API contract formally established:
1. The Python backend should be implemented using **FastAPI** with CORS middleware enabled for `http://localhost:5173`.
2. Endpoints `POST /api/v1/documents/verify` and `POST /api/v1/resumes/analyze` should serve as the primary AI pipelines.
3. Auxiliary endpoints `GET /api/v1/health`, `GET /api/v1/history`, and `GET /api/v1/dashboard/stats` should be implemented to complete the platform.
