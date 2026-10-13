import React from 'react';
import { FileText, X, CheckCircle2 } from 'lucide-react';
import type { UploadedFileItem, EmploymentDocType } from '../../types';

interface FileListProps {
  files: UploadedFileItem[];
  onRemoveFile: (id: string) => void;
  onDocTypeChange?: (id: string, docType: EmploymentDocType) => void;
  showDocTypeSelector?: boolean;
}

const docTypeLabels: Record<EmploymentDocType, string> = {
  offer_letter: 'Offer Letter',
  contract: 'Employment Contract',
  job_description: 'Job Description',
  hr_policy: 'HR Policy',
  other: 'Other Document',
};

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onDocTypeChange,
  showDocTypeSelector = false,
}) => {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
          Attached ({files.length})
        </span>
        <span className="text-[10px] text-[#94A3B8]">Ready to process</span>
      </div>

      <div className="space-y-1.5">
        {files.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-3.5 h-3.5 text-[#4338CA]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#172554] truncate text-xs" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] text-[#64748B]">{formatFileSize(item.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />

              {showDocTypeSelector && onDocTypeChange && (
                <select
                  value={item.docType || 'offer_letter'}
                  onChange={(e) =>
                    onDocTypeChange(item.id, e.target.value as EmploymentDocType)
                  }
                  className="text-[10px] bg-white border border-indigo-100 rounded-lg px-2 py-1 text-[#172554] font-medium focus:outline-none focus:border-[#4338CA] shadow-sm"
                >
                  <option value="offer_letter">{docTypeLabels.offer_letter}</option>
                  <option value="contract">{docTypeLabels.contract}</option>
                  <option value="job_description">{docTypeLabels.job_description}</option>
                  <option value="hr_policy">{docTypeLabels.hr_policy}</option>
                  <option value="other">{docTypeLabels.other}</option>
                </select>
              )}

              <button
                type="button"
                onClick={() => onRemoveFile(item.id)}
                className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
