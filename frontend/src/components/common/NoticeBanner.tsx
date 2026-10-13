import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface NoticeBannerProps {
  title?: string;
  message: string;
  variant?: 'demo' | 'warning' | 'info';
  className?: string;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  message,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-white/80 bg-gradient-to-r from-indigo-50/70 via-white/60 to-blue-50/60 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
          <Info className="w-3.5 h-3.5 text-[#4338CA]" />
        </div>
        <span className="text-xs text-[#4338CA] font-medium truncate">{message}</span>
      </div>
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#4338CA] border border-indigo-100 shrink-0 shadow-sm">
        <Sparkles className="w-3 h-3" />
        Demo
      </span>
    </div>
  );
};
