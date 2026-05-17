import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck, Sparkles, Globe, Heart, Rocket } from "lucide-react";
import { Creator } from "@/data/creators";

interface HeroProps {
  creators: Creator[];
}

export const Hero = ({ creators }: HeroProps) => {
  const previewCreators = creators.slice(0, 4);
  const formattedCount = (10 + (creators.length / 1000)).toFixed(1);

  return (
    <section className="relative pt-8 md:pt-16 pb-24 md:pb-32 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[160px] rounded-full -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <div className="flex-1 text-left space-y-8 md:space-y-10 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <Heart className="h-4 w-4 text-purple-500 fill-purple-500" />
              <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Network Powered by XPR</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white">
              The Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Appreciation Hub</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/40 max-w-2xl leading-relaxed font-medium">
              Direct connection for delivery pros, coaches, and creators to their fans via the <span className="text-white font-black">XPR Network</span>. Zero fees. <span className="text-orange-500 italic">Instant TAB settlement.</span>
            </p>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-2 md:pt-4">
              {[
                { icon: Zap, text: "Direct Tipping", color: "text-orange-500" },
                { icon: UserCheck, text: "Everyday Hustle", color: "text-purple-500" },
                { icon: Rocket, text: "Gig Economy", color: "text-cyan-400" }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] px-6 py-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <badge.icon className={cn("h-5 w-5 fill-current", badge.color)} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{badge.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {previewCreators.map((creator) => (
                  <div 
                    key={creator.id} 
                    className={`h-14 w-14 rounded-2xl border-4 border-[#0a0514] ${creator.color} flex items-center justify-center font-black text-[10px] overflow-hidden shadow-xl`}
                  >
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                      creator.avatar
                    )}
                  </div>
                ))}
                <div className="h-14 w-14 rounded-2xl border-4 border-[#0a0514] bg-white/10 backdrop-blur-sm flex items-center justify-center font-black text-xs text-white/60">
                  +{creators.length > 4 ? creators.length - 4 : 0}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-black text-white tracking-wide">
                  Join {formattedCount}k+ pros
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">On the Global Map</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative lg:block hidden">
            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-500/10 blur-[120px] rounded-full scale-150" />
              <img 
                src="/src/assets/logo.png" 
                alt="TIPTAB Logo"
                className="w-full max-w-[520px] mx-auto drop-shadow-[0_0_80px_rgba(168,85,247,0.3)] animate-float cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

import { cn } from "@/lib/utils";