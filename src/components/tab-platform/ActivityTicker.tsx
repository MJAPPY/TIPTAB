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
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0a0514]/60 backdrop-blur-xl border-b border-white/5 h-10 flex items-center overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      {/* Live Indicator Badge with Enhanced Blend */}
      <div className="relative z-30 flex items-center h-full pl-6 pr-32">
        {/* Main Badge Background with Long Gradient Falloff */}
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-orange-600 via-orange-600 to-transparent opacity-90 shadow-[inset_-20px_0_40px_-20px_rgba(0,0,0,0.5)]" />
        
        {/* Extra glowing edge blur */}
        <div className="absolute inset-y-0 right-16 w-24 bg-orange-500/20 blur-xl pointer-events-none" />
        
        <div className="relative z-20 flex items-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white whitespace-nowrap drop-shadow-lg">
            Live Feed
          </span>
        </div>
      </div>

      <div className="flex whitespace-nowrap animate-marquee items-center pl-4 relative z-10">
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