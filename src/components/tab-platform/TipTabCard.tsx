"use client";

import React, { useRef } from "react";
import { QrCode, MapPin, Share2, Download, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';

interface TipTabCardProps {
  creator: Creator;
}

export const TipTabCard = ({ creator }: TipTabCardProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const tippingUrl = `${window.location.origin}/tip/${creator.handle}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tip ${creator.name} on TIPTAB`,
          text: `Support my work on the XPR Network using TIPTAB!`,
          url: tippingUrl,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(tippingUrl);
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: "Your tipping link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        backgroundColor: '#0a0514' 
      });
      
      const link = document.createElement('a');
      link.download = `TipTab-${creator.handle}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Card Downloaded",
        description: "Your high-resolution silver-edition TipTab card has been saved.",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Could not generate card image.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full max-w-[460px] mx-auto">
      {/* Main Card Container */}
      <div 
        ref={cardRef}
        className="w-full aspect-[1.5/1] bg-[#0a0514] rounded-[48px] p-8 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between"
      >
        
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-600/10 via-transparent to-orange-500/10 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full" />
        
        {/* Header Section */}
        <div className="relative z-10 flex items-start gap-4 h-24">
          {/* Creator Info - Takes remaining space */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`h-14 w-14 shrink-0 rounded-2xl ${creator.color} flex items-center justify-center text-xl font-black border-2 border-white/20 shadow-xl`}>
              {creator.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-black text-white leading-tight break-words">
                {creator.name}
              </h3>
              <p className="text-purple-400 font-bold text-sm">@{creator.handle}</p>
            </div>
          </div>

          {/* Branding - Fixed to the right */}
          <div className="flex flex-col items-end shrink-0 pt-1">
             <div className="flex items-center gap-1 -mr-2">
               <img src="/src/assets/logo.png" alt="TAB" className="h-16 w-16 object-contain" />
               <span className="text-xl font-black italic tracking-tighter text-white">
                TIP<span className="text-orange-500">TAB</span>
               </span>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex items-end justify-between gap-4 mt-2">
          {/* Left Info Column */}
          <div className="space-y-4 flex-1 min-w-0 pb-1">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 text-[13px] font-bold">
                <MapPin className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span className="truncate">{creator.location}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-medium leading-tight max-w-[180px]">
                Direct TAB tipping on the XPR Network.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Zero Fees</span>
            </div>
          </div>

          {/* Right QR Column */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-[-8px] bg-white/20 blur-xl rounded-full" />
              <div className="relative bg-white p-3 rounded-[24px] shadow-2xl">
                <div className="h-24 w-24 bg-black flex items-center justify-center rounded-xl overflow-hidden">
                  <QrCode className="h-20 w-20 text-white" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white bg-orange-500 px-3 py-1 rounded-full shadow-lg shadow-orange-500/20">
                Scan to Tip Me
              </p>
              <p className="text-[10px] font-black text-white/40 tracking-widest uppercase pt-1">
                XPR Network
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-2.5 h-14 font-bold text-base transition-all"
        >
          {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-purple-400" />}
          {isCopied ? "Link Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-2.5 h-14 font-bold text-base transition-all"
        >
          {isDownloading ? (
            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-5 w-5 text-orange-400" />
          )}
          {isDownloading ? "Saving..." : "Download Card"}
        </Button>
      </div>
    </div>
  );
};