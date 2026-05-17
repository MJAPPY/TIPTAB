import { Zap, Sparkles, TrendingUp, Heart } from "lucide-react";

const ACTIVITIES = [
  { icon: Zap, text: "New Tip: 500 TAB sent to @alex_arts", color: "text-orange-500" },
  { icon: Sparkles, text: "@sarahcodes just joined the global map!", color: "text-purple-400" },
  { icon: TrendingUp, text: "Network Milestone: 1.2M TAB tipped globally", color: "text-green-400" },
  { icon: Heart, text: "Top Supporter: 0x71...4F2a sent a 5,000 TAB tip!", color: "text-pink-500" },
  { icon: Zap, text: "New Tip: 250 TAB sent to @priyatech", color: "text-orange-500" },
  { icon: Sparkles, text: "@mwright is now a verified creator", color: "text-purple-400" },
];

export const ActivityTicker = () => {
  // Helper to highlight handles in the text
  const formatText = (text: string, colorClass: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className={`${colorClass} brightness-125 drop-shadow-[0_0_8px_currentColor] font-black`}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed top-32 left-0 right-0 z-40 bg-[#0a0514]/60 backdrop-blur-xl border-y border-white/5 h-10 flex items-center overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      {/* Live Indicator Badge */}
      <div className="relative z-20 flex items-center h-full bg-orange-600/90 px-4 gap-2">
        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">Live Feed</span>
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0514]/0 to-transparent translate-x-full" />
      </div>

      <div className="flex whitespace-nowrap animate-marquee items-center pl-10">
        {/* First set of activities */}
        {ACTIVITIES.map((activity, i) => (
          <div key={`a-${i}`} className="flex items-center gap-3 px-10 group cursor-default">
            <div className={`h-1 w-1 rounded-full bg-white/10 group-hover:bg-white/40 transition-colors`} />
            <activity.icon className={`h-3 w-3 ${activity.color} drop-shadow-[0_0_5px_currentColor]`} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60 group-hover:text-white transition-colors">
              {formatText(activity.text, activity.color)}
            </span>
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {ACTIVITIES.map((activity, i) => (
          <div key={`b-${i}`} className="flex items-center gap-3 px-10 group cursor-default">
            <div className={`h-1 w-1 rounded-full bg-white/10 group-hover:bg-white/40 transition-colors`} />
            <activity.icon className={`h-3 w-3 ${activity.color} drop-shadow-[0_0_5px_currentColor]`} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60 group-hover:text-white transition-colors">
              {formatText(activity.text, activity.color)}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
};