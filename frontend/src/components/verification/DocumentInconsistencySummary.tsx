import React from 'react';
import { AlertCircle, FileQuestion, FileText } from 'lucide-react';
import type { VerificationResult } from '../../types';

interface DocumentInconsistencySummaryProps {
  result: VerificationResult;
}

export const DocumentInconsistencySummary: React.FC<DocumentInconsistencySummaryProps> = ({
  result,
}) => {
  const highCount = result.findings.filter((f) => f.severity === 'high').length;
  const mediumCount = result.findings.filter((f) => f.severity === 'medium').length;
  const lowCount = result.findings.filter((f) => f.severity === 'low').length;

  return (
    <div className="space-y-4">
      {/* Primary Status Banner */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.25)]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">
                {result.findings.length} Potential Inconsistencies Detected
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Action Required
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1] max-w-2xl leading-relaxed">
              {result.summaryNote}
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#94A3B8] font-medium">
              <span>Reviewed on: {result.reviewedAt}</span>
              <span>•</span>
              <span className="text-[#62D8FF]">Domain: {result.domain}</span>
            </div>
          </div>
        </div>

        {/* Severity Metrics Pills */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <div className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-center min-w-[60px]">
            <span className="text-base font-extrabold text-red-300 block">{highCount}</span>
            <span className="text-[9px] uppercase font-bold text-red-400">High</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center min-w-[60px]">
            <span className="text-base font-extrabold text-amber-300 block">{mediumCount}</span>
            <span className="text-[9px] uppercase font-bold text-amber-400">Med</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-center min-w-[60px]">
            <span className="text-base font-extrabold text-blue-300 block">{lowCount}</span>
            <span className="text-[9px] uppercase font-bold text-blue-400">Low</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-center min-w-[60px]">
            <span className="text-base font-extrabold text-white block">
              {result.missingFields.length}
            </span>
            <span className="text-[9px] uppercase font-bold text-[#94A3B8]">Missing</span>
          </div>
        </div>
      </div>

      {/* Reviewed Documents Pills */}
      <div className="p-4 rounded-xl glass-card border border-white/10 text-xs">
        <span className="font-bold text-[#94A3B8] uppercase tracking-wider text-[10px] block mb-2">
          Documents Cross-Referenced in Batch:
        </span>
        <div className="flex flex-wrap gap-2">
          {result.documentsReviewed.map((doc, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 text-[#CBD5E1] border border-white/10 text-xs font-semibold"
            >
              <FileText className="w-3.5 h-3.5 text-[#62D8FF]" />
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Essential Information */}
      {result.missingFields.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              Missing Mandatory Clauses & Expected Fields ({result.missingFields.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {result.missingFields.map((field) => (
              <div
                key={field.id}
                className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{field.fieldName}</span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {field.severity}
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mb-1">
                  Expected in: <span className="text-white font-medium">{field.expectedIn}</span>
                </p>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">{field.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
