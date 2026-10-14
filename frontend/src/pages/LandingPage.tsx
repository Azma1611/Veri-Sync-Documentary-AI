import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  FileSearch,
  Users,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { platformDomains } from '../data/domainData';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080D20] flex flex-col text-slate-100 relative overflow-hidden">
      {/* Layered Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-transparent blur-[120px] transform-gpu" />
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent blur-[140px] transform-gpu" />
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-teal-500/15 via-indigo-600/10 to-transparent blur-[130px] transform-gpu" />
      </div>

      {/* Top Navigation */}
      <header className="h-16 glass-topbar border-b border-white/10 sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              VeriSync <span className="text-xs px-1.5 py-0.2 rounded bg-indigo-500/20 text-cyan-300 font-mono">AI</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400">Multi-Domain Verification</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#domains" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Supported Domains
          </a>
          <a href="#workflow" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            7-Step Pipeline
          </a>
          <a href="#demo-scenarios" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Demo Scenarios
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors"
          >
            Auditor Overview
          </Link>
          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
          >
            <span>Launch Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10 pt-16 sm:pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-cyan-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-inner">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation Multi-Domain Document AI</span>
            <Sparkles className="w-3 h-3 text-violet-400" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.12] mb-6">
            Evidence-First Verification Across{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300">
              Enterprise Documents
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Cross-reference multi-document packages, flag contractual inconsistencies, check required clauses, and ground every audit determination with exact source citations and human-in-the-loop oversight.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              to="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl btn-primary text-white text-sm font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all"
            >
              <FileSearch className="w-4 h-4 text-cyan-300" />
              <span>Start Document Verification</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 text-slate-200 text-sm font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
            >
              <span>View Auditor Dashboard</span>
            </Link>
          </div>

          {/* Verification Preview Card */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-cyan-500/20 to-violet-500/30 rounded-3xl blur-xl opacity-60" />
            <div className="relative glass-panel rounded-2xl border border-white/15 p-2 shadow-2xl">
              <div className="glass-panel-elevated rounded-xl overflow-hidden text-left p-5 text-xs text-slate-200 border border-white/10">
                {/* Simulated workspace header */}
                <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-teal-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      verisync://audit/employment-hr/contract-comparison
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                    Variance Detected (Requires Auditor Determination)
                  </span>
                </div>

                {/* Side-by-side evidence snippet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#080D20]/70 border border-indigo-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Document A • Offer Letter (Signed)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Page 2, Clause 3.1</span>
                    </div>
                    <p className="font-mono text-xs text-slate-100 bg-white/5 p-2 rounded-lg border border-white/5">
                      "Gross Remuneration: ₹30,000 / month (payable on the last working day of calendar month)"
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        Document B • Employment Contract
                      </span>
                      <span className="text-[10px] font-mono text-red-300/70">Page 5, Annexure A</span>
                    </div>
                    <p className="font-mono text-xs text-red-200 font-semibold bg-red-900/30 p-2 rounded-lg border border-red-500/20">
                      "Basic & Allowances Total: ₹25,000 / month gross"
                    </p>
                  </div>
                </div>

                {/* Footer status inside card */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Completeness: 5/5 Required Clauses Present
                  </span>
                  <span className="text-indigo-300 font-medium">Auditor Action: Confirm Mismatch | Flag for Legal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Supported & Planned Domains Section */}
      <section id="domains" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-cyan-300 border border-indigo-400/30 backdrop-blur-sm mb-3">
            Domain Architecture
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            One Core Engine. Six Specialized Domains.
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            VeriSync AI configures extraction taxonomies, required completeness fields, and cross-document comparison heuristics per enterprise vertical.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformDomains.map((domain) => {
            const Icon = domain.icon;
            const isActive = domain.status === 'active';

            return (
              <div
                key={domain.id}
                className={`glass-card rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-500/40 bg-gradient-to-b from-[#111735]/80 to-[#080D20]/80 shadow-lg shadow-indigo-950/50 hover:border-cyan-400/50 hover:scale-[1.01]'
                    : 'border-white/10 opacity-70 hover:opacity-90 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-400/30">
                        Operational Demo
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                        Prototype Roadmap
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{domain.name}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Target Documents:
                    </span>
                    <p className="text-[11px] text-slate-200 font-medium">
                      {domain.supportedDocsSample.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {domain.workflows.length} workflow spec{domain.workflows.length > 1 ? 's' : ''}
                  </span>
                  {isActive ? (
                    <Link
                      to={domain.id === 'employment-hr' ? '/verify/employment' : `/verify/document-verification?domain=${domain.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
                    >
                      <span>Launch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Roadmap</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Scenarios Section */}
      <section id="demo-scenarios" className="py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full relative z-10">
        <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                Hackathon Live Demonstrations
              </span>
              <h3 className="text-xl font-bold text-white">Pre-Loaded Fictional Demo Packs</h3>
              <p className="text-xs text-slate-300 mt-1">
                Both functional demo domains come with one-click realistic test files designed for live judging walkthroughs.
              </p>
            </div>
            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-xs font-bold text-white shadow-md shrink-0"
            >
              <span>Test in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scenario 1 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Employment & HR: Salary Variance</h4>
                </div>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Demonstrates offer letter vs. employment contract comparison. Automatically flags a ₹5,000 monthly compensation mismatch with source clause citations.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-cyan-300 font-mono">Offer Letter</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-cyan-300 font-mono">Employment Contract</span>
                </div>
              </div>
              <Link
                to="/verify/employment/documents"
                className="mt-4 text-xs font-semibold text-cyan-300 hover:text-white inline-flex items-center gap-1"
              >
                <span>Open HR Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Scenario 2 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HeartHandshake className="w-4 h-4 text-teal-400" />
                  <h4 className="text-sm font-bold text-white">Healthcare Admin: Billing & Dates</h4>
                </div>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Demonstrates hospital invoice vs. insurance claim comparison. Detects billing amount variance ($14,250 vs $12,800) and discharge date discrepancy.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Hospital Invoice</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Insurance Claim</span>
                </div>
              </div>
              <Link
                to="/verify/document-verification?domain=healthcare-admin"
                className="mt-4 text-xs font-semibold text-teal-300 hover:text-white inline-flex items-center gap-1"
              >
                <span>Open Healthcare Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Step Main Product Experience */}
      <section id="workflow" className="py-20 px-6 sm:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-400/30 backdrop-blur-sm mb-3">
              Standardized Execution Pipeline
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              The 7-Step Verification Workflow
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Every verification adheres to a rigorous, grounded pipeline ensuring human auditability and zero fabricated evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'Select Domain', desc: 'Choose target enterprise category (Employment, Healthcare, Banking, Legal, etc.)' },
              { num: '02', title: 'Choose Workflow', desc: 'Activate specialized validation rules (e.g. Contract Comparison or Patient Registration)' },
              { num: '03', title: 'Upload Documents', desc: 'Upload PDF, DOCX, TXT, or scan image files with strict size and MIME validation' },
              { num: '04', title: 'Completeness Audit', desc: 'System checks mandatory parameters, required signatures, and missing annexures' },
              { num: '05', title: 'Cross-Compare Fields', desc: 'Detect variances across compensation, dates, identifiers, and terms' },
              { num: '06', title: 'Inspect Grounded Evidence', desc: 'Examine exact cited quotes, page numbers, and side-by-side comparison boxes' },
            ].map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                <div>
                  <span className="text-2xl font-black text-indigo-400/40 font-mono block mb-2">{step.num}</span>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
            <div className="p-5 rounded-2xl glass-panel bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-2xl font-black text-cyan-400 font-mono block mb-1">07</span>
                <h3 className="text-sm font-bold text-white">Review Findings & Export Audit Report</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Auditor makes formal determinations (Confirm Mismatch, Flag for Legal, Accept Variance) and exports evidence-linked Markdown, JSON, or printable reports.
                </p>
              </div>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white text-xs font-bold shadow-md hover:shadow-indigo-500/50 shrink-0 self-start sm:self-auto transition-all"
              >
                <span>Launch Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 sm:px-12 glass-panel border-t border-white/10 text-xs text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">VeriSync AI</span>
            <span>— Multi-Domain Document Verification Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              Human-in-the-Loop Oversight
            </span>
            <span>College Hackathon 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

