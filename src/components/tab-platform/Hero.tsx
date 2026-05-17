import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck, Sparkles, Globe, Heart } from "lucide-react";
import { Creator } from "@/data/creators";

interface HeroProps {
  creators: Creator[];
}

export const Hero = ({ creators }: HeroProps) => {
  // Take the first 4 creators for the preview avatars
  const previewCreators = creators.slice(0, 4);
  // Calculate a dynamic count (using a base of 10k to maintain the 'scale' vibe)
  const formattedCount = (10 + (creators.length / 1000)).toFixed(1);

  return (
    <section className="relative pt-48 pb-32 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[160px] rounded-full -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          <div className="flex-1 text-left space-y-10 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              <span className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">Empowering Everyday Heroes</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              The Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Appreciation Hub</span>
            </h1>
            
            <p className="text-2xl text-white/40 max-w-2xl leading-relaxed font-medium">
              Whether you're a delivery pro, a fitness coach, wait staff, or a digital creator—TIPTAB connects you directly to the people who value your hustle. Zero fees. Instant TAB rewards.
            </p>
            
            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
                <span className="text-sm font-black uppercase tracking-widest text-white/80">Direct Tipping</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <UserCheck className="h-5 w-5 text-green-500" />
                <span className="text-sm font-black uppercase tracking-widest text-white/80">Gig-Economy Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {previewCreators.map((creator) => (
                  <div 
                    key={creator.id} 
                    className={`h-12 w-12 rounded-full border-4 border-[#0a0514] ${creator.color} flex items-center justify-center font-black text-[10px] overflow-hidden shadow-xl`}
                  >
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                      creator.avatar
                    )}
                  </div>
                ))}
                <div className="h-12 w-12 rounded-full border-4 border-[#0a0514] bg-white/10 backdrop-blur-sm flex items-center justify-center font-black text-[10px] text-white/60">
                  +{creators.length > 4 ? creators.length - 4 : 0}
                </div>
              </div>
              <p className="text-sm font-bold text-white/30 tracking-wide">
                Join <span className="text-white">{formattedCount}k+</span> service pros & creators
              </p>
            </div>
          </div>
          
          <div className="flex-1 relative lg:block hidden">
            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500/10 blur-[120px] rounded-full scale-150" />
              
              <div className="relative group">
                <img 
                  src="/src/assets/logo.png" 
                  alt="TIPTAB Logo"
                  className="w-full max-w-[480px] mx-auto drop-shadow-[0_0_50px_rgba(249,115,22,0.4)] animate-delayed-spin cursor-pointer transition-transform duration-700 group-hover:scale-105"
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