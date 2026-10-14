import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

interface FitScoreGaugeProps {
  score: number;
  label?: string;
}

export const FitScoreGauge: React.FC<FitScoreGaugeProps> = ({
  score,
  label = 'Role Fit Score',
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 80)
      return {
        text: 'text-teal-300',
        bar: 'bg-gradient-to-r from-teal-500 via-teal-400 to-[#62D8FF]',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        label: 'Strong Match',
      };
    if (s >= 60)
      return {
        text: 'text-[#62D8FF]',
        bar: 'bg-gradient-to-r from-[#4338CA] via-[#438AFF] to-[#62D8FF]',
        badge: 'bg-[#438AFF]/20 text-[#62D8FF] border-[#438AFF]/30',
        label: 'Moderate Match',
      };
    return {
      text: 'text-amber-300',
      bar: 'bg-gradient-to-r from-amber-600 to-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'Developing Match',
    };
  };

  const colors = getScoreColor(score);

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-5 shadow-xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#438AFF]/20 border border-[#438AFF]/30 flex items-center justify-center text-[#62D8FF] shadow-inner">
            <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">
            {label}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-md ${colors.badge}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {colors.label} · {score}%
        </span>
      </div>

      {/* Progress track */}
      <div className="relative h-3 w-full rounded-full bg-black/40 border border-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full progress-animated ${colors.bar} shadow-[0_0_12px_rgba(98,216,255,0.4)]`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Scale numbers */}
      <div className="mt-2.5 flex justify-between text-[10px] text-[#94A3B8] font-mono">
        <span>0%</span>
        <span className={`font-bold ${colors.text}`}>{score}% Qualified</span>
        <span>100%</span>
      </div>

      <p className="mt-2.5 text-[11px] text-[#94A3B8] leading-relaxed">
        Algorithmically evaluated against stated role specifications. Not a guarantee of employment.
      </p>
    </div>
  );
};
