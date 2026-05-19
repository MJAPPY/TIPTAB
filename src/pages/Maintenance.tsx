"use client";

import React from "react";
import { Hammer, Zap, ShieldAlert, Clock } from "lucide-react";
import { useXpr } from "@/contexts/XprContext";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  const { isAdmin, setMaintenanceMode } = useXpr();

  return (
    <div className="min-h-screen bg-[#0a0514] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 blur-[160px] rounded-full animate-pulse" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full" />
      
      <div className="relative z-10 max-w-2xl w-full text-center space-y-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative h-32 w-32 md:h-48 md:w-48 bg-[#130b21] border-4 border-red-500/50 rounded-[48px] flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)] mx-auto group">
            <Hammer className="h-16 w-16 md:h-24 md:w-24 text-red-500 animate-bounce group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-4 -right-4 bg-orange-500 text-white font-black text-xs px-4 py-1 rounded-full shadow-lg">OFFLINE</div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-none">
            NETWORK <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">UPGRADE</span>
          </h1>
          <p className="text-white/60 text-xl md:text-2xl font-bold leading-relaxed max-w-xl mx-auto">
            We're calibrating the XPR Network nodes for better TAB liquidity. We'll be back in a few minutes.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-xl">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/80">Est. Time: 15 Mins</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-xl">
            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/80">TAB Core Updates</span>
          </div>
        </div>

        {isAdmin && (
          <div className="pt-12">
            <Button 
              onClick={() => setMaintenanceMode(false)}
              className="bg-white/5 border border-white/20 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] transition-all"
            >
              Exit Maintenance (Admin Only)
            </Button>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">
        TIP TAB PLATFORM • SECURED BY XPR NETWORK
      </div>
    </div>
  );
};

export default Maintenance;