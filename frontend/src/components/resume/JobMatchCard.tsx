import React from 'react';
import { MapPin, Building2, TrendingUp, Sparkles } from 'lucide-react';
import type { JobMatchItem } from '../../types';

interface JobMatchCardProps {
  job: JobMatchItem;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({ job }) => {
  const scoreColor =
    job.matchScore >= 80
      ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
      : job.matchScore >= 60
      ? 'bg-[#438AFF]/20 text-[#62D8FF] border-[#438AFF]/30'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-white truncate tracking-tight">{job.title}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <p className="text-xs text-[#CBD5E1] font-medium truncate">
                {job.company} · {job.department}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shrink-0 ${scoreColor}`}
          >
            <TrendingUp className="w-3 h-3" />
            {job.matchScore}% Fit
          </span>
        </div>

        <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
          {job.description}
        </p>

        {/* Skills preview */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.matchedSkills.slice(0, 3).map((sk, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-950/30 text-teal-300 border border-teal-500/20"
            >
              {sk}
            </span>
          ))}
          {job.missingSkills.slice(0, 1).map((sk, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-950/30 text-amber-300 border border-amber-500/20"
            >
              Δ {sk}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
        <span className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
          <MapPin className="w-3.5 h-3.5 text-[#62D8FF]" />
          {job.location}
        </span>
        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#62D8FF]" />
          Benchmark Listing
        </span>
      </div>
    </div>
  );
};
