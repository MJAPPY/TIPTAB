"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShieldAlert, Radio, Zap, Lock, AlertTriangle } from "lucide-react";
import { useXpr } from "@/contexts/XprContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ROOT_ADMINS } from "@/constants/xpr";
import { cn } from "@/lib/utils";

const Maintenance = () => {
  const { isAdmin, setMaintenanceMode, login, isConnected, logout, actor, isLoading } = useXpr();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Security: If a regular user is connected while on this page, log them out immediately
  // Added a check for ROOT_ADMINS to prevent accidental logouts of the primary admin account
  useEffect(() => {
    const isRoot = actor && ROOT_ADMINS.includes(actor.toLowerCase());
    if (!isLoading && isConnected && !isAdmin && !isRoot) {
      const performLogout = async () => {
        await logout();
      };
      performLogout();
    }
  }, [isConnected, isAdmin, isLoading, logout, actor]);

  const handleHiddenLogin = async () => {
    // Hidden trigger: Click 3 times to show login
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setClickCount(0);
      setIsAuthenticating(true);
      
      try {
        // Trigger WebAuth Login
        const session = await login();
        
        if (session) {
          const loggedActor = session.auth.actor.toString().toLowerCase();
          const isRoot = ROOT_ADMINS.includes(loggedActor);
          
          // Wait briefly for context to sync, but check root status immediately
          setTimeout(async () => {
            if (!isRoot && !isAdmin) {
              toast({
                title: "Authorization Denied",
                description: "This account is not authorized to bypass maintenance.",
                variant: "destructive"
              });
              await logout();
            } else {
              toast({
                title: "Admin Authenticated",
                description: `Welcome back, @${loggedActor}.`,
              });
            }
            setIsAuthenticating(false);
          }, 800);
        } else {
          setIsAuthenticating(false);
        }

      } catch (e) {
        console.error("Admin login failed", e);
        setIsAuthenticating(false);
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
            className={cn(
              "relative inline-block cursor-pointer group",
              isAuthenticating && "animate-pulse pointer-events-none opacity-50"
            )}
            onClick={handleHiddenLogin}
          >
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
                {isAuthenticating ? "VERIFYING..." : "SYNCING NETWORK"}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mt-2">
            Admin Bypass Portal {isConnected && !isAdmin ? "(Access Denied)" : "(Click 3x to Authenticate)"}
          </p>
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
          </div>
        </div>

        {(isAdmin || (actor && ROOT_ADMINS.includes(actor.toLowerCase()))) && isConnected && (
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
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    onClick={() => setMaintenanceMode(false)}
                    className="bg-white text-black hover:bg-orange-500 hover:text-white rounded-[20px] h-16 px-12 font-black uppercase tracking-widest text-sm transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
                  >
                    Restore Public Access
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={logout}
                    className="h-16 px-8 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-black uppercase text-xs"
                  >
                    Logout Admin
                  </Button>
                </div>
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
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Maintenance;