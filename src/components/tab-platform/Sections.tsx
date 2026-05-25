import React from "react";
import { TOKEN_LOGOS } from "@/constants/logos";

export const StatsBanner = () => {
  const stats = [
    { label: "Powered by", value: "WebAuth Protocol", color: "text-purple-400" },
    { 
      label: "Instant rewards in", 
      value: (
        <span className="flex items-center gap-4">
          {[
            { s: 'TAB', c: 'text-orange-500' },
            { s: 'XPR', c: 'text-purple-400' },
            { s: 'XUSDC', c: 'text-green-400' },
            { s: 'XMD', c: 'text-cyan-400' },
            { s: 'METAL', c: 'text-slate-400' },
            { s: 'LOAN', c: 'text-blue-500' }
          ].map(t => (
            <span key={t.s} className="flex items-center gap-1.5 group/token">
              <img src={TOKEN_LOGOS[t.s]} alt={t.s} className="h-5 w-5 object-contain group-hover/token:scale-125 transition-transform" />
              <span className={t.c}>{t.s}</span>
            </span>
          ))}
        </span>
      ), 
      isCustom: true 
    },
    { label: "Settlement", value: "Instant & Zero Fee", color: "text-green-400" },
    { label: "Platform", value: "TAB Token Rewards", color: "text-blue-400" },
    { label: "Security", value: "On-Chain Verified", color: "text-orange-400" },
    { label: "Ecosystem", value: "Global XPR Network", color: "text-purple-400" }
  ];

  return (
    <div className="relative border-y border-white/10 bg-black/40 backdrop-blur-sm py-8 overflow-hidden flex items-center h-24">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-stats-ticker">
        {stats.map((stat, i) => (
          <div key={`a-${i}`} className="flex items-center gap-8 px-16 group">
            <div className="flex flex-col -space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-orange-500 transition-colors duration-500">
                {stat.label}
              </span>
              {(stat as any).isCustom ? (
                <div className="text-2xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-105">
                  {stat.value}
                </div>
              ) : (
                <span className={`text-2xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-105 ${stat.color}`}>
                  {stat.value}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-md rounded-full opacity-50 animate-pulse" />
              <div className="h-2.5 w-2.5 rounded-full bg-white relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        ))}
        {stats.map((stat, i) => (
          <div key={`b-${i}`} className="flex items-center gap-8 px-16 group">
            <div className="flex flex-col -space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-orange-500 transition-colors duration-500">
                {stat.label}
              </span>
              {(stat as any).isCustom ? (
                <div className="text-2xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-105">
                  {stat.value}
                </div>
              ) : (
                <span className={`text-2xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-105 ${stat.color}`}>
                  {stat.value}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-md rounded-full opacity-50 animate-pulse" />
              <div className="h-2.5 w-2.5 rounded-full bg-white relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes stats-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-stats-ticker {
          animation: stats-ticker 40s linear infinite;
        }
        .animate-stats-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};