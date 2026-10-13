import React, { useState, useMemo } from 'react';
import { Search, Eye, Calendar, FileCheck, TrendingUp, Filter } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { Modal } from '../components/common/Modal';
import { mockHistoryItems } from '../data/mockData';
import type { HistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'resume' | 'verification'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const filteredItems = useMemo(() => {
    return mockHistoryItems.filter((item) => {
      if (typeFilter === 'resume' && item.analysisType !== 'Resume & Career Fit') return false;
      if (typeFilter === 'verification' && item.analysisType !== 'Employment Document Verification') return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.documentName.toLowerCase().includes(q) &&
          !item.summary.toLowerCase().includes(q) &&
          !item.domain.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [searchQuery, typeFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-5 page-enter max-w-7xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Searchable demonstration audit archive. Historical records are stored in mock session memory." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">History</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Audit logs and consistency records across previous verification workflows.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
          <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            {filteredItems.length} records
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel rounded-2xl border border-white/80 shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, candidates, or findings..."
            className="w-full pl-9 pr-3 py-2.5 glass-input text-xs text-[#172554] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2.5 glass-input text-xs font-semibold text-[#172554] focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="all">All Workflows</option>
            <option value="verification">Document Verification</option>
            <option value="resume">Resume Fit</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 glass-input text-xs font-semibold text-[#172554] focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="Inconsistencies Found">Needs Review</option>
            <option value="Verified">Verified Clean</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length > 0 ? (
        <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/50 backdrop-blur-md border-b border-white/60 text-[#64748B] text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-6">Document / Candidate</th>
                  <th className="py-3 px-4">Workflow</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-[#172554]">{item.documentName}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5 truncate max-w-xs">{item.summary}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${
                        item.analysisType === 'Employment Document Verification'
                          ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 backdrop-blur-sm'
                          : 'bg-violet-50/80 text-violet-700 border-violet-200/60 backdrop-blur-sm'
                      }`}>
                        {item.analysisType === 'Employment Document Verification'
                          ? <FileCheck className="w-3 h-3" />
                          : <TrendingUp className="w-3 h-3" />
                        }
                        {item.analysisType === 'Employment Document Verification' ? 'Verification' : 'Resume Fit'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <Calendar className="w-3 h-3 text-[#94A3B8]" />
                        {item.date}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:text-[#172554] px-3 py-1.5 rounded-xl hover:bg-indigo-50/60 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No verification records found"
          description={`No history entries match your current search "${searchQuery}" or selected filters.`}
          actionText="Clear Search & Filters"
          onAction={handleClearFilters}
        />
      )}

      {/* Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title={`Audit Record: ${selectedItem.id}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl glass-card border border-white/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1.5">
                Document Batch
              </span>
              <h4 className="text-sm font-bold text-[#172554]">{selectedItem.documentName}</h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{selectedItem.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Workflow', value: selectedItem.analysisType },
                { label: 'Date', value: selectedItem.date },
                { label: 'Domain', value: selectedItem.domain },
                { label: 'Status', value: selectedItem.status },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl border border-white/80 glass-card shadow-sm">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">{label}</span>
                  <span className="text-xs font-semibold text-[#172554]">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
