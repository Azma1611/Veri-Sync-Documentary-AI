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
    <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/60 bg-gradient-to-r from-white/40 to-indigo-50/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#172554]">Document Completeness Audit</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50/80 text-[#4338CA] border border-indigo-200/60 backdrop-blur-sm">
              {domainName} Specification
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Validation of mandatory contract clauses and required metadata fields
          </p>
        </div>

        {/* Completeness Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Completeness</span>
            <span className="text-sm font-extrabold text-[#172554]">{percentage}% Verified</span>
          </div>
          <div className="w-12 h-12 rounded-xl glass-card border-white/80 flex items-center justify-center font-extrabold text-xs text-[#4338CA] shadow-sm">
            {presentCount}/{items.length}
          </div>
        </div>
      </div>

      {missingRequired > 0 && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50/70 backdrop-blur-sm border border-amber-200/80 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">{missingRequired} mandatory clause(s) not located</span> in the uploaded files. This may trigger an incomplete package alert during HR onboarding audit.
          </div>
        </div>
      )}

      {/* List items */}
      <div className="p-5 divide-y divide-white/60">
        {items.map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {item.status === 'present' ? (
                <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                </div>
              ) : item.status === 'missing' ? (
                <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#172554]">{item.label}</p>
                  {item.required ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
                      Required
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-[#64748B]">
                      Optional
                    </span>
                  )}
                </div>
                {item.foundIn && (
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Found in: <span className="font-medium text-[#172554]">{item.foundIn}</span>
                  </p>
                )}
                {item.note && (
                  <p className="text-[11px] text-amber-800 mt-0.5 font-medium">{item.note}</p>
                )}
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                item.status === 'present'
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : item.status === 'missing'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {item.status === 'present'
                ? 'Extracted'
                : item.status === 'missing'
                ? 'Missing Clause'
                : 'Under Review'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
