import React, { useRef } from "react";
import { QrCode, Zap, MapPin, Share2, Download, Check, ShieldCheck } from "lucide-react";
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
        title: "Download Started",
        description: "Your high-resolution TipTab card is being saved.",
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
    <div className="group relative w-full max-w-[460px]">
      {/* Main Card Container */}
      <div 
        ref={cardRef}
        className="w-full aspect-[1.6/1] bg-[#0a0514] rounded-[48px] p-10 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-700 group-hover:scale-[1.03] group-hover:border-purple-500/40"
      >
        
        {/* Dynamic Background Effects */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-600/15 via-transparent to-orange-500/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Top Section: Profile & Logo */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className={`h-20 w-20 rounded-[28px] ${creator.color} flex items-center justify-center text-3xl font-black border-2 border-white/20 shadow-2xl rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500`}>
                {creator.avatar}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-3xl font-black text-white tracking-tight leading-none">{creator.name}</h3>
                <p className="text-purple-400 text-lg font-bold">@{creator.handle}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-lg font-black italic tracking-tighter text-white/60">TIP<span className="text-orange-500">TAB</span></span>
               <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                 <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
                 <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest leading-none">Pro</span>
               </div>
            </div>
          </div>

          {/* Bottom Section: Info & QR */}
          <div className="flex items-end justify-between">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/70 text-lg font-medium">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  {creator.location}
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 w-fit">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Network Verified</span>
                </div>
              </div>
              
              {/* Added small detail to fill space nicely */}
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Built on XPR Network</p>
            </div>

            {/* Enlarged QR Code Column */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group/qr">
                {/* Glow behind QR */}
                <div className="absolute inset-[-10px] bg-white/10 blur-2xl rounded-[32px] group-hover/qr:bg-purple-500/30 transition-colors" />
                <div className="relative bg-white p-4 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105">
                  <div className="h-28 w-28 bg-black flex items-center justify-center rounded-2xl overflow-hidden">
                    <QrCode className="h-24 w-24 text-white" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">Scan to Tip</p>
                <p className="text-sm font-black text-orange-500 tracking-tighter">DIRECT PAYMENT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Action Buttons */}
      <div className="mt-10 grid grid-cols-2 gap-5">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-3 h-16 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
        >
          {isCopied ? <Check className="h-6 w-6 text-green-500" /> : <Share2 className="h-6 w-6 text-purple-400" />}
          {isCopied ? "Copied!" : "Share Link"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-3 h-16 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
        >
          {isDownloading ? (
            <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-6 w-6 text-orange-400" />
          )}
          {isDownloading ? "..." : "Save PNG"}
        </Button>
      </div>
    </div>
  );
};