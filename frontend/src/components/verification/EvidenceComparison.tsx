import React from 'react';
import { FileText, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface EvidenceSource {
  documentName: string;
  section: string;
  page: number;
  extractedValue: string;
}

interface EvidenceComparisonProps {
  sourceA: EvidenceSource;
  sourceB: EvidenceSource;
}

export const EvidenceComparison: React.FC<EvidenceComparisonProps> = ({
  sourceA,
  sourceB,
}) => {
  return (
    <div className="relative rounded-xl border border-[#E6EAF0] bg-[#F8F9FC] p-4">
      <div className="flex items-center justify-center -mt-6 sm:-mt-7 mb-2.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#14213D] text-white text-3xs font-semibold shadow-2xs">
          <ArrowRightLeft className="w-3 h-3 text-[#4CC9F0]" />
          <span>Cross-Document Conflict</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Source A */}
        <div className="p-3.5 rounded-lg bg-white border border-[#E6EAF0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF0] mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                <span className="text-xs font-semibold text-[#182230] truncate" title={sourceA.documentName}>
                  {sourceA.documentName}
                </span>
              </div>
              <span className="text-3xs font-medium px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#667085] shrink-0">
                Page {sourceA.page}
              </span>
            </div>

            <p className="text-3xs font-semibold text-[#667085] uppercase tracking-wider mb-1">
              {sourceA.section}
            </p>

            <div className="p-2.5 rounded bg-[#F8F9FC] border border-[#E6EAF0] text-[#182230] font-mono text-xs leading-relaxed">
              "{sourceA.extractedValue}"
            </div>
          </div>
          <span className="mt-2 text-3xs text-[#98A2B3]">Source Passage • Document A</span>
        </div>

        {/* Source B (Mismatch) */}
        <div className="p-3.5 rounded-lg bg-white border border-[#C2414B]/30 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF0] mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                <span className="text-xs font-semibold text-[#182230] truncate" title={sourceB.documentName}>
                  {sourceB.documentName}
                </span>
              </div>
              <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-[#C2414B]/10 text-[#C2414B] shrink-0 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                Page {sourceB.page}
              </span>
            </div>

            <p className="text-3xs font-semibold text-[#667085] uppercase tracking-wider mb-1">
              {sourceB.section}
            </p>

            <div className="p-2.5 rounded bg-[#C2414B]/5 border border-[#C2414B]/20 text-[#C2414B] font-mono text-xs leading-relaxed font-semibold">
              "{sourceB.extractedValue}"
            </div>
          </div>
          <span className="mt-2 text-3xs text-[#C2414B]">Contradictory Passage • Document B</span>
        </div>
      </div>
    </div>
  );
};
