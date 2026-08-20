import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Shield,
  LayoutDashboard,
  FolderLock,
  UploadCloud,
  Link,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Hexagon
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/evidence', label: 'Evidence Register', icon: FolderLock },
  { to: '/evidence/upload', label: 'Secure Upload', icon: UploadCloud },
  { to: '/blockchain', label: 'Ledger Audit', icon: Link },
  { to: '/profile', label: 'Account Settings', icon: User },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-md shadow-blue-600/20 shrink-0">
          <Hexagon className="w-5 h-5 text-white absolute" />
          <Shield className="w-3 h-3 text-white absolute" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">ForensicChain</h1>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-0.5">Enterprise</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />}
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        {/* Collapse toggle (desktop only) */}
        <div className="hidden md:block mb-2">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ${collapsed ? 'justify-center px-0' : 'px-3'}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen border-r border-slate-200 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={onMobileClose} />
          <aside className="fixed top-0 left-0 h-screen w-64 border-r border-slate-200 z-50 md:hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
