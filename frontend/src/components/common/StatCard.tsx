import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  accent?: 'blue' | 'violet' | 'teal';
}

const accentConfig = {
  blue: {
    border: 'stat-blue',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#3B82F6]',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
    valueColor: 'text-[#172554]',
  },
  violet: {
    border: 'stat-violet',
    iconBg: 'bg-violet-50',
    iconColor: 'text-[#8B5CF6]',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-100',
    valueColor: 'text-[#172554]',
  },
  teal: {
    border: 'stat-teal',
    iconBg: 'bg-teal-50',
    iconColor: 'text-[#0D9488]',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-100',
    valueColor: 'text-[#172554]',
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
  const cfg = accentConfig[accent];

  return (
    <div className={`glass-card rounded-2xl p-5 ${cfg.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{title}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center ${cfg.iconColor} shrink-0`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tracking-tight ${cfg.valueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-[#94A3B8] leading-normal">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
