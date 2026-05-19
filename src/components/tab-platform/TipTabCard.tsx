"use client";

import React, { useRef } from "react";
import { MapPin, Share2, Download, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import { QRCodeSVG } from "qrcode.react";

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
      link.download = `TipTab-Silver-${creator.handle}.png`;
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
      {/* Main Card Container with Silver Metallic Theme */}
      <div 
        ref={cardRef}
        className="w-full aspect-[1.5/1] bg-[#0a0514] rounded-[48px] p-8 border border-slate-400/30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between"
      >
        
        {/* Sleek Metallic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/5 via-transparent to-slate-400/10 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-slate-300/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-slate-100/5 blur-[100px] rounded-full" />
        
        {/* Silver Edge Glow */}
        <div className="absolute inset-0 ring-1 ring-inset ring-slate-400/20 rounded-[48px] pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10 flex items-start gap-4 h-24">
          {/* Creator Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`h-14 w-14 shrink-0 rounded-2xl ${creator.color} flex items-center justify-center text-xl font-black border-2 border-white/20 shadow-xl overflow-hidden`}>
              {creator.avatarImage ? (
                <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                creator.avatar
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-black text-white leading-tight break-words tracking-tight">
                {creator.name}
              </h3>
              <p className="text-slate-400 font-bold text-sm tracking-tight">@{creator.handle}</p>
            </div>
          </div>

          {/* Branding with Silver/Orange Mix */}
          <div className="flex flex-col items-end shrink-0 pt-1">
             <div className="flex items-center gap-1 -mr-2">
               <img src="/src/assets/logo.png" alt="TAB" className="h-16 w-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
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
              <div className="flex items-center gap-2 text-slate-200 text-[13px] font-bold">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{creator.location}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-medium leading-tight max-w-[180px] tracking-wide">
                Direct TAB tipping on the <span className="text-slate-200 font-bold italic">XPR Network</span>.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-slate-400/20 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Silver Tier Verified</span>
            </div>
          </div>

          {/* Right QR Column */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <div className="relative">
              {/* Outer Silver Glow */}
              <div className="absolute inset-[-12px] bg-slate-300/10 blur-2xl rounded-full" />
              <div className="relative bg-white p-3 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-2 border-slate-300">
                <div className="h-24 w-24 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                  <QRCodeSVG 
                    value={tippingUrl}
                    size={84}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/src/assets/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 20,
                      width: 20,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20 border border-white/10">
                SCAN TO TIP
              </p>
              <p className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase pt-1.5">
                XPR PLATFORM
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
          className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-2.5 h-14 font-bold text-base transition-all group"
        >
          {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />}
          {isCopied ? "Link Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-2.5 h-14 font-bold text-base transition-all group"
        >
          {isDownloading ? (
            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          )}
          {isDownloading ? "Saving..." : "Download Card"}
        </Button>
      </div>
    </div>
  );
};