import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
            <Zap className="h-4 w-4" />
            Powered by $TAB on XPR Network
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
            Tip Creators with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">$TAB</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-xl">
            Support your favorite builders, artists, educators, service providers, and sports professionals directly with $TAB tokens. Zero fees. Instant. On XPR Network.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Zero fees
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-500" />
              Direct to creator
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-[#0a0514] bg-white/10" />
                ))}
              </div>
              <span>6 creators registered</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          {/* Main TAB Chip Image Placeholder */}
          <div className="relative z-10 animate-bounce-slow">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/90265c21d05a59e62dd0e06141ae2cf8-9XfX1XfX1XfX1XfX1XfX1XfX1XfX1X.PNG" 
              alt="TAB Chip"
              className="w-full max-w-[400px] mx-auto drop-shadow-[0_0_50px_rgba(249,115,22,0.3)]"
              onError={(e) => {
                e.currentTarget.src = "https://placeholder.svg?text=TAB+CHIP";
              }}
            />
          </div>
          
          {/* Card Overlay like in the image */}
          <div className="absolute top-0 right-0 w-full h-full -z-10 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = `
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}
`;