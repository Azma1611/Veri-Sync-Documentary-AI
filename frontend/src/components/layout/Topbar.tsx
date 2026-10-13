import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string; color: string }> = {
  '/dashboard': {
    title: 'Overview',
    subtitle: 'Platform verification volume, potential inconsistencies & recent activity',
    color: 'text-[#4338CA]',
  },
  '/verify': {
    title: 'Verify Documents',
    subtitle: 'Select enterprise domain & launch verification workflows',
    color: 'text-[#3B82F6]',
  },
  '/verify/employment': {
    title: 'Employment & HR',
    subtitle: 'Contract verification & candidate qualification workflows',
    color: 'text-[#4338CA]',
  },
  '/verify/employment/documents': {
    title: 'Document Verification Workspace',
    subtitle: 'Multi-document completeness, clause alignment & discrepancy findings',
    color: 'text-[#3B82F6]',
  },
  '/verify/employment/resume': {
    title: 'Resume & Career Fit Analysis',
    subtitle: 'Candidate qualification benchmarking & skill gap identification',
    color: 'text-[#8B5CF6]',
  },
  '/history': {
    title: 'History',
    subtitle: 'Searchable audit records & verification inspection logs',
    color: 'text-[#0D9488]',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Preferences, reviewer profile & backend API configuration',
    color: 'text-[#64748B]',
  },
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentPage = pageTitles[location.pathname] || {
    title: 'VeriSync AI',
    subtitle: 'Multi-Domain Document Verification Platform',
    color: 'text-[#4338CA]',
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
    <header className="h-[60px] glass-topbar px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Hamburger + Page info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className={`text-sm font-bold leading-none tracking-tight ${currentPage.color}`}>
            {currentPage.title}
          </h1>
          <p className="hidden md:block text-[11px] text-[#94A3B8] mt-0.5 leading-none">
            {currentPage.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Demo badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-[#4338CA] border border-indigo-100">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA] animate-pulse" />
          Demo Mode
        </span>

        {/* Notification button */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-slate-100 hover:text-[#172033] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4338CA]" />
        </button>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full btn-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              AM
            </div>
            <span className="hidden md:block text-xs font-semibold text-[#172033]">
              Alex Morgan
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 glass-modal rounded-2xl py-1.5 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-3 border-b border-white/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full btn-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    AM
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#172033]">Alex Morgan</p>
                    <p className="text-[10px] text-[#64748B]">alex.m@verisync.internal</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-[10px] text-[#94A3B8]">Auditor Session</p>
                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-[#4338CA]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4338CA]" />
                  Multi-Domain Demo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
