import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  History,
  Settings,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/verify', label: 'Verify Documents', icon: FileCheck2 },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-sidebar flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-[64px] px-5 flex items-center justify-between border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5 text-[#62D8FF]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight">VeriSync</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[#62D8FF] border border-indigo-400/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#94A3B8] tracking-wider uppercase mt-0.5">
                Multi-Domain
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 lg:hidden transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8]/80">
              Platform
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-teal-400 font-semibold">
              <Sparkles className="w-2.5 h-2.5" />
              v1.0 Live
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/dashboard'
                ? location.pathname === '/dashboard'
                : item.to === '/verify'
                ? location.pathname.startsWith('/verify')
                : location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'nav-active shadow-lg'
                    : 'text-[#CBD5E1] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#438AFF]/20 text-[#62D8FF] shadow-inner'
                      : 'text-[#94A3B8] group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#62D8FF] shadow-[0_0_8px_#62D8FF] shrink-0" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Link & Status */}
        <div className="p-3.5 border-t border-white/10 space-y-2">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#94A3B8]">Engine Status</span>
              <span className="flex items-center gap-1 text-teal-400 font-semibold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Deterministic
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] leading-relaxed">
              Evidence-linked audit verification for enterprise documents.
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#94A3B8] hover:bg-white/5 hover:text-[#62D8FF] transition-colors group"
          >
            <span>Platform Overview</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </Link>
        </div>
      </aside>
    </>
  );
};
