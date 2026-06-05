import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck, Sparkles, Heart, Car } from "lucide-react";
import { Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";
import { TOKEN_LOGOS } from "@/constants/logos";
import { cn } from "@/lib/utils";

// Import the image file through Vite so it resolves to a valid public URL in the preview iframe
import heroImage from "../../../.dyad/media/7dd414cfd4dba583ba648b6242083b32facc3ab33dacc2cff0f25b3218dcdfc7.jpg";

interface HeroProps {
  creators: Creator[];
  onJoin?: () => void;
}

export const Hero = ({ creators, onJoin }: HeroProps) => {
  const { isMember } = useXpr();
  const previewCreators = creators.slice(0, 4);
  const activeCount = creators.length;

  const rewardTokens = [
    { symbol: "TAB", color: "text-orange-500", glow: "rgba(249,115,22,0.3)" },
    { symbol: "XPR", color: "text-purple-400", glow: "rgba(168,85,247,0.3)" },
    { symbol: "XUSDC", color: "text-green-400", glow: "rgba(34,197,94,0.3)" },
    { symbol: "XMD", color: "text-cyan-400", glow: "rgba(6,182,212,0.3)" },
    { symbol: "METAL", color: "text-slate-400", glow: "rgba(148,163,184,0.3)" },
    { symbol: "LOAN", color: "text-blue-500", glow: "rgba(59,130,246,0.3)" },
    { symbol: "XMT", color: "text-emerald-400", glow: "rgba(16,185,129,0.3)" },
  ];

  return (
    <section className="relative pt-8 md:pt-16 pb-24 md:pb-32 overflow-hidden">
      {/* Background radial spotlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[160px] rounded-full -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Left Content Side */}
          <div className="flex-1 text-left space-y-8 md:space-y-10 max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
              <Heart className="h-4 w-4 text-purple-500 fill-purple-500" />
              <span className="text-white/90 text-xs font-black uppercase tracking-[0.2em]">Powered by XPR Network</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              The Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Appreciation Hub</span>
            </h1>
            
            <div className="space-y-8">
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl leading-relaxed font-medium">
                Whether you're a delivery pro, a fitness coach, a musician, or a digital creator—TIPTAB connects you directly to the people who value your hustle via the <span className="text-purple-400 font-black">XPR Network</span>. Zero fees.
              </p>
              
              <div className="space-y-4">
                <span className="text-white/40 font-black italic tracking-tight text-lg uppercase">Instant rewards in</span>
                <div className="flex flex-wrap items-center gap-8">
                  {rewardTokens.map((token) => (
                    <div key={token.symbol} className="flex flex-col items-center gap-3 group cursor-default">
                      <span className={cn("text-xs md:text-sm font-black italic tracking-tighter uppercase", token.color)}>
                        {token.symbol}
                      </span>
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 group-hover:border-white/20 transition-all shadow-lg" style={{ boxShadow: `0 0 20px ${token.glow}` }}>
                        <img src={TOKEN_LOGOS[token.symbol]} alt={token.symbol} className="w-full h-full object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {!isMember && (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={onJoin}
                    className="w-full h-16 md:h-20 px-10 md:px-14 bg-white text-black hover:bg-orange-600 hover:text-purple-200 rounded-[24px] md:rounded-[32px] font-black text-xl md:text-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all group active:scale-95 animate-shimmer-silver"
                  >
                    Join the Network <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                  <p className="text-[10px] md:text-xs font-bold text-white/30 italic px-2">
                    *wallet connection required to join
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  {previewCreators.map((creator) => (
                    <div 
                      key={creator.id} 
                      className={`h-10 w-10 md:h-12 md:w-12 rounded-full border-4 border-[#0a0514] ${creator.color} flex items-center justify-center font-black text-[10px] overflow-hidden shadow-xl`}
                    >
                      {creator.avatarImage ? (
                        <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
                      ) : (
                        creator.avatar
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-white/40 tracking-wide">
                  Join <span className="text-white/80">{activeCount}</span> active {activeCount === 1 ? 'pro' : 'pros'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4">
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Direct Tipping</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <UserCheck className="h-5 w-5 text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Everyday Hustle</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-colors">
                <Car className="h-5 w-5 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-green-400 transition-colors">Gig Economy Ready</span>
              </div>
            </div>
          </div>
          
          {/* Right Visual Image Showcase Side (Desktop) */}
          <div className="flex-1 relative lg:block hidden">
            <div className="relative z-10 flex items-center justify-center">
              {/* Massive backlighting glows */}
              <div className="absolute w-[450px] h-[450px] bg-purple-600/20 blur-[130px] rounded-full animate-pulse z-0" />
              <div className="absolute w-[350px] h-[350px] bg-orange-500/15 blur-[100px] rounded-full translate-x-12 -translate-y-12 z-0" />
              
              {/* 100% Borderless, Floating Image Container with soft radial gradient masking */}
              <div className="relative max-w-[520px] w-full aspect-[4/3] z-10 flex items-center justify-center [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,1)_35%,rgba(0,0,0,0)_75%)] [-webkit-mask-image:radial-gradient(circle_at_center,rgba(0,0,0,1)_35%,rgba(0,0,0,0)_75%)] select-none pointer-events-none">
                <img 
                  src={heroImage} 
                  alt="TIPTAB Ecosystem Showcase"
                  className="w-full h-full object-cover opacity-85 hover:opacity-100 scale-105 transition-all duration-700 filter contrast-[1.05] saturate-[1.05]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};