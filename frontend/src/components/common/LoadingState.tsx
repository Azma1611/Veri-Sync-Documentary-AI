import React from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  title: string;
  description?: string;
  steps?: string[];
  currentStepIndex?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description = 'Processing evidence-linked verification matrices...',
  steps = [
    'Parsing document tokens and layout structures',
    'Extracting clauses, boundaries, and entity metadata',
    'Reconciling cross-document values and completeness rules',
    'Generating audit evidence citations and discrepancy report',
  ],
  currentStepIndex = 2,
}) => {
  return (
    <div className="py-12 px-8 rounded-2xl glass-panel text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute w-48 h-48 bg-[#438AFF]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated icon */}
      <div className="relative mb-5 z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4338CA]/40 to-[#438AFF]/30 border border-[#62D8FF]/30 flex items-center justify-center shadow-[0_0_25px_rgba(67,138,255,0.3)]">
          <Loader2 className="w-8 h-8 text-[#62D8FF] animate-spin" strokeWidth={2} />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2DD4BF] border-2 border-[#080D20] shadow-[0_0_8px_#2DD4BF] animate-pulse" />
      </div>

      <h3 className="text-lg font-extrabold text-white mb-1.5 tracking-tight z-10">{title}</h3>
      <p className="text-xs text-[#94A3B8] mb-6 max-w-sm leading-relaxed z-10">{description}</p>

      {steps.length > 0 && (
        <div className="w-full max-w-md space-y-3 text-left bg-black/30 p-5 rounded-2xl border border-white/10 backdrop-blur-md z-10">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
            <span>Execution Pipeline</span>
            <span className="text-[#62D8FF] flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" /> Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#62D8FF] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                )}
                <span
                  className={`${
                    isCurrent
                      ? 'font-bold text-white'
                      : isCompleted
                      ? 'text-[#94A3B8]/70 line-through'
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
