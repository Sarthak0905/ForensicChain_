import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this page.</p>
          <p className="text-slate-500 text-sm mt-2">Required role: {requiredRoles.join(', ')}</p>
        </div>
      </div>
    );
  }

  return children;
}
