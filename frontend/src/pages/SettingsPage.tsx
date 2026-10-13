import React, { useState } from 'react';
import { User, Bell, Wifi, WifiOff, CheckCircle2, Shield, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { API_BASE_URL, isBackendConfigured, checkBackendHealth, type HealthCheckResult } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [userName, setUserName] = useState('Alex Morgan');
  const [userEmail, setUserEmail] = useState('alex.morgan@verisync.internal');
  const [discrepancyAlerts, setDiscrepancyAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Health check state
  const [healthChecking, setHealthChecking] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  const handleTestConnection = async () => {
    setHealthChecking(true);
    setHealthResult(null);
    const result = await checkBackendHealth();
    setHealthResult(result);
    setHealthChecking(false);
  };

  const connected = isBackendConfigured();

  return (
    <div className="space-y-5 page-enter max-w-3xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Preferences are applied to the active demonstration session only." />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Reviewer profile, notification preferences, and backend API configuration.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-4">
        {/* Backend Status Card */}
        <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/60 bg-gradient-to-r from-white/40 to-indigo-50/30 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connected ? 'bg-teal-50' : 'bg-slate-100'}`}>
                {connected ? (
                  <Wifi className="w-4 h-4 text-[#0D9488]" />
                ) : (
                  <WifiOff className="w-4 h-4 text-[#64748B]" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#172554]">Backend Integration</h2>
                <p className="text-[11px] text-[#94A3B8]">API connection status</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
              connected
                ? 'bg-teal-500/10 text-teal-700 border-teal-200/80 backdrop-blur-sm'
                : 'bg-amber-500/10 text-amber-700 border-amber-200/80 backdrop-blur-sm'
            }`}>
              {connected ? '● Configured' : '○ Demo Mode'}
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-white/60 rounded-xl border border-white/80 shadow-sm p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#64748B]">Endpoint Base URL</span>
                <code className="text-xs text-[#172554] font-mono bg-white/80 px-3 py-1.5 rounded-lg border border-white/80 shadow-sm">
                  {API_BASE_URL || 'Not configured'}
                </code>
              </div>
              <div className="pt-2 border-t border-white/60">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  To connect the backend, add{' '}
                  <code className="font-mono text-[#4338CA] bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
                    VITE_API_BASE_URL=http://localhost:8000/api/v1
                  </code>{' '}
                  to your{' '}
                  <code className="font-mono text-[#172554] bg-white/80 px-1 py-0.5 rounded border border-white/80">.env</code>{' '}
                  file and restart the dev server.
                </p>
              </div>
            </div>

            {/* Live health check button */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                id="btn-test-backend"
                onClick={handleTestConnection}
                disabled={healthChecking}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
                  bg-indigo-600/90 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                  backdrop-blur-sm border border-indigo-500/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthChecking ? 'animate-spin' : ''}`} />
                {healthChecking ? 'Checking…' : 'Test Connection'}
              </button>

              {/* Health check result */}
              {healthResult && (
                <div className={`rounded-xl border p-4 text-xs space-y-2 ${
                  healthResult.ok
                    ? 'bg-teal-50/70 border-teal-200/80'
                    : 'bg-red-50/70 border-red-200/80'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {healthResult.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={healthResult.ok ? 'text-teal-700' : 'text-red-600'}>
                      {healthResult.ok ? 'Backend reachable' : 'Connection failed'}
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-normal text-[#94A3B8]">
                      <Clock className="w-3 h-3" />
                      {healthResult.latencyMs} ms
                    </span>
                  </div>

                  {healthResult.ok && healthResult.payload && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#475569] pt-1">
                      <span className="text-[#94A3B8]">Status</span>
                      <span className="font-semibold capitalize">{healthResult.payload.status}</span>
                      <span className="text-[#94A3B8]">Version</span>
                      <span className="font-semibold">{healthResult.payload.version}</span>
                      <span className="text-[#94A3B8]">Environment</span>
                      <span className="font-semibold capitalize">{healthResult.payload.environment}</span>
                      <span className="text-[#94A3B8]">Active Domain</span>
                      <span className="font-semibold">{healthResult.payload.activeDomain}</span>
                      <span className="text-[#94A3B8]">AI Engine</span>
                      <span className={`font-semibold ${healthResult.payload.aiEngineReady ? 'text-teal-600' : 'text-red-500'}`}>
                        {healthResult.payload.aiEngineReady ? 'Ready' : 'Not ready'}
                      </span>
                    </div>
                  )}

                  {!healthResult.ok && healthResult.error && (
                    <p className="text-red-600 leading-relaxed pt-1">{healthResult.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviewer Profile */}
        <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/60 bg-gradient-to-r from-indigo-50/40 to-blue-50/20 backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <User className="w-4 h-4 text-[#4338CA]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172554]">Reviewer Profile</h2>
              <p className="text-[11px] text-[#94A3B8]">Session identity information</p>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input text-sm text-[#172554] font-medium focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input text-sm text-[#172554] font-medium focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/60 bg-gradient-to-r from-violet-50/40 to-purple-50/20 backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172554]">Notifications</h2>
              <p className="text-[11px] text-[#94A3B8]">Alert preferences for this session</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {[
              {
                id: 'discrepancy',
                label: 'Discrepancy Email Alerts',
                desc: 'Send alert when high-priority contract discrepancies are detected',
                checked: discrepancyAlerts,
                onChange: setDiscrepancyAlerts,
              },
              {
                id: 'digest',
                label: 'Weekly Verification Digest',
                desc: 'Weekly summary of processed documents and audit status',
                checked: weeklyDigest,
                onChange: setWeeklyDigest,
              },
            ].map(({ id, label, desc, checked, onChange }) => (
              <label
                key={id}
                htmlFor={id}
                className="flex items-center justify-between p-4 rounded-xl glass-card border border-white/80 hover:border-indigo-200 hover:bg-white/90 cursor-pointer transition-all shadow-sm"
              >
                <div>
                  <span className="text-sm font-semibold text-[#172554] block">{label}</span>
                  <span className="text-xs text-[#64748B]">{desc}</span>
                </div>
                <div className="relative shrink-0 ml-4">
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      checked ? 'bg-[#4338CA]' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${
                      checked ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Platform section */}
        <div className="glass-panel rounded-2xl border border-white/80 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/60 bg-gradient-to-r from-teal-50/40 to-emerald-50/20 backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172554]">Platform</h2>
              <p className="text-[11px] text-[#94A3B8]">Build version and environment</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Version', value: '0.1.0-demo' },
                { label: 'Environment', value: 'Frontend Only' },
                { label: 'Build', value: 'React + Vite' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/60 border border-white/80 shadow-sm">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">{label}</span>
                  <span className="text-xs font-semibold text-[#172554]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex items-center justify-between py-2">
          {saveSuccess ? (
            <span className="text-sm text-teal-600 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved for current session
            </span>
          ) : (
            <span className="text-xs text-[#94A3B8]">
              Settings are stored in local session state.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl btn-primary text-white font-bold text-sm shadow-md"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
