import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck, Sparkles, Globe, Heart, Rocket } from "lucide-react";
import { Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

interface HeroProps {
  creators: Creator[];
  onJoin?: () => void;
}

export const Hero = ({ creators, onJoin }: HeroProps) => {
  const { isMember } = useXpr();
  const previewCreators = creators.slice(0, 4);
  const formattedCount = (10 + (creators.length / 1000)).toFixed(1);

  return (
    <section className="relative pt-12 md:pt-24 pb-24 md:pb-36 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-purple-600/10 blur-[200px] rounded-full -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <div className="flex-1 text-left space-y-8 md:space-y-12 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
              <Heart className="h-4 w-4 text-orange-500 fill-orange-500" />
              <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em]">Live on XPR Network</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white">
              Direct <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 italic">Appreciation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl leading-relaxed font-medium">
              Empowering the global workforce. Receive tips directly to your wallet with <span className="text-purple-400 font-black">Zero Platform Fees</span>. Built for the everyday hustle.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              {!isMember && (
                <Button 
                  onClick={onJoin}
                  className="w-full sm:w-auto h-20 px-14 bg-white text-black hover:bg-orange-600 hover:text-white rounded-[32px] font-black text-2xl shadow-[0_20px_60px_rgba(255,255,255,0.15)] transition-all group active:scale-95 animate-shimmer-silver"
                >
                  Join Now <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              )}
              <div className="flex items-center gap-5 px-4">
                <div className="flex -space-x-4">
                  {previewCreators.map((creator) => (
                    <div 
                      key={creator.id} 
                      className={`h-12 w-12 md:h-14 md:w-14 rounded-full border-4 border-[#0a0514] ${creator.color} flex items-center justify-center font-black text-[10px] overflow-hidden shadow-2xl relative group/avatar`}
                    >
                      {creator.avatarImage ? (
                        <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform" />
                      ) : (
                        creator.avatar
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-black text-white">{formattedCount}k+</p>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Pros</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-8">
              {[
                { icon: Zap, text: "Instant Settlements", color: "text-orange-500" },
                { icon: Globe, text: "Borderless Tips", color: "text-cyan-400" },
                { icon: UserCheck, text: "No Middlemen", color: "text-purple-400" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5">
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 relative lg:block hidden">
            <div className="relative z-10">
              <div className="absolute inset-0 bg-purple-500/20 blur-[150px] rounded-full scale-125" />
              <img 
                src="/src/assets/logo.png" 
                alt="TIPTAB Logo"
                className="w-full max-w-[560px] mx-auto drop-shadow-[0_0_80px_rgba(168,85,247,0.4)] animate-float cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};