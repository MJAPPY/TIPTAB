"use client";

import React, { useRef } from "react";
import { MapPin, Share2, Download, Check, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { APP_LOGO } from "@/utils/assets";

interface TipTabCardProps {
  creator: Creator;
}

export const TipTabCard = ({ creator }: TipTabCardProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const cleanHandle = creator.handle.replace(/^@/, "").toLowerCase().trim();
  const tippingUrl = `${window.location.origin}/tip/${cleanHandle}`;

  const handleShare = async () => {
    const shareData = {
      title: `Tip ${creator.name} on TIPTAB`,
      text: `Support my work on the XPR Network using TIPTAB!`,
      url: tippingUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({ title: "Shared Successfully" });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyFallback();
        }
      }
    } else {
      copyFallback();
    }
  };

  const copyFallback = () => {
    navigator.clipboard.writeText(tippingUrl);
    setIsCopied(true);
    toast({
      title: "Link Copied!",
      description: "Your tipping link has been copied to your clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        backgroundColor: '#0a0514',
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `TipTab-${cleanHandle}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Card Saved",
        description: "Your high-resolution silver-edition TipTab card has been downloaded.",
      });
    } catch (err) {
      console.error("Download error:", err);
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
      <div className={cn(
        "absolute inset-0 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 rounded-[48px] pointer-events-none",
        creator.color
      )} />

      <div 
        ref={cardRef}
        className="w-full aspect-[1.58/1] bg-[#0a0514] rounded-[48px] p-7 md:p-8 border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between ring-1 ring-inset ring-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-orange-500/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className={cn(
              "h-14 md:h-16 w-14 md:w-16 shrink-0 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black border-2 border-white/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden",
              creator.color
            )}>
              {creator.avatarImage ? (
                <img 
                  src={creator.avatarImage} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  crossOrigin="anonymous"
                />
              ) : (
                creator.avatar
              )}
            </div>
            <div className="min-w-0 space-y-0.5">
              <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter truncate">
                {creator.name}
              </h3>
              <p className="text-purple-400 font-black text-[13px] md:text-sm tracking-tight">@{cleanHandle}</p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 -mt-1">
             <div className="flex items-center gap-0.5 -mr-2">
               <img src={APP_LOGO} alt="" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
               <span className="text-lg md:text-xl font-black italic tracking-tighter text-white">
                TIP<span className="text-orange-500">TAB</span>
               </span>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-4">
          <div className="space-y-4 flex-1 min-w-0 pb-1">
            <p className="text-[15px] md:text-[16px] font-black uppercase tracking-[0.45em] text-white/50 italic">
              Tip Card
            </p>
            <div className="flex items-center gap-2 text-white font-black text-[13px] md:text-sm">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500 shrink-0" />
              <span className="truncate tracking-tight">{creator.location}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <div className="relative bg-white p-1.5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="h-20 w-20 md:h-24 md:w-24 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                <QRCodeSVG 
                  value={tippingUrl}
                  size={110}
                  level="H"
                  includeMargin={false}
                  className="w-full h-full"
                />
              </div>
            </div>
            <div className="bg-orange-500 text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-1.5">
              <Zap className="h-2.5 w-2.5 fill-white" />
              Scan to Tip
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 relative z-20">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-3 h-14 md:h-16 font-black transition-all"
        >
          {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-purple-400" />}
          {isCopied ? "Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-3 h-14 md:h-16 font-black transition-all"
        >
          {isDownloading ? (
            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-5 w-5 text-orange-500" />
          )}
          {isDownloading ? "Saving..." : "Download Card"}
        </Button>
      </div>
    </div>
  );
};