import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, FileCheck, TrendingUp, Filter, HeartPulse, Sparkles } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { Modal } from '../components/common/Modal';
import { mockHistoryItems } from '../data/mockData';
import { fetchAnalysisHistory } from '../services/api';
import type { HistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'resume' | 'verification'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [items, setItems] = useState<HistoryItem[]>(mockHistoryItems);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setIsLoading(true);
    });
    fetchAnalysisHistory({ type: typeFilter, status: statusFilter, searchQuery })
      .then((res) => {
        if (isMounted && res.data) {
          setItems(res.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load history from API:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [searchQuery, typeFilter, statusFilter]);

  const filteredItems = items;

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Audit Log Archive: Historical verification logs and cross-document reconciliation records across active domains." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compliance Audit Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verification History
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 max-w-xl leading-relaxed">
            Historical audit records, clause discrepancy findings, and candidate qualification benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-md">
            {filteredItems.length} Records Indexed
          </span>
        </div>

        <div className="absolute -right-16 -top-16 w-52 h-52 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search and Filters */}
      <div className="glass-panel rounded-2xl border border-white/10 shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, candidates, domain, or findings..."
            className="w-full pl-10 pr-3 py-2.5 glass-input rounded-xl text-xs text-white font-medium placeholder-[#64748B] focus:outline-none focus:border-[#438AFF] shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2.5 glass-input rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#438AFF]"
          >
            <option value="all">All Workflows</option>
            <option value="verification">Document Verification</option>
            <option value="resume">Resume Fit</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 glass-input rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#438AFF]"
          >
            <option value="all">All Statuses</option>
            <option value="Inconsistencies Found">Review Required</option>
            <option value="Verified">Verified Clean</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table / Loading State */}
      {isLoading ? (
        <div className="glass-panel rounded-2xl border border-white/10 shadow-xl p-12 text-center">
          <p className="text-xs font-bold text-[#62D8FF] animate-pulse">
            Syncing audit history records from backend...
          </p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10 text-[#94A3B8] text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Document Batch / Target</th>
                  <th className="py-3.5 px-4">Workflow Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-4 px-6">
                      <p className="font-extrabold text-white text-xs">{item.documentName}</p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate max-w-sm">{item.summary}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          item.analysisType.includes('Healthcare')
                            ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                            : item.analysisType === 'Employment Document Verification'
                            ? 'bg-indigo-500/15 text-[#62D8FF] border border-indigo-500/30'
                            : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                        }`}
                      >
                        {item.analysisType.includes('Healthcare') ? (
                          <>
                            <HeartPulse className="w-3 h-3 text-teal-400" />
                            Healthcare Admin
                          </>
                        ) : item.analysisType === 'Employment Document Verification' ? (
                          <>
                            <FileCheck className="w-3 h-3 text-[#62D8FF]" />
                            Employment Verification
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3 h-3 text-violet-400" />
                            Resume & Career Fit
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#CBD5E1] font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        {item.date}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62D8FF] hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
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
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider block mb-1">
                Document Batch
              </span>
              <h4 className="text-sm font-extrabold text-white">{selectedItem.documentName}</h4>
              <p className="text-xs text-[#CBD5E1] mt-1.5 leading-relaxed">{selectedItem.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Workflow', value: selectedItem.analysisType },
                { label: 'Audit Date', value: selectedItem.date },
                { label: 'Target Domain', value: selectedItem.domain },
                { label: 'Audit Status', value: selectedItem.status },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">
                    {label}
                  </span>
                  <span className="text-xs font-bold text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl btn-primary text-white text-xs font-bold shadow-lg"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
