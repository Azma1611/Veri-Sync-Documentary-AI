import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  ArrowRight,
  Clock,
  Plus,
  FileCheck,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { DomainExplorer } from '../components/common/DomainExplorer';
import { mockStats, mockRecentActivity } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 page-enter max-w-6xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Multi-Domain Document Verification Platform: Demonstration environment displaying sample audit records and active Employment & HR verification workflows." />

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            Welcome to VeriSync AI 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Configurable, evidence-first document verification across enterprise domains.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/verify')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl btn-primary text-white text-sm font-bold shadow-md hover:shadow-lg shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Start Verification</span>
        </button>
      </div>

      {/* 3 Compact Summary Cards: Documents Reviewed, Potential Inconsistencies, Items Requiring Review */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Documents Reviewed"
          value={mockStats.totalDocumentsReviewed}
          subtitle="Audited across active domains"
          icon={FileText}
          badge="Demo data"
          accent="blue"
        />
        <StatCard
          title="Potential Inconsistencies"
          value={mockStats.potentialInconsistenciesFound}
          subtitle="Clause variances detected for review"
          icon={AlertCircle}
          badge="Demo data"
          accent="violet"
        />
        <StatCard
          title="Items Requiring Review"
          value={mockStats.itemsRequiringReview || 36}
          subtitle="Awaiting human auditor sign-off"
          icon={ShieldAlert}
          badge="Action required"
          accent="teal"
        />
      </div>

      {/* Central Domain Selection Explorer */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm">
        <DomainExplorer
          title="Enterprise Document Domains"
          subtitle="Select a domain to inspect supported document types and launch verification workflows"
          showAllLink={true}
        />
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-white/60 flex items-center justify-between bg-gradient-to-r from-white/60 to-indigo-50/30 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#172554]">Recent Verification Activity</h2>
              <span className="text-[10px] font-bold text-[#4338CA] px-2 py-0.5 rounded-full bg-indigo-50/80 border border-indigo-100">
                Demo Activity
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Latest cross-document audits and candidate evaluations
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:text-[#172554] transition-colors"
          >
            <span>View all audit logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-[#64748B] text-[10px] uppercase tracking-wider font-bold backdrop-blur-md">
                <th className="py-3 px-6">Document Package / Target</th>
                <th className="py-3 px-4">Domain & Workflow</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8F2]">
              {mockRecentActivity.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-indigo-50/30 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <p className="font-semibold text-[#172554]">{activity.title}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">{activity.subtitle}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full ${
                        activity.type === 'verification'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-violet-50 text-violet-700 border border-violet-100'
                      }`}
                    >
                      {activity.type === 'verification' ? (
                        <>
                          <FileCheck className="w-3 h-3" />
                          Employment Verification
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          Resume & Career Fit
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        activity.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : activity.status === 'success'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {activity.statusText}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#94A3B8]">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
