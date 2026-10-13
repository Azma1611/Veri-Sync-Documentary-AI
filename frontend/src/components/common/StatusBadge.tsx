import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';
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
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-[11px] gap-1.5';

  if (severity) {
    switch (severity) {
      case 'high':
        return (
          <span className={`inline-flex items-center rounded-full font-semibold bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
            <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            Needs Review
          </span>
        );
      case 'low':
        return (
          <span className={`inline-flex items-center rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
            <Info className="w-3 h-3 text-teal-600 shrink-0" />
            Minor Note
          </span>
        );
    }
  }

  switch (status) {
    case 'Inconsistencies Found':
    case 'discrepancies_detected':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          Needs Review
        </span>
      );
    case 'Verified':
    case 'verified_clean':
    case 'Clean Verification':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
          Verified Clean
        </span>
      );
    case 'Completed':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
          Completed
        </span>
      );
    case 'Pending Review':
    case 'manual_review_required':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-violet-50 text-violet-700 border border-violet-200 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-violet-600 shrink-0" />
          Pending Review
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          {status || 'Unknown'}
        </span>
      );
  }
};
