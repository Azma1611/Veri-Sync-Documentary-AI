import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { platformDomains } from '../data/domainData';
import type { WorkflowDefinition } from '../data/domainData';

export const VerifyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('employment-hr');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('employment-verification');

  const selectedDomain = platformDomains.find((d) => d.id === selectedDomainId) || platformDomains[0];

  const handleStartWorkflow = (workflow: WorkflowDefinition) => {
    if (workflow.status === 'active' && workflow.path) {
      navigate(workflow.path);
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-6xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Multi-Domain Verification Engine: Select an enterprise domain to load domain-specific document types, completeness rules, and clause-matching heuristics." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4338CA] border border-indigo-100 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Configurable Verification Hub
          </div>
          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            Verify Documents
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Choose a target domain and verification workflow to begin document completeness and consistency checks.
          </p>
        </div>
      </div>

      {/* Step 1: Select Domain */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full btn-primary text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-[#172554]">Select Document Domain</h2>
          </div>
          <span className="text-xs text-[#64748B]">
            6 Domains Available & Planned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {platformDomains.map((domain) => {
            const Icon = domain.icon;
            const isSelected = selectedDomainId === domain.id;
            const isActive = domain.status === 'active';

            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomainId(domain.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'glass-card border-indigo-400 ring-2 ring-indigo-100 shadow-md bg-white/90'
                    : 'glass-card border-white/80 hover:border-indigo-200 hover:bg-white/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'btn-primary text-white shadow-sm'
                          : isActive
                          ? 'bg-indigo-50 text-[#4338CA]'
                          : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Coming soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#172554]">{domain.name}</h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E4E8F2]/70 flex items-center justify-between text-[11px]">
                  <span className="text-[#94A3B8]">
                    {domain.workflows.length} workflow{domain.workflows.length > 1 ? 's' : ''}
                  </span>
                  {isSelected && (
                    <span className="font-bold text-[#4338CA]">Selected</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Verification Workflow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full btn-primary text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm font-bold text-[#172554]">
              Choose Verification Workflow for {selectedDomain.name}
            </h2>
          </div>
          {selectedDomain.status === 'active' && (
            <span className="text-xs font-semibold text-teal-700">
              Workflows operational
            </span>
          )}
        </div>

        {selectedDomain.status === 'active' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDomain.workflows.map((workflow) => {
              const Icon = workflow.icon;
              const isSelected = selectedWorkflowId === workflow.id;

              return (
                <div
                  key={workflow.id}
                  onClick={() => setSelectedWorkflowId(workflow.id)}
                  className={`glass-panel rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-400 ring-2 ring-indigo-200/60 shadow-lg bg-white/90'
                      : 'border-white/80 hover:border-indigo-200 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center text-white shadow-md">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-200/80 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Ready to Launch
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#172554] tracking-tight">
                      {workflow.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#4338CA] mt-0.5">
                      {workflow.tagline}
                    </p>
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                      {workflow.description}
                    </p>

                    {/* Supported document types */}
                    <div className="mt-4 pt-3 border-t border-white/60">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1.5">
                        Supported Document Types
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {workflow.documentTypes.map((dt, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/60 text-[#172554] border border-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key verification checks */}
                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1.5">
                        Key Verification Checks
                      </span>
                      <ul className="space-y-1">
                        {workflow.keyChecks.map((kc, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-[#64748B] flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA]" />
                            <span>{kc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B] font-medium">Evidence-supported output</span>
                    <button
                      type="button"
                      onClick={() => handleStartWorkflow(workflow)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
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
          <div className="glass-panel rounded-2xl border border-white/80 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/70 border border-white text-[#64748B] flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-[#172554]">
              {selectedDomain.name} Workflows Are In Development
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
              We are finalizing the parser rules and compliance matrices for {selectedDomain.name}. Workflows for this category will be unlocked in upcoming releases.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedDomainId('employment-hr')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/90 text-[#4338CA] text-xs font-bold border border-indigo-200/60 shadow-sm transition-all"
              >
                <span>Switch to Active Employment & HR Domain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
