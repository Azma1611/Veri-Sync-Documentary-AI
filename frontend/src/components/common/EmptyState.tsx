import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 px-6 text-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] backdrop-blur-md flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-[#438AFF]/15 border border-[#438AFF]/30 flex items-center justify-center text-[#62D8FF] mb-4 shadow-[0_0_20px_rgba(67,138,255,0.2)]">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-[#94A3B8] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold shadow-lg"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
};
