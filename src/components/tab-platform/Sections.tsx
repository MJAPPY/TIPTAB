import React from "react";

export const StatsBanner = () => {
  const stats = [
    { label: "Powered by", value: "WebAuth Protocol" },
    { label: "Community", value: "Creators & Athletes" },
    { label: "Network", value: "XPR Network" },
    { label: "Settlement", value: "Instant & Zero Fee" },
    { label: "Ecosystem", value: "TAB Token Rewards" },
    { label: "Security", value: "On-Chain Verified" }
  ];

  return (
    <div className="border-y border-white/5 bg-white/[0.02] py-6 overflow-hidden flex items-center h-20">
      <div className="flex whitespace-nowrap animate-stats-ticker">
        {/* First set of stats */}
        {stats.map((stat, i) => (
          <div key={`a-${i}`} className="flex items-center gap-6 px-12 group">
            <div className="flex flex-col -space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-orange-500 transition-colors duration-500">
                {stat.label}
              </span>
              <span className="text-xl font-black text-white/80 group-hover:text-white transition-colors duration-500 italic tracking-tighter">
                {stat.value}
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {stats.map((stat, i) => (
          <div key={`b-${i}`} className="flex items-center gap-6 px-12 group">
            <div className="flex flex-col -space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-orange-500 transition-colors duration-500">
                {stat.label}
              </span>
              <span className="text-xl font-black text-white/80 group-hover:text-white transition-colors duration-500 italic tracking-tighter">
                {stat.value}
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes stats-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-stats-ticker {
          animation: stats-ticker 30s linear infinite;
        }
        .animate-stats-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};