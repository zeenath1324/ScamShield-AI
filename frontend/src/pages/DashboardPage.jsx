import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';
import { RiskBadge } from '../components/RiskScoreBadge';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  Lightbulb,
  Shield,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900 rounded-3xl lg:col-span-2" />
          <div className="h-80 bg-slate-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  const dist = stats?.risk_distribution || { low: 0, suspicious: 0, high: 0 };
  const chartData = [
    { name: 'Low Risk', count: dist.low, color: '#10b981' },
    { name: 'Suspicious', count: dist.suspicious, color: '#f59e0b' },
    { name: 'High Risk', count: dist.high, color: '#f43f5e' },
  ];

  const hasScans = stats?.total_scans > 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Here is your live cybersecurity threat activity summary.
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Threat Scan</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Scans
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.total_scans || 0}
            </div>
          </div>
          <div className="p-3 bg-slate-800 text-teal-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              High Risk
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.high_risk_count || 0}
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Suspicious */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Suspicious
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.suspicious_count || 0}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Low Observed Risk */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Low Risk
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.low_risk_count || 0}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">
                Risk Distribution
              </h2>
              <span className="text-xs text-slate-500 font-mono">Actual User Records</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of risk severity across all of your completed scans.
            </p>
          </div>

          {hasScans ? (
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
              <Shield className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No scan records yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[180px]">
                Perform your first scan to visualize your risk distribution.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center text-xs">
            <div>
              <span className="block text-emerald-400 font-bold">{dist.low}</span>
              <span className="text-[10px] text-slate-500">Low</span>
            </div>
            <div>
              <span className="block text-amber-400 font-bold">{dist.suspicious}</span>
              <span className="text-[10px] text-slate-500">Suspicious</span>
            </div>
            <div>
              <span className="block text-rose-400 font-bold">{dist.high}</span>
              <span className="text-[10px] text-slate-500">High</span>
            </div>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-tight">Recent Scans</h2>
              <Link
                to="/history"
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats?.recent_scans?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_scans.map((scan) => (
                  <Link
                    key={scan.id}
                    to={`/scans/${scan.id}`}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/40 flex items-center justify-between gap-4 transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {scan.scan_type}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate font-mono">
                        {scan.normalized_url || scan.redacted_input_preview}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <RiskBadge category={scan.risk_category} score={scan.risk_score} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No scans logged yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit a URL or message to test our rule-based detection engine.
                </p>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25 rounded-xl text-xs font-bold transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start Your First Scan</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cybersecurity Tips Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Cybersecurity Awareness Tips
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {stats?.safety_tips?.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
            >
              <h3 className="text-xs font-bold text-slate-200">{t.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
