import React, { useState } from 'react';
import { User, Bell, Wifi, WifiOff, CheckCircle2, Shield, RefreshCw, AlertCircle, Clock, Sparkles } from 'lucide-react';
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
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      {/* Notice Banner */}
      <NoticeBanner message="Settings & Configuration: Preferences are applied to the active auditor session. Backend configuration coordinates with the FastAPI service." />

      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auditor Environment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 max-w-xl leading-relaxed">
            Reviewer profile identity, audit notification preferences, and live backend FastAPI endpoint integration.
          </p>
        </div>
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#438AFF]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-5">
        {/* Backend Status Card */}
        <div className="glass-panel rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4.5 border-b border-white/10 bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  connected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">Backend Integration</h2>
                <p className="text-[11px] text-[#94A3B8]">FastAPI REST service connection status</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-md ${
                connected
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {connected ? '● Configured' : '○ Demo Mode'}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-black/30 rounded-2xl border border-white/10 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#CBD5E1]">Endpoint Base URL</span>
                <code className="text-xs text-[#62D8FF] font-mono bg-white/[0.06] px-3 py-1.5 rounded-xl border border-white/10 shadow-inner">
                  {API_BASE_URL || 'Not configured (runs in local Demo Mode)'}
                </code>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  To connect the FastAPI service, set{' '}
                  <code className="font-mono text-[#62D8FF] bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-400/30">
                    VITE_API_BASE_URL=http://localhost:8000/api/v1
                  </code>{' '}
                  in your{' '}
                  <code className="font-mono text-white bg-white/10 px-1 py-0.5 rounded border border-white/10">
                    .env
                  </code>{' '}
                  file.
                </p>
              </div>
            </div>

            {/* Live health check button & result */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                id="btn-test-backend"
                onClick={handleTestConnection}
                disabled={healthChecking}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg self-start btn-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthChecking ? 'animate-spin' : ''}`} />
                <span>{healthChecking ? 'Checking Connection…' : 'Test Backend Health'}</span>
              </button>

              {healthResult && (
                <div
                  className={`rounded-2xl border p-4 text-xs space-y-2.5 backdrop-blur-md animate-fadeIn ${
                    healthResult.ok
                      ? 'bg-teal-950/40 border-teal-500/30'
                      : 'bg-red-950/40 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {healthResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={healthResult.ok ? 'text-teal-300' : 'text-red-300'}>
                      {healthResult.ok ? 'Backend reachable (FastAPI Healthy)' : 'Connection failed'}
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-mono text-[#94A3B8]">
                      <Clock className="w-3.5 h-3.5" />
                      {healthResult.latencyMs} ms
                    </span>
                  </div>

                  {healthResult.ok && healthResult.payload && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[#CBD5E1] pt-1">
                      <span className="text-[#94A3B8]">Status</span>
                      <span className="font-bold text-white capitalize">{healthResult.payload.status}</span>
                      <span className="text-[#94A3B8]">Version</span>
                      <span className="font-mono text-[#62D8FF]">{healthResult.payload.version}</span>
                      <span className="text-[#94A3B8]">Environment</span>
                      <span className="font-semibold capitalize text-white">{healthResult.payload.environment}</span>
                      <span className="text-[#94A3B8]">Active Domain</span>
                      <span className="font-semibold text-white">{healthResult.payload.activeDomain}</span>
                      <span className="text-[#94A3B8]">AI Provider Engine</span>
                      <span
                        className={`font-bold ${
                          healthResult.payload.aiEngineReady ? 'text-teal-300' : 'text-amber-300'
                        }`}
                      >
                        {healthResult.payload.aiEngineReady ? 'Ready / Active' : 'Standby'}
                      </span>
                    </div>
                  )}

                  {!healthResult.ok && healthResult.error && (
                    <p className="text-red-300 leading-relaxed pt-1">{healthResult.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviewer Profile */}
        <div className="glass-panel rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4.5 border-b border-white/10 bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#438AFF]/20 border border-[#438AFF]/30 flex items-center justify-center text-[#62D8FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Reviewer Identity</h2>
              <p className="text-[11px] text-[#94A3B8]">Active compliance auditor details</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Auditor Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#438AFF] shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#438AFF] shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-panel rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4.5 border-b border-white/10 bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Alert Preferences</h2>
              <p className="text-[11px] text-[#94A3B8]">Notifications for high-severity discrepancies</p>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {[
              {
                id: 'discrepancy',
                label: 'High-Priority Discrepancy Alerts',
                desc: 'Notify reviewer when salary or billing variances exceed configured tolerance',
                checked: discrepancyAlerts,
                onChange: setDiscrepancyAlerts,
              },
              {
                id: 'digest',
                label: 'Weekly Verification Digest',
                desc: 'Weekly summary of processed documents, clean batches, and pending reviews',
                checked: weeklyDigest,
                onChange: setWeeklyDigest,
              },
            ].map(({ id, label, desc, checked, onChange }) => (
              <label
                key={id}
                htmlFor={id}
                className="flex items-center justify-between p-4 rounded-2xl glass-card border border-white/10 hover:border-[#438AFF]/40 cursor-pointer transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{label}</span>
                  <span className="text-[11px] text-[#94A3B8] leading-relaxed">{desc}</span>
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
                      checked ? 'bg-[#438AFF]' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${
                        checked ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Platform section */}
        <div className="glass-panel rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4.5 border-b border-white/10 bg-gradient-to-r from-[#111735]/80 via-[#161F48]/60 to-[#111735]/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Platform Information</h2>
              <p className="text-[11px] text-[#94A3B8]">Engine version and active environment</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Platform Version', value: 'v1.0.0-hackathon' },
                { label: 'Frontend Stack', value: 'React 19 + Vite' },
                { label: 'Backend Engine', value: 'FastAPI + Pydantic' },
                { label: 'Active Domains', value: 'Employment & Health' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3.5 rounded-2xl bg-black/30 border border-white/10">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">
                    {label}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex items-center justify-between py-2">
          {saveSuccess ? (
            <span className="text-xs text-teal-300 flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Preferences recorded for active session
            </span>
          ) : (
            <span className="text-xs text-[#94A3B8]">
              Preferences stored in active browser session.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl btn-primary text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
