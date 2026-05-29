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

  // Use a clean handle for the URL
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
        // Fallback if user cancels or it fails
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
      // Small delay to ensure any dynamic assets are settled
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        backgroundColor: '#0a0514',
        cacheBust: true, // Prevents caching issues with dynamic images
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
        description: "Could not generate card image. This usually happens if the profile photo is protected.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full max-w-[480px] mx-auto transition-transform duration-500 hover:scale-[1.02]">
      {/* Outer Glow - Added pointer-events-none to prevent blocking clicks */}
      <div className={cn(
        "absolute inset-0 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 rounded-[48px] pointer-events-none",
        creator.color
      )} />

      {/* Main Card Container with optimized padding */}
      <div 
        ref={cardRef}
        className="w-full aspect-[1.58/1] bg-[#0a0514] rounded-[40px] md:rounded-[48px] p-5 md:p-6 border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between ring-1 ring-inset ring-white/10"
      >
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-orange-500/20 pointer-events-none" />
        <div className={cn("absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full opacity-40", creator.color)} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-600/20 blur-[100px] rounded-full opacity-30" />
        
        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        {/* Header Section */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Creator Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "h-12 md:h-14 w-12 md:w-14 shrink-0 rounded-2xl flex items-center justify-center text-lg md:text-xl font-black border border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden",
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
              <h3 className="text-lg md:text-xl font-black text-white leading-tight tracking-tighter drop-shadow-md truncate">
                {creator.name}
              </h3>
              <div className="flex items-center gap-1">
                <p className="text-purple-400 font-black text-[11px] md:text-xs tracking-tight">@{cleanHandle}</p>
                <div className="h-0.5 w-0.5 rounded-full bg-white/20" />
                <span className="text-white/40 text-[8px] font-black uppercase tracking-widest truncate">WebAuth Name</span>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="flex flex-col items-end shrink-0 -mt-2">
             <div className="flex items-center gap-0.5 -mr-1">
               <img src="/logo.png" alt="" className="h-11 w-11 md:h-14 md:w-14 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
               <span className="text-base md:text-lg font-black italic tracking-tighter text-white">
                TIP<span className="text-orange-500">TAB</span>
               </span>
             </div>
          </div>
        </div>

        {/* Content Section with tightened layout */}
        <div className="relative z-10 flex items-end justify-between gap-4 mt-2">
          {/* Left Info Column */}
          <div className="space-y-3 flex-1 min-w-0 pb-0.5">
            <div className="mb-0.5">
              <p className="text-[13px] md:text-[14px] font-black uppercase tracking-[0.45em] text-white/50 italic">
                Tip Card
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-white font-black text-[11px] md:text-xs">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 text-purple-500 shrink-0" />
                <span className="truncate tracking-tight">{creator.location}</span>
              </div>
              <p className="text-white/50 text-[9px] md:text-[10px] font-bold leading-tight max-w-[170px]">
                Instant network settlement with zero platform deductions.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-green-500/10 border border-green-500/30 w-fit shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <ShieldCheck className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-400">Zero Fees</span>
            </div>
          </div>

          {/* Right QR Column - Re-scaled to prevent clipping */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group/qr">
              <div className="absolute inset-[-6px] bg-white/5 blur-xl rounded-full" />
              <div className="relative bg-white p-1 rounded-[16px] shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                <div className="h-16 w-16 md:h-20 md:w-20 bg-white flex items-center justify-center rounded-lg overflow-hidden">
                  <QRCodeSVG 
                    value={tippingUrl}
                    size={90}
                    level="H"
                    includeMargin={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-1 w-full flex flex-col items-center">
              <div className="bg-orange-500 text-white font-black text-[8px] md:text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1 w-full">
                <Zap className="h-2 w-2 fill-white" />
                Scan to Tip
              </div>
              
              {/* Blended WebAuth Logo Segment */}
              <div className="flex items-center justify-center gap-1 pt-0.5 opacity-85 hover:opacity-100 transition-opacity">
                <div className="h-3.5 w-3.5 rounded-full overflow-hidden border border-white/20 bg-black/60 shadow-inner flex items-center justify-center relative shrink-0">
                  <img 
                    src="/webAuth-logo.jpg" 
                    alt="WebAuth" 
                    className="h-full w-full object-cover mix-blend-screen scale-[1.3] relative z-10" 
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-[7px] font-black text-white/50 tracking-[0.2em] uppercase whitespace-nowrap">
                  WebAuth Pay
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Action Buttons - Added relative z-20 to ensure buttons stay on top */}
      <div className="mt-8 grid grid-cols-2 gap-4 relative z-20">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-3 h-14 md:h-16 font-black text-sm md:text-base transition-all hover:border-purple-500/50 group"
        >
          {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />}
          {isCopied ? "Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-100 gap-3 h-14 md:h-16 font-black text-sm md:text-base transition-all hover:border-orange-500/50 group"
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

export default TipTabCard;