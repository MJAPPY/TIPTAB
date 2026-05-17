"use client";

import React, { useRef } from "react";
import { QrCode, Zap, MapPin, Share2, Download, Check, ShieldCheck, Heart, User } from "lucide-react";
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
        pixelRatio: 4,
        backgroundColor: 'transparent' 
      });
      
      const link = document.createElement('a');
      link.download = `TIPTAB-Badge-${creator.handle}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Badge Ready!",
        description: "Your high-res badge file has been generated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not generate badge file.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full max-w-[480px]">
      {/* Badge/Sticker Container */}
      <div 
        ref={cardRef}
        className="relative p-4" 
      >
        {/* Lanyard Slot Visual (Only shows on physical print/badge mode) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/20 rounded-full border-2 border-white/40 z-20 flex items-center justify-center">
          <div className="w-8 h-1.5 bg-black/40 rounded-full" />
        </div>

        <div className="w-full aspect-[1.4/1] bg-[#0a0514] rounded-[54px] border-[8px] border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] relative overflow-hidden">
          
          {/* Identity Stripe */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-orange-500 opacity-20" />
          
          {/* Glows */}
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-orange-500/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-purple-600/30 blur-[100px] rounded-full" />
          
          <div className="relative z-10 h-full flex flex-col justify-between p-10">
            {/* Header: Identity & Role */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className={`h-20 w-20 rounded-[28px] ${creator.color} flex items-center justify-center text-3xl font-black border-4 border-white/20 shadow-xl`}>
                  {creator.avatar}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-0.5 bg-white text-black rounded-full w-fit">
                    <User className="h-3 w-3 fill-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Creator</span>
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-md">
                    {creator.name}
                  </h3>
                  <p className="text-orange-500 font-bold text-lg">@{creator.handle}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-2xl font-black italic tracking-tighter text-white">TIP<span className="text-orange-500">TAB</span></span>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1 text-right">XPR Network <br/> Verified Node</p>
              </div>
            </div>

            {/* Content: Location & Scan Area */}
            <div className="flex items-end justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/80 text-xl font-bold">
                    <MapPin className="h-6 w-6 text-purple-500" />
                    {creator.location}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 rounded-2xl border border-green-500/30 w-fit">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-green-400">Identity Verified</span>
                  </div>
                </div>
                
                <p className="text-white/40 text-sm font-medium leading-tight max-w-[200px]">
                  Official Network Badge — Scan to support directly.
                </p>
              </div>

              {/* Massive Badge QR */}
              <div className="shrink-0 relative">
                <div className="absolute -inset-6 bg-purple-500/20 blur-3xl rounded-full" />
                
                <div className="relative bg-white p-6 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                  <div className="h-32 w-32 bg-black flex items-center justify-center rounded-[32px] overflow-hidden">
                    <QrCode className="h-28 w-28 text-white" />
                  </div>
                </div>
                
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-5 py-2 rounded-full shadow-xl whitespace-nowrap">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                     <Heart className="h-3 w-3 fill-white" /> Send Tip
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-5 px-4">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[28px] bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-3 h-16 font-bold text-lg"
        >
          {isCopied ? <Check className="h-6 w-6 text-green-500" /> : <Share2 className="h-6 w-6 text-purple-400" />}
          {isCopied ? "Link Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[28px] bg-white text-black hover:bg-white/90 gap-3 h-16 font-black text-lg shadow-xl"
        >
          {isDownloading ? (
            <div className="h-6 w-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <Download className="h-6 w-6" />
          )}
          {isDownloading ? "..." : "Get Badge"}
        </Button>
      </div>
    </div>
  );
};