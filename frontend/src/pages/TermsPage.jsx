import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-400">
          User guidelines and educational scope for ScamShield AI.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
        <div className="flex items-center gap-3 text-teal-400">
          <FileText className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">1. Educational & Awareness Purpose</h2>
        </div>
        <p>
          ScamShield AI provides heuristic analysis intended solely to assist users in identifying common social engineering cues, deceptive domain structures, and urgency triggers. It does not replace professional digital forensics or antivirus software.
        </p>

        <div className="flex items-center gap-3 text-amber-400 pt-4 border-t border-slate-800">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">2. No Guarantee of Absolute Safety or Fraud</h2>
        </div>
        <p>
          Automated rule matching and language heuristics are probabilistic indicators. A "Low Observed Risk" result does not guarantee that an unknown web page or message is safe, and a "High Risk" result does not constitute legal proof of malicious conduct. Users remain solely responsible for verifying the authenticity of communications before sharing credentials or funds.
        </p>

        <div className="flex items-center gap-3 text-teal-400 pt-4 border-t border-slate-800">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">3. Acceptable Use</h2>
        </div>
        <p>
          Users agree not to use ScamShield AI to conduct denial-of-service attempts, attempt unauthorized access to other accounts, bypass platform rate limits, or reverse-engineer the heuristic engine for malicious evasion purposes.
        </p>
      </div>
    </div>
  );
}
