"use client";

import React, { useRef } from "react";
import { MapPin, Share2, Download, Check, ShieldCheck, Zap, Twitter, MessageSquare, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TipTabCardProps {
  creator: Creator;
}

const PRODUCTION_URL = "https://tiptab.org";

export const TipTabCard = ({ creator }: TipTabCardProps) => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  // Use a clean handle for the URL
  const cleanHandle = creator.handle.replace(/^@/, "").toLowerCase().trim();
  const tippingUrl = `${PRODUCTION_URL}/tip/${cleanHandle}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tippingUrl).then(() => {
      setIsCopied(true);
      toast({ title: "Link Copied!", description: "Your tipping link has been copied to your clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = () => {
    setIsShareOpen(true);
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
    <>
      <div className="group relative w-full max-w-[480px] mx-auto transition-transform duration-500 hover:scale-[1.02]">
        {/* Outer Glow - Added pointer-events-none to prevent blocking clicks */}
        <div className={cn(
          "absolute inset-0 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 rounded-[48px] pointer-events-none",
          creator.color
        )} />

        {/* Main Card Container */}
        <div 
          ref={cardRef}
          className="w-full aspect-[1.58/1] bg-[#0a0514] rounded-[48px] p-7 md:p-8 border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between ring-1 ring-inset ring-white/10"
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
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter drop-shadow-md truncate">
                  {creator.name}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-purple-400 font-black text-lg md:text-xl tracking-tight">@{cleanHandle}</p>
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest truncate">WebAuth Name</span>
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="flex flex-col items-end shrink-0 -mt-1">
               <div className="flex items-center gap-0.5 -mr-2">
                 <img src="/logo.png" alt="" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
                 <span className="text-lg md:text-xl font-black italic tracking-tighter text-white">
                  TIP<span className="text-orange-500">TAB</span>
                 </span>
               </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative z-10 flex items-end justify-between gap-4">
            {/* Left Info Column */}
            <div className="space-y-4 flex-1 min-w-0 pb-1">
              <div className="mb-1">
                <p className="text-[15px] md:text-[16px] font-black uppercase tracking-[0.45em] text-white/50 italic">
                  Tip Card
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white font-black text-[13px] md:text-sm">
                  <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500 shrink-0" />
                  <span className="truncate tracking-tight">{creator.location}</span>
                </div>
                <p className="text-white/50 text-[10px] md:text-[11px] font-bold leading-tight max-w-[180px]">
                  Instant network settlement with zero platform deductions.
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/30 w-fit shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <ShieldCheck className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-400">Zero Fees</span>
              </div>
            </div>

            {/* Right QR Column */}
            <div className="flex flex-col items-center gap-2.5 shrink-0">
              <div className="relative group/qr">
                <div className="absolute inset-[-10px] bg-white/5 blur-xl rounded-full" />
                <div className="relative bg-white p-1.5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  <div className="h-20 w-20 md:h-24 md:w-24 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                    <QRCodeSVG 
                      level="H"
                      value={tippingUrl}
                      size={110}
                      includeMargin={false}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1 w-full flex flex-col items-center">
                <div className="bg-orange-500 text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 w-full">
                  <Zap className="h-2.5 w-2.5 fill-white" />
                  Scan to Tip
                </div>
                
                <div className="pt-1.5 flex flex-col items-center justify-center">
                  <img 
                    src="/webAuth-logo.jpg" 
                    alt="WebAuth Logo" 
                    className="h-5 md:h-6 object-contain brightness-100 filter contrast-125"
                  />
                  <p className="text-[6px] md:text-[7px] font-black text-white/20 tracking-[0.3em] uppercase pt-1">
                    XPR Network
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
            <Share2 className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
            Share URL
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

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="bg-[#1e1438]/95 backdrop-blur-3xl border-white/10 text-white rounded-[40px] p-8 max-w-sm shadow-[0_0_100px_rgba(0,0,0,0.8)] border-t-purple-500/20">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-[24px] bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
               <Share2 className="h-8 w-8 text-purple-400" />
            </div>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Share Tip Link</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-sm">Direct link to support your hustle.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-1 gap-3">
               <Button 
                onClick={copyToClipboard}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest gap-3 justify-start px-6 transition-all"
               >
                 {isCopied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-purple-400" />}
                 {isCopied ? "Link Copied" : "Copy Tipping Link"}
               </Button>

               <Button 
                asChild
                className="h-16 rounded-2xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 text-white font-black text-sm uppercase tracking-widest gap-3 justify-start px-6 transition-all"
               >
                 <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Show some appreciation on @tabtokenxpr!`)}&url=${encodeURIComponent(tippingUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                 >
                   <Twitter className="h-5 w-5 text-[#1DA1F2] fill-[#1DA1F2]" />
                   Share on X (Twitter)
                 </a>
               </Button>

               <Button 
                asChild
                className="h-16 rounded-2xl bg-purple-600/10 border border-purple-600/30 hover:bg-purple-600/20 text-white font-black text-sm uppercase tracking-widest gap-3 justify-start px-6 transition-all"
               >
                 <a 
                  href={`https://snipverse.com/submit?url=${encodeURIComponent(tippingUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                 >
                   <MessageSquare className="h-5 w-5 text-purple-400 fill-purple-400" />
                   Share on Snipverse
                 </a>
               </Button>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Production address</p>
               <p className="text-[11px] font-bold text-purple-400 truncate select-all">{tippingUrl}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};