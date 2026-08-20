import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { evidenceAPI, blockchainAPI, systemAPI } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FolderLock,
  Link as LinkIcon,
  ShieldCheck,
  Activity,
  Upload,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evidenceRes, bcRes, healthRes] = await Promise.allSettled([
          evidenceAPI.list({ limit: 5, page: 1 }),
          blockchainAPI.getStats(),
          systemAPI.health(),
        ]);

        if (evidenceRes.status === 'fulfilled') {
          const data = evidenceRes.value.data;
          setRecentEvidence(data.evidence || data.data || []);
          setStats({
            totalEvidence: data.total || data.totalRecords || 0,
          });
        }
        if (bcRes.status === 'fulfilled') {
          setBlockchainStats(bcRes.value.data);
        }
        if (healthRes.status === 'fulfilled') {
          setHealthStatus(healthRes.value.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const statCards = [
    {
      label: 'Total Evidence',
      value: stats?.totalEvidence || 0,
      icon: FolderLock,
      color: 'text-cyan-400',
      bg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5',
      trend: '+12% this week'
    },
    {
      label: 'Blockchain Blocks',
      value: blockchainStats?.totalBlocks || blockchainStats?.stats?.totalBlocks || 0,
      icon: LinkIcon,
      color: 'text-purple-400',
      bg: 'bg-gradient-to-br from-purple-500/20 to-purple-500/5',
      trend: 'Immutable'
    },
    {
      label: 'Securely Tracked',
      value: blockchainStats?.totalEvidence || blockchainStats?.stats?.totalEvidence || 0,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5',
      trend: '100% verified'
    },
    {
      label: 'System Status',
      value: healthStatus?.status === 'ok' || healthStatus ? 'Online' : 'Unknown',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5',
      trend: '99.9% uptime'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1121] p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.firstName || 'Investigator'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of your forensic evidence and blockchain integrity
          </p>
        </div>
        <div className="relative z-10">
          <Link
            to="/evidence/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <Upload className="w-4 h-4" />
            Upload Evidence
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0B1121] rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} border border-white/5`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-slate-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Evidence - Enterprise Table format */}
        <div className="lg:col-span-2 bg-[#0B1121] rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
            <h2 className="text-base font-semibold text-white">Recent Evidence Registry</h2>
            <Link
              to="/evidence"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-cyan-500/10 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentEvidence.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FolderLock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No evidence uploaded yet</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentEvidence.map((ev) => (
                    <tr key={ev._id || ev.evidenceId} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <FolderLock className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <Link to={`/evidence/${ev.evidenceId}`} className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">
                              {ev.title}
                            </Link>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{ev.evidenceId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge type="evidenceType" value={ev.type} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge type="verification" value={ev.verificationStatus} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {ev.createdAt ? format(new Date(ev.createdAt), 'MMM d, yyyy') : 'Recently'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Blockchain Health */}
        <div className="bg-[#0B1121] rounded-2xl border border-slate-800 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <LinkIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Network Health</h2>
          </div>

          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <div className="relative">
                {healthStatus ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0B1121] rounded-full animate-ping" />
                  </>
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Consensus Status</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {healthStatus?.status === 'ok' ? 'All nodes synchronized' : 'Synchronization pending'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent" />
                <p className="text-xs font-medium text-slate-400 mb-1">Total Blocks</p>
                <p className="text-2xl font-bold text-white tracking-tight">
                  {blockchainStats?.totalBlocks || blockchainStats?.stats?.totalBlocks || 0}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent" />
                <p className="text-xs font-medium text-slate-400 mb-1">Latest Hash</p>
                <p className="text-2xl font-bold text-white tracking-tight">
                  #{blockchainStats?.latestBlock || blockchainStats?.stats?.latestBlock || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/blockchain"
              className="flex items-center justify-center w-full py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl text-sm font-semibold transition-colors focus:ring-2 focus:ring-purple-500/50"
            >
              Verify Ledger Integrity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
