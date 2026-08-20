import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Shield,
  LayoutDashboard,
  FolderLock,
  Upload,
  Link,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/evidence', label: 'Evidence', icon: FolderLock },
  { to: '/evidence/upload', label: 'Upload Evidence', icon: Upload },
  { to: '/blockchain', label: 'Blockchain', icon: Link },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <Shield className="w-8 h-8 text-cyan-500 shrink-0" />
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Forensic Chain</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">DFA-AOKGE</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block px-2 py-2 border-t border-slate-700/50">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-slate-900 border-r border-slate-700/50 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onMobileClose} />
          <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-700/50 z-50 md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
