"use client";

import React, { useState } from "react";
import { Hammer, Zap, ShieldAlert, Clock, Settings, Lock } from "lucide-react";
import { useXpr } from "@/contexts/XprContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Maintenance = () => {
  const { isAdmin, setMaintenanceMode, login, isConnected } = useXpr();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);

  const handleHiddenLogin = async () => {
    // Hidden trigger: Click 5 times to show login
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      setClickCount(0);
      if (!isConnected) {
        try {
          await login();
        } catch (e) {
          console.error("Admin login failed", e);
        }
      } else {
        toast({
          title: "Admin Access",
          description: isAdmin ? "You are authenticated as admin." : "Connected but not authorized as admin.",
        });
      }
    }

    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <div className="min-h-screen bg-[#06030e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-red-500/30">
      {/* Cinematic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-red-600/10 blur-[180px] rounded-full animate-pulse" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full" />
      
      {/* Scanning Line Effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-scan" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
        {/* Hidden Login Trigger Logo */}
        <div 
          className="relative inline-block cursor-default group"
          onClick={handleHiddenLogin}
        >
          <div className="absolute inset-0 bg-red-500/20 blur-[80px] rounded-full scale-150 animate-pulse" />
          <div className="relative h-32 w-32 md:h-48 md:w-48 bg-[#130b21] border-4 border-white/5 rounded-[48px] flex items-center justify-center shadow-[0_0_80px_rgba(239,68,68,0.2)] mx-auto transition-transform active:scale-95">
             <div className="absolute inset-4 rounded-[32px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent" />
             <img 
              src="/src/assets/logo.png" 
              alt="TIPTAB" 
              className="h-20 w-20 md:h-32 md:w-32 object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black text-[10px] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-white/20">
              OFFLINE
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Settings className="h-4 w-4 text-red-500 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">System Maintenance</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-none">
            NETWORK <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">OPTIMIZATION</span>
          </h1>
          <p className="text-white/50 text-lg md:text-2xl font-bold leading-relaxed max-w-xl mx-auto">
            We're calibrating the XPR Network nodes to enhance TAB liquidity and settle network rewards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded-[24px] border border-white/10 backdrop-blur-xl w-full sm:w-auto">
            <Clock className="h-6 w-6 text-orange-500" />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Estimated Delay</p>
              <p className="text-sm font-black text-white">~15 MINUTES</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded-[24px] border border-white/10 backdrop-blur-xl w-full sm:w-auto">
            <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Current Task</p>
              <p className="text-sm font-black text-white">SYNCING NODES</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-red-500/10 border border-red-500/20 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-center gap-3">
                <ShieldAlert className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-black italic tracking-tight">ADMINISTRATOR OVERRIDE</h2>
              </div>
              <Button 
                onClick={() => setMaintenanceMode(false)}
                className="bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95"
              >
                RESTORE PUBLIC ACCESS
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.5em] text-white/10 whitespace-nowrap">
        TIPTAB PROTOCOL • SECURED BY XPR NETWORK
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Maintenance;