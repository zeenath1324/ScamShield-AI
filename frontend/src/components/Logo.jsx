import React from 'react';

export default function Logo({ size = 'md', showTagline = false }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSize = isSm ? 'w-6 h-6' : isLg ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-indigo-950 border border-teal-500/40 shadow-lg shadow-teal-950/30">
        <svg
          className={`${iconSize} text-teal-400`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" strokeWidth="2.5" className="text-cyan-300" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse shadow-sm shadow-teal-400" />
      </div>
      <div>
        <div className={`font-black tracking-tight text-white ${titleSize} flex items-center gap-1`}>
          <span>ScamShield</span>
          <span className="text-teal-400">AI</span>
        </div>
        {showTagline && (
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Detect suspicious signs. Stay safer online.
          </p>
        )}
      </div>
    </div>
  );
}
