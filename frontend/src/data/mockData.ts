import type {
  PlatformStats,
  RecentActivityItem,
  ResumeAnalysisResult,
  VerificationResult,
  HistoryItem,
} from '../types';

export const mockStats: PlatformStats = {
  totalDocumentsReviewed: 1428,
  potentialInconsistenciesFound: 184,
  itemsRequiringReview: 36,
  resumesAnalyzed: 892,
  jobMatchesIdentified: 3410,
};

export const mockRecentActivity: RecentActivityItem[] = [
  {
    id: 'act-1',
    title: 'Employment Package Cross-Check',
    subtitle: 'Offer_Letter_2024.pdf vs Employment_Contract.pdf',
    timestamp: '12 mins ago',
    type: 'verification',
    status: 'warning',
    statusText: '2 Inconsistencies Flagged',
  },
  {
    id: 'act-2',
    title: 'Senior Full Stack Resume Analysis',
    subtitle: 'Alex_Morgan_Resume_v4.pdf',
    timestamp: '45 mins ago',
    type: 'resume',
    status: 'success',
    statusText: '86% Job Fit Score',
  },
  {
    id: 'act-3',
    title: 'Healthcare Claim Billing Audit',
    subtitle: 'Hospital_Invoice_9842.pdf vs Insurance_Claim.pdf',
    timestamp: '1 hour ago',
    type: 'verification',
    status: 'warning',
    statusText: 'Amount & Date Discrepancy',
  },
  {
    id: 'act-4',
    title: 'Executive Contract Verification',
    subtitle: 'Director_Agreement.pdf vs Compensation_Annex.pdf',
    timestamp: '2 hours ago',
    type: 'verification',
    status: 'info',
    statusText: 'Verified Clean',
  },
  {
    id: 'act-5',
    title: 'ML Engineer Candidate Screening',
    subtitle: 'David_Chen_CV.pdf',
    timestamp: '4 hours ago',
    type: 'resume',
    status: 'success',
    statusText: '91% Job Fit Score',
  },
  {
    id: 'act-6',
    title: 'Patient Intake Completeness Audit',
    subtitle: 'Registration_Packet_MED44.pdf',
    timestamp: 'Yesterday',
    type: 'verification',
    status: 'warning',
    statusText: 'Missing Policy ID',
  },
];

export const mockResumeAnalysis: ResumeAnalysisResult = {
  candidateName: 'Alex Morgan',
  overallFitScore: 86,
  experienceLevel: 'Senior Level (5+ Years)',
  summary:
    'Demonstrated expertise in building scalable cloud web applications using modern React, TypeScript, and Node.js microservices. Strong foundation in distributed systems, RESTful API design, and automated testing.',
  identifiedSkills: [
    'React',
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'Next.js',
    'Docker',
    'REST APIs',
    'Git',
    'Tailwind CSS',
    'Jest',
    'Redis',
    'System Design',
  ],
  matchedSkills: [
    'React',
    'TypeScript',
    'Node.js',
    'PostgreSQL',
    'Docker',
    'REST APIs',
    'Git',
    'Tailwind CSS',
  ],
  missingSkills: [
    'Kubernetes (K8s)',
    'GraphQL',
    'AWS Cloud Architecture (IAM, Lambda)',
    'CI/CD Pipeline Orchestration',
  ],
  recommendedRoles: [
    'Senior Full Stack Engineer',
    'Lead Frontend Engineer',
    'Platform Software Engineer II',
  ],
  jobMatches: [
    {
      id: 'job-1',
      title: 'Senior Full Stack Engineer',
      company: 'NovaCloud Technologies',
      location: 'Bangalore, India (Hybrid)',
      matchScore: 92,
      salaryRange: '₹28,00,000 - ₹35,00,000 PA',
      workType: 'Hybrid',
      description:
        'Looking for a senior engineer to drive our core collaborative enterprise dashboard, microservices, and reactive data pipelines.',
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      missingSkills: ['Kubernetes', 'AWS'],
      department: 'Core Infrastructure',
      postedDate: '3 days ago',
    },
    {
      id: 'job-2',
      title: 'Lead Frontend Architect',
      company: 'Aetheria Systems',
      location: 'Remote (Pan-India)',
      matchScore: 88,
      salaryRange: '₹30,00,000 - ₹38,00,000 PA',
      workType: 'Remote',
      description:
        'Architect high-performance client experiences, establish design system standards, and guide cross-functional product squads.',
      matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Jest'],
      missingSkills: ['GraphQL', 'WebSockets'],
      department: 'Design & Experience',
      postedDate: 'Just now',
    },
    {
      id: 'job-3',
      title: 'Senior Software Engineer (Full Stack)',
      company: 'Zenith Health Dynamics',
      location: 'Hyderabad, India (On-site)',
      matchScore: 84,
      salaryRange: '₹26,00,000 - ₹32,00,000 PA',
      workType: 'Full-time',
      description:
        'Build compliant health tech workflows and diagnostic data pipelines using modern React and scalable backend services.',
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      missingSkills: ['HIPAA Compliance', 'CI/CD Pipelines'],
      department: 'Clinical Engineering',
      postedDate: '5 days ago',
    },
  ],
  analyzedAt: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  fileName: 'Alex_Morgan_Senior_Engineer_Resume.pdf',
  fileSize: '1.4 MB',
};

