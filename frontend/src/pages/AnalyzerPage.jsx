import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { scanApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RiskBadge, RiskGauge } from '../components/RiskScoreBadge';
import {
  ShieldAlert,
  Link as LinkIcon,
  MessageSquare,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function AnalyzerPage() {
  const toast = useToast();
  const [mode, setMode] = useState('url'); // 'url', 'message', 'combined'
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [useAi, setUseAi] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (mode === 'url' && !url.trim()) {
      setError('Please provide a URL or web address to analyze.');
      return;
    }
    if (mode === 'message' && !message.trim()) {
      setError('Please paste the email or message text to analyze.');
      return;
    }
    if (mode === 'combined' && !url.trim() && !message.trim()) {
      setError('Please provide at least a URL or message text for combined analysis.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        scan_type: mode,
        url: url.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        use_ai: useAi,
      };
      const data = await scanApi.analyze(payload);
      setResult(data);
      toast.success('Static threat analysis complete.');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check your inputs.');
      toast.error(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUrl('');
    setSubject('');
    setMessage('');
    setError('');
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `ScamShield AI Analysis Summary:
Type: ${result.scan_type.toUpperCase()}
Risk Score: ${result.risk_score}/100 (${result.risk_category.toUpperCase()})
Preview: ${result.redacted_input_preview}
Indicators Found: ${result.detected_indicators.length}
${result.explanation}

Recommended Next Steps:
${result.recommended_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Disclaimer: Heuristic static assessment for cybersecurity awareness.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Analysis summary copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Security Threat Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Static inspection of suspicious URLs, emails, SMS notices, and social engineering indicators.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Static text analysis only — Target URLs are never visited or executed.</span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] text-teal-400">
          SSRF-Protected
        </span>
      </div>

      {!result ? (
        /* Analyzer Input Form */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('url');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'url'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>URL Scan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('message');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'message'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message / SMS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('combined');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'combined'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Combined</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Mode A: URL input */}
            {(mode === 'url' || mode === 'combined') && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300" htmlFor="scan-url">
                    Target URL or Domain
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {url.length} / 2048 chars
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="scan-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    maxLength={2048}
                    placeholder="e.g. http://paypal-verify-account.xyz/login or bit.ly/3xY89Ab"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Mode B: Message inputs */}
            {(mode === 'message' || mode === 'combined') && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="scan-subject">
                    Subject Line <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="scan-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={500}
                    placeholder="e.g. Urgent Notice: Account Temporarily Suspended"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-300" htmlFor="scan-msg">
                      Message Body / SMS Text
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {message.length} / 15000 chars
                    </span>
                  </div>
                  <textarea
                    id="scan-msg"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={15000}
                    placeholder="Paste the suspicious email, SMS, or direct message text here..."
                    className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all leading-relaxed font-sans"
                  />
                </div>
              </>
            )}

            {/* AI Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    AI Plain-English Enrichment
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Use optional Groq LLM to generate plain-language explanations if configured.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  <span>Evaluating Static Threat Indicators...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Analyze Threat Signals</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Scan Result Presentation */
        <div className="space-y-6">
          {/* Top Result Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {result.scan_type}
                  </span>
                  <span className="text-xs text-slate-500">
                    Analyzed on {new Date(result.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                  Threat Assessment Result
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>

            {/* Score & Explanation Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <RiskGauge score={result.risk_score} category={result.risk_category} />
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Summary Assessment
                  </span>
                  <RiskBadge category={result.risk_category} score={result.risk_score} />
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {result.explanation}
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 break-words">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans mb-0.5">
                    Sanitized Preview
                  </span>
                  {result.redacted_input_preview}
                </div>
              </div>
            </div>

            {/* AI Explanation Card (if generated) */}
            {result.ai_summary && (
              <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30 space-y-2">
                <div className="flex items-center gap-2 text-teal-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Plain-English AI Explanation
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.ai_summary}
                </p>
              </div>
            )}
          </div>

          {/* Detected Indicators List */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Detected Indicators ({result.detected_indicators.length})
              </h3>
              <span className="text-xs text-slate-500">Deduplicated Signals</span>
            </div>

            {result.detected_indicators.length > 0 ? (
              <div className="space-y-3">
                {result.detected_indicators.map((ind, i) => (
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
                      <span className="text-[10px] font-mono text-slate-500">
                        {ind.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ind.description}
                    </p>

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
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                No threat indicators or deception signatures were detected in this sample.
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Recommended Safety Steps</h3>
            <div className="space-y-2.5">
              {result.recommended_actions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300"
                >
                  <div className="p-1 bg-teal-500/10 text-teal-400 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation link back to history */}
          <div className="flex justify-between items-center px-2">
            <Link
              to="/history"
              className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>View in Scan History</span>
            </Link>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Scan Another Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
