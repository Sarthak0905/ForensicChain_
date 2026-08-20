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
} from 'lucide-react';

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
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Blockchain Blocks',
      value: blockchainStats?.totalBlocks || blockchainStats?.stats?.totalBlocks || 0,
      icon: LinkIcon,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Evidence Tracked',
      value: blockchainStats?.totalEvidence || blockchainStats?.stats?.totalEvidence || 0,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'System Status',
      value: healthStatus?.status === 'ok' || healthStatus ? 'Online' : 'Unknown',
      icon: Activity,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Investigator'}`}
        description="Overview of your forensic evidence and blockchain integrity"
        actions={
          <Link
            to="/evidence/upload"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Evidence
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 rounded-xl border border-slate-700/50 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Evidence */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Evidence</h2>
            <Link
              to="/evidence"
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentEvidence.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderLock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No evidence uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvidence.map((ev) => (
                <Link
                  key={ev._id || ev.evidenceId}
                  to={`/evidence/${ev.evidenceId}`}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FolderLock className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                        {ev.title}
                      </p>
                      <p className="text-xs text-slate-500">{ev.evidenceId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge type="evidenceType" value={ev.type} />
                    <StatusBadge type="verification" value={ev.verificationStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Blockchain Health */}
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Blockchain Health</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
              {healthStatus ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-white">System Health</p>
                <p className="text-xs text-slate-400">
                  {healthStatus?.status === 'ok' ? 'All systems operational' : 'Status unknown'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-purple-400">
                  {blockchainStats?.totalBlocks || blockchainStats?.stats?.totalBlocks || 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">Total Blocks</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-cyan-400">
                  #{blockchainStats?.latestBlock || blockchainStats?.stats?.latestBlock || 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">Latest Block</p>
              </div>
            </div>

            <Link
              to="/blockchain"
              className="block w-full text-center py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-colors"
            >
              Verify Blockchain Integrity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