export const mockVerificationResult: VerificationResult = {
  domain: 'Employment & HR',
  totalDocuments: 2,
  status: 'inconsistencies_detected',
  summaryNote:
    'High-priority discrepancies identified between the compensation terms, probation duration, and notice stipulations across the provided employment documents. Flagged for human review.',
  reviewedAt: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  documentsReviewed: [
    'Offer_Letter_Signed_2024.pdf (Candidate Copy)',
    'Employment_Contract_Standard_v2.pdf (Company Legal Copy)',
  ],
  findings: [
    {
      id: 'finding-1',
      title: 'Monthly Base Compensation Discrepancy',
      severity: 'high',
      category: 'compensation',
      explanation:
        'The candidate offer letter explicitly promises a monthly gross salary of ₹30,000 per month, while the countersigned employment contract specifies ₹25,000 per month in the compensation schedule.',
      sourceA: {
        documentName: 'Offer_Letter_Signed_2024.pdf',
        section: 'Clause 3.1: Compensation Structure',
        page: 2,
        extractedValue: 'Gross Remuneration: ₹30,000 / month (payable on the last working day)',
      },
      sourceB: {
        documentName: 'Employment_Contract_Standard_v2.pdf',
        section: 'Annexure A: Salary Breakdown',
        page: 5,
        extractedValue: 'Basic & Allowances Total: ₹25,000 / month gross',
      },
      recommendedAction:
        'Immediate HR reconciliation required. Request an addendum or confirmation letter from Payroll before formal onboarding closure.',
      status: 'verified_inconsistency',
    },
    {
      id: 'finding-2',
      title: 'Probation Duration Conflict',
      severity: 'medium',
      category: 'probation_period',
      explanation:
        'Offer letter outlines a probationary tenure of 3 calendar months, whereas the employment contract stipulates 6 months prior to permanent confirmation review.',
      sourceA: {
        documentName: 'Offer_Letter_Signed_2024.pdf',
        section: 'Clause 5: Probation & Confirmation',
        page: 2,
        extractedValue: 'Probationary tenure of 3 (three) months from Joining Date.',
      },
      sourceB: {
        documentName: 'Employment_Contract_Standard_v2.pdf',
        section: 'Clause 4: Evaluation Period',
        page: 3,
        extractedValue: 'Subject to a formal probation period of 6 (six) months with milestone assessment.',
      },
      recommendedAction:
        'Obtain clarification from the hiring department on whether standard 3-month or extended 6-month probation applies to this role grade.',
      status: 'flagged',
    },
    {
      id: 'finding-3',
      title: 'Notice Period Duration Mismatch',
      severity: 'medium',
      category: 'notice_period',
      explanation:
        'The notice period required during post-confirmation service is conflicting between documents: 30 days in Offer Letter versus 90 days in Company Contract.',
      sourceA: {
        documentName: 'Offer_Letter_Signed_2024.pdf',
        section: 'Clause 8: Separation Terms',
        page: 3,
        extractedValue: 'Either party may terminate service with 30 (thirty) days written notice.',
      },
      sourceB: {
        documentName: 'Employment_Contract_Standard_v2.pdf',
        section: 'Clause 9.2: Notice on Termination',
        page: 6,
        extractedValue: 'Mandatory 90 (ninety) days notice or salary in lieu thereof post-confirmation.',
      },
      recommendedAction:
        'Legal team must confirm standard notice duration for technical staff and issue harmonized terms.',
      status: 'flagged',
    },
  ],
  missingFields: [
    {
      id: 'missing-1',
      fieldName: 'Annexure B: Intellectual Property & Inventions Assignment',
      expectedIn: 'Employment_Contract_Standard_v2.pdf',
      severity: 'critical',
      detail:
        'Section 12 references Annexure B for proprietary invention assignments, but the attachment is missing in the uploaded file.',
    },
    {
      id: 'missing-2',
      fieldName: 'Reporting Manager Designation',
      expectedIn: 'Offer_Letter_Signed_2024.pdf',
      severity: 'moderate',
      detail:
        'Department is noted as "Engineering" but the specific title of the designated reporting supervisor is left blank.',
    },
  ],
};

