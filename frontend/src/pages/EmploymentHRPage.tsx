import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  TrendingUp,
  ArrowRight,
  Users,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { NoticeBanner } from '../components/common/NoticeBanner';

export const EmploymentHRPage: React.FC = () => {
  return (
    <div className="space-y-6 page-enter max-w-6xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Employment & HR Domain: Select between contractual cross-document verification or candidate resume qualification fit. Both workflows operate within the Employment & HR domain." />

      {/* Breadcrumb & Domain Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2 font-medium">
          <Link to="/verify" className="hover:text-[#62D8FF] transition-colors">
            Domains
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="font-bold text-white">Employment & HR</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl btn-primary text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Employment & HR
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  Active Domain
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 max-w-xl leading-relaxed">
                Specialized workflows for cross-referencing employment contracts, validating compensation terms, and benchmarking candidate qualifications.
              </p>
            </div>
          </div>

          <Link
            to="/verify"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all self-start sm:self-auto z-10"
          >
            <span>Change Domain</span>
          </Link>

          <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#438AFF]/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* The Two Domain Workflows: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workflow A: Employment Document Verification */}
        <div className="glass-panel rounded-2xl border border-white/10 hover:border-[#438AFF]/40 shadow-xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_10px_35px_rgba(67,138,255,0.2)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#438AFF]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl btn-primary flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <FileCheck className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30">
                Workflow A
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-white tracking-tight group-hover:text-[#62D8FF] transition-colors">
              Employment Document Verification
            </h2>
            <p className="text-xs font-semibold text-[#62D8FF] mt-0.5">
              Cross-Document Clause Reconciliation & Compliance Audit
            </p>
            <p className="text-xs text-[#CBD5E1] mt-2.5 leading-relaxed">
              Upload offer letters, employment contracts, and policies. Cross-checks contractual terms, flags compensation mismatches, notice period differences, and missing mandatory attachments.
            </p>

            {/* Verification Capabilities */}
            <div className="mt-5 space-y-2 pt-4 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                Verification Capabilities:
              </span>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62D8FF] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Required-Field Completeness:</strong> Validates salary intervals, probation, and notice clauses</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62D8FF] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Cross-Document Comparison:</strong> Aligns offer letter clauses against standard contract text</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62D8FF] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Evidence-Linked Citations:</strong> Exact quoted excerpts with page numbers & side-by-side view</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#62D8FF] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Human Review Workflow:</strong> Flag, confirm, or accept variances with report export</span>
                </li>
              </ul>
            </div>

            {/* Target Document Types */}
            <div className="mt-4 pt-3.5 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-2">
                Expected Documents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Offer Letters', 'Employment Contracts', 'Job Descriptions', 'HR Policies'].map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.05] text-[#CBD5E1] border border-white/10"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#62D8FF]" /> Demo package included
            </span>
            <Link
              to="/verify/employment/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <span>Launch Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Workflow B: Resume & Career Fit */}
        <div className="glass-panel rounded-2xl border border-white/10 hover:border-violet-400/40 shadow-xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_10px_35px_rgba(139,92,246,0.2)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30">
                Workflow B
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-white tracking-tight group-hover:text-violet-300 transition-colors">
              Resume & Career Fit
            </h2>
            <p className="text-xs font-semibold text-violet-300 mt-0.5">
              Candidate Credential & Role Specification Evaluation
            </p>
            <p className="text-xs text-[#CBD5E1] mt-2.5 leading-relaxed">
              Upload candidate resumes and compare them directly against specific role descriptions. Evaluates verified competencies, isolates skill gaps, and calculates qualification alignment.
            </p>

            {/* Verification Capabilities */}
            <div className="mt-5 space-y-2 pt-4 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                Verification Capabilities:
              </span>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <span><strong className="text-white">Skills Extraction:</strong> Isolates technical frameworks, languages, and methodologies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <span><strong className="text-white">Skill Gap Analysis:</strong> Distinguishes verified proficiencies from missing requirements</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <span><strong className="text-white">Fit Score Gauge:</strong> Deterministic match percentage with competency breakdown</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <span><strong className="text-white">Role Recommendations:</strong> Suggests adjacent benchmark career paths</span>
                </li>
              </ul>
            </div>

            {/* Target Document Types */}
            <div className="mt-4 pt-3.5 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-2">
                Expected Documents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Candidate Resumes (PDF)', 'Target Job Description', 'Competency Matrices'].map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.05] text-[#CBD5E1] border border-white/10"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" /> PDF / DOCX support
            </span>
            <Link
              to="/verify/employment/resume"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
            >
              <span>Launch Fit Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
