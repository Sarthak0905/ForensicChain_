import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-20 flex items-center justify-between px-4 lg:px-6 transition-all duration-300">
      {/* Left: Mobile menu toggle */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-auto">
        {/* System health */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-slate-400">Online</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-700" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <StatusBadge type="role" value={user?.role} />
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
