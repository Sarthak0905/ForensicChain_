import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Protected Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import EvidenceListPage from './pages/evidence/EvidenceListPage';
import EvidenceDetailPage from './pages/evidence/EvidenceDetailPage';
import EvidenceUploadPage from './pages/evidence/EvidenceUploadPage';
import BlockchainPage from './pages/blockchain/BlockchainPage';
import ProfilePage from './pages/profile/ProfilePage';

function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <RegisterPage />
          </AuthRedirect>
        }
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="evidence" element={<EvidenceListPage />} />
        <Route path="evidence/upload" element={<EvidenceUploadPage />} />
        <Route path="evidence/:id" element={<EvidenceDetailPage />} />
        <Route path="blockchain" element={<BlockchainPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-700 mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-6">Page not found</p>
        <a href="/" className="text-cyan-400 hover:text-cyan-300 font-medium">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
