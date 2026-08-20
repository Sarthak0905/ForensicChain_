import { useState, useEffect } from 'react';
import { blockchainAPI } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Link as LinkIcon,
  ShieldCheck,
  Database,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BlockchainPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await blockchainAPI.getStats();
        setStats(res.data.stats || res.data);
      } catch (err) {
        console.error('Error fetching blockchain stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setIntegrityResult(null);
    try {
      const res = await blockchainAPI.verifyIntegrity();
      setIntegrityResult(res.data);
      const isValid = res.data.isValid || res.data.valid || res.data.integrity;
      toast[isValid ? 'success' : 'error'](
        isValid ? 'Blockchain integrity verified!' : 'Blockchain integrity check failed!'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Integrity check failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading blockchain data..." />;

  const statCards = [
    {
      label: 'Total Blocks',
      value: stats?.totalBlocks || 0,
      icon: Database,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Evidence Records',
      value: stats?.totalEvidence || 0,
      icon: LinkIcon,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Latest Block',
      value: `#${stats?.latestBlock || stats?.latestBlockNumber || 0}`,
      icon: Hash,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Last Activity',
      value: stats?.latestTimestamp
        ? format(new Date(stats.latestTimestamp), 'MMM d, HH:mm')
        : '—',
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ];

  const isValid = integrityResult?.isValid || integrityResult?.valid || integrityResult?.integrity;

  return (
    <div>
      <PageHeader
        title="Blockchain Ledger"
        description="Internal blockchain for evidence integrity and tamper-proof auditing"
        actions={
          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Verify Integrity
              </>
            )}
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
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

      {/* Integrity Result */}
      {integrityResult && (
        <div className={`rounded-xl border p-6 mb-8 ${
          isValid
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-red-500/5 border-red-500/30'
        }`}>
          <div className="flex items-start gap-4">
            {isValid ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400 shrink-0" />
            )}
            <div>
              <h3 className={`text-lg font-semibold ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                {isValid ? 'Blockchain Integrity Verified' : 'Integrity Check Failed'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {isValid
                  ? 'All blocks have been verified. Hash continuity is intact and no tampering was detected across the entire chain.'
                  : 'WARNING: One or more blocks have inconsistent hashes. The chain may have been tampered with.'}
              </p>
              {integrityResult.totalBlocks && (
                <p className="text-xs text-slate-500 mt-2">
                  {integrityResult.totalBlocks} blocks verified •{' '}
                  {integrityResult.blocksVerified || integrityResult.totalBlocks} passed
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Visual */}
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className={`w-24 h-20 rounded-lg border flex flex-col items-center justify-center p-2 ${
                i === 0 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800 border-slate-700'
              }`}>
                <Hash className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-xs text-white font-medium">Block #{i}</span>
                <span className="text-[10px] text-slate-500">{i === 0 ? 'Genesis' : 'Evidence'}</span>
              </div>
              {i < 4 && (
                <div className="flex items-center">
                  <div className="w-6 h-px bg-cyan-500/50" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-cyan-500/50" />
                </div>
              )}
            </div>
          ))}
          <div className="text-slate-500 text-sm pl-2">...</div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Each block contains a SHA-256 hash of its contents and the previous block's hash, creating an immutable chain. 
          Any modification to a block invalidates all subsequent blocks.
        </p>
      </div>
    </div>
  );
}
