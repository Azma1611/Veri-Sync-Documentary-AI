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
  Briefcase,
  ClipboardCheck,
  Code2,
  Database,
  Coins,
  Layout,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CareerDomain, DocumentDomain } from '../types';

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
      bgLight: 'bg-indigo-950/40',
      border: 'border-indigo-500/30 hover:border-indigo-400/60',
      text: 'text-[#62D8FF]',
      badgeBg: 'bg-indigo-900/50 border-indigo-500/30',
      badgeText: 'text-[#62D8FF]',
      iconBg: 'bg-indigo-600 text-white',
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
    id: 'healthcare-admin',
    name: 'Healthcare Administration',
    shortName: 'Healthcare Admin',
    description:
      'Compare patient registration forms, discharge summaries, hospital invoices, and insurance claims. Reconciles patient IDs, service dates, billing codes, and policy coverage amounts. (Non-clinical administrative check only; not medical advice).',
    status: 'active',
    icon: HeartPulse,
    colorName: 'teal',
    accentClass: {
      bgLight: 'bg-teal-950/40',
      border: 'border-teal-500/30 hover:border-teal-400/60',
      text: 'text-teal-300',
      badgeBg: 'bg-teal-900/50 border-teal-500/30',
      badgeText: 'text-teal-300',
      iconBg: 'bg-teal-600 text-white',
    },
    supportedDocsSample: [
      'Patient Registration Forms',
      'Inpatient Discharge Summaries',
      'Hospital Billing Invoices',
      'Health Insurance Claims & Pre-Auth Forms',
    ],
    completenessChecklist: [
      { id: 'health-1', label: 'Patient MRN & Legal Identifier Parity', required: true, description: 'Medical Record Number matches across admission and claim records' },
      { id: 'health-2', label: 'Admission & Discharge Date Alignment', required: true, description: 'Hospital stay dates match invoice billing line item dates' },
      { id: 'health-3', label: 'Itemized Treatment Amount Reconciliation', required: true, description: 'Hospital invoice total aligns with insurance claim submitted amount' },
      { id: 'health-4', label: 'Emergency Contact & Attending Physician ID', required: true, description: 'Designated next-of-kin contact and physician NPI on file' },
      { id: 'health-5', label: 'Patient Financial Responsibility Consent', required: false, description: 'Signed assignment of insurance benefits addendum' },
    ],
    workflows: [
      {
        id: 'health-doc-comparison',
        name: 'Medical Administration Document Comparison',
        tagline: 'Reconcile hospital invoice, insurance claim & discharge records',
        description:
          'Compares patient identifiers, treatment dates, and billed versus claimed amounts across hospital invoices, discharge summaries, and insurance filings to identify billing variances for administrative review.',
        status: 'active',
        documentTypes: ['Hospital Invoices', 'Insurance Claims', 'Discharge Summaries', 'Patient Forms'],
        keyChecks: [
          'Patient MRN and demographic alignment',
          'Service & discharge date boundary parity',
          'Billed amount vs claim requested total reconciliation',
          'Billing code & procedure description consistency',
        ],
        path: '/verify/employment/documents?domain=healthcare-admin',
        icon: Receipt,
      },
      {
        id: 'health-patient-reg',
        name: 'Patient Registration Completeness',
        tagline: 'Check required identifiers, insurance cards & consent signatures',
        description:
          'Verifies that mandatory patient intake fields, emergency contact details, primary insurance policy IDs, and HIPAA consent signatures are present and consistent.',
        status: 'active',
        documentTypes: ['Patient Registration Forms', 'Insurance Card Copies', 'HIPAA Consent Addenda'],
        keyChecks: [
          'Mandatory demographic & contact validation',
          'Insurance subscriber policy ID verification',
          'Emergency contact completeness',
          'HIPAA authorization signature verification',
        ],
        path: '/verify/employment/documents?domain=healthcare-admin&workflow=patient-reg',
        icon: ClipboardCheck,
      },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    shortName: 'Education',
    description:
      'Inspect academic transcripts, degree certificates, institution accreditation, and credit transfer equivalencies across institutions. (Prototype / Roadmap)',
    status: 'coming_soon',
    icon: GraduationCap,
    colorName: 'violet',
    accentClass: {
      bgLight: 'bg-violet-950/30',
      border: 'border-violet-500/20',
      text: 'text-violet-300',
      badgeBg: 'bg-violet-900/30 border-violet-500/20',
      badgeText: 'text-violet-300',
      iconBg: 'bg-violet-600 text-white',
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
      'Verify civil registry records, identity documentation, public tender applications, and municipal permit submissions for regulatory alignment. (Prototype / Roadmap)',
    status: 'coming_soon',
    icon: Landmark,
    colorName: 'navy',
    accentClass: {
      bgLight: 'bg-slate-900/40',
      border: 'border-slate-700/40',
      text: 'text-slate-300',
      badgeBg: 'bg-slate-800/40 border-slate-700/40',
      badgeText: 'text-slate-300',
      iconBg: 'bg-slate-700 text-white',
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
      'Cross-audit commercial loan applications, mortgage covenants, audited balance sheets, and collateral deeds to highlight data variances. (Prototype / Roadmap)',
    status: 'coming_soon',
    icon: Receipt,
    colorName: 'teal',
    accentClass: {
      bgLight: 'bg-emerald-950/30',
      border: 'border-emerald-500/20',
      text: 'text-emerald-300',
      badgeBg: 'bg-emerald-900/30 border-emerald-500/20',
      badgeText: 'text-emerald-300',
      iconBg: 'bg-emerald-600 text-white',
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
    id: 'business-legal',
    name: 'Business & Legal Documents',
    shortName: 'Business & Legal',
    description:
      'Harmonize Master Services Agreements (MSAs), Statements of Work (SOWs), Non-Disclosure Agreements, and procurement terms. (Prototype / Roadmap)',
    status: 'coming_soon',
    icon: Scale,
    colorName: 'amber',
    accentClass: {
      bgLight: 'bg-amber-950/30',
      border: 'border-amber-500/20',
      text: 'text-amber-300',
      badgeBg: 'bg-amber-900/30 border-amber-500/20',
      badgeText: 'text-amber-300',
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

export interface CareerDomainOption {
  id: CareerDomain;
  label: string;
  icon: LucideIcon;
  color: string;
  glow: string;
}

export const careerDomains: CareerDomainOption[] = [
  { id: 'software-engineering', label: 'Software Eng.', icon: Code2, color: 'text-[#62D8FF]', glow: 'shadow-[0_0_12px_rgba(98,216,255,0.3)]' },
  { id: 'data-ai', label: 'Data & AI', icon: Database, color: 'text-violet-300', glow: 'shadow-[0_0_12px_rgba(139,92,246,0.3)]' },
  { id: 'finance-fintech', label: 'Finance', icon: Coins, color: 'text-emerald-300', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]' },
  { id: 'product-design', label: 'Product & Design', icon: Layout, color: 'text-amber-300', glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]' },
  { id: 'healthcare-biotech', label: 'Healthcare', icon: HeartPulse, color: 'text-teal-300', glow: 'shadow-[0_0_12px_rgba(45,212,191,0.3)]' },
  { id: 'operations-hr', label: 'Operations & HR', icon: Briefcase, color: 'text-indigo-300', glow: 'shadow-[0_0_12px_rgba(165,180,252,0.3)]' },
];

export const documentDomains: { id: DocumentDomain; label: string; description: string }[] = [
  { id: 'employment-hr', label: 'Employment & HR', description: 'Cross-reference offer letters, contracts, compensation annexures, and HR policies' },
  { id: 'healthcare-admin', label: 'Healthcare Administration', description: 'Reconcile hospital invoices, insurance claims, discharge summaries, and patient registration forms' },
  { id: 'education', label: 'Education (Roadmap)', description: 'Inspect academic transcripts, degree certificates, and credit transfer equivalencies' },
  { id: 'government-public', label: 'Government & Public (Roadmap)', description: 'Civil registry records, identity credentials, and municipal permits' },
  { id: 'banking-finance', label: 'Banking & Finance (Roadmap)', description: 'Commercial loan sanction letters, mortgages, and audited balance sheets' },
  { id: 'business-legal', label: 'Business & Legal (Roadmap)', description: 'Master services agreements, vendor SOWs, and NDAs' },
];

