import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F6FD] flex relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Ambient Glowing Orbs for Glass Refraction */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-400/25 via-blue-400/20 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/4 -right-28 w-96 h-96 bg-gradient-to-bl from-violet-400/25 via-purple-300/20 to-pink-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-tr from-teal-300/25 via-sky-300/20 to-indigo-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-2/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Glass Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
