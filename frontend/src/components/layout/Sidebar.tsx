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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 glass-sidebar flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-white/60">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-[#172554] tracking-tight">VeriSync</span>
              <span className="text-[10px] font-semibold text-[#4338CA] leading-tight">AI Platform</span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748B] hover:text-[#172033] hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-semibold text-[#94A3B8]">
            Platform
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            // Also consider active if user is inside /verify subroutes for the "Verify Documents" item
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'nav-active font-semibold shadow-sm'
                    : 'text-[#64748B] hover:bg-slate-50 hover:text-[#172033]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white shadow-sm text-[#4338CA]'
                      : 'text-[#94A3B8] group-hover:text-[#64748B]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="truncate text-xs">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4338CA] shrink-0" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/60">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#64748B] hover:bg-indigo-50 hover:text-[#4338CA] transition-colors group"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </Link>
        </div>
      </aside>
    </>
  );
};
