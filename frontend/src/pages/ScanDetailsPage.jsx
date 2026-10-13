import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { scanApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RiskBadge, RiskGauge } from '../components/RiskScoreBadge';
import Modal from '../components/Modal';
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

export default function ScanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchScan() {
      try {
        const data = await scanApi.getScanById(id);
        setScan(data);
      } catch (err) {
        setError('Scan record not found or unauthorized.');
      } finally {
        setLoading(false);
      }
    }
    fetchScan();
  }, [id]);

  const handleCopy = () => {
    if (!scan) return;
    const text = `ScamShield AI Analysis Details (Scan #${scan.id}):
Type: ${scan.scan_type.toUpperCase()}
Score: ${scan.risk_score}/100 (${scan.risk_category.toUpperCase()})
Preview: ${scan.redacted_input_preview}
Explanation: ${scan.explanation}

Recommended Actions:
${scan.recommended_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

ScamShield AI — Static Cybersecurity Assessment`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Scan details copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await scanApi.deleteScan(id);
      toast.success('Scan successfully deleted.');
      navigate('/history');
    } catch (err) {
      toast.error('Failed to delete scan.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 w-40 bg-slate-900 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-3xl" />
        <div className="h-48 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl w-fit mx-auto border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400">
          This scan record does not exist or you do not have permission to access it.
        </p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <Link
            to="/analyze"
            className="px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </Link>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Delete scan"
            aria-label="Delete scan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {scan.scan_type}
              </span>
              <RiskBadge category={scan.risk_category} score={scan.risk_score} size="sm" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1.5">
              Scan Record #{scan.id}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(scan.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Gauge & Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <RiskGauge score={scan.risk_score} category={scan.risk_category} />
          </div>
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evaluation Breakdown
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {scan.explanation}
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 break-words">
              <span className="text-slate-500 block text-[10px] uppercase font-sans mb-0.5">
                Redacted Preview Log
              </span>
              {scan.redacted_input_preview}
            </div>
          </div>
        </div>

        {/* AI Explanation (if available) */}
        {scan.ai_summary && (
          <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                AI Plain-English Summary
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {scan.ai_summary}
            </p>
          </div>
        )}
      </div>

      {/* Detected Indicators */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">
          Triggered Indicators ({scan.detected_indicators?.length || 0})
        </h3>
        {scan.detected_indicators?.length > 0 ? (
          <div className="space-y-3">
            {scan.detected_indicators.map((ind, i) => (
              <div
                key={ind.id || i}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ind.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : ind.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ind.severity} severity
                    </span>
                    <h4 className="text-xs font-bold text-white">{ind.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{ind.category}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ind.description}</p>
                <div className="text-[11px] text-teal-400/90 bg-teal-500/5 p-2.5 rounded-xl border border-teal-500/10">
                  <strong>Why this matters:</strong> {ind.why_it_matters}
                </div>
                {ind.evidence && (
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded-lg">
                    Evidence snippet: <span className="text-slate-200">"{ind.evidence}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No threat indicators triggered.</p>
        )}
      </div>

      {/* Recommended Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Recommended Actions</h3>
        <div className="space-y-2">
          {scan.recommended_actions?.map((act, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Scan Record"
        description="Are you sure you want to delete this scan record? This action cannot be reversed."
        confirmText="Delete Record"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
