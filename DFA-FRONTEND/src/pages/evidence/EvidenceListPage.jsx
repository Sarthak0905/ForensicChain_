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
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Evidence Registry"
        description={`${pagination.total} total evidence records`}
        actions={
          <Link
            to="/evidence/upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.caseId}
            onChange={(e) => handleFilterChange('caseId', e.target.value)}
            placeholder="Search by Case ID..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-sm"
          />
        </div>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-sm min-w-[150px]"
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {evidence.map((ev) => (
              <Link
                key={ev._id || ev.evidenceId}
                to={`/evidence/${ev.evidenceId}`}
                className="block p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                      <FolderLock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {ev.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-slate-500 font-mono">{ev.evidenceId}</span>
                        {ev.caseId && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            Case: <span className="font-medium text-slate-700">{ev.caseId}</span>
                          </span>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ev.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge type="evidenceType" value={ev.type} />
                    <StatusBadge type="verification" value={ev.verificationStatus} />
                    {ev.createdAt && (
                      <span className="text-xs font-medium text-slate-400 hidden lg:inline border-l border-slate-200 pl-3 ml-1">
                        {format(new Date(ev.createdAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
              <p className="text-sm text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
