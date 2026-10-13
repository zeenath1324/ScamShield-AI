import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { scanApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RiskBadge } from '../components/RiskScoreBadge';
import Modal from '../components/Modal';
import {
  History,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export default function HistoryPage() {
  const toast = useToast();
  const [scans, setScans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskCategory, setRiskCategory] = useState('all');
  const [scanType, setScanType] = useState('all');
  const [sort, setSort] = useState('newest');

  // Deletion modals
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scanApi.getScans({
        search: search.trim(),
        risk_category: riskCategory,
        scan_type: scanType,
        sort,
        page,
        page_size: 10,
      });
      setScans(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      toast.error('Failed to load scan records.');
    } finally {
      setLoading(false);
    }
  }, [search, riskCategory, scanType, sort, page, toast]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const handleDeleteSingle = async () => {
    if (!deleteTargetId) return;
    setIsDeletingSingle(true);
    try {
      await scanApi.deleteScan(deleteTargetId);
      toast.success('Scan deleted successfully.');
      setDeleteTargetId(null);
      fetchScans();
    } catch (err) {
      toast.error('Failed to delete scan.');
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      await scanApi.clearAllScans();
      toast.success('All scan history has been cleared.');
      setIsClearAllOpen(false);
      fetchScans();
    } catch (err) {
      toast.error('Failed to clear scans.');
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Scan History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View, search, and manage your saved security evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {total > 0 && (
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          )}
          <Link
            to="/analyze"
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search URL or preview..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Risk Filter */}
        <select
          value={riskCategory}
          onChange={(e) => {
            setRiskCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="suspicious">Suspicious</option>
          <option value="low">Low Risk</option>
        </select>

        {/* Scan Type Filter */}
        <select
          value={scanType}
          onChange={(e) => {
            setScanType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">All Scan Types</option>
          <option value="url">URL Scans</option>
          <option value="message">Message / SMS</option>
          <option value="combined">Combined</option>
        </select>

        {/* Sorting */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-300 outline-none cursor-pointer"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="highest_risk">Sort: Highest Risk</option>
        </select>
      </div>

      {/* Scans List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-900/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : scans.length > 0 ? (
        <div className="space-y-3">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {scan.scan_type}
                  </span>
                  <RiskBadge category={scan.risk_category} score={scan.risk_score} size="sm" />
                  <span className="text-[11px] text-slate-500">
                    {new Date(scan.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-mono truncate">
                  {scan.normalized_url || scan.redacted_input_preview}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {scan.explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <Link
                  to={`/scans/${scan.id}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setDeleteTargetId(scan.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete scan"
                  aria-label="Delete scan record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-2 text-xs text-slate-400">
              <span>
                Showing {scans.length} of {total} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-white disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-white disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center p-8 border border-dashed border-slate-800 rounded-3xl space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No scan records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || riskCategory !== 'all' || scanType !== 'all'
              ? 'No scans matched your active search filters.'
              : 'You have not evaluated any URLs or messages yet.'}
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all mt-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Perform a New Scan</span>
          </Link>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Scan Record"
        description="Are you sure you want to permanently delete this scan record? This action cannot be undone."
        confirmText="Delete Record"
        isDanger={true}
        isLoading={isDeletingSingle}
      />

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Scan History"
        description="Are you sure you want to delete all stored scans from your account? All history and threat indicators will be permanently purged."
        confirmText="Clear All History"
        isDanger={true}
        isLoading={isClearingAll}
      />
    </div>
  );
}
