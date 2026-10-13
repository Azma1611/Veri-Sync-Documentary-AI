import React from 'react';
import {
  AlertCircle,
  FileQuestion,
  FileText,
} from 'lucide-react';
import type { VerificationResult } from '../../types';

interface DocumentInconsistencySummaryProps {
  result: VerificationResult;
}

export const DocumentInconsistencySummary: React.FC<DocumentInconsistencySummaryProps> = ({
  result,
}) => {
  const highCount = result.findings.filter((f) => f.severity === 'high').length;
  const mediumCount = result.findings.filter((f) => f.severity === 'medium').length;

  return (
    <div className="space-y-4">
      {/* Primary Status Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E6EAF0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C2414B]/10 border border-[#C2414B]/20 flex items-center justify-center text-[#C2414B] shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-[#182230]">
                {result.findings.length} Potential Inconsistencies Detected
              </span>
              <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-[#C2414B]/10 text-[#C2414B] border border-[#C2414B]/20">
                Action Required
              </span>
            </div>
            <p className="text-xs text-[#667085] max-w-2xl leading-relaxed">
              {result.summaryNote}
            </p>
            <div className="mt-2 flex items-center gap-2 text-3xs text-[#98A2B3] font-medium">
              <span>Reviewed on: {result.reviewedAt}</span>
              <span>•</span>
              <span>Domain: {result.domain}</span>
            </div>
          </div>
        </div>

        {/* Severity Metrics Pills */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <div className="px-3 py-2 rounded-lg bg-[#C2414B]/8 border border-[#C2414B]/20 text-center">
            <span className="text-base font-bold text-[#C2414B] block">{highCount}</span>
            <span className="text-3xs uppercase font-semibold text-[#C2414B]">High Severity</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#B7791F]/8 border border-[#B7791F]/20 text-center">
            <span className="text-base font-bold text-[#B7791F] block">{mediumCount}</span>
            <span className="text-3xs uppercase font-semibold text-[#B7791F]">Medium</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#F2F4F7] border border-[#E6EAF0] text-center">
            <span className="text-base font-bold text-[#667085] block">
              {result.missingFields.length}
            </span>
            <span className="text-3xs uppercase font-semibold text-[#667085]">Missing</span>
          </div>
        </div>
      </div>

      {/* Reviewed Documents Pills */}
      <div className="p-3.5 rounded-lg bg-white border border-[#E6EAF0] text-xs shadow-2xs">
        <span className="font-semibold text-[#667085] uppercase tracking-wider text-3xs block mb-1.5">
          Documents Cross-Referenced in Batch:
        </span>
        <div className="flex flex-wrap gap-2">
          {result.documentsReviewed.map((doc, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8F9FC] text-[#182230] border border-[#E6EAF0] text-2xs font-medium"
            >
              <FileText className="w-3 h-3 text-[#4361EE]" />
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Essential Information */}
      {result.missingFields.length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-[#B7791F]/30 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-[#B7791F]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#182230]">
              Missing Clauses & Attachments ({result.missingFields.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.missingFields.map((field) => (
              <div
                key={field.id}
                className="p-3 rounded-lg bg-[#FDF9F2] border border-[#F2E7D3]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#182230]">{field.fieldName}</span>
                  <span className="text-3xs uppercase font-bold px-1.5 py-0.2 rounded bg-[#B7791F]/15 text-[#B7791F]">
                    {field.severity}
                  </span>
                </div>
                <p className="text-3xs text-[#667085] mb-1">Expected in: {field.expectedIn}</p>
                <p className="text-xs text-[#182230] leading-relaxed">{field.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
