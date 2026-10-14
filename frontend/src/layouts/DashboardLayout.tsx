import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080D20] text-[#F8FAFC] flex relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-[#62D8FF]">
      {/* Layered Atmospheric Glowing Ambient Light Orbs (Dark Crystal Glass Effect) */}
      <div
        className="fixed -top-40 -left-40 w-[36rem] h-[36rem] bg-gradient-to-br from-[#4338CA]/25 via-[#438AFF]/15 to-transparent rounded-full blur-[120px] pointer-events-none glow-orb"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/4 -right-36 w-[34rem] h-[34rem] bg-gradient-to-bl from-[#8B5CF6]/20 via-[#4338CA]/15 to-transparent rounded-full blur-[130px] pointer-events-none glow-orb"
        style={{ animationDelay: '-3s' }}
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-48 left-1/3 w-[42rem] h-[42rem] bg-gradient-to-tr from-[#0D9488]/20 via-[#438AFF]/15 to-transparent rounded-full blur-[140px] pointer-events-none glow-orb"
        style={{ animationDelay: '-5s' }}
        aria-hidden="true"
      />
      <div
        className="fixed top-2/3 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-r from-[#62D8FF]/10 via-[#4338CA]/15 to-transparent rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Dark Crystal Glass Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
