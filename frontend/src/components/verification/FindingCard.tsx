import React, { useState } from 'react';
import { AlertCircle, CheckSquare, ChevronDown, ChevronUp, Check, Flag } from 'lucide-react';
import type { InconsistencyFinding } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EvidenceComparison } from './EvidenceComparison';

interface FindingCardProps {
  finding: InconsistencyFinding;
  onReviewerAction?: (findingId: string, status: string, notes: string) => void;
  initialDecision?: { status: string; notes: string };
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onReviewerAction,
  initialDecision,
}) => {
  const [decision, setDecision] = useState<string>(initialDecision?.status || finding.status);
  const [notes, setNotes] = useState<string>(initialDecision?.notes || '');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleApplyDecision = (newStatus: string) => {
    setDecision(newStatus);
    if (onReviewerAction) {
      onReviewerAction(finding.id, newStatus, notes);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const getBorderColor = () => {
    if (finding.severity === 'high') return 'border-red-500/30 hover:border-red-400/50';
    if (finding.severity === 'medium') return 'border-amber-500/30 hover:border-amber-400/50';
    return 'border-teal-500/30 hover:border-teal-400/50';
  };

  return (
    <div className={`glass-panel rounded-2xl border ${getBorderColor()} p-5 shadow-xl space-y-4 transition-all backdrop-blur-xl relative overflow-hidden`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              finding.severity === 'high'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : finding.severity === 'medium'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#62D8FF] border border-white/10">
                {finding.category.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                ID: {finding.id}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              {finding.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <StatusBadge severity={finding.severity} size="sm" />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isExpanded ? 'Collapse finding' : 'Expand finding'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Finding Explanation */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs text-[#CBD5E1] leading-relaxed backdrop-blur-md">
            <span className="font-bold text-white block mb-1">Audit Finding Detail:</span>
            {finding.explanation}
          </div>

          {/* Side-by-side Evidence Comparison */}
          <EvidenceComparison sourceA={finding.sourceA} sourceB={finding.sourceB} />

          {/* Recommended Auditor Action */}
          <div className="pt-2 border-t border-white/10 flex items-start gap-2.5 text-xs">
            <div className="p-1.5 rounded-lg bg-[#438AFF]/20 text-[#62D8FF] border border-[#438AFF]/30 shrink-0 mt-0.5">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-white block">Recommended Auditor Action:</span>
              <p className="text-[#94A3B8] mt-0.5 leading-relaxed">{finding.recommendedAction}</p>
            </div>
          </div>

          {/* Human Reviewer Action Controls */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Auditor Review:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyDecision('verified_inconsistency')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    decision === 'verified_inconsistency'
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-sm'
                      : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  Confirm Mismatch
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDecision('flagged')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    decision === 'flagged'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:text-white'
                  }`}
                >
                  <Flag className="w-3 h-3 text-amber-400" />
                  Flag for Legal
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDecision('accepted_variation')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    decision === 'accepted_variation'
                      ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 shadow-sm'
                      : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:text-white'
                  }`}
                >
                  <Check className="w-3 h-3 text-teal-400" />
                  Accept Variance
                </button>
              </div>
            </div>

            {/* Optional Auditor Note */}
            <div className="pt-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (onReviewerAction) {
                    onReviewerAction(finding.id, decision, e.target.value);
                  }
                }}
                placeholder="Auditor rationale or legal note (optional)..."
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {savedSuccess && (
              <span className="text-[10px] text-teal-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Recorded in Audit Log
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
