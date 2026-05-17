import { Zap, ShieldCheck, Wallet, Globe, ArrowRight } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      title: "Quick Connect",
      desc: "Link your WebAuth wallet in seconds. It's your digital pocket for all the tips you'll earn.",
      icon: Wallet,
      color: "#00ffff", // Cyan
      glow: "rgba(0, 255, 255, 0.2)"
    },
    {
      title: "Pin Your Spot",
      desc: "Join the global map. Whether you're a barista in Seattle or a courier in London, let fans find you.",
      icon: Globe,
      color: "#ff00ff", // Pink
      glow: "rgba(255, 0, 255, 0.2)"
    },
    {
      title: "Earn Directly",
      desc: "Receive instant TAB tips. No platform cut, no delay—just pure appreciation for your hard work.",
      icon: Zap,
      color: "#39ff14", // Lime
      glow: "rgba(57, 255, 20, 0.2)"
    }
  ];

  return (
    <section className="py-32 container mx-auto px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-600/[0.02] blur-[150px] -z-10" />
      
      <div className="text-center space-y-4 mb-20">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
          Empowering The <span className="text-orange-500">Everyday Hustle</span>
        </h2>
        <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
          The most direct way for service workers and gig pros to receive gratitude. Built for speed on XPR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10" />
        
        {steps.map((step, i) => (
          <div key={i} className="group relative">
            <div className="bg-[#130b21]/50 border border-white/5 rounded-[40px] p-10 hover:bg-[#1a102d] transition-all hover:-translate-y-2 duration-500 h-full">
              <div 
                className="h-20 w-20 rounded-3xl flex items-center justify-center mb-8 transition-all group-hover:scale-110"
                style={{ backgroundColor: `${step.color}15`, border: `2px solid ${step.color}30`, boxShadow: `0 0 30px ${step.glow}` }}
              >
                <step.icon className="h-10 w-10" style={{ color: step.color }} />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-white/10">{i + 1}</span>
                  <h3 className="text-2xl font-black">{step.title}</h3>
                </div>
                <p className="text-white/50 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div className="mt-8 flex md:hidden items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-white/10 rotate-90" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};