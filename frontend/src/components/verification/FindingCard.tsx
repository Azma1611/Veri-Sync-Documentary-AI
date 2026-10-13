import React from 'react';
import { AlertCircle, CheckSquare } from 'lucide-react';
import type { InconsistencyFinding } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EvidenceComparison } from './EvidenceComparison';

interface FindingCardProps {
  finding: InconsistencyFinding;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  return (
    <div className="bg-white rounded-xl border border-[#E6EAF0] p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C2414B]/10 text-[#C2414B] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-3xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F2F4F7] text-[#667085]">
                {finding.category.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-[#182230]">{finding.title}</h4>
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <StatusBadge severity={finding.severity} size="sm" />
        </div>
      </div>

      {/* Concise Explanation */}
      <div className="p-3 rounded-lg bg-[#F8F9FC] border border-[#E6EAF0] text-xs text-[#182230] leading-relaxed">
        <span className="font-semibold text-[#182230] block mb-0.5">Finding Details:</span>
        {finding.explanation}
      </div>

      {/* Side-by-side Evidence Comparison */}
      <EvidenceComparison
        sourceA={finding.sourceA}
        sourceB={finding.sourceB}
      />

      {/* Recommended Action */}
      <div className="pt-2 border-t border-[#E6EAF0] flex items-start gap-2 text-xs">
        <div className="p-1 rounded bg-[#4361EE]/10 text-[#4361EE] shrink-0 mt-0.5">
          <CheckSquare className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-semibold text-[#182230] block">Recommended Action:</span>
          <p className="text-[#667085] mt-0.5 leading-relaxed">{finding.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
};
