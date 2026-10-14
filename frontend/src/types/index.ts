// Types for VeriSync AI Platform

export type CareerDomain =
  | 'software-engineering'
  | 'data-ai'
  | 'finance-fintech'
  | 'product-design'
  | 'healthcare-biotech'
  | 'operations-hr';

export type DocumentDomain =
  | 'employment-hr'
  | 'healthcare-admin'
  | 'education'
  | 'government-public'
  | 'banking-finance'
  | 'business-legal';

export type EmploymentDocType =
  | 'offer_letter'
  | 'contract'
  | 'job_description'
  | 'hr_policy'
  | 'other';

export type HealthcareDocType =
  | 'patient_registration'
  | 'hospital_invoice'
  | 'insurance_claim'
  | 'discharge_summary'
  | 'other';

export type GenericDocType = EmploymentDocType | HealthcareDocType | string;

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  docType?: GenericDocType;
  uploadedAt: Date;
}

export interface JobMatchItem {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salaryRange: string;
  workType: 'Full-time' | 'Remote' | 'Hybrid' | 'Contract';
  description: string;
  matchedSkills: string[];
  missingSkills: string[];
  department: string;
  postedDate: string;
}

export interface ResumeAnalysisResult {
  candidateName: string;
  overallFitScore: number;
  experienceLevel: string;
  summary: string;
  identifiedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  recommendedRoles: string[];
  jobMatches: JobMatchItem[];
  analyzedAt: string;
  fileName: string;
  fileSize: string;
}

export type InconsistencySeverity = 'high' | 'medium' | 'low';

export interface InconsistencyFinding {
  id: string;
  title: string;
  severity: InconsistencySeverity;
  category:
    | 'compensation'
    | 'probation_period'
    | 'notice_period'
    | 'roles_responsibilities'
    | 'benefits'
    | 'billing_reconciliation'
    | 'service_dates'
    | 'patient_identity'
    | string;
  explanation: string;
  sourceA: {
    documentName: string;
    section: string;
    page: number;
    extractedValue: string;
  };
  sourceB: {
    documentName: string;
    section: string;
    page: number;
    extractedValue: string;
  };
  recommendedAction: string;
  status: 'flagged' | 'inconclusive' | 'verified_inconsistency';
}

export interface MissingFieldFinding {
  id: string;
  fieldName: string;
  expectedIn: string;
  severity: 'critical' | 'moderate' | 'optional';
  detail: string;
}

export interface VerificationResult {
  domain: string;
  totalDocuments: number;
  status: 'inconsistencies_detected' | 'verified_clean' | 'manual_review_required';
  findings: InconsistencyFinding[];
  missingFields: MissingFieldFinding[];
  summaryNote: string;
  reviewedAt: string;
  documentsReviewed: string[];
}

export interface HistoryItem {
  id: string;
  documentName: string;
  analysisType: 'Resume & Career Fit' | 'Employment Document Verification' | 'Healthcare Administration Verification';
  date: string;
  status: 'Completed' | 'Inconsistencies Found' | 'Verified' | 'Pending Review';
  summary: string;
  metricBadge: string;
  findingsCount?: number;
  score?: number;
  domain: string;
}

export interface PlatformStats {
  totalDocumentsReviewed: number;
  potentialInconsistenciesFound: number;
  itemsRequiringReview?: number;
  resumesAnalyzed: number;
  jobMatchesIdentified: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: 'resume' | 'verification';
  status: 'success' | 'warning' | 'info';
  statusText: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl?: string;
}
