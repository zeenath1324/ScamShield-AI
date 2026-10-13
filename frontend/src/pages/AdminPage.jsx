import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Users,
  Database,
  PieChart as PieIcon,
  Activity,
  Layers,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function AdminPage() {
  const toast = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await dashboardApi.getAdminMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message || 'Failed to load administrator metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-20 bg-slate-900 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-900 rounded-2xl" />
          <div className="h-32 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-xs text-rose-300 bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <h2 className="text-sm font-bold text-white mb-1">Access Denied / Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
              Admin Role Authorized
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Metrics Console</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Privacy-preserving aggregate metrics across all active accounts.
          </p>
        </div>
        <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Platform Users
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {metrics?.total_users || 0}
            </div>
          </div>
          <div className="p-3 bg-slate-800 text-teal-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Platform Scans
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {metrics?.total_scans || 0}
            </div>
          </div>
          <div className="p-3 bg-slate-800 text-cyan-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scans by Type */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Scans by Input Type</span>
          </h2>
          <div className="space-y-3">
            {Object.entries(metrics?.scans_by_type || {}).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
              >
                <span className="font-mono uppercase text-slate-300">{type}</span>
                <span className="font-bold text-teal-400">{count}</span>
              </div>
            ))}
            {Object.keys(metrics?.scans_by_type || {}).length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">No scans recorded yet.</p>
            )}
          </div>
        </div>

        {/* Scans by Risk */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            <span>Scans by Risk Band</span>
          </h2>
          <div className="space-y-3">
            {Object.entries(metrics?.scans_by_risk || {}).map(([risk, count]) => (
              <div
                key={risk}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
              >
                <span className="font-mono uppercase text-slate-300">{risk}</span>
                <span
                  className={`font-bold ${
                    risk === 'high'
                      ? 'text-rose-400'
                      : risk === 'suspicious'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(metrics?.scans_by_risk || {}).length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">No scans recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-500">
        <Lock className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          Administrator safety policy: Raw messages, plain credentials, and personal browsing records are excluded from platform reporting to preserve user confidentiality.
        </span>
      </div>
    </div>
  );
}
