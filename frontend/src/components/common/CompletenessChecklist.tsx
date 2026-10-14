import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: 'present' | 'missing' | 'inconclusive';
  foundIn?: string;
  note?: string;
}

interface CompletenessChecklistProps {
  items: ChecklistItem[];
  domainName?: string;
}

export const CompletenessChecklist: React.FC<CompletenessChecklistProps> = ({
  items,
  domainName = 'Employment & HR',
}) => {
  const presentCount = items.filter((i) => i.status === 'present').length;
  const percentage = items.length > 0 ? Math.round((presentCount / items.length) * 100) : 0;
  const missingRequired = items.filter((i) => i.required && i.status === 'missing').length;

  return (
    <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-white/10 bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Document Completeness Audit
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30">
              {domainName} Checklist
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Validation of mandatory contract clauses and required metadata fields
          </p>
        </div>

        {/* Completeness Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
              Completeness
            </span>
            <span className="text-sm font-extrabold text-teal-400">
              {percentage}% Verified
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/15 flex items-center justify-center font-extrabold text-xs text-[#62D8FF] shadow-inner">
            {presentCount}/{items.length}
          </div>
        </div>
      </div>

      {missingRequired > 0 && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-300">
              {missingRequired} mandatory item(s) not located
            </span>{' '}
            in the uploaded documents. Requires compliance review before formal approval.
          </div>
        </div>
      )}

      {/* List items */}
      <div className="p-6 divide-y divide-white/10">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              {item.status === 'present' ? (
                <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                </div>
              ) : item.status === 'missing' ? (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  {item.required ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      Required
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#94A3B8]">
                      Optional
                    </span>
                  )}
                </div>
                {item.foundIn && (
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Found in: <span className="font-semibold text-white">{item.foundIn}</span>
                  </p>
                )}
                {item.note && (
                  <p className="text-[11px] text-amber-300 mt-0.5 font-medium">{item.note}</p>
                )}
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                item.status === 'present'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : item.status === 'missing'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-white/10 text-[#CBD5E1] border-white/15'
              }`}
            >
              {item.status === 'present'
                ? 'Extracted'
                : item.status === 'missing'
                ? 'Missing Item'
                : 'Under Review'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
