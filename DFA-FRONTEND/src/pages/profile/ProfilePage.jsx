import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { User, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    organizationName: user?.organizationName || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account settings and security" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Profile Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization</label>
                <input
                  type="text"
                  name="organizationName"
                  value={profileForm.organizationName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                  placeholder="Optional"
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" /> Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {savingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Account Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Account Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-white">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <div className="mt-0.5">
                  <StatusBadge type="role" value={user?.role} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Account Status</p>
                <p className={`text-sm ${user?.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {user?.isActive ? '● Active' : '● Inactive'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Verified</p>
                <p className={`text-sm ${user?.isVerified ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {user?.isVerified ? '✓ Verified' : '○ Unverified'}
                </p>
              </div>
              {user?.lastLogin && (
                <div>
                  <p className="text-xs text-slate-500">Last Login</p>
                  <p className="text-sm text-slate-300">{format(new Date(user.lastLogin), 'PPpp')}</p>
                </div>
              )}
              {user?.createdAt && (
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm text-slate-300">{format(new Date(user.createdAt), 'PP')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Upgrade Card */}
          {user?.role !== 'premium_investigator' && (
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2 relative z-10">
                ⭐ Premium Plan
              </h3>
              <p className="text-sm text-indigo-200 mb-4 relative z-10">
                Upgrade your account for advanced forensic tools, unlimited storage, and priority blockchain audits.
              </p>
              <button
                onClick={async () => {
                  try {
                    const { paymentAPI } = await import('../../api/axios');
                    // Create Order
                    const res = await paymentAPI.createOrder({ amount: 999 }); // ₹999
                    const data = res.data;
                    
                    const options = {
                      key: data.keyId,
                      amount: data.amount,
                      currency: data.currency,
                      name: 'ForensicChain Enterprise',
                      description: 'Premium Investigator Upgrade',
                      order_id: data.orderId,
                      handler: async function (response) {
                        try {
                          await paymentAPI.verify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                          });
                          window.location.reload(); // Reload to reflect new role
                        } catch (err) {
                          alert('Payment verification failed');
                        }
                      },
                      prefill: {
                        name: `${user?.firstName} ${user?.lastName}`,
                        email: user?.email,
                      },
                      theme: { color: '#06b6d4' }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                  } catch (err) {
                    console.error(err);
                    alert('Could not initialize payment gateway');
                  }
                }}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg text-sm transition-colors relative z-10 shadow-lg shadow-indigo-500/20"
              >
                Upgrade Now (₹999)
              </button>
            </div>
          )}

          {/* SBVM Info */}
          {user?.sbvm && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> SBVM Security
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Secure Block Verification Mechanism (circle-based challenge authentication)
              </p>
              <div className="space-y-2 text-sm">
                {user.sbvm.origin && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Origin</span>
                    <span className="text-slate-300 font-mono">
                      ({user.sbvm.origin.x}, {user.sbvm.origin.y})
                    </span>
                  </div>
                )}
                {user.sbvm.radius && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Radius</span>
                    <span className="text-slate-300 font-mono">{user.sbvm.radius}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