/* =========================================================================
   HEALTHCARE ADMINISTRATION DEMO DATA (NON-CLINICAL ADMINISTRATIVE CHECK)
   ========================================================================= */

export const mockHealthcareVerificationResult: VerificationResult = {
  domain: 'Healthcare Administration',
  totalDocuments: 2,
  status: 'inconsistencies_detected',
  summaryNote:
    'Administrative discrepancies identified between hospital invoice and insurance claim. Medical Record Number (MRN) matched, but itemized billing amount differs by $1,450.00 and admission date shows a 2-day variance. (Administrative check only; no medical diagnosis or treatment advice).',
  reviewedAt: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  documentsReviewed: [
    'Hospital_Inpatient_Invoice_INV-98421.pdf (St. Jude Medical Center)',
    'Health_Insurance_Claim_CLM-77104.pdf (BlueShield Healthcare)',
  ],
  findings: [
    {
      id: 'hc-finding-1',
      title: 'Billed Amount vs Claim Reimbursable Variance',
      severity: 'high',
      category: 'billing_reconciliation',
      explanation:
        'Hospital Inpatient Invoice lists total charges as $14,250.00 for Room & Board and Surgical Suite, while the submitted Insurance Claim requests $12,800.00, omitting itemized Pharmacy Line #4 ($1,450.00).',
      sourceA: {
        documentName: 'Hospital_Inpatient_Invoice_INV-98421.pdf',
        section: 'Section 4: Itemized Charges & Total',
        page: 2,
        extractedValue: 'Total Gross Charges: $14,250.00 (Pharmacy $1,450, Room $7,200, OR $5,600)',
      },
      sourceB: {
        documentName: 'Health_Insurance_Claim_CLM-77104.pdf',
        section: 'Box 28: Total Charge Claimed',
        page: 1,
        extractedValue: 'Total Claimed: $12,800.00 (Excludes Pharmacy Dispensation Code 250)',
      },
      recommendedAction:
        'Cross-check patient ledger line items with billing coding department. Ensure pharmacy dispensation was authorized under secondary insurance pre-approval.',
      status: 'verified_inconsistency',
    },
    {
      id: 'hc-finding-2',
      title: 'Inpatient Admission Date Discrepancy',
      severity: 'high',
      category: 'service_dates',
      explanation:
        'Hospital discharge record lists admission as September 12, 2026, whereas the submitted Health Insurance Claim form states admission on September 14, 2026.',
      sourceA: {
        documentName: 'Hospital_Inpatient_Invoice_INV-98421.pdf',
        section: 'Admission Details & Patient Header',
        page: 1,
        extractedValue: 'Date of Admission: 2026-09-12 08:30 EST | Discharge: 2026-09-16 11:00 EST',
      },
      sourceB: {
        documentName: 'Health_Insurance_Claim_CLM-77104.pdf',
        section: 'Box 18: Hospitalization Dates',
        page: 1,
        extractedValue: 'From: 2026-09-14 | To: 2026-09-16 (Total Days: 2)',
      },
      recommendedAction:
        'Verify emergency intake date vs scheduled floor transfer date. Correct claim CMS-1500 box 18 to prevent automatic payer denial.',
      status: 'flagged',
    },
    {
      id: 'hc-finding-3',
      title: 'Patient Medical Record Number (MRN) Parity',
      severity: 'low',
      category: 'patient_identity',
      explanation:
        'MRN #MED-98421 and Patient DOB 1984-06-15 match identically across both documents.',
      sourceA: {
        documentName: 'Hospital_Inpatient_Invoice_INV-98421.pdf',
        section: 'Header Info',
        page: 1,
        extractedValue: 'MRN: MED-98421 | Patient: John D. Smith | DOB: 06/15/1984',
      },
      sourceB: {
        documentName: 'Health_Insurance_Claim_CLM-77104.pdf',
        section: 'Box 1a & 5: Insured & Patient Info',
        page: 1,
        extractedValue: 'Patient ID / MRN: MED-98421 | John D. Smith | DOB: 06/15/1984',
      },
      recommendedAction:
        'Patient identity successfully confirmed. No manual audit necessary for demographic fields.',
      status: 'inconclusive',
    },
  ],
  missingFields: [
    {
      id: 'hc-missing-1',
      fieldName: 'Attending Physician National Provider Identifier (NPI)',
      expectedIn: 'Hospital_Inpatient_Invoice_INV-98421.pdf',
      severity: 'critical',
      detail:
        'Box 24J / Section 5 names Dr. Sarah Lin, MD, but leaves the 10-digit NPI number field blank.',
    },
    {
      id: 'hc-missing-2',
      fieldName: 'Prior Authorization Reference Number',
      expectedIn: 'Health_Insurance_Claim_CLM-77104.pdf',
      severity: 'moderate',
      detail:
        'Inpatient surgical procedure requires Pre-Auth number in Box 23. Field is currently marked as "Pending".',
    },
  ],
};

