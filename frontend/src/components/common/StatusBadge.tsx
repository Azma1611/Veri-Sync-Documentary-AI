import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Info, ShieldCheck } from 'lucide-react';
import type { InconsistencySeverity } from '../../types';

interface StatusBadgeProps {
  status?: string;
  severity?: InconsistencySeverity;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  severity,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-[11px] gap-1.5';

  if (severity) {
    switch (severity) {
      case 'high':
        return (
          <span
            className={`inline-flex items-center rounded-full font-bold bg-red-950/60 text-red-300 border border-red-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
          >
            <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span
            className={`inline-flex items-center rounded-full font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            Needs Review
          </span>
        );
      case 'low':
        return (
          <span
            className={`inline-flex items-center rounded-full font-bold bg-teal-950/60 text-teal-300 border border-teal-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
          >
            <Info className="w-3 h-3 text-teal-400 shrink-0" />
            Minor Note
          </span>
        );
    }
  }

  switch (status) {
    case 'Inconsistencies Found':
    case 'inconsistencies_detected':
    case 'discrepancies_detected':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
          Review Required
        </span>
      );
    case 'Verified':
    case 'verified_clean':
    case 'Clean Verification':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-teal-950/60 text-teal-300 border border-teal-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
          Verified Clean
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-indigo-950/60 text-[#62D8FF] border border-indigo-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
        >
          <ShieldCheck className="w-3 h-3 text-[#62D8FF] shrink-0" />
          Completed
        </span>
      );
    case 'Pending Review':
    case 'manual_review_required':
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-violet-950/60 text-violet-300 border border-violet-500/40 backdrop-blur-md shadow-sm ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-violet-400 shrink-0" />
          Pending Review
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-semibold bg-white/10 text-[#CBD5E1] border border-white/15 backdrop-blur-md ${sizeClasses}`}
        >
          {status || 'Unknown'}
        </span>
      );
  }
};
