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
    <div className="py-16 px-6 text-center rounded-2xl border-2 border-dashed border-[#C7D2FE] bg-white flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl brand-gradient-subtle border border-indigo-100 flex items-center justify-center text-[#4338CA] mb-4 shadow-sm">
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-[#172554] mb-1.5">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
};