export const mockHealthcarePatientRegResult: VerificationResult = {
  domain: 'Healthcare Administration',
  totalDocuments: 1,
  status: 'manual_review_required',
  summaryNote:
    'Patient Registration Form review completed. Demographic and primary insurance information present, but Emergency Contact Phone Number and HIPAA Authorization Signature Date are missing.',
  reviewedAt: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  documentsReviewed: ['Patient_Intake_Registration_Form_MED-44.pdf'],
  findings: [
    {
      id: 'hc-reg-1',
      title: 'Missing Emergency Contact Contact Details',
      severity: 'high',
      category: 'completeness',
      explanation:
        'Emergency contact individual name is listed as "Robert Miller (Spouse)", but the telephone number and address fields are empty.',
      sourceA: {
        documentName: 'Patient_Intake_Registration_Form_MED-44.pdf',
        section: 'Section 3: Emergency Contacts',
        page: 1,
        extractedValue: 'Contact: Robert Miller (Spouse) | Phone: [BLANK]',
      },
      sourceB: {
        documentName: 'Patient_Intake_Registration_Form_MED-44.pdf',
        section: 'Section 3: Emergency Contacts',
        page: 1,
        extractedValue: 'Secondary Contact: [NOT PROVIDED]',
      },
      recommendedAction:
        'Reception staff must obtain primary emergency phone number prior to patient procedure.',
      status: 'flagged',
    },
  ],
  missingFields: [
    {
      id: 'reg-missing-1',
      fieldName: 'Emergency Contact Phone Number',
      expectedIn: 'Patient_Intake_Registration_Form_MED-44.pdf',
      severity: 'critical',
      detail: 'Mandatory hospital admission requirement missing in Section 3.',
    },
    {
      id: 'reg-missing-2',
      fieldName: 'HIPAA Acknowledgment Signature Date',
      expectedIn: 'Patient_Intake_Registration_Form_MED-44.pdf',
      severity: 'moderate',
      detail: 'Signature mark present but date stamp field is unpopulated.',
    },
  ],
};

