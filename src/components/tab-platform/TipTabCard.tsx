"use client";

import React, { useRef } from "react";
import { MapPin, Share2, Download, Check, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

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
    <div className="group relative w-full max-w-[480px] mx-auto transition-transform duration-500 hover:scale-[1.02]">
      {/* Outer Glow Syncing with Creator Color */}
      <div className={cn(
        "absolute inset-0 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 rounded-[48px]",
        creator.color
      )} />

      {/* Main Card Container */}
      <div 
        ref={cardRef}
        className="w-full aspect-[1.58/1] bg-[#0a0514] rounded-[48px] p-8 border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between ring-1 ring-inset ring-white/10"
      >
        
        {/* Intensified Background Glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-orange-500/20 pointer-events-none" />
        <div className={cn("absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full opacity-40", creator.color)} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-600/20 blur-[100px] rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Grid Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        {/* Header Section */}
        <div className="relative z-10 flex items-start justify-between h-24">
          {/* Creator Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(
              "h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden",
              creator.color
            )}>
              {creator.avatarImage ? (
                <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                creator.avatar
              )}
            </div>
            <div className="min-w-0 space-y-0.5">
              <h3 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter drop-shadow-md">
                {creator.name}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-purple-400 font-black text-sm md:text-base tracking-tight">@{creator.handle}</p>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{creator.category}</span>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="flex flex-col items-end shrink-0 -mt-2">
             <div className="flex items-center gap-1 -mr-2 group/logo transition-transform hover:scale-105">
               <img src="/src/assets/logo.png" alt="TAB" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
               <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">
                TIP<span className="text-orange-500">TAB</span>
               </span>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex items-end justify-between gap-6 mt-4">
          {/* Left Info Column */}
          <div className="space-y-5 flex-1 min-w-0 pb-1">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-white font-black text-sm">
                <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
                </div>
                <span className="truncate tracking-tight">{creator.location}</span>
              </div>
              <p className="text-white/50 text-[11px] md:text-xs font-bold leading-snug max-w-[200px]">
                Instant network settlement with zero platform deductions.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30 w-fit shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Zero Fees</span>
            </div>
          </div>

          {/* Right QR Column */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative group/qr cursor-pointer">
              {/* Pulsing QR Aura */}
              <div className="absolute inset-[-12px] bg-white/10 blur-2xl rounded-full animate-pulse" />
              <div className="relative bg-white p-3.5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform group-hover/qr:scale-105 duration-300">
                <div className="h-24 w-24 md:h-28 md:w-28 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                  <QRCodeSVG 
                    value={tippingUrl}
                    size={100}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/src/assets/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center space-y-1.5 w-full">
              <div className="bg-orange-500 text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-[0_10px_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2">
                <Zap className="h-3 w-3 fill-white" />
                Scan to Tip
              </div>
              <p className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase pt-1">
                XPR Network
              </p>
            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Border Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-3 h-16 font-black text-base transition-all hover:border-purple-500/50 group"
        >
          {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />}
          {isCopied ? "Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-3 h-16 font-black text-base transition-all hover:border-orange-500/50 group"
        >
          {isDownloading ? (
            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-5 w-5 text-orange-500 group-hover:translate-y-0.5 transition-transform" />
          )}
          {isDownloading ? "Saving..." : "Download Card"}
        </Button>
      </div>
    </div>
  );
};