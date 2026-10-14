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
  Sparkles,
  HeartPulse,
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
      <NoticeBanner message="Multi-Domain Document Verification Platform: Configurable cross-document clause analysis across enterprise domains. Results highlight potential discrepancies requiring human review." />

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic Evidence Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to VeriSync AI
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1.5 max-w-2xl leading-relaxed">
            Cross-reference employment contracts, candidate qualifications, and healthcare records. Detect discrepancies, trace exact source citations, and generate evidence-linked audit reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/verify')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl btn-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 shrink-0 transition-all hover:scale-[1.02] z-10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Verify Documents</span>
        </button>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#438AFF]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Documents Reviewed"
          value={mockStats.totalDocumentsReviewed}
          subtitle="Cross-referenced across active domains"
          icon={FileText}
          badge="Audit Total"
          accent="blue"
        />
        <StatCard
          title="Potential Inconsistencies"
          value={mockStats.potentialInconsistenciesFound}
          subtitle="Clause variances detected for review"
          icon={AlertCircle}
          badge="Flagged"
          accent="amber"
        />
        <StatCard
          title="Items Requiring Review"
          value={mockStats.itemsRequiringReview || 36}
          subtitle="Awaiting human compliance sign-off"
          icon={ShieldAlert}
          badge="Action needed"
          accent="violet"
        />
        <StatCard
          title="Resumes Evaluated"
          value={mockStats.resumesAnalyzed}
          subtitle="Candidate qualification benchmarks"
          icon={TrendingUp}
          badge="HR Domain"
          accent="teal"
        />
      </div>

      {/* Central Domain Selection Explorer */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10">
        <DomainExplorer
          title="Enterprise Document Domains"
          subtitle="Choose an active domain to inspect supported document types and launch verification workflows"
          showAllLink={true}
        />
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/10">
        <div className="px-6 py-4.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#111735]/80 to-[#161F48]/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                Recent Verification Activity
              </h2>
              <span className="text-[10px] font-bold text-[#62D8FF] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                Audit Log
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Latest cross-document audits, billing reconciliations, and candidate evaluations
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#62D8FF] hover:text-white transition-colors"
          >
            <span>View all audit logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10 text-[#94A3B8] text-[10px] uppercase tracking-wider font-bold">
                <th className="py-3 px-6">Document Package / Target</th>
                <th className="py-3 px-4">Domain & Workflow</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockRecentActivity.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <p className="font-bold text-white">{activity.title}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 font-mono">{activity.subtitle}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        activity.type === 'verification'
                          ? activity.title.includes('Healthcare') || activity.title.includes('Patient')
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                            : 'bg-indigo-500/15 text-[#62D8FF] border border-indigo-500/30'
                          : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {activity.type === 'verification' ? (
                        activity.title.includes('Healthcare') || activity.title.includes('Patient') ? (
                          <>
                            <HeartPulse className="w-3 h-3 text-teal-400" />
                            Healthcare Admin
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-3 h-3 text-[#62D8FF]" />
                            Employment Verification
                          </>
                        )
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3 text-violet-400" />
                          Resume & Career Fit
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        activity.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : activity.status === 'success'
                          ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                          : 'bg-white/10 text-[#CBD5E1] border-white/15'
                      }`}
                    >
                      {activity.statusText}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#94A3B8]">
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
