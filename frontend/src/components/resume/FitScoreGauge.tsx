import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

interface FitScoreGaugeProps {
  score: number;
  label?: string;
}

export const FitScoreGauge: React.FC<FitScoreGaugeProps> = ({
  score,
  label = 'Career Fit Score',
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: 'text-[#0D9488]', bar: 'bg-gradient-to-r from-teal-400 to-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200' };
    if (s >= 60) return { text: 'text-[#4338CA]', bar: 'bg-gradient-to-r from-indigo-400 to-blue-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { text: 'text-amber-600', bar: 'bg-gradient-to-r from-amber-400 to-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="glass-panel rounded-2xl border border-white/80 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#4338CA]" strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-[#172554] uppercase tracking-wider">
            {label}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${colors.badge}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Match' : 'Moderate Match'} · {score}%
        </span>
      </div>

      {/* Score bar with animation */}
      <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full progress-animated ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Score scale labels */}
      <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
        <span>0%</span>
        <span className={`font-bold ${colors.text}`}>{score}%</span>
        <span>100%</span>
      </div>

      <p className="mt-2 text-[11px] text-[#64748B]">
        Evaluated against core technical requirements for the target role. Results are indicative only.
      </p>
    </div>
  );
};
