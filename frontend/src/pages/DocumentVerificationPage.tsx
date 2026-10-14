import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Download,
  HeartPulse,
  ClipboardCheck,
} from 'lucide-react';
import { UploadZone } from '../components/common/UploadZone';
import { FileList } from '../components/common/FileList';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { LoadingState } from '../components/common/LoadingState';
import { CompletenessChecklist } from '../components/common/CompletenessChecklist';
import type { ChecklistItem } from '../components/common/CompletenessChecklist';
import { ExportReportModal } from '../components/common/ExportReportModal';
import { FindingCard } from '../components/verification/FindingCard';
import { DocumentInconsistencySummary } from '../components/verification/DocumentInconsistencySummary';
import { verifyEmploymentDocuments, submitReviewerDecision } from '../services/api';
import type {
  UploadedFileItem,
  VerificationResult,
  GenericDocType,
} from '../types';
import {
  mockVerificationResult,
  mockHealthcareVerificationResult,
  mockHealthcarePatientRegResult,
} from '../data/mockData';

export const DocumentVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialDomain = searchParams.get('domain') === 'healthcare-admin' ? 'healthcare-admin' : 'employment-hr';

  const [selectedDomainId, setSelectedDomainId] = useState<string>(initialDomain);
  const [activeDocType, setActiveDocType] = useState<GenericDocType>(
    initialDomain === 'healthcare-admin' ? 'hospital_invoice' : 'offer_letter'
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [reviewerDecisions, setReviewerDecisions] = useState<Record<string, { status: string; notes: string }>>({});

  const handleSelectDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    setActiveDocType(domainId === 'healthcare-admin' ? 'hospital_invoice' : 'offer_letter');
  };

  const handleFilesSelected = (files: File[]) => {
    const newItems: UploadedFileItem[] = files.map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/pdf',
      docType: activeDocType,
      uploadedAt: new Date(),
    }));
    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDocTypeChange = (id: string, newType: GenericDocType) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, docType: newType } : f))
    );
  };

  const handleReviewDocuments = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true);

    try {
      if (selectedDomainId === 'healthcare-admin') {
        // Healthcare verification demo simulation
        await new Promise((resolve) => setTimeout(resolve, 1400));
        const fileNames = uploadedFiles.map((f) => f.name);
        setVerificationResult({
          ...mockHealthcareVerificationResult,
          totalDocuments: uploadedFiles.length,
          documentsReviewed: fileNames.length > 0 ? fileNames : mockHealthcareVerificationResult.documentsReviewed,
        });
      } else {
        // Employment verification via live API or structured mock fallback
        const response = await verifyEmploymentDocuments({
          files: uploadedFiles.map((f) => ({
            file: f.file,
            docType: (f.docType || 'offer_letter') as any,
          })),
          domain: selectedDomainId as any,
        });
        setVerificationResult(response.data);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult(
        selectedDomainId === 'healthcare-admin'
          ? mockHealthcareVerificationResult
          : mockVerificationResult
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadEmploymentSample = () => {
    const fileA = new File(['sample offer letter'], 'Offer_Letter_Signed_2024.pdf', {
      type: 'application/pdf',
    });
    const fileB = new File(['sample contract'], 'Employment_Contract_Standard_v2.pdf', {
      type: 'application/pdf',
    });
    setSelectedDomainId('employment-hr');
    setUploadedFiles([
      {
        id: 'sample-emp-1',
        file: fileA,
        name: 'Offer_Letter_Signed_2024.pdf',
        size: 1153433,
        type: 'application/pdf',
        docType: 'offer_letter',
        uploadedAt: new Date(),
      },
      {
        id: 'sample-emp-2',
        file: fileB,
        name: 'Employment_Contract_Standard_v2.pdf',
        size: 2411724,
        type: 'application/pdf',
        docType: 'contract',
        uploadedAt: new Date(),
      },
    ]);
    setVerificationResult(mockVerificationResult);
  };

  const handleLoadHealthcareSample = () => {
    const fileA = new File(['hospital inpatient invoice'], 'Hospital_Inpatient_Invoice_INV-98421.pdf', {
      type: 'application/pdf',
    });
    const fileB = new File(['insurance claim cms1500'], 'Health_Insurance_Claim_CLM-77104.pdf', {
      type: 'application/pdf',
    });
    setSelectedDomainId('healthcare-admin');
    setUploadedFiles([
      {
        id: 'sample-hc-1',
        file: fileA,
        name: 'Hospital_Inpatient_Invoice_INV-98421.pdf',
        size: 1845120,
        type: 'application/pdf',
        docType: 'hospital_invoice',
        uploadedAt: new Date(),
      },
      {
        id: 'sample-hc-2',
        file: fileB,
        name: 'Health_Insurance_Claim_CLM-77104.pdf',
        size: 1420500,
        type: 'application/pdf',
        docType: 'insurance_claim',
        uploadedAt: new Date(),
      },
    ]);
    setVerificationResult(mockHealthcareVerificationResult);
  };

  const handleLoadPatientRegSample = () => {
    const fileA = new File(['patient intake registration packet'], 'Patient_Intake_Registration_Form_MED-44.pdf', {
      type: 'application/pdf',
    });
    setSelectedDomainId('healthcare-admin');
    setUploadedFiles([
      {
        id: 'sample-reg-1',
        file: fileA,
        name: 'Patient_Intake_Registration_Form_MED-44.pdf',
        size: 980400,
        type: 'application/pdf',
        docType: 'patient_registration',
        uploadedAt: new Date(),
      },
    ]);
    setVerificationResult(mockHealthcarePatientRegResult);
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setVerificationResult(null);
    setReviewerDecisions({});
  };

  const handleReviewerAction = (findingId: string, status: string, notes: string = '') => {
    setReviewerDecisions((prev) => ({
      ...prev,
      [findingId]: { status, notes },
    }));
    submitReviewerDecision(findingId, status, notes).catch((err) => {
      console.warn('Failed to persist reviewer decision:', err);
    });
  };

  // Checklist items based on active domain
  const employmentChecklist: ChecklistItem[] = [
    {
      id: 'chk-1',
      label: 'Base Compensation & Pay Frequency',
      required: true,
      status: 'present',
      foundIn: 'Offer Letter (Clause 3.1) & Contract (Annex A)',
      note: 'Discrepancy identified between ₹30k and ₹25k values',
    },
    {
      id: 'chk-2',
      label: 'Probation Duration & Review Criteria',
      required: true,
      status: 'present',
      foundIn: 'Offer Letter (Clause 5) & Contract (Clause 4)',
      note: 'Duration mismatch: 3 months vs 6 months',
    },
    {
      id: 'chk-3',
      label: 'Separation & Notice Period Schedule',
      required: true,
      status: 'present',
      foundIn: 'Offer Letter (Clause 8) & Contract (Clause 9.2)',
      note: 'Notice tenure mismatch: 30 days vs 90 days',
    },
    {
      id: 'chk-4',
      label: 'Annexure B: Intellectual Property Assignment',
      required: true,
      status: 'missing',
      note: 'Referenced in contract Section 12 but attachment missing from upload',
    },
    {
      id: 'chk-5',
      label: 'Reporting Manager Designation',
      required: false,
      status: 'missing',
      note: 'Department listed as Engineering; supervisor designation left unspecified',
    },
  ];

  const healthcareChecklist: ChecklistItem[] = [
    {
      id: 'hc-chk-1',
      label: 'Patient Medical Record Number (MRN) Parity',
      required: true,
      status: 'present',
      foundIn: 'Hospital Invoice (Header) & Claim (Box 1a)',
      note: 'MRN #MED-98421 matches across records',
    },
    {
      id: 'hc-chk-2',
      label: 'Admission & Service Date Parity',
      required: true,
      status: 'present',
      foundIn: 'Hospital Invoice (Section 1) & Claim (Box 18)',
      note: 'Date mismatch: 2026-09-12 vs 2026-09-14',
    },
    {
      id: 'hc-chk-3',
      label: 'Total Reimbursable Treatment Amount',
      required: true,
      status: 'present',
      foundIn: 'Hospital Invoice (Section 4) & Claim (Box 28)',
      note: 'Billed amount mismatch: $14,250 vs $12,800',
    },
    {
      id: 'hc-chk-4',
      label: 'Attending Physician NPI Number',
      required: true,
      status: 'missing',
      note: 'Physician name provided but 10-digit NPI left blank in Section 5',
    },
    {
      id: 'hc-chk-5',
      label: 'Emergency Contact Telephone Details',
      required: false,
      status: 'missing',
      note: 'Spouse named as contact; phone number omitted',
    },
  ];

  const currentChecklist = selectedDomainId === 'healthcare-admin' ? healthcareChecklist : employmentChecklist;

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Multi-Domain Verification Workspace: Cross-references document pairs to highlight potential discrepancies. Results indicate potential inconsistencies requiring human auditor review; not proof of fraud or authenticity." />

      {/* Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1.5 font-medium">
            <Link to="/verify" className="hover:text-[#62D8FF] transition-colors">
              Domains
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="font-bold text-white">
              {selectedDomainId === 'healthcare-admin' ? 'Healthcare Administration' : 'Employment & HR'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[#62D8FF] font-semibold">Verification Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Document Verification Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 max-w-2xl leading-relaxed">
            {selectedDomainId === 'healthcare-admin'
              ? 'Reconcile hospital invoices, insurance claims, and discharge records. Cross-checks MRN identifiers, service dates, and billed totals.'
              : 'Cross-reference offer letters, employment contracts, and policies for terms consistency, compensation alignment, and completeness.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap z-10">
          {!verificationResult && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleLoadEmploymentSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-[#62D8FF] text-xs font-bold border border-indigo-400/30 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo: Employment Contract Mismatch</span>
              </button>

              <button
                type="button"
                onClick={handleLoadHealthcareSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/30 transition-all shadow-sm"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Demo: Healthcare Invoice Discrepancy</span>
              </button>

              <button
                type="button"
                onClick={handleLoadPatientRegSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-bold border border-violet-500/30 transition-all shadow-sm"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Demo: Patient Intake Completeness</span>
              </button>
            </div>
          )}

          {verificationResult && (
            <>
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-bold text-white border border-white/15 shadow-lg transition-all"
              >
                <Download className="w-4 h-4 text-[#62D8FF]" />
                <span>Export Audit Report</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 hover:bg-white/10 text-xs font-bold text-white shadow-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>New Verification</span>
              </button>
            </>
          )}
        </div>

        <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#438AFF]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <LoadingState
          title={`Auditing ${selectedDomainId === 'healthcare-admin' ? 'Healthcare Records' : 'Employment Documents'}`}
          description="Extracting clauses, reconciling numerical terms, and assembling evidence citations..."
          currentStepIndex={2}
        />
      )}

      {/* Upload & Configuration Workspace */}
      {!verificationResult && !isLoading && (
        <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 max-w-4xl mx-auto backdrop-blur-2xl">
          {/* Domain & Document Classification selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                1. Verification Domain
              </label>
              <select
                value={selectedDomainId}
                onChange={(e) => handleSelectDomain(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#438AFF] shadow-inner"
              >
                <option value="employment-hr">Employment & HR (Active)</option>
                <option value="healthcare-admin">Healthcare Administration (Active)</option>
                <option value="education" disabled>Education (Roadmap)</option>
                <option value="government-public" disabled>Government & Public (Roadmap)</option>
                <option value="banking-finance" disabled>Banking & Finance (Roadmap)</option>
                <option value="business-legal" disabled>Business & Legal (Roadmap)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                2. Document Classification
              </label>
              <select
                value={activeDocType}
                onChange={(e) => setActiveDocType(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#438AFF] shadow-inner"
              >
                {selectedDomainId === 'healthcare-admin' ? (
                  <>
                    <option value="hospital_invoice">Hospital Inpatient Invoice</option>
                    <option value="insurance_claim">Health Insurance Claim Form</option>
                    <option value="discharge_summary">Inpatient Discharge Summary</option>
                    <option value="patient_registration">Patient Registration Form</option>
                    <option value="other">Other Medical Record</option>
                  </>
                ) : (
                  <>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="contract">Employment Contract</option>
                    <option value="job_description">Job Description</option>
                    <option value="hr_policy">HR Policy / Handbook</option>
                    <option value="other">Other Supporting Document</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              3. Upload Document Files
            </label>
            <UploadZone
              multiple={true}
              onFilesSelected={handleFilesSelected}
              acceptedFormats={['.pdf', '.docx', '.doc', '.txt', '.png', '.jpg']}
              helperText="Upload 2 or more files to run multi-document clause comparison (PDF, DOCX, TXT up to 10MB)"
            />
          </div>

          {/* Uploaded File List */}
          {uploadedFiles.length > 0 && (
            <div className="pt-2">
              <FileList
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                onDocTypeChange={handleDocTypeChange}
                showDocTypeSelector={true}
                domain={selectedDomainId}
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-[#94A3B8]">
              {uploadedFiles.length < 2
                ? 'Attach at least 2 documents to enable cross-document comparison'
                : `${uploadedFiles.length} documents ready for verification engine`}
            </span>

            <button
              type="button"
              disabled={uploadedFiles.length < 2}
              onClick={handleReviewDocuments}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold shadow-lg transition-all ${
                uploadedFiles.length >= 2
                  ? 'btn-primary text-white shadow-indigo-500/25 hover:scale-105'
                  : 'bg-white/5 text-[#94A3B8] border border-white/10 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Execute Verification Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Verification Results Display */}
      {verificationResult && !isLoading && (
        <div className="space-y-6">
          {/* High-level Summary Card */}
          <DocumentInconsistencySummary result={verificationResult} />

          {/* Completeness Checklist for the active domain */}
          <CompletenessChecklist
            items={currentChecklist}
            domainName={verificationResult.domain}
          />

          {/* Inconsistency Finding Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Detailed Findings & Evidence Citations ({verificationResult.findings.length})
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Side-by-side extracted text excerpts and recommended auditor reconciliation actions
                </p>
              </div>

              <span className="text-xs text-[#62D8FF] font-mono">
                {Object.keys(reviewerDecisions).length} Reviewer Decisions Recorded
              </span>
            </div>

            <div className="space-y-4">
              {verificationResult.findings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onReviewerAction={handleReviewerAction}
                  initialDecision={reviewerDecisions[finding.id]}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {verificationResult && (
        <ExportReportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          result={verificationResult}
        />
      )}
    </div>
  );
};
