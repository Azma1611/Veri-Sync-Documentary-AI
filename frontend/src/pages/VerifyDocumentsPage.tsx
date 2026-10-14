import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { platformDomains } from '../data/domainData';
import type { WorkflowDefinition } from '../data/domainData';

export const VerifyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('employment-hr');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('employment-verification');

  const selectedDomain =
    platformDomains.find((d) => d.id === selectedDomainId) || platformDomains[0];

  const handleStartWorkflow = (workflow: WorkflowDefinition) => {
    if (workflow.status === 'active' && workflow.path) {
      navigate(workflow.path);
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-6xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Multi-Domain Verification Engine: Select an enterprise domain to configure domain-specific document types, completeness rules, and clause-matching heuristics." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30 text-xs font-bold mb-2.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Configurable Verification Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verify Documents
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1.5 max-w-2xl leading-relaxed">
            Choose an enterprise domain and operational workflow to begin automated completeness audits, clause cross-referencing, and evidence extraction.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end text-xs text-[#94A3B8] font-mono z-10">
          <span className="text-[#62D8FF] font-bold">2 Primary Domains Active</span>
          <span>4 Domains on Roadmap</span>
        </div>

        <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#438AFF]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Step 1: Select Domain */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full btn-primary text-white text-xs font-extrabold flex items-center justify-center shadow-md">
              1
            </span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Step 1: Select Document Domain
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">
            6 Enterprise Domains
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {platformDomains.map((domain) => {
            const Icon = domain.icon;
            const isSelected = selectedDomainId === domain.id;
            const isActive = domain.status === 'active';

            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  setSelectedDomainId(domain.id);
                  if (domain.workflows.length > 0) {
                    setSelectedWorkflowId(domain.workflows[0].id);
                  }
                }}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between backdrop-blur-md relative ${
                  isSelected
                    ? 'bg-[#141C48] border-[#438AFF] shadow-[0_0_20px_rgba(67,138,255,0.3)] ring-1 ring-[#62D8FF]/50'
                    : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        isSelected
                          ? 'btn-primary text-white shadow-indigo-500/25'
                          : isActive
                          ? 'bg-[#438AFF]/20 text-[#62D8FF] border border-[#438AFF]/30'
                          : 'bg-white/10 text-[#94A3B8]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                        <CheckCircle2 className="w-3 h-3 text-teal-400" />
                        Operational
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#94A3B8] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                        <Clock className="w-3 h-3 text-[#94A3B8]" />
                        Roadmap
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">{domain.name}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-[#94A3B8]">
                    {domain.workflows.length} workflow{domain.workflows.length > 1 ? 's' : ''}
                  </span>
                  {isSelected && (
                    <span className="font-extrabold text-[#62D8FF] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Verification Workflow */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full btn-primary text-white text-xs font-extrabold flex items-center justify-center shadow-md">
              2
            </span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Step 2: Choose Verification Workflow for {selectedDomain.name}
            </h2>
          </div>
          {selectedDomain.status === 'active' && (
            <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Workflows Ready
            </span>
          )}
        </div>

        {selectedDomain.id === 'healthcare-admin' && (
          <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 flex items-start gap-2.5 text-xs text-teal-200">
            <HeartPulse className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Healthcare Administrative Compliance Notice:</strong> Workflows reconcile administrative fields across invoices, claims, discharge records, and patient forms (MRN, service dates, billing totals). This platform does not perform medical diagnoses, clinical evaluations, or treatment decisions.
            </span>
          </div>
        )}

        {selectedDomain.status === 'active' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDomain.workflows.map((workflow) => {
              const Icon = workflow.icon;
              const isSelected = selectedWorkflowId === workflow.id;

              return (
                <div
                  key={workflow.id}
                  onClick={() => setSelectedWorkflowId(workflow.id)}
                  className={`glass-panel rounded-2xl border p-6 flex flex-col justify-between transition-all cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? 'border-[#438AFF] ring-1 ring-[#62D8FF]/50 shadow-[0_10px_35px_rgba(67,138,255,0.25)] bg-[#141C48]'
                      : 'border-white/10 hover:border-white/25 hover:shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="w-11 h-11 rounded-xl btn-primary flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        Ready to Launch
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {workflow.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#62D8FF] mt-0.5">
                      {workflow.tagline}
                    </p>
                    <p className="text-xs text-[#CBD5E1] mt-2.5 leading-relaxed">
                      {workflow.description}
                    </p>

                    {/* Supported document types */}
                    <div className="mt-4 pt-3.5 border-t border-white/10">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-2">
                        Supported Document Types
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {workflow.documentTypes.map((dt, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.05] text-[#CBD5E1] border border-white/10"
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key verification checks */}
                    <div className="mt-3.5">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-2">
                        Key Verification Checks
                      </span>
                      <ul className="space-y-1.5">
                        {workflow.keyChecks.map((kc, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-[#94A3B8] flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#62D8FF] shrink-0" />
                            <span>{kc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#94A3B8] font-medium">Evidence-linked audit report</span>
                    <button
                      type="button"
                      onClick={() => handleStartWorkflow(workflow)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                    >
                      <span>Launch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#94A3B8] flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-7 h-7 text-[#94A3B8]" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              {selectedDomain.name} Specifications on Roadmap
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              Document parsers and compliance matrices for {selectedDomain.name} are currently staged for upcoming releases. For current hackathon demonstration, explore the operational <strong>Employment & HR</strong> or <strong>Healthcare Administration</strong> workflows.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedDomainId('employment-hr')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-lg"
              >
                <span>Switch to Employment & HR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomainId('healthcare-admin')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/30"
              >
                <span>Switch to Healthcare Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
