import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
