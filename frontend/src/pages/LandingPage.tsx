import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Star,
  Layers,
} from 'lucide-react';
import { platformDomains } from '../data/domainData';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FF] flex flex-col text-[#172033] relative overflow-hidden">
      {/* Background Ambient Glowing Refraction Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-400/20 via-violet-400/20 to-transparent blur-3xl transform-gpu" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-blue-400/20 via-sky-300/15 to-transparent blur-3xl transform-gpu" />
        <div className="absolute bottom-20 left-1/4 w-88 h-88 rounded-full bg-gradient-to-tr from-teal-400/15 via-emerald-300/10 to-transparent blur-3xl transform-gpu" />
      </div>

      {/* Top Navigation */}
      <header className="h-16 glass-topbar border-b border-white/60 sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-[#172554] tracking-tight">VeriSync</span>
            <span className="text-[10px] font-semibold text-[#4338CA] leading-tight">AI Platform</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#domains" className="text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors">
            Supported Domains
          </a>
          <a href="#workflow" className="text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors">
            7-Step Verification Flow
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex text-xs font-semibold text-[#4338CA] hover:text-[#172554] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
          >
            <span>Start Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <div className="hero-gradient">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgpdi0yaC00djIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
          <div className="relative max-w-5xl mx-auto px-6 sm:px-12 pt-20 pb-16 text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white/90 text-xs font-semibold mb-8 backdrop-blur-md shadow-inner">
              <Layers className="w-3.5 h-3.5 text-blue-200" />
              Multi-Domain Document Verification Platform
              <Star className="w-3 h-3 text-yellow-300" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-[1.1] mb-6">
              Evidence-First Document Verification Across{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-violet-300">
                Enterprise Domains
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
              Verify completeness, detect contractual inconsistencies, and cross-reference information across multi-document packages with source-grounded evidence and human-in-the-loop review.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                to="/verify"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#4338CA] text-sm font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Launch Verification Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#domains"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/15 text-white text-sm font-semibold border border-white/30 hover:bg-white/25 transition-all backdrop-blur-md shadow-sm"
              >
                Explore Supported Domains
              </a>
            </div>

            {/* Verification Preview Card */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-b from-white/10 to-transparent rounded-3xl" />
              <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl border border-white/30 p-1.5 shadow-2xl">
                <div className="glass-panel-elevated rounded-xl overflow-hidden text-left p-5 text-xs text-[#172033]">
                  {/* Browser-like header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/60">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-teal-400" />
                      <span className="ml-2 font-mono text-[10px] text-[#64748B]">
                        verisync://workspace/employment-hr/verification-matrix
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-200/80 backdrop-blur-sm">
                      Discrepancies Flagged (Requires Auditor Review)
                    </span>
                  </div>

                  {/* Sample matrix snippet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/70 border border-white/80 shadow-sm">
                      <span className="text-[10px] font-bold text-[#4338CA] uppercase block">
                        Source A: Offer Letter Signed (p.2, Clause 3.1)
                      </span>
                      <p className="font-mono text-xs text-[#172554] mt-1">
                        "Gross Remuneration: ₹30,000 / month (payable on the last working day)"
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 shadow-sm">
                      <span className="text-[10px] font-bold text-red-600 uppercase block">
                        Source B: Employment Contract (p.5, Annex A)
                      </span>
                      <p className="font-mono text-xs text-red-700 font-bold mt-1">
                        "Basic & Allowances Total: ₹25,000 / month gross"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Supported & Planned Domains Section */}
      <section id="domains" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50/80 text-[#4338CA] border border-indigo-200/60 backdrop-blur-sm mb-3">
            Domain Architecture
          </div>
          <h2 className="text-3xl font-extrabold text-[#172554] tracking-tight">
            One Engine. Six Specialized Domains.
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            VeriSync AI adapts extraction taxonomies and inconsistency heuristics to domain-specific compliance standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformDomains.map((domain) => {
            const Icon = domain.icon;
            const isActive = domain.status === 'active';

            return (
              <div
                key={domain.id}
                className={`glass-card rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-white/90 shadow-md ring-1 ring-indigo-100 hover:shadow-xl'
                    : 'border-white/60 opacity-85 hover:bg-white/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'btn-primary text-white shadow-sm' : 'bg-white/70 text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50/80 px-2.5 py-0.5 rounded-full border border-teal-200/80 backdrop-blur-sm">
                        Active in Workspace
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-white/70 px-2.5 py-0.5 rounded-full border border-white/80">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#172554]">{domain.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-white/60">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">
                      Target Documents:
                    </span>
                    <p className="text-[11px] text-[#172554] font-medium">
                      {domain.supportedDocsSample.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#94A3B8] font-medium">
                    {domain.workflows.length} workflow spec{domain.workflows.length > 1 ? 's' : ''}
                  </span>
                  {isActive ? (
                    <Link
                      to="/verify/employment"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#4338CA] hover:text-[#172554]"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Planned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7-Step Main Product Experience */}
      <section id="workflow" className="py-20 px-6 sm:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50/80 text-teal-700 border border-teal-200/80 backdrop-blur-sm mb-3">
              Standardized Execution Pipeline
            </div>
            <h2 className="text-3xl font-extrabold text-[#172554] tracking-tight">
              The 7-Step Verification Experience
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Every workflow adheres to an evidence-grounded verification procedure designed for precision and human accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '01', title: 'Select Domain', desc: 'Choose target enterprise category (Employment, Education, Banking, Legal, etc.)' },
              { num: '02', title: 'Choose Workflow', desc: 'Activate specialized validation rules (e.g. Contract Cross-Check or Resume Fit)' },
              { num: '03', title: 'Upload Documents', desc: 'Submit relevant PDF/DOCX multi-document packages or single credentials' },
              { num: '04', title: 'Completeness Audit', desc: 'System checks required clauses, missing annexures, and mandatory parameters' },
              { num: '05', title: 'Cross-Compare Info', desc: 'Detect variances across compensation, tenure, terms, and specifications' },
              { num: '06', title: 'Inspect Grounded Evidence', desc: 'Examine exact cited quotes, page numbers, and side-by-side comparison boxes' },
            ].map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl glass-card border border-white/80 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-2xl font-black text-[#4338CA]/30 font-mono block mb-2">{step.num}</span>
                  <h3 className="text-sm font-bold text-[#172554]">{step.title}</h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
            <div className="p-5 rounded-2xl glass-panel bg-gradient-to-br from-white/70 to-indigo-50/40 border border-indigo-200/80 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-2xl font-black text-[#4338CA] font-mono block mb-1">07</span>
                <h3 className="text-sm font-bold text-[#172554]">Review Findings & Export Audit Report</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Auditor makes formal determinations (Confirm, Flag, Accept) and exports evidence-linked Markdown or JSON reports.
                </p>
              </div>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white text-xs font-bold shadow-md hover:shadow-lg shrink-0 self-start sm:self-auto transition-all"
              >
                <span>Try Verification Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 sm:px-12 glass-panel border-t border-white/60 text-xs text-[#64748B] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md btn-primary flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#172554]">VeriSync AI</span>
            <span>— Multi-Domain Document Verification Platform</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Evidence-grounded audits for enterprise compliance. Built with React & TypeScript.
          </p>
        </div>
      </footer>
    </div>
  );
};
