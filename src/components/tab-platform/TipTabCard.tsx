import React from "react";
import { QrCode, Zap, MapPin, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";

interface TipTabCardProps {
  creator: Creator;
}

export const TipTabCard = ({ creator }: TipTabCardProps) => {
  return (
    <div className="group relative">
      {/* Card Body */}
      <div className="w-full max-w-sm aspect-[1.586/1] bg-gradient-to-br from-[#1a102d] to-[#0a0514] rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-purple-500/50">
        
        {/* Animated Background Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
        
        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl ${creator.color} flex items-center justify-center text-xl font-black border border-white/20 shadow-lg`}>
              {creator.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{creator.name}</h3>
              <p className="text-purple-400 text-sm font-bold">@{creator.handle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs font-black italic tracking-tighter text-white/40 uppercase">Tip<span className="text-orange-500/40">Tab</span></span>
             <Zap className="h-4 w-4 text-orange-500 mt-1 fill-orange-500" />
          </div>
        </div>

        {/* Card Middle - Info */}
        <div className="mt-8 relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-2">
            <MapPin className="h-3.5 w-3.5 text-purple-500" />
            {creator.location}
          </div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Verified Creator</p>
        </div>

        {/* Card Footer - QR Section */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4 relative z-10">
          <div className="bg-white p-2 rounded-2xl shadow-xl transition-transform group-hover:scale-110">
            <QrCode className="h-16 w-16 text-black" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Scan to tip</p>
            <p className="text-sm font-bold text-orange-500">2,500 XPR</p>
          </div>
        </div>

        {/* Chip simulation */}
        <div className="absolute bottom-8 left-8 w-10 h-8 rounded-md bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 border border-yellow-500/30 overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-3 h-full w-full opacity-30">
            <div className="border-r border-b border-yellow-500/50" />
            <div className="border-b border-yellow-500/50" />
            <div className="border-r border-b border-yellow-500/50" />
            <div className="border-b border-yellow-500/50" />
            <div className="border-r border-yellow-500/50" />
            <div className="border-yellow-500/50" />
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div className="mt-6 flex gap-3 justify-center">
        <Button variant="secondary" className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 h-11">
          <Share2 className="h-4 w-4" /> Share Link
        </Button>
        <Button variant="secondary" className="rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 h-11">
          <Download className="h-4 w-4" /> Download PNG
        </Button>
      </div>
    </div>
  );
};