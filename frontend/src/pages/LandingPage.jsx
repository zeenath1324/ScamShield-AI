import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Search,
  MessageSquare,
  FileText,
  Lock,
  ArrowRight,
  AlertTriangle,
  Eye,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 py-4">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide shadow-sm">
          <Zap className="w-3.5 h-3.5 text-teal-400" />
          <span>Next-Generation Cybersecurity Awareness</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Detect suspicious signs. <br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            Understand the risk.
          </span>{' '}
          Stay safer online.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ScamShield AI breaks down deceptive URLs, urgent SMS threats, and phishing emails using transparent static indicators and plain-English safety guidance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            to={isAuthenticated ? '/analyze' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Analyze a Message or URL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-all"
            >
              <span>Sign In to Dashboard</span>
            </Link>
          )}
        </div>

        {/* Security & Non-SSRF Assurance Badge */}
        <div className="pt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Safe Static Analysis — We never execute or automatically visit submitted URLs.</span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Threat Awareness
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Actionable insights that explain the specific manipulation tactics used by fraudsters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">URL Structural Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects IP-address hostnames, deceptive brand typosquatting, high-risk TLDs, punycode, and hidden redirects without triggering remote requests.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Email & SMS Heuristics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies manufactured panic, fake account suspensions, requests for OTPs/passwords, gift card extortion, and bogus package deliveries.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Transparent Risk Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every score (0–100) is grounded in visible, documented rules. No mysterious black-box scores—you see exactly which signals triggered.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Personal Scan History</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Securely track past inquiries, search and filter your records, and view trends in your personal security dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How It Works</h2>
          <p className="text-sm text-slate-400">Three simple steps to assess digital communications safely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-base font-semibold text-white">Input the Suspicious Item</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste the web link, message text, or combine both in our dedicated scanner. Sensitive inputs like passwords or OTPs are redacted.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-base font-semibold text-white">Rule & Threat Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our backend static engine checks against known social engineering cues, spoofed domains, and deceptive syntax without visiting the site.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-base font-semibold text-white">Actionable Safety Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review a transparent score breakdown, understand why each signal is risky, and follow practical steps to safeguard your accounts.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent Ethical Disclaimer Banner */}
      <section className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-amber-200">
        <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-100">Cybersecurity Heuristic Disclaimer</h4>
          <p className="text-xs text-amber-300/90 leading-relaxed">
            Automated analysis tools provide educational risk heuristics, not absolute guarantees. A low score does not guarantee safety, as cybercriminals frequently evolve tactics. When in doubt, always independently verify with the official entity.
          </p>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="text-center p-10 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/60 border border-teal-500/20 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-white">Ready to inspect a suspicious communication?</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Start scanning right now. Create a free account to track your scans and monitor cybersecurity trends.
        </p>
        <div className="pt-2">
          <Link
            to={isAuthenticated ? '/analyze' : '/register'}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-lg transition-all"
          >
            <span>Start Free Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
