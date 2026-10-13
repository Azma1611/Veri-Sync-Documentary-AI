import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { platformDomains } from '../../data/domainData';
import type { DomainDefinition } from '../../data/domainData';

interface DomainExplorerProps {
  onSelectDomain?: (domain: DomainDefinition) => void;
  title?: string;
  subtitle?: string;
  showAllLink?: boolean;
}

export const DomainExplorer: React.FC<DomainExplorerProps> = ({
  onSelectDomain,
  title = 'Document Domains',
  subtitle = 'Select an enterprise domain to configure validation rules and verification workflows',
  showAllLink = true,
}) => {
  const navigate = useNavigate();

  const handleDomainClick = (domain: DomainDefinition) => {
    if (onSelectDomain) {
      onSelectDomain(domain);
      return;
    }

    if (domain.status === 'active') {
      navigate('/verify/employment');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-[#172554] tracking-tight">{title}</h2>
          <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
        </div>
        {showAllLink && (
          <button
            type="button"
            onClick={() => navigate('/verify')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:text-[#172554] transition-colors self-start sm:self-auto"
          >
            <span>Open Verification Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {platformDomains.map((domain) => {
          const Icon = domain.icon;
          const isActive = domain.status === 'active';

          return (
            <div
              key={domain.id}
              className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                isActive
                  ? 'glass-card border-white/90 hover:border-indigo-300 hover:shadow-xl cursor-pointer hover:-translate-y-1'
                  : 'bg-white/40 backdrop-blur-md border-white/60 opacity-85 hover:bg-white/60'
              }`}
              onClick={() => isActive && handleDomainClick(domain)}
            >
              {/* Header: Icon & Status Badge */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      isActive
                        ? 'btn-primary text-white shadow-indigo-100'
                        : 'bg-slate-100 text-[#64748B] border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 2} />
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      Active (2 Workflows)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-[#64748B] border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-[#172554] tracking-tight group-hover:text-[#4338CA] transition-colors">
                  {domain.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed line-clamp-2">
                  {domain.description}
                </p>

                {/* Supported doc preview pill tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {domain.supportedDocsSample.slice(0, 2).map((doc, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F7FF] text-[#4338CA] border border-indigo-50"
                    >
                      {doc}
                    </span>
                  ))}
                  {domain.supportedDocsSample.length > 2 && (
                    <span className="text-[10px] text-[#94A3B8] font-medium self-center">
                      +{domain.supportedDocsSample.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-[#E4E8F2] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#64748B]">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-teal-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Ready to verify
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">Planned workflow</span>
                  )}
                </span>

                {isActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDomainClick(domain);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-primary text-white text-xs font-bold shadow-sm transition-all group-hover:shadow"
                  >
                    <span>Open Workflows</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-[#94A3B8] text-[11px] font-medium cursor-not-allowed border border-slate-200"
                    title="This domain is in development. Workflows will be unlocked in upcoming releases."
                  >
                    <span>Coming soon</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
