import { Zap, Sparkles, TrendingUp, Heart } from "lucide-react";

const ACTIVITIES = [
  { icon: Zap, text: "New Tip: 500 TAB sent to @alex_arts", color: "text-orange-500", glow: "shadow-[0_0_8px_rgba(249,115,22,0.4)]" },
  { icon: Sparkles, text: "@sarahcodes just joined the global map!", color: "text-purple-400", glow: "shadow-[0_0_8px_rgba(168,85,247,0.4)]" },
  { icon: TrendingUp, text: "Network Milestone: 1.2M TAB tipped globally", color: "text-green-400", glow: "shadow-[0_0_8px_rgba(34,197,94,0.4)]" },
  { icon: Heart, text: "Top Supporter: 0x71...4F2a sent a 5,000 TAB tip!", color: "text-pink-500", glow: "shadow-[0_0_8px_rgba(236,72,153,0.4)]" },
  { icon: Zap, text: "New Tip: 250 TAB sent to @priyatech", color: "text-orange-500", glow: "shadow-[0_0_8px_rgba(249,115,22,0.4)]" },
  { icon: Sparkles, text: "@mwright is now a verified creator", color: "text-purple-400", glow: "shadow-[0_0_8px_rgba(168,85,247,0.4)]" },
];

export const ActivityTicker = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0a0514]/90 backdrop-blur-xl border-b border-white/10 h-10 flex items-center overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Live Indicator Badge */}
      <div className="relative z-20 flex items-center h-full bg-orange-600 px-4 gap-2 shadow-[10px_0_30px_rgba(234,88,12,0.3)]">
        <div className="h-2 w-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">Live Activity</span>
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-orange-600 to-transparent translate-x-full" />
      </div>

      <div className="flex whitespace-nowrap animate-marquee items-center pl-10">
        {/* First set of activities */}
        {ACTIVITIES.map((activity, i) => (
          <div key={`a-${i}`} className="flex items-center gap-3 px-10 group cursor-default">
            <div className={`h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors`} />
            <activity.icon className={`h-3.5 w-3.5 ${activity.color} drop-shadow-[0_0_5px_currentColor]`} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80 group-hover:text-white transition-colors">
              {activity.text}
            </span>
            <div className="ml-10 h-4 w-px bg-white/5" />
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {ACTIVITIES.map((activity, i) => (
          <div key={`b-${i}`} className="flex items-center gap-3 px-10 group cursor-default">
            <div className={`h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors`} />
            <activity.icon className={`h-3.5 w-3.5 ${activity.color} drop-shadow-[0_0_5px_currentColor]`} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80 group-hover:text-white transition-colors">
              {activity.text}
            </span>
            <div className="ml-10 h-4 w-px bg-white/5" />
          </div>
        ))}
      </div>

      {/* Decorative neon bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};