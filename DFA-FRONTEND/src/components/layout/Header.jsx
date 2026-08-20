import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, Search, Bell, ChevronDown } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function Header({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-20 flex items-center justify-between px-4 lg:px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search (Enterprise Feature) */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search evidence, cases, or hashes (Ctrl+K)" 
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded">⌘</kbd>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded">K</kbd>
          </div>
        </div>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-3 sm:gap-5 ml-auto">
        {/* System health */}
        <div className="hidden lg:flex items-center gap-2 text-sm px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-medium text-xs tracking-wide uppercase">System Operational</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-slate-900" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-800" />

        {/* User Profile Dropdown Placeholder */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-1.5 rounded-lg transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white leading-tight group-hover:text-cyan-400 transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 leading-tight mt-0.5 capitalize">
              {user?.role || 'Investigator'}
            </p>
          </div>
          <ChevronDown className="hidden sm:block w-4 h-4 text-slate-500" />
        </div>

        {/* Logout (mobile) */}
        <button
          onClick={logout}
          className="md:hidden p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
