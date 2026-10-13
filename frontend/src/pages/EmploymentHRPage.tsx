import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  TrendingUp,
  ArrowRight,
  Users,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { NoticeBanner } from '../components/common/NoticeBanner';

export const EmploymentHRPage: React.FC = () => {

  return (
    <div className="space-y-6 page-enter max-w-6xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Employment & HR Domain: Select between contractual cross-document verification or candidate resume qualification fit. Both workflows operate within the Employment & HR domain." />

      {/* Breadcrumb & Domain Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2 font-medium">
          <Link to="/verify" className="hover:text-[#4338CA] transition-colors">
            Domains
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-bold text-[#172554]">Employment & HR</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl btn-primary text-white flex items-center justify-center shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
                  Employment & HR
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  Active Domain
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Two specialized verification workflows for talent acquisition, contract compliance, and role fit
              </p>
            </div>
          </div>

          <Link
            to="/verify"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card border-white/80 hover:bg-white/90 text-xs font-semibold text-[#172554] shadow-sm transition-all self-start sm:self-auto"
          >
            <span>Change Domain</span>
          </Link>
        </div>
      </div>

      {/* The Two Domain Workflows: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workflow A: Employment Document Verification */}
        <div className="glass-panel rounded-2xl border border-white/80 hover:border-indigo-300/80 shadow-lg p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl btn-primary flex items-center justify-center text-white shadow-md">
                <FileCheck className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-[#4338CA] border border-indigo-200/80 backdrop-blur-sm">
                Workflow A
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-[#172554] tracking-tight group-hover:text-[#4338CA] transition-colors">
              Employment Document Verification
            </h2>
            <p className="text-xs font-semibold text-[#4338CA] mt-0.5">
              Cross-Document Clause Reconciliation & Compliance Audit
            </p>
            <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
              Upload offer letters, employment contracts, job descriptions, and HR policies. Cross-checks contractual terms, detects potential discrepancies (base pay, probation, notice period), checks document completeness, and links findings directly to source clauses.
            </p>

            {/* What's Checked */}
            <div className="mt-5 space-y-2 pt-4 border-t border-white/60">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                Verification Capabilities:
              </span>
              <ul className="space-y-1.5 text-xs text-[#172033]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA] mt-1.5 shrink-0" />
                  <span><strong>Required-Field & Completeness:</strong> Validates salary terms, probation, and notice clauses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA] mt-1.5 shrink-0" />
                  <span><strong>Cross-Document Comparison:</strong> Aligns offer letter clauses against standard contract text</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA] mt-1.5 shrink-0" />
                  <span><strong>Evidence-Linked Inspection:</strong> Exact quoted excerpts with page numbers & side-by-side view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA] mt-1.5 shrink-0" />
                  <span><strong>Human Review Workflow:</strong> Flag, confirm, or add auditor remarks with report export</span>
                </li>
              </ul>
            </div>

            {/* Target Document Types */}
            <div className="mt-4 pt-3 border-t border-white/60">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1.5">
                Expected Documents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Offer Letters', 'Employment Contracts', 'Job Descriptions', 'HR Policies'].map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/60 text-[#172554] border border-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between">
            <span className="text-[11px] text-[#94A3B8] font-medium">Includes demo sample package</span>
            <Link
              to="/verify/employment/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Launch Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Workflow B: Resume & Career Fit */}
        <div className="glass-panel rounded-2xl border border-white/80 hover:border-violet-300/80 shadow-lg p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-[#8B5CF6] border border-violet-200/80 backdrop-blur-sm">
                Workflow B
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-[#172554] tracking-tight group-hover:text-[#8B5CF6] transition-colors">
              Resume & Career Fit
            </h2>
            <p className="text-xs font-semibold text-[#8B5CF6] mt-0.5">
              Candidate Credential & Role Specification Evaluation
            </p>
            <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed">
              Upload candidate resumes and compare them directly against provided job descriptions. Evaluates skill alignment, identifies missing technical competencies, calculates role fit scores, and provides career grade recommendations.
            </p>

            {/* What's Checked */}
            <div className="mt-5 space-y-2 pt-4 border-t border-white/60">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                Verification Capabilities:
              </span>
              <ul className="space-y-1.5 text-xs text-[#172033]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                  <span><strong>Skills Extraction:</strong> Automatically isolates technical frameworks, languages, and tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                  <span><strong>Skill Gap Analysis:</strong> Distinguishes verified proficiencies from missing requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                  <span><strong>Fit Score Gauge:</strong> Evidence-grounded match percentage with assessment breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                  <span><strong>Role Recommendations:</strong> Suggests adjacent job categories based on extracted skill profiles</span>
                </li>
              </ul>
            </div>

            {/* Target Document Types */}
            <div className="mt-4 pt-3 border-t border-white/60">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1.5">
                Expected Documents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Candidate Resumes (PDF)', 'Target Job Description', 'Competency Matrices'].map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/60 text-[#172554] border border-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between">
            <span className="text-[11px] text-[#94A3B8] font-medium">Supports PDF / DOCX resume parsing</span>
            <Link
              to="/verify/employment/resume"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
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
