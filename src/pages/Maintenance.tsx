"use client";

import React, { useState } from "react";
import { Sparkles, Activity, ShieldAlert, Radio, Zap } from "lucide-react";
import { useXpr } from "@/contexts/XprContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Maintenance = () => {
  const { isAdmin, setMaintenanceMode, login, logout, isConnected, adminsList } = useXpr();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);

  const handleHiddenLogin = async () => {
    // Hidden trigger: Click 3 times to show login
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setClickCount(0);
      
      if (!isConnected) {
        try {
          const session = await login();
          if (session) {
            const actorName = session.auth.actor.toString();
            // Check if this actor is in the authorized admin list
            const isAuthorized = adminsList.some(a => a.handle === actorName);
            
            if (!isAuthorized) {
              toast({
                title: "Unauthorized Access",
                description: "This bypass portal is restricted to Network Administrators only.",
                variant: "destructive",
              });
              await logout(); // Immediately terminate unauthorized session
            } else {
              toast({
                title: "Admin Access Granted",
                description: `Successfully authenticated as @${actorName}`,
              });
            }
          }
        } catch (e) {
          console.error("Admin login failed", e);
        }
      } else {
        if (!isAdmin) {
          toast({
            title: "Access Denied",
            description: "Your current session does not have administrator privileges.",
            variant: "destructive",
          });
          await logout();
        } else {
          toast({
            title: "Admin Session Active",
            description: "You are already authenticated as an administrator.",
          });
        }
      }
    }

    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <div className="min-h-screen bg-[#06030e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full" />
      
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(6,3,14,1)_70%)]" />

      <div className="relative z-10 max-w-3xl w-full text-center space-y-12">
        {/* Hidden Login Trigger Logo */}
        <div className="space-y-4">
          <div 
            className="relative inline-block cursor-pointer group"
            onClick={handleHiddenLogin}
          >
            {/* Multi-layered glow */}
            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
            <div className="absolute inset-0 bg-orange-500/10 blur-[60px] rounded-full scale-125 animate-pulse-slow" />
            
            <div className="relative h-40 w-40 md:h-56 md:w-56 bg-black/40 backdrop-blur-3xl border-2 border-white/10 rounded-[60px] flex items-center justify-center shadow-[0_0_80px_rgba(168,85,247,0.15)] mx-auto transition-all active:scale-95 group-hover:border-purple-500/30">
               <div className="absolute inset-4 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/10 to-transparent" />
               <img 
                src="/logo.png" 
                alt="TIPTAB" 
                className="h-24 w-24 md:h-36 md:w-36 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.6)] group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-black text-[9px] px-5 py-1.5 rounded-full shadow-[0_10px_20px_rgba(168,85,247,0.3)] border border-white/20 whitespace-nowrap tracking-[0.2em]">
                SYNCING NETWORK
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Radio className="h-4 w-4 text-purple-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Live Calibration</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic leading-[0.8] text-white">
            MAINTENANCE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-500 to-cyan-400">MODE ACTIVE</span>
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/60 text-xl md:text-3xl font-bold leading-tight max-w-xl mx-auto tracking-tight">
              We're polishing the edges. <br />
              <span className="text-white">Be back very soon.</span>
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-1.5 w-8 rounded-full bg-orange-500/20 overflow-hidden">
                <div className="h-full bg-orange-500 animate-loading-bar w-1/2" />
              </div>
              <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="pt-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border border-white/10 rounded-[40px] p-10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <ShieldAlert className="h-20 w-20 text-white" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <Zap className="h-6 w-6 text-orange-500 fill-orange-500" />
                  <h2 className="text-2xl font-black italic tracking-tight uppercase">Admin Override Connected</h2>
                </div>
                <Button 
                  onClick={() => setMaintenanceMode(false)}
                  className="bg-white text-black hover:bg-orange-500 hover:text-white rounded-[20px] h-16 px-12 font-black uppercase tracking-widest text-sm transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
                >
                  Restore Public Access
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.6em] text-white/10 whitespace-nowrap italic">
        TIP TAB PROTOCOL • XPR NETWORK
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 0.5; transform: scale(1.1) translate(-50%, -50%); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Maintenance;