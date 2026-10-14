import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  accent?: 'blue' | 'violet' | 'teal' | 'amber';
}

const accentConfig = {
  blue: {
    border: 'stat-blue',
    iconBg: 'bg-[#438AFF]/20 text-[#62D8FF] border border-[#438AFF]/30',
    badgeBg: 'bg-[#438AFF]/20 text-[#62D8FF] border-[#438AFF]/30',
    glow: 'shadow-[0_0_15px_rgba(67,138,255,0.2)]',
  },
  violet: {
    border: 'stat-violet',
    iconBg: 'bg-[#8B5CF6]/20 text-violet-300 border border-[#8B5CF6]/30',
    badgeBg: 'bg-[#8B5CF6]/20 text-violet-300 border-[#8B5CF6]/30',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  },
  teal: {
    border: 'stat-teal',
    iconBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    glow: 'shadow-[0_0_15px_rgba(45,212,191,0.2)]',
  },
  amber: {
    border: 'stat-amber',
    iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accent = 'blue',
}) => {
  const cfg = accentConfig[accent] || accentConfig.blue;

  return (
    <div className={`glass-card rounded-2xl p-5 ${cfg.border} relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">{title}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${cfg.iconBg} ${cfg.glow} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${cfg.badgeBg}`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-[#CBD5E1] leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
