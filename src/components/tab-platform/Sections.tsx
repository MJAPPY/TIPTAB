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

export const CreatorMap = () => {
  return (
    <section className="py-20 container mx-auto px-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        </div>
        <h2 className="text-xl font-bold">Creators Around the World</h2>
        <span className="text-white/40 text-sm">— click a pin to tip</span>
      </div>
      
      <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.1)]">
        <img 
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/90265c21d05a59e62dd0e06141ae2cf8-9XfX1XfX1XfX1XfX1XfX1XfX1XfX1X.PNG" 
          alt="World Map" 
          className="w-full object-cover opacity-80"
          onError={(e) => {
            e.currentTarget.src = "https://placeholder.svg?text=World+Map+with+Pins";
          }}
        />
        
        {/* Glow Overlay */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[40px] pointer-events-none" />
      </div>
    </section>
  );
};