import React from "react";

export const StatsBanner = () => {
  const stats = [
    { label: "Powered by", value: "WebAuth Protocol", color: "text-purple-400" },
    { label: "Community", value: "XPR Network Creators & Athletes", color: "text-orange-400" },
    { label: "Settlement", value: "Instant & Zero Fee", color: "text-green-400" },
    { label: "Platform", value: "TAB Token Rewards", color: "text-blue-400" },
    { label: "Security", value: "On-Chain Verified", color: "text-orange-400" },
    { label: "Ecosystem", value: "Global XPR Network Hub", color: "text-purple-400" }
  ];

  return (
    <div className="relative border-y border-white/10 bg-black/40 backdrop-blur-sm py-8 overflow-hidden flex items-center h-24">
      {/* Subtle background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-stats-ticker">
        {/* First set of stats */}
        {stats.map((stat, i) => (
          <div key={`a-${i}`} className="flex items-center gap-8 px-16 group">
            <div className="flex flex-col -space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-orange-500 transition-colors duration-500">
                {stat.label}
              </span>
              <span className={`text-2xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-105 ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-md rounded-full opacity-50 animate-pulse" />
              <div className="h-2.5 w-2.5 rounded-full bg-white relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {stats.map((stat, i) => (
          <div key={`b-${i}`} className="flex items-center gap-8 px-16 group">
            <div className="flex flex-col -space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-orange-500 transition-colors duration-500">
                {stat.label}
              </span>
              <span className={`text-2xl font-black italic tracking-tighter transition-all duration-500 group-hover:scale-105 ${stat.color}`}>
                {stat.value}
              </span>
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