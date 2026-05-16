export const StatsBanner = () => {
  const stats = [
    { label: "Powered by TAB", value: "Wallet" },
    { label: "Creators - Athletes - Professionals", value: "Community" },
    { label: "On XPR Network", value: "Network" },
    { label: "Direct to Creator", value: "Transparency" }
  ];

  return (
    <div className="border-y border-white/5 bg-white/2 py-4">
      <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[800px] gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 group-hover:scale-150 transition-transform" />
              <span className="text-white/60 font-medium whitespace-nowrap">{stat.label}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};