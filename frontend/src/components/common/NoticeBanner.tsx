import React from 'react';
import { Info, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NoticeBannerProps {
  title?: string;
  message: string;
  variant?: 'demo' | 'warning' | 'info' | 'success';
  className?: string;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  message,
  variant = 'info',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          wrapper: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
          iconBg: 'bg-amber-500/20 text-amber-300',
          badge: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
          badgeText: 'Review Required',
        };
      case 'success':
        return {
          wrapper: 'bg-teal-950/40 border-teal-500/30 text-teal-200',
          iconBg: 'bg-teal-500/20 text-teal-300',
          badge: 'bg-teal-500/20 border-teal-400/30 text-teal-300',
          badgeText: 'Verified',
        };
      case 'demo':
        return {
          wrapper: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
          iconBg: 'bg-indigo-500/20 text-[#62D8FF]',
          badge: 'bg-indigo-500/20 border-indigo-400/30 text-[#62D8FF]',
          badgeText: 'Demo Mode',
        };
      default:
        return {
          wrapper: 'bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80 border-white/10 text-[#CBD5E1]',
          iconBg: 'bg-[#438AFF]/20 text-[#62D8FF]',
          badge: 'bg-[#4338CA]/30 border-indigo-500/30 text-[#62D8FF]',
          badgeText: 'Platform Notice',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg ${styles.wrapper} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${styles.iconBg}`}>
          {variant === 'warning' ? (
            <ShieldAlert className="w-3.5 h-3.5" />
          ) : variant === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Info className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="text-xs font-medium leading-relaxed">{message}</span>
      </div>
      <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border shrink-0 ${styles.badge}`}>
        <Sparkles className="w-3 h-3" />
        {styles.badgeText}
      </span>
    </div>
  );
};
