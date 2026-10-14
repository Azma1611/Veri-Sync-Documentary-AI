import React from 'react';
import { Check, ArrowUpRight, Briefcase } from 'lucide-react';
import type { ResumeAnalysisResult } from '../../types';

interface ResumeSkillsViewProps {
  analysis: ResumeAnalysisResult;
}

export const ResumeSkillsView: React.FC<ResumeSkillsViewProps> = ({ analysis }) => {
  return (
    <div className="space-y-4">
      {/* Candidate Summary Card */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="w-11 h-11 rounded-xl btn-primary text-white font-extrabold flex items-center justify-center text-sm shadow-lg shadow-indigo-500/25">
            {analysis.candidateName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight">{analysis.candidateName}</p>
            <p className="text-xs text-[#62D8FF] font-semibold">{analysis.experienceLevel}</p>
          </div>
        </div>
        <p className="text-xs text-[#CBD5E1] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="p-5 rounded-2xl glass-card border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Matched Core Skills
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
              {analysis.matchedSkills.length} Verified
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.matchedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/40 text-teal-200 border border-teal-500/30 text-xs font-semibold shadow-sm"
              >
                <Check className="w-3 h-3 text-teal-400" strokeWidth={2.5} />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skills to Develop */}
        <div className="p-5 rounded-2xl glass-card border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Identified Skill Gaps
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {analysis.missingSkills.length} Areas
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 text-amber-200 border border-amber-500/30 text-xs font-semibold shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Roles */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-3.5">
          <Briefcase className="w-4 h-4 text-[#62D8FF]" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Target Role Alignment (Benchmark Recommendations)
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {analysis.recommendedRoles.map((role, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] text-white border border-white/10 text-xs font-bold hover:border-[#438AFF]/50 hover:bg-[#438AFF]/15 transition-all cursor-default"
            >
              <span>{role}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#62D8FF]" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
