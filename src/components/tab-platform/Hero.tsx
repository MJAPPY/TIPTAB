import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, UserCheck, Sparkles, Globe } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 blur-[160px] rounded-full -z-10 animate-pulse" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          <div className="flex-1 text-left space-y-10 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">Network Live on XPR</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              The Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Tip Economy</span>
            </h1>
            
            <p className="text-2xl text-white/40 max-w-2xl leading-relaxed font-medium">
              Empowering creators, athletes, and builders with direct TAB tipping. No fees. No middlemen. Just pure appreciation on the XPR Network.
            </p>
            
            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
                <span className="text-sm font-black uppercase tracking-widest text-white/80">Zero Fees</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                <Globe className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-black uppercase tracking-widest text-white/80">Global Map</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-12 w-12 rounded-full border-4 border-[#0a0514] bg-white/10 bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center font-black text-[10px]">
                    {i}k+
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-white/30 tracking-wide">
                Join <span className="text-white">6,400+</span> creators globally
              </p>
            </div>
          </div>
          
          <div className="flex-1 relative lg:block hidden">
            <div className="relative z-10">
              <img 
                src="/src/assets/logo.png" 
                alt="TIPTAB Logo"
                className="w-full max-w-[500px] mx-auto drop-shadow-[0_0_100px_rgba(249,115,22,0.2)] animate-bounce-slow"
              />
              
              {/* Floating elements */}
              <div className="absolute top-0 -left-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-2xl animate-float">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Recent Tip</p>
                    <p className="text-xl font-black">500 TAB</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 -right-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-2xl animate-float-delayed">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">New Creator</p>
                    <p className="text-xl font-black">@alex_arts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};