export const mockHistoryItems: HistoryItem[] = [
  {
    id: 'HIST-101',
    documentName: 'Offer_Letter_Signed_2024.pdf & Contract.pdf',
    analysisType: 'Employment Document Verification',
    date: 'Oct 12, 2026',
    status: 'Inconsistencies Found',
    summary: 'Salary discrepancy (₹30,000 vs ₹25,000) and probation period conflict identified.',
    metricBadge: '3 Inconsistencies',
    findingsCount: 3,
    domain: 'Employment & HR',
  },
  {
    id: 'HIST-102',
    documentName: 'Alex_Morgan_Senior_Engineer_Resume.pdf',
    analysisType: 'Resume & Career Fit',
    date: 'Oct 12, 2026',
    status: 'Completed',
    summary: 'Analyzed for Senior Full Stack Engineer role. Strong React and Node.js alignment.',
    metricBadge: '86% Fit Score',
    score: 86,
    domain: 'Software Engineering',
  },
  {
    id: 'HIST-103',
    documentName: 'Hospital_Invoice_INV-98421.pdf & Insurance_Claim.pdf',
    analysisType: 'Healthcare Administration Verification',
    date: 'Oct 11, 2026',
    status: 'Inconsistencies Found',
    summary: 'Itemized billing discrepancy ($14,250 vs $12,800) and admission date variance.',
    metricBadge: '2 Variances',
    findingsCount: 2,
    domain: 'Healthcare Administration',
  },
  {
    id: 'HIST-104',
    documentName: 'Director_Agreement.pdf & Annex.pdf',
    analysisType: 'Employment Document Verification',
    date: 'Oct 11, 2026',
    status: 'Verified',
    summary: 'Executive appointment terms harmonized across compensation and non-compete clauses.',
    metricBadge: 'Clean Verification',
    findingsCount: 0,
    domain: 'Employment & HR',
  },
  {
    id: 'HIST-105',
    documentName: 'David_Chen_CV.pdf',
    analysisType: 'Resume & Career Fit',
    date: 'Oct 10, 2026',
    status: 'Completed',
    summary: 'Machine Learning Engineer evaluation. Strong PyTorch and Transformers experience.',
    metricBadge: '91% Fit Score',
    score: 91,
    domain: 'Data & AI',
  },
  {
    id: 'HIST-106',
    documentName: 'Patient_Intake_Registration_Form_MED-44.pdf',
    analysisType: 'Healthcare Administration Verification',
    date: 'Oct 09, 2026',
    status: 'Pending Review',
    summary: 'Missing emergency contact phone and unsigned HIPAA acknowledgment date.',
    metricBadge: '2 Missing Fields',
    findingsCount: 1,
    domain: 'Healthcare Administration',
  },
  {
    id: 'HIST-107',
    documentName: 'Internship_Offer_Batch_A.pdf',
    analysisType: 'Employment Document Verification',
    date: 'Oct 07, 2026',
    status: 'Verified',
    summary: 'Standard 6-month educational internship stipend and NDAs validated without issues.',
    metricBadge: 'Clean Verification',
    findingsCount: 0,
    domain: 'Employment & HR',
  },
  {
    id: 'HIST-108',
    documentName: 'Marcus_Vance_Cloud_Architect.pdf',
    analysisType: 'Resume & Career Fit',
    date: 'Oct 05, 2026',
    status: 'Completed',
    summary: 'Evaluated for Solutions Architect. High multi-cloud and security accreditation.',
    metricBadge: '89% Fit Score',
    score: 89,
    domain: 'Software Engineering',
  },
];
