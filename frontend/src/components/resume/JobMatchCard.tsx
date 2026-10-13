import React from 'react';
import { MapPin, Building2, TrendingUp } from 'lucide-react';
import type { JobMatchItem } from '../../types';

interface JobMatchCardProps {
  job: JobMatchItem;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({ job }) => {
  const scoreColor =
    job.matchScore >= 80
      ? 'bg-teal-50 text-teal-700 border-teal-200'
      : job.matchScore >= 60
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="glass-card rounded-2xl border border-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-[#172554] truncate">{job.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3 h-3 text-[#94A3B8] shrink-0" />
            <p className="text-[11px] text-[#64748B] font-medium truncate">
              {job.company} · {job.department}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${scoreColor}`}>
          <TrendingUp className="w-3 h-3" />
          {job.matchScore}%
        </span>
      </div>

      <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed mb-3">
        {job.description}
      </p>

      <div className="flex items-center justify-between pt-2.5 border-t border-white/60">
        <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <MapPin className="w-3 h-3 text-[#94A3B8]" />
          {job.location}
        </span>
        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Demo data</span>
      </div>
    </div>
  );
};
