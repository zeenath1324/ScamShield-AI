import React from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon, Info, Target, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          About ScamShield AI
        </h1>
        <p className="text-base text-slate-400 max-w-xl mx-auto">
          Democratizing cybersecurity awareness through transparent, explainable threat inspection.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 text-teal-400">
          <Target className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Our Mission</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Phishing and online impersonation attacks exploit psychological triggers: artificial panic, sudden threats of account suspension, or unearned prize claims. Many victims fall prey because warning signs are hidden in complex URLs or coercive language.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>ScamShield AI</strong> was built to make these threat mechanics understandable for everyone. Instead of giving opaque "risk numbers" without explanation, our platform pinpoints the precise indicators present in suspicious text and links—teaching users how to spot deception before harm occurs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Responsible & Safe Design</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
            <li>
              • <strong>Strictly Static Inspection:</strong> The analyzer never visits, resolves, or executes submitted URLs, preventing SSRF or malicious script execution.
            </li>
            <li>
              • <strong>Privacy Redaction:</strong> Candidate passwords, PINs, OTP codes, and payment numbers are redacted before storing logs.
            </li>
            <li>
              • <strong>User Isolation:</strong> Every user’s scan records and history remain strictly private and accessible only to their authenticated account.
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
            <AlertOctagon className="w-5 h-5" />
            <span>Limitations & Honest Scope</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
            <li>
              • <strong>Provisional Heuristics:</strong> Risk scores are indicative heuristics (0–100), not mathematical probabilities or safety guarantees.
            </li>
            <li>
              • <strong>No Unearned Certifications:</strong> ScamShield AI does not claim unearned government or third-party accreditations.
            </li>
            <li>
              • <strong>Always Verify Independently:</strong> The lack of detected indicators does not mean an unknown URL or message is completely safe.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
