import {
  Users,
  GraduationCap,
  Building2,
  Landmark,
  HeartPulse,
  Scale,
  FileCheck,
  TrendingUp,
  FileText,
  Award,
  Receipt,
  Stethoscope,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface WorkflowDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: 'active' | 'coming_soon';
  documentTypes: string[];
  keyChecks: string[];
  path?: string;
  icon: LucideIcon;
}

export interface DomainDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  status: 'active' | 'coming_soon';
  icon: LucideIcon;
  colorName: string;
  accentClass: {
    bgLight: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
  };
  workflows: WorkflowDefinition[];
  supportedDocsSample: string[];
  completenessChecklist: { id: string; label: string; required: boolean; description: string }[];
}

export const platformDomains: DomainDefinition[] = [
  {
    id: 'employment-hr',
    name: 'Employment & HR',
    shortName: 'HR & Talent',
    description:
      'Cross-reference offer letters, contracts, job descriptions, and HR policies to highlight clause discrepancies and evaluate qualification alignment.',
    status: 'active',
    icon: Users,
    colorName: 'indigo',
    accentClass: {
      bgLight: 'bg-indigo-50/60',
      border: 'border-indigo-100 hover:border-indigo-300',
      text: 'text-[#4338CA]',
      badgeBg: 'bg-indigo-50 border-indigo-200',
      badgeText: 'text-[#4338CA]',
      iconBg: 'bg-indigo-500 text-white',
    },
    supportedDocsSample: [
      'Offer Letters (Candidate & HR Copy)',
      'Standard Employment Contracts',
      'Job Descriptions & Grade Specs',
      'HR Handbooks & Leave Policies',
    ],
    completenessChecklist: [
      { id: 'comp-1', label: 'Base Remuneration & Pay Interval', required: true, description: 'Explicit monthly/annual gross salary stated' },
      { id: 'comp-2', label: 'Probationary Tenure & Confirmation Clause', required: true, description: 'Evaluation duration and performance review schedule' },
      { id: 'comp-3', label: 'Separation & Notice Period Stipulation', required: true, description: 'Notice duration or severance in lieu specified' },
      { id: 'comp-4', label: 'Intellectual Property Assignment Addendum', required: false, description: 'Invention assignment schedule attached' },
      { id: 'comp-5', label: 'Reporting Hierarchy & Designated Manager', required: false, description: 'Reporting designation or business unit head' },
    ],
    workflows: [
      {
        id: 'employment-verification',
        name: 'Employment Document Verification',
        tagline: 'Cross-document clause analysis & consistency inspection',
        description:
          'Compare offer letters, signed contracts, and HR policies. Checks required fields, highlights compensation and notice period differences, and provides evidence-linked findings for human auditors.',
        status: 'active',
        documentTypes: ['Offer Letters', 'Employment Contracts', 'Job Descriptions', 'HR Policies'],
        keyChecks: [
          'Gross compensation parity cross-check',
          'Probation tenure and review conditions',
          'Notice period duration harmonization',
          'Document completeness & missing annexures',
        ],
        path: '/verify/employment/documents',
        icon: FileCheck,
      },
      {
        id: 'resume-career',
        name: 'Resume & Career Fit',
        tagline: 'Candidate qualification & job description matching',
        description:
          'Evaluate candidate resumes against specific role descriptions. Identifies matched skills, missing qualification gaps, provides fit score assessments, and suggests relevant role grades.',
        status: 'active',
        documentTypes: ['Candidate Resumes (PDF/DOCX)', 'Role Job Descriptions', 'Skills Matrices'],
        keyChecks: [
          'Extracted technical & functional skills',
          'Qualification gap identification',
          'Experience level & role alignment score',
          'Recommended job profile categories',
        ],
        path: '/verify/employment/resume',
        icon: TrendingUp,
      },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    shortName: 'Education',
    description:
      'Inspect academic transcripts, degree certificates, institution accreditation, and credit transfer equivalencies across institutions.',
    status: 'coming_soon',
    icon: GraduationCap,
    colorName: 'violet',
    accentClass: {
      bgLight: 'bg-violet-50/50',
      border: 'border-violet-100',
      text: 'text-[#8B5CF6]',
      badgeBg: 'bg-slate-100 border-slate-200',
      badgeText: 'text-slate-600',
      iconBg: 'bg-violet-500 text-white',
    },
    supportedDocsSample: [
      'Official Academic Transcripts',
      'Degree & Diploma Certificates',
      'Course Syllabus & Credit Syllabi',
      'Accreditation Board Records',
    ],
    completenessChecklist: [
      { id: 'edu-1', label: 'Registrar Seal & Signature', required: true, description: 'Institutional authority validation marks' },
      { id: 'edu-2', label: 'Cumulative GPA & Credit Total', required: true, description: 'Grading scale and overall completion summary' },
      { id: 'edu-3', label: 'Graduation Conferred Date', required: true, description: 'Official conferral date stated' },
    ],
    workflows: [
      {
        id: 'edu-credentials',
        name: 'Academic Credential Verification',
        tagline: 'Transcript & degree certificate cross-check',
        description:
          'Cross-references conferred degrees against transcript semester marksheets and institutional registrar registries.',
        status: 'coming_soon',
        documentTypes: ['Transcripts', 'Degree Certificates', 'Provisional Certificates'],
        keyChecks: ['Credit math consistency', 'Enrollment date alignment', 'Accreditation status'],
        icon: Award,
      },
      {
        id: 'edu-curriculum',
        name: 'Syllabus & Transfer Equivalency',
        tagline: 'Coursework cross-comparison for transfer credits',
        description:
          'Evaluates syllabus content and contact hours to determine course equivalencies across transfer institutions.',
        status: 'coming_soon',
        documentTypes: ['Course Syllabi', 'Curriculum Frameworks'],
        keyChecks: ['Prerequisite mapping', 'Credit weight equivalence'],
        icon: FileText,
      },
    ],
  },
  {
    id: 'government-public',
    name: 'Government & Public Services',
    shortName: 'Gov & Public',
    description:
      'Verify civil registry records, identity documentation, public tender applications, and municipal permit submissions for regulatory alignment.',
    status: 'coming_soon',
    icon: Landmark,
    colorName: 'navy',
    accentClass: {
      bgLight: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-[#172554]',
      badgeBg: 'bg-slate-100 border-slate-200',
      badgeText: 'text-slate-600',
      iconBg: 'bg-[#172554] text-white',
    },
    supportedDocsSample: [
      'Civil Registry Certificates',
      'Identity Documents & Proof of Residence',
      'Municipal Permits & Licenses',
      'Public Subsidy & Grant Applications',
    ],
    completenessChecklist: [
      { id: 'gov-1', label: 'Government Issuing Authority ID', required: true, description: 'Valid reference number and jurisdiction stamp' },
      { id: 'gov-2', label: 'Applicant Legal Name Parity', required: true, description: 'Exact name matching across supporting declarations' },
    ],
    workflows: [
      {
        id: 'gov-identity',
        name: 'Identity & Permit Cross-Check',
        tagline: 'Multi-registry public record alignment',
        description:
          'Cross-verifies identity credentials, municipal licenses, and supporting declarations for administrative reviews.',
        status: 'coming_soon',
        documentTypes: ['Permits', 'Civil Registry Extracts', 'Affidavits'],
        keyChecks: ['Jurisdiction code match', 'Date of validity window'],
        icon: Building2,
      },
    ],
  },
  {
    id: 'banking-finance',
    name: 'Banking & Finance',
    shortName: 'Banking & Finance',
    description:
      'Cross-audit commercial loan applications, mortgage covenants, audited balance sheets, and collateral deeds to highlight data variances.',
    status: 'coming_soon',
    icon: Receipt,
    colorName: 'teal',
    accentClass: {
      bgLight: 'bg-teal-50/50',
      border: 'border-teal-100',
      text: 'text-[#0D9488]',
      badgeBg: 'bg-slate-100 border-slate-200',
      badgeText: 'text-slate-600',
      iconBg: 'bg-teal-600 text-white',
    },
    supportedDocsSample: [
      'Commercial Loan Sanction Letters',
      'Mortgage Deeds & Property Encumbrance',
      'Audited Financial Statements (P&L, Balance Sheet)',
      'Tax Returns & Form 16 / W-2 Declarations',
    ],
    completenessChecklist: [
      { id: 'fin-1', label: 'Authorized Signatory Matrix', required: true, description: 'Registered executive signatures' },
      { id: 'fin-2', label: 'Principal & Interest Rate Clause', required: true, description: 'Explicit borrowing rate and repayment schedule' },
    ],
    workflows: [
      {
        id: 'fin-underwriting',
        name: 'Loan Underwriting Cross-Check',
        tagline: 'Sanction letter vs mortgage covenant reconciliation',
        description:
          'Identifies variances between approved loan terms, collateral valuation reports, and borrower income statements.',
        status: 'coming_soon',
        documentTypes: ['Loan Sanction Letters', 'Valuation Reports', 'Financial Disclosures'],
        keyChecks: ['Interest rate consistency', 'Collateral description match', 'Borrowing limits'],
        icon: Receipt,
      },
    ],
  },
  {
    id: 'healthcare-admin',
    name: 'Healthcare Administration',
    shortName: 'Healthcare Admin',
    description:
      'Review clinical practitioner licenses, hospital privileging files, clinical trial protocols, and medical billing disclosures for compliance.',
    status: 'coming_soon',
    icon: HeartPulse,
    colorName: 'rose',
    accentClass: {
      bgLight: 'bg-rose-50/50',
      border: 'border-rose-100',
      text: 'text-rose-600',
      badgeBg: 'bg-slate-100 border-slate-200',
      badgeText: 'text-slate-600',
      iconBg: 'bg-rose-500 text-white',
    },
    supportedDocsSample: [
      'Medical Practitioner Board Licenses',
      'Institutional Review Board (IRB) Consents',
      'Hospital Privileging & Credentialing Packets',
      'Insurance Pre-Authorization Summaries',
    ],
    completenessChecklist: [
      { id: 'health-1', label: 'Active Medical Board Registration', required: true, description: 'Board registration number and expiration date' },
      { id: 'health-2', label: 'HIPAA & Patient Consent Addendum', required: true, description: 'Signed privacy disclosure statement' },
    ],
    workflows: [
      {
        id: 'health-credentialing',
        name: 'Practitioner Credentialing Audit',
        tagline: 'License, malpractice coverage & hospital privileging review',
        description:
          'Cross-checks medical board registration records against malpractice insurance schedules and institutional privileges.',
        status: 'coming_soon',
        documentTypes: ['Medical Licenses', 'Malpractice Coverage', 'Privileging Forms'],
        keyChecks: ['License expiration dates', 'Specialty board certification status'],
        icon: Stethoscope,
      },
    ],
  },
  {
    id: 'business-legal',
    name: 'Business & Legal Documents',
    shortName: 'Business & Legal',
    description:
      'Harmonize Master Services Agreements (MSAs), Statements of Work (SOWs), Non-Disclosure Agreements, and procurement terms.',
    status: 'coming_soon',
    icon: Scale,
    colorName: 'amber',
    accentClass: {
      bgLight: 'bg-amber-50/50',
      border: 'border-amber-100',
      text: 'text-amber-700',
      badgeBg: 'bg-slate-100 border-slate-200',
      badgeText: 'text-slate-600',
      iconBg: 'bg-amber-600 text-white',
    },
    supportedDocsSample: [
      'Master Services Agreements (MSA)',
      'Vendor Statements of Work (SOW)',
      'Non-Disclosure Agreements (NDA)',
      'Service Level Agreements (SLA) & Rate Cards',
    ],
    completenessChecklist: [
      { id: 'leg-1', label: 'Governing Law & Jurisdiction', required: true, description: 'Applicable state/federal arbitration venue' },
      { id: 'leg-2', label: 'Limitation of Liability Cap', required: true, description: 'Explicit monetary liability limitation clause' },
    ],
    workflows: [
      {
        id: 'legal-msa-sow',
        name: 'MSA vs SOW Reconciliation',
        tagline: 'Master agreement & statement of work cross-check',
        description:
          'Detects conflicting payment milestones, IP ownership provisions, and liability limitations between master contracts and SOWs.',
        status: 'coming_soon',
        documentTypes: ['Master Services Agreements', 'Statements of Work', 'Amendments'],
        keyChecks: ['Payment term overrides', 'Intellectual property ownership clauses', 'Liability caps'],
        icon: Briefcase,
      },
    ],
  },
];
