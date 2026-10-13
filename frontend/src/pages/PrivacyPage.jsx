import React from 'react';
import { Lock, EyeOff, Database, Trash2, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-400">
          Transparent data handling practices for ScamShield AI.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
        <div className="flex items-center gap-3 text-teal-400">
          <Database className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">What Information We Store</h2>
        </div>
        <p>
          When you register and use ScamShield AI, we collect minimal data required to provide the awareness service:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs text-slate-400">
          <li><strong>Account Data:</strong> Full name, email address, and an Argon2/bcrypt-derived cryptographic password hash. We never store or log plaintext passwords.</li>
          <li><strong>Sanitized Scan Metadata:</strong> The selected scan type (URL, message, combined), normalized domain, heuristic risk score, triggered indicator IDs, and analysis timestamps.</li>
          <li><strong>Redacted Preview Only:</strong> We avoid storing raw unredacted message text. High-sensitivity tokens (candidate credit card sequences, 6-digit OTP codes, SSNs, and explicit password strings) are automatically masked before persisting records.</li>
        </ul>

        <div className="flex items-center gap-3 text-teal-400 pt-4 border-t border-slate-800">
          <EyeOff className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">How Your Scans Are Protected</h2>
        </div>
        <p>
          Every scan record is strictly linked to your unique user ID and protected by backend authorization checks. No user can view, search, or delete another user's scan history.
        </p>

        <div className="flex items-center gap-3 text-teal-400 pt-4 border-t border-slate-800">
          <Trash2 className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">User Control & Data Deletion</h2>
        </div>
        <p>
          You retain complete ownership over your activity. You can delete individual scans or clear your entire scan history at any time from the Scan History page. You can also permanently delete your account and all associated data from Account Settings.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
          <strong>Notice:</strong> ScamShield AI is an independent cybersecurity awareness application. We do not claim external governmental or commercial compliance certifications that have not been formally audited and awarded.
        </div>
      </div>
    </div>
  );
}
