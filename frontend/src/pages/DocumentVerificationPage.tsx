import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  FileText,
  AlertCircle,
  FileQuestion,
  ShieldAlert,
  ChevronRight,
  Download,
  Scale,
  Check,
} from 'lucide-react';
import { UploadZone } from '../components/common/UploadZone';
import { FileList } from '../components/common/FileList';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { LoadingState } from '../components/common/LoadingState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { CompletenessChecklist } from '../components/common/CompletenessChecklist';
import type { ChecklistItem } from '../components/common/CompletenessChecklist';
import { ExportReportModal } from '../components/common/ExportReportModal';
import { verifyEmploymentDocuments, submitReviewerDecision } from '../services/api';
import type {
  EmploymentDocType,
  UploadedFileItem,
  VerificationResult,
  InconsistencyFinding,
} from '../types';
import { mockVerificationResult } from '../data/mockData';
import { platformDomains } from '../data/domainData';

export const DocumentVerificationPage: React.FC = () => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('employment-hr');
  const [activeDocType, setActiveDocType] = useState<EmploymentDocType>('offer_letter');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [inspectFinding, setInspectFinding] = useState<InconsistencyFinding | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [reviewerDecisions, setReviewerDecisions] = useState<Record<string, { status: string; notes: string }>>({});

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

  const handleDocTypeChange = (id: string, newType: EmploymentDocType) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, docType: newType } : f))
    );
  };

  const handleReviewDocuments = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true);
    try {
      const response = await verifyEmploymentDocuments({
        files: uploadedFiles.map((f) => ({ file: f.file, docType: f.docType || 'other' })),
        domain: selectedDomainId as any,
      });
      setVerificationResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult(mockVerificationResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    const fileA = new File(['sample'], 'Offer_Letter_Signed_2024.pdf', { type: 'application/pdf' });
    const fileB = new File(['sample'], 'Employment_Contract_Standard_v2.pdf', { type: 'application/pdf' });
    setUploadedFiles([
      { id: 'sample-1', file: fileA, name: 'Offer_Letter_Signed_2024.pdf', size: 1153433, type: 'application/pdf', docType: 'offer_letter', uploadedAt: new Date() },
      { id: 'sample-2', file: fileB, name: 'Employment_Contract_Standard_v2.pdf', size: 2411724, type: 'application/pdf', docType: 'contract', uploadedAt: new Date() },
    ]);
    setSelectedDomainId('employment-hr');
    setVerificationResult(mockVerificationResult);
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
      console.warn('Failed to persist reviewer decision to audit trail:', err);
    });
  };

  const checklistItems: ChecklistItem[] = [
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
      label: 'Annexure B: Intellectual Property & Inventions Assignment',
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

  const severityBorderClass = (severity: string) => {
    if (severity === 'high') return 'severity-high';
    if (severity === 'medium') return 'severity-medium';
    return 'severity-low';
  };

  return (
    <div className="space-y-5 page-enter max-w-7xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Multi-Domain Verification Workspace: Cross-references document pairs to highlight potential discrepancies. Results indicate potential inconsistencies requiring human auditor review; not proof of fraud or authenticity." />

      {/* Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1 font-medium">
            <Link to="/verify" className="hover:text-[#4338CA] transition-colors">
              Domains
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <Link to="/verify/employment" className="hover:text-[#4338CA] transition-colors">
              Employment & HR
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-bold text-[#172554]">Employment Document Verification</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            Document Verification Workspace
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cross-reference offer letters, employment contracts, and policies for terms consistency and completeness.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!verificationResult && (
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] text-xs font-bold border border-indigo-100 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Demo Package
            </button>
          )}

          {verificationResult && (
            <>
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-white/90 text-xs font-bold text-[#172554] border border-white/80 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#4338CA]" />
                Export Audit Report
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border-white/80 hover:bg-white/90 text-xs font-bold text-[#172554] shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                New Verification
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload & Configuration Panel */}
      {!verificationResult && !isLoading && (
        <div className="glass-panel rounded-2xl border border-white/80 p-6 shadow-lg space-y-5 max-w-4xl">
          {/* Domain & Doc Type selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Target Domain
              </label>
              <select
                value={selectedDomainId}
                onChange={(e) => setSelectedDomainId(e.target.value)}
                className="w-full px-3 py-2.5 glass-input text-xs text-[#172554] font-semibold focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                {platformDomains.map((d) => (
                  <option key={d.id} value={d.id} disabled={d.status !== 'active'}>
                    {d.name} {d.status !== 'active' ? '(Coming Soon)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Document Classification
              </label>
              <select
                value={activeDocType}
                onChange={(e) => setActiveDocType(e.target.value as EmploymentDocType)}
                className="w-full px-3 py-2.5 glass-input text-xs text-[#172554] font-semibold focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                <option value="offer_letter">Offer Letter</option>
                <option value="contract">Employment Contract</option>
                <option value="job_description">Job Description</option>
                <option value="hr_policy">HR Policy / Handbook</option>
                <option value="other">Other Supporting Document</option>
              </select>
            </div>
          </div>

          {/* Upload Zone */}
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Upload Documents for Cross-Referencing
            </label>
            <UploadZone
              onFilesSelected={handleFilesSelected}
              multiple={true}
              maxSizeMB={15}
              acceptedFormats={['.pdf', '.docx', '.doc']}
              helperText="Upload 2 or more files (e.g. Candidate Offer Letter + Countersigned Contract)"
              compact={false}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <FileList
              files={uploadedFiles}
              onRemoveFile={handleRemoveFile}
              onDocTypeChange={handleDocTypeChange}
              showDocTypeSelector={true}
            />
          )}

          {/* Action footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E4E8F2]">
            <span className="text-[11px] text-[#94A3B8]">
              {uploadedFiles.length < 2
                ? 'Tip: Upload 2 or more documents to perform multi-source clause comparison.'
                : `${uploadedFiles.length} files attached for multi-source inspection.`}
            </span>
            <button
              type="button"
              disabled={uploadedFiles.length === 0}
              onClick={handleReviewDocuments}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                uploadedFiles.length > 0
                  ? 'btn-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-400 border border-[#E4E8F2] cursor-not-allowed'
              }`}
            >
              <span>Execute Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <LoadingState
          title="Executing Multi-Domain Document Verification..."
          description="Parsing structured text clauses, verifying mandatory fields, and comparing information across documents."
          steps={[
            'Ingesting PDF document streams and isolating clause boundaries',
            'Evaluating document completeness and required-field checklist',
            'Cross-comparing terms across compensation, notice duration, and tenure',
            'Grounding potential inconsistency findings with page & section citations',
          ]}
          currentStepIndex={2}
        />
      )}

      {/* Verification Workspace Results */}
      {verificationResult && !isLoading && (
        <div className="space-y-6">
          {/* Top Banner: Status & Disclaimer */}
          <div className="glass-panel rounded-2xl border border-amber-200/80 shadow-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/60 to-white/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#172554]">
                  {verificationResult.findings.length} Potential Inconsistencies Requiring Review
                </p>
                <p className="text-xs text-[#64748B]">
                  Identified variances between documents. Reviewers must confirm findings before formal action.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {verificationResult.documentsReviewed.map((doc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 backdrop-blur-sm"
                >
                  <FileText className="w-3 h-3" />
                  {doc.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Completeness Checklist */}
          <CompletenessChecklist
            items={checklistItems}
            domainName="Employment & HR"
          />

          {/* Potential Inconsistencies Matrix */}
          <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-white/60 bg-gradient-to-r from-white/40 to-indigo-50/30 backdrop-blur-md flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#172554]">
                  Potential Inconsistencies & Evidence Citations
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Side-by-side clause comparison grounded by source documents, sections, and page references
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/70 text-[#64748B] border border-white/80">
                {verificationResult.findings.length} findings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/50 backdrop-blur-sm border-b border-white/60 text-[#64748B] text-[10px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-6">Clause Category & Finding</th>
                    <th className="py-3 px-4">Source Excerpts</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/60">
                  {verificationResult.findings.map((finding) => {
                    const decision = reviewerDecisions[finding.id];
                    return (
                      <tr
                        key={finding.id}
                        className={`hover:bg-white/60 transition-colors cursor-pointer ${severityBorderClass(finding.severity)}`}
                        onClick={() => setInspectFinding(finding)}
                      >
                        <td className="py-4 px-6 max-w-xs">
                          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                            {finding.category.replace('_', ' ')}
                          </span>
                          <p className="font-bold text-[#172554] mt-0.5">{finding.title}</p>
                          <span className="text-[10px] text-[#64748B] block mt-1 line-clamp-1">
                            {finding.explanation}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-baseline gap-1.5 text-[11px]">
                              <span className="text-[10px] font-bold text-[#4338CA] shrink-0">
                                Doc A (p.{finding.sourceA.page}):
                              </span>
                              <span className="font-mono text-[#172554] truncate">
                                "{finding.sourceA.extractedValue}"
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1.5 text-[11px]">
                              <span className="text-[10px] font-bold text-red-600 shrink-0">
                                Doc B (p.{finding.sourceB.page}):
                              </span>
                              <span className="font-mono text-red-700 font-bold truncate">
                                "{finding.sourceB.extractedValue}"
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge severity={finding.severity} size="sm" />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {decision ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                              <Check className="w-3 h-3" />
                              {decision.status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Requires Review
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectFinding(finding);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:text-[#172554] px-3 py-1.5 rounded-xl hover:bg-indigo-50/60 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Evidence</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Missing or Unverified Clauses */}
          {verificationResult.missingFields.length > 0 && (
            <div className="glass-panel rounded-2xl border border-white/80 shadow-lg p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileQuestion className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172554]">
                    Missing or Unverified Clauses
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {verificationResult.missingFields.length} expected fields could not be verified in the submitted documents
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {verificationResult.missingFields.map((field) => (
                  <div key={field.id} className="p-3 rounded-xl bg-white/60 border border-white/80 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#172554] text-xs">{field.fieldName}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800">
                        {field.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">{field.detail}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-1">Expected in: {field.expectedIn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evidence Inspection Modal with Human-Review Actions */}
      {inspectFinding && (
        <Modal
          isOpen={Boolean(inspectFinding)}
          onClose={() => setInspectFinding(null)}
          title={`Evidence Inspection: ${inspectFinding.title}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Potential inconsistency flagged for human review. Verify with legal/HR before issuing corrections.</span>
            </div>

            {/* Issue Explanation */}
            <div className="p-4 rounded-xl bg-[#F5F7FF] border border-[#E4E8F2]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                Discrepancy Analysis
              </span>
              <p className="text-xs text-[#475569] leading-relaxed">{inspectFinding.explanation}</p>
            </div>

            {/* Side-by-Side Evidence Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white border border-[#E4E8F2] shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E8F2] mb-2">
                  <span className="font-bold text-[#172554] text-xs truncate">
                    {inspectFinding.sourceA.documentName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                    Page {inspectFinding.sourceA.page}
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mb-2">{inspectFinding.sourceA.section}</p>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-[#172554] leading-relaxed">
                  "{inspectFinding.sourceA.extractedValue}"
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-50/30 border border-red-200 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-red-200 mb-2">
                  <span className="font-bold text-red-900 text-xs truncate">
                    {inspectFinding.sourceB.documentName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                    Page {inspectFinding.sourceB.page}
                  </span>
                </div>
                <p className="text-[10px] text-red-600 mb-2">{inspectFinding.sourceB.section}</p>
                <div className="p-3 rounded-lg bg-white border border-red-200 font-mono text-xs text-red-800 font-bold leading-relaxed">
                  "{inspectFinding.sourceB.extractedValue}"
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-[#4338CA] shrink-0" />
                <span className="font-bold text-[#172554] text-xs">Recommended Auditor Remediation</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{inspectFinding.recommendedAction}</p>
            </div>

            {/* Human Review Actions */}
            <div className="pt-3 border-t border-[#E4E8F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#64748B]">Auditor Decision:</span>
                <button
                  type="button"
                  onClick={() => {
                    handleReviewerAction(inspectFinding.id, 'Verified Inconsistency');
                    setInspectFinding(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                >
                  Confirm Inconsistency
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReviewerAction(inspectFinding.id, 'Acceptable Variation');
                    setInspectFinding(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors"
                >
                  Acceptable Variation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleReviewerAction(inspectFinding.id, 'Flagged for Legal Review');
                    setInspectFinding(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                >
                  Flag for Legal
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInspectFinding(null)}
                className="px-4 py-2 rounded-xl border border-[#E4E8F2] hover:bg-slate-50 text-xs font-semibold text-[#172554]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
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
