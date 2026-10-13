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
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/70 to-indigo-50/50 backdrop-blur-md border border-white/80 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl btn-primary text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {analysis.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-[#172554]">{analysis.candidateName}</p>
            <p className="text-xs text-[#4338CA] font-medium">{analysis.experienceLevel}</p>
          </div>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Matched Skills */}
        <div className="p-4 rounded-2xl glass-panel border border-white/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#172554]">
              Matched Skills
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 border border-teal-200/80 backdrop-blur-sm">
              {analysis.matchedSkills.length} verified
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {analysis.matchedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold"
              >
                <Check className="w-2.5 h-2.5 text-teal-600" strokeWidth={3} />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skills to Develop */}
        <div className="p-4 rounded-2xl glass-panel border border-white/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#172554]">
              Skills to Develop
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-200/80 backdrop-blur-sm">
              {analysis.missingSkills.length} gaps
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {analysis.missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Roles */}
      <div className="p-4 rounded-2xl glass-panel border border-white/80 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-4 h-4 text-[#4338CA]" />
          <h3 className="text-xs font-bold text-[#172554]">Recommended Roles</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.recommendedRoles.map((role, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-[#4338CA] border border-indigo-100 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-default"
            >
              <span>{role}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
