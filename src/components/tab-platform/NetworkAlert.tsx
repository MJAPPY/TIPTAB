"use client";

import React from "react";
import { Bell, X, ShieldAlert } from "lucide-react";
import { useXpr } from "@/contexts/XprContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NetworkAlert = () => {
  const { networkAlert, broadcastAlert, isAdmin } = useXpr();

  if (!networkAlert) return null;

  return (
    <div className="fixed top-[42px] left-0 right-0 z-[55] flex justify-center px-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="w-full max-w-4xl bg-orange-600/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_20px_50px_rgba(249,115,22,0.4)] flex items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-pulse" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 shadow-inner">
            <Bell className="h-5 w-5 text-white animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> System Broadcast
            </p>
            <p className="text-sm md:text-base font-black text-white tracking-tight italic">
              {networkAlert}
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => broadcastAlert(null)}
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0 relative z-10"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};