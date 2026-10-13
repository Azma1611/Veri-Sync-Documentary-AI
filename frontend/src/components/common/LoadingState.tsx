import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  title: string;
  description?: string;
  steps?: string[];
  currentStepIndex?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description = 'Processing demonstration data across verification matrices...',
  steps = [
    'Parsing document tokens and optical layout',
    'Extracting contractual clauses and entity metadata',
    'Synthesizing cross-document discrepancy matrix',
  ],
  currentStepIndex = 1,
}) => {
  return (
    <div className="py-12 px-8 rounded-2xl border border-[#E4E8F2] bg-white text-center flex flex-col items-center justify-center shadow-sm">
      {/* Animated icon */}
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl brand-gradient-subtle border border-indigo-100 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#4338CA] animate-spin" strokeWidth={2} />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#4338CA] border-2 border-white animate-pulse" />
      </div>

      <h3 className="text-base font-bold text-[#172554] mb-1">{title}</h3>
      <p className="text-xs text-[#64748B] mb-6 max-w-xs leading-relaxed">{description}</p>

      {steps.length > 0 && (
        <div className="w-full max-w-sm space-y-2.5 text-left bg-[#F5F7FF] p-4 rounded-xl border border-[#E4E8F2]">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#4338CA] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#C7D2FE] shrink-0" />
                )}
                <span
                  className={`${
                    isCurrent
                      ? 'font-semibold text-[#172554]'
                      : isCompleted
                      ? 'text-[#94A3B8] line-through'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
