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
    <div className="relative rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-center justify-center -mt-7 sm:-mt-8 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111735] text-white text-[11px] font-bold border border-[#438AFF]/40 shadow-[0_0_15px_rgba(67,138,255,0.3)]">
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#62D8FF]" />
          <span>Cross-Document Clause Comparison</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source A */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[#62D8FF] shrink-0" />
                <span className="text-xs font-bold text-white truncate" title={sourceA.documentName}>
                  {sourceA.documentName}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#CBD5E1] shrink-0">
                Page {sourceA.page}
              </span>
            </div>

            <p className="text-[10px] font-bold text-[#62D8FF] uppercase tracking-wider mb-1.5">
              {sourceA.section}
            </p>

            <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-[#F8FAFC] font-mono text-xs leading-relaxed">
              "{sourceA.extractedValue}"
            </div>
          </div>
          <span className="mt-3 text-[10px] text-[#94A3B8] font-semibold">
            Source Passage • Document A
          </span>
        </div>

        {/* Source B (Mismatch) */}
        <div className="p-4 rounded-xl bg-red-950/25 border border-red-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-red-500/20 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate" title={sourceB.documentName}>
                  {sourceB.documentName}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 shrink-0 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                Page {sourceB.page}
              </span>
            </div>

            <p className="text-[10px] font-bold text-red-300 uppercase tracking-wider mb-1.5">
              {sourceB.section}
            </p>

            <div className="p-3 rounded-lg bg-black/50 border border-red-500/30 text-red-200 font-mono text-xs leading-relaxed font-semibold">
              "{sourceB.extractedValue}"
            </div>
          </div>
          <span className="mt-3 text-[10px] text-red-300 font-semibold">
            Contradictory Passage • Document B
          </span>
        </div>
      </div>
    </div>
  );
};
