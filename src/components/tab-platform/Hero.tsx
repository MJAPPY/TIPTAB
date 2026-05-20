import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck, Sparkles, Globe, Heart, Rocket, Car } from "lucide-react";
import { Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";

interface HeroProps {
  creators: Creator[];
  onJoin?: () => void;
}

export const Hero = ({ creators, onJoin }: HeroProps) => {
  const { isMember } = useXpr();
  // Take the first 4 creators for the preview avatars
  const previewCreators = creators.slice(0, 4);
  // Calculate a dynamic count (using a base of 10k to maintain the 'scale' vibe)
  const formattedCount = (10 + (creators.length / 1000)).toFixed(1);

  return (
    <section className="relative pt-8 md:pt-16 pb-24 md:pb-32 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[160px] rounded-full -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          <div className="flex-1 text-left space-y-8 md:space-y-10 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
              <Heart className="h-4 w-4 text-purple-500 fill-purple-500" />
              <span className="text-white/90 text-xs font-black uppercase tracking-[0.2em]">Powered by XPR Network</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              The Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Appreciation Hub</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl leading-relaxed font-medium">
              Whether you're a delivery pro, a fitness coach, or a digital creator—TIPTAB connects you directly to the people who value your hustle via the <span className="text-purple-400 font-black">XPR Network</span>. Zero fees. Instant TAB rewards. <span className="inline-block bg-gradient-to-br from-slate-100 via-white to-slate-400 bg-clip-text text-transparent italic font-black drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)] tracking-tight">“Tipping is the value of appreciation.”</span>
            </p>

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
                  Join <span className="text-white/80">{formattedCount}k+</span> pros
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
          
          <div className="flex-1 relative lg:block hidden">
            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-500/10 blur-[120px] rounded-full scale-150" />
              
              <div className="relative group">
                <img 
                  src="/src/assets/logo.png" 
                  alt="TIPTAB Logo"
                  className="w-full max-w-[480px] mx-auto drop-shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-delayed-spin cursor-pointer transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes delayed-spin {
          0%, 50% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-delayed-spin {
          animation: delayed-spin 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 10s;
        }
      `}</style>
    </section>
  );
};