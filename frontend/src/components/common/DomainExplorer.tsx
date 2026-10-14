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

    if (domain.id === 'employment-hr') {
      navigate('/verify/employment');
    } else if (domain.id === 'healthcare-admin') {
      navigate('/verify/employment/documents?domain=healthcare-admin');
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>
        </div>
        {showAllLink && (
          <button
            type="button"
            onClick={() => navigate('/verify')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62D8FF] hover:text-white transition-colors self-start sm:self-auto"
          >
            <span>Open Verification Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platformDomains.map((domain) => {
          const Icon = domain.icon;
          const isActive = domain.status === 'active';

          return (
            <div
              key={domain.id}
              className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 backdrop-blur-md ${
                isActive
                  ? 'glass-card border-white/15 hover:border-[#438AFF]/50 hover:shadow-[0_10px_30px_rgba(67,138,255,0.2)] cursor-pointer hover:-translate-y-1'
                  : 'bg-white/[0.03] border-white/10 opacity-75 hover:opacity-90'
              }`}
              onClick={() => isActive && handleDomainClick(domain)}
            >
              {/* Header: Icon & Status Badge */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                      isActive
                        ? 'btn-primary text-white shadow-indigo-500/20'
                        : 'bg-white/10 text-[#94A3B8] border border-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 2} />
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      Active (2 Workflows)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-[#94A3B8] border border-white/10">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      Roadmap Spec
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#62D8FF] transition-colors">
                  {domain.name}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed line-clamp-2">
                  {domain.description}
                </p>

                {/* Supported doc preview tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {domain.supportedDocsSample.slice(0, 2).map((doc, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] text-[#CBD5E1] border border-white/10"
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
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#94A3B8]">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-teal-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-primary text-white text-xs font-bold shadow-lg transition-all group-hover:shadow-indigo-500/30"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 text-[#94A3B8] text-[11px] font-medium cursor-not-allowed border border-white/10"
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
