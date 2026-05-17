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
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-black/60 backdrop-blur-md border-b border-white/5 h-10 flex items-center overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* First set of activities */}
        {ACTIVITIES.map((activity, i) => (
          <div key={`a-${i}`} className="flex items-center gap-2 px-8">
            <activity.icon className={`h-3 w-3 ${activity.color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {activity.text}
            </span>
            <span className="ml-8 text-white/10">•</span>
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {ACTIVITIES.map((activity, i) => (
          <div key={`b-${i}`} className="flex items-center gap-2 px-8">
            <activity.icon className={`h-3 w-3 ${activity.color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {activity.text}
            </span>
            <span className="ml-8 text-white/10">•</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};