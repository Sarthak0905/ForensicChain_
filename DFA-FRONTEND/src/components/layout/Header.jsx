import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, Search, Bell, ChevronDown } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function Header({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-20 flex items-center justify-between px-4 lg:px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search (Enterprise Feature) */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search evidence, cases, or hashes (Ctrl+K)" 
            className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-sm">⌘</kbd>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-3 sm:gap-5 ml-auto">
        {/* System health */}
        <div className="hidden lg:flex items-center gap-2 text-sm px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-700 font-medium text-xs tracking-wide uppercase">System Operational</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200" />

        {/* User Profile Dropdown Placeholder */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 leading-tight mt-0.5 capitalize font-medium">
              {user?.role || 'Investigator'}
            </p>
          </div>
          <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
        </div>

        {/* Logout (mobile) */}
        <button
          onClick={logout}
          className="md:hidden p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
