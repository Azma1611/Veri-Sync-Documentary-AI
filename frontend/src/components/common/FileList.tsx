import React from 'react';
import { FileText, X, CheckCircle2 } from 'lucide-react';
import type { UploadedFileItem, GenericDocType } from '../../types';

interface FileListProps {
  files: UploadedFileItem[];
  onRemoveFile: (id: string) => void;
  onDocTypeChange?: (id: string, docType: GenericDocType) => void;
  showDocTypeSelector?: boolean;
  domain?: string;
}

const employmentLabels: Record<string, string> = {
  offer_letter: 'Offer Letter',
  contract: 'Employment Contract',
  job_description: 'Job Description',
  hr_policy: 'HR Policy / Handbook',
  other: 'Other Supporting Document',
};

const healthcareLabels: Record<string, string> = {
  patient_registration: 'Patient Registration Form',
  hospital_invoice: 'Hospital Inpatient Invoice',
  insurance_claim: 'Health Insurance Claim',
  discharge_summary: 'Inpatient Discharge Summary',
  other: 'Other Medical Record',
};

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onDocTypeChange,
  showDocTypeSelector = false,
  domain = 'employment-hr',
}) => {
  if (files.length === 0) return null;

  const docTypeLabels = domain === 'healthcare-admin' ? healthcareLabels : employmentLabels;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
          Attached Documents ({files.length})
        </span>
        <span className="text-[11px] text-teal-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-teal-400" />
          Ready to verify
        </span>
      </div>

      <div className="space-y-2">
        {files.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs gap-3 hover:bg-white/[0.08] hover:border-white/20 transition-all backdrop-blur-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#438AFF]/20 border border-[#438AFF]/30 flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-4 h-4 text-[#62D8FF]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate text-xs" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#94A3B8]">{formatFileSize(item.size)}</span>
                  {item.docType && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/25">
                      {docTypeLabels[item.docType] || item.docType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {showDocTypeSelector && onDocTypeChange && (
                <select
                  value={item.docType || (domain === 'healthcare-admin' ? 'hospital_invoice' : 'offer_letter')}
                  onChange={(e) => onDocTypeChange(item.id, e.target.value)}
                  className="text-[11px] bg-[#0C122C] border border-white/15 rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none focus:border-[#438AFF] shadow-sm"
                >
                  {Object.entries(docTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => onRemoveFile(item.id)}
                className="w-7 h-7 flex items-center justify-center text-[#94A3B8] hover:text-red-400 rounded-lg hover:bg-red-500/15 transition-colors"
                title="Remove document"
                aria-label={`Remove ${item.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
