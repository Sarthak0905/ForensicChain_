import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { evidenceAPI } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FolderLock, Search, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const evidenceTypes = ['all', 'image', 'document', 'video', 'audio', 'network_log', 'system_log', 'other'];

export default function EvidenceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    caseId: searchParams.get('caseId') || '',
    type: searchParams.get('type') || 'all',
  });

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchEvidence = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (filters.caseId) params.caseId = filters.caseId;
        if (filters.type && filters.type !== 'all') params.type = filters.type;

        const res = await evidenceAPI.list(params);
        const data = res.data;
        setEvidence(data.evidence || data.data || []);
        setPagination({
          page: data.currentPage || data.page || page,
          totalPages: data.totalPages || 1,
          total: data.total || data.totalRecords || 0,
        });
      } catch (err) {
        console.error('Error fetching evidence:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, [page, filters.caseId, filters.type]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSearchParams((prev) => {
      if (value && value !== 'all') prev.set(key, value);
      else prev.delete(key);
      prev.set('page', '1');
      return prev;
    });
  };

  const goToPage = (p) => {
    setSearchParams((prev) => {
      prev.set('page', String(p));
      return prev;
    });
  };

  return (
    <div>
      <PageHeader
        title="Evidence"
        description={`${pagination.total} total evidence records`}
        actions={
          <Link
            to="/evidence/upload"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.caseId}
            onChange={(e) => handleFilterChange('caseId', e.target.value)}
            placeholder="Search by Case ID..."
            className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
          />
        </div>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
        >
          {evidenceTypes.map((t) => (
            <option key={t} value={t}>
              {t === 'all' ? 'All Types' : t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Evidence List */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading evidence..." />
      ) : evidence.length === 0 ? (
        <EmptyState
          icon={FolderLock}
          title="No evidence found"
          description="Upload your first piece of evidence to get started."
          action={{ label: 'Upload Evidence', onClick: () => window.location.href = '/evidence/upload' }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {evidence.map((ev) => (
              <Link
                key={ev._id || ev.evidenceId}
                to={`/evidence/${ev.evidenceId}`}
                className="block bg-slate-900 rounded-xl border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <FolderLock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                        {ev.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-xs text-slate-500 font-mono">{ev.evidenceId}</span>
                        {ev.caseId && (
                          <span className="text-xs text-slate-500">
                            Case: <span className="text-slate-400">{ev.caseId}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge type="evidenceType" value={ev.type} />
                    <StatusBadge type="verification" value={ev.verificationStatus} />
                    {ev.createdAt && (
                      <span className="text-xs text-slate-500 hidden lg:inline">
                        {format(new Date(ev.createdAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                {ev.description && (
                  <p className="text-xs text-slate-500 mt-2 ml-8 line-clamp-1">{ev.description}</p>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
