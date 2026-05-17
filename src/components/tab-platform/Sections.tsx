export const StatsBanner = () => {
  const stats = [
    { label: "Powered by", value: "WebAuth Protocol" },
    { label: "Community", value: "Creators & Athletes" },
    { label: "Network", value: "XPR Network" },
    { label: "Settlement", value: "Instant & Zero Fee" }
  ];

  return (
    <div className="border-y border-white/5 bg-white/[0.02] py-8 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 group">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-orange-500 transition-colors">
                {stat.label}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-white/80 group-hover:text-white transition-colors">
                  {stat.value}
                </span>
                <div className="h-1 w-1 rounded-full bg-purple-500 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};