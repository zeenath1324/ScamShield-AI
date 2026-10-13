import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export function getRiskConfig(category, score) {
  const cat = (category || '').toLowerCase();
  if (cat === 'high' || score >= 60) {
    return {
      label: 'High Risk',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      textColor: 'text-rose-400',
      barColor: 'bg-rose-500',
      ringColor: '#f43f5e',
      icon: ShieldAlert,
      summary: 'Strong phishing or fraud indicators identified.',
    };
  }
  if (cat === 'suspicious' || score >= 30) {
    return {
      label: 'Suspicious',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      textColor: 'text-amber-400',
      barColor: 'bg-amber-500',
      ringColor: '#f59e0b',
      icon: AlertTriangle,
      summary: 'Notable deception or caution signals observed.',
    };
  }
  return {
    label: 'Low Observed Risk',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    textColor: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    ringColor: '#10b981',
    icon: ShieldCheck,
    summary: 'No prominent deception signatures detected by static rules.',
  };
}

export function RiskBadge({ category, score, size = 'sm' }) {
  const config = getRiskConfig(category, score);
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${
        config.badgeBg
      } ${isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm'}`}
    >
      <Icon className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-75 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
}

export function RiskGauge({ score, category }) {
  const config = getRiskConfig(category, score);
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-inner">
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Circular SVG Meter */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={config.ringColor}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(100, Math.max(0, score)) / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-black tracking-tight ${config.textColor}`}>
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            out of 100
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-1.5 font-bold text-white text-sm">
          <Icon className={`w-4 h-4 ${config.textColor}`} />
          <span>{config.label}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-tight">
          {config.summary}
        </p>
      </div>
    </div>
  );
}
