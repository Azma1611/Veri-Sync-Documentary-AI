import React from 'react';
import type { CareerDomain } from '../../types';
import { careerDomains } from '../../data/domainData';

interface CareerDomainSelectorProps {
  selected: CareerDomain;
  onChange: (domain: CareerDomain) => void;
}

export const CareerDomainSelector: React.FC<CareerDomainSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
        Target Career Domain
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {careerDomains.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selected === domain.id;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onChange(domain.id)}
              className={`p-3 rounded-xl border text-left flex flex-col items-start gap-2 transition-all duration-150 backdrop-blur-md ${
                isSelected
                  ? 'bg-[#1A2555] border-[#438AFF] shadow-[0_0_15px_rgba(67,138,255,0.25)] ring-1 ring-[#62D8FF]/40'
                  : 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-[#438AFF]/20 text-[#62D8FF]' : 'bg-white/10 text-[#94A3B8]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? domain.color : 'text-[#94A3B8]'}`} strokeWidth={2} />
              </div>
              <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`}>
                {domain.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
