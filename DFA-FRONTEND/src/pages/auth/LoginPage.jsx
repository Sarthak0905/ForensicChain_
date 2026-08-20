import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', secretCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password, form.secretCode || undefined);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Forensic Chain</h1>
          <p className="text-slate-400 text-sm mt-1">DFA-AOKGE Security System</p>
        </div>

        {/* Form */}
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                placeholder="investigator@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Advanced: SBVM Secret Code */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced Security (SBVM)
              </button>
              {showAdvanced && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="secretCode"
                    value={form.secretCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                    placeholder="SBVM Secret Code (optional)"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
