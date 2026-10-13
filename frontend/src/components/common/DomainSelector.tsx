import React from 'react';
import { Code2, Database, Coins, Layout, HeartPulse, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CareerDomain, DocumentDomain } from '../../types';

interface CareerDomainOption {
  id: CareerDomain;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  activeBg: string;
  activeBorder: string;
}

export const careerDomains: CareerDomainOption[] = [
  { id: 'software-engineering', label: 'Software Eng.', icon: Code2, color: 'text-[#3B82F6]', bg: 'bg-blue-50', activeBg: 'bg-blue-50', activeBorder: 'border-blue-400 ring-blue-100' },
  { id: 'data-ai', label: 'Data & AI', icon: Database, color: 'text-[#8B5CF6]', bg: 'bg-violet-50', activeBg: 'bg-violet-50', activeBorder: 'border-violet-400 ring-violet-100' },
  { id: 'finance-fintech', label: 'Finance', icon: Coins, color: 'text-[#0D9488]', bg: 'bg-teal-50', activeBg: 'bg-teal-50', activeBorder: 'border-teal-400 ring-teal-100' },
  { id: 'product-design', label: 'Product & Design', icon: Layout, color: 'text-[#F59E0B]', bg: 'bg-amber-50', activeBg: 'bg-amber-50', activeBorder: 'border-amber-400 ring-amber-100' },
  { id: 'healthcare-biotech', label: 'Healthcare', icon: HeartPulse, color: 'text-[#EF4444]', bg: 'bg-red-50', activeBg: 'bg-red-50', activeBorder: 'border-red-400 ring-red-100' },
  { id: 'operations-hr', label: 'Operations', icon: Briefcase, color: 'text-[#64748B]', bg: 'bg-slate-100', activeBg: 'bg-slate-100', activeBorder: 'border-slate-400 ring-slate-100' },
];

export const documentDomains: { id: DocumentDomain; label: string; description: string }[] = [
  { id: 'employment-hr', label: 'Employment & HR', description: 'Cross-reference offer letters, contracts, compensation annexures, and HR policies' },
  { id: 'legal-contracts', label: 'Legal & Compliance (Preview)', description: 'Cross-analyze master service agreements, vendor SOWs, and NDAs' },
  { id: 'procurement-finance', label: 'Finance & Procurement (Preview)', description: 'Verify purchase orders against invoices, rate cards, and delivery manifests' },
];

interface CareerDomainSelectorProps {
  selected: CareerDomain;
  onChange: (domain: CareerDomain) => void;
}

export const CareerDomainSelector: React.FC<CareerDomainSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
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
              className={`p-3 rounded-xl border text-left flex flex-col items-start gap-2 transition-all duration-150 ${
                isSelected
                  ? `${domain.activeBg} ${domain.activeBorder} ring-2 shadow-sm`
                  : 'glass-card border-white/80 hover:border-indigo-200 hover:bg-white/80'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg ${isSelected ? 'bg-white/80' : 'bg-white/60'} flex items-center justify-center shadow-sm`}>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? domain.color : 'text-[#94A3B8]'}`} strokeWidth={2} />
              </div>
              <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-[#172554]' : 'text-[#64748B]'}`}>
                {domain.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
