import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, User, ExternalLink, Activity } from 'lucide-react';
import { isBackendConfigured } from '../../services/api';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string; color: string }> = {
  '/dashboard': {
    title: 'Overview',
    subtitle: 'Platform verification volume, potential inconsistencies & recent activity',
    color: 'text-[#62D8FF]',
  },
  '/verify': {
    title: 'Verify Documents',
    subtitle: 'Select enterprise domain & launch verification workflows',
    color: 'text-[#438AFF]',
  },
  '/verify/employment': {
    title: 'Employment & HR',
    subtitle: 'Contract verification & candidate qualification workflows',
    color: 'text-[#62D8FF]',
  },
  '/verify/employment/documents': {
    title: 'Document Verification Workspace',
    subtitle: 'Multi-document completeness, clause alignment & discrepancy findings',
    color: 'text-[#438AFF]',
  },
  '/verify/employment/resume': {
    title: 'Resume & Career Fit Analysis',
    subtitle: 'Candidate qualification benchmarking & skill gap identification',
    color: 'text-[#8B5CF6]',
  },
  '/history': {
    title: 'History',
    subtitle: 'Searchable audit records & verification inspection logs',
    color: 'text-teal-400',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Preferences, reviewer profile & backend API configuration',
    color: 'text-[#CBD5E1]',
  },
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const backendConnected = isBackendConfigured();

  const currentPage = pageTitles[location.pathname] || {
    title: 'VeriSync AI',
    subtitle: 'Multi-Domain Document Verification Platform',
    color: 'text-[#62D8FF]',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[64px] glass-topbar px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle + Page titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 lg:hidden focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{currentPage.title}</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="hidden sm:inline-block text-xs font-normal text-[#94A3B8] truncate max-w-md">
              {currentPage.subtitle}
            </span>
          </h1>
        </div>
      </div>

      {/* Right: Environment status pill & Auditor profile */}
      <div className="flex items-center gap-3">
        {/* Connection status badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${
            backendConnected
              ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}
          title={
            backendConnected
              ? 'Connected to live FastAPI backend at http://localhost:8000/api/v1'
              : 'Running in rich local demo mode (FastAPI backend offline or unconfigured)'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              backendConnected ? 'bg-teal-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{backendConnected ? 'API Connected' : 'Demo Mode'}</span>
        </div>

        {/* Auditor Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl glass-card border-white/10 hover:border-white/20 text-white transition-all text-xs font-semibold"
            aria-expanded={profileOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#4338CA] to-[#438AFF] flex items-center justify-center text-white shadow-sm font-bold text-xs">
              AM
            </div>
            <div className="hidden md:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-white">Alex Morgan</span>
              <span className="text-[10px] text-[#94A3B8] mt-0.5">Lead Auditor</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-panel-elevated rounded-2xl border border-white/15 shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="p-2 border-b border-white/10 mb-2">
                <p className="text-xs font-bold text-white">Alex Morgan</p>
                <p className="text-[11px] text-[#94A3B8]">alex.morgan@verisync.internal</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-[#62D8FF] text-[10px] font-semibold border border-indigo-400/30">
                  Senior Document Compliance Auditor
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#CBD5E1] hover:bg-white/10 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-[#62D8FF]" />
                  <span>Auditor Profile & Settings</span>
                </a>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#CBD5E1] hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span>FastAPI Swagger Docs</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>

              <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-[#94A3B8] flex items-center justify-between px-2">
                <span>VeriSync AI Platform</span>
                <span className="text-teal-400 font-semibold">Ready</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
