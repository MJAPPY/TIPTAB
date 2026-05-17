import React, { useRef } from "react";
import { QrCode, Zap, MapPin, Share2, Download, Check, ShieldCheck, Heart } from "lucide-react";
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
      // Sticker-optimized download (high DPI, crisp edges)
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 4,
        backgroundColor: 'transparent' // Perfect for stickers
      });
      
      const link = document.createElement('a');
      link.download = `TIPTAB-Sticker-${creator.handle}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Sticker Ready!",
        description: "Your high-res sticker file has been generated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not generate sticker file.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full max-w-[480px]">
      {/* Sticker Container - This is the exported part */}
      <div 
        ref={cardRef}
        className="relative p-2" // Space for the die-cut border
      >
        <div className="w-full aspect-[1.4/1] bg-[#0a0514] rounded-[54px] p-10 border-[6px] border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Sticker Background - High Vibrancy for Visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-orange-500/30" />
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-orange-500/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-purple-600/30 blur-[100px] rounded-full" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Header: Brand & CTA */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-full w-fit">
                  <Heart className="h-3.5 w-3.5 fill-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Support Me</span>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-lg">
                  {creator.name}
                </h3>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-2xl font-black italic tracking-tighter text-white">TIP<span className="text-orange-500">TAB</span></span>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">XPR Network</p>
              </div>
            </div>

            {/* Main Content Area: Massive QR Focus */}
            <div className="flex items-center justify-between gap-8 mt-4">
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/80 text-xl font-bold">
                    <MapPin className="h-6 w-6 text-orange-500" />
                    {creator.location}
                  </div>
                  <p className="text-white/60 text-lg font-medium leading-tight max-w-[180px]">
                    Scan to support my work directly
                  </p>
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-2xl border border-white/20 w-fit backdrop-blur-md">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Verified</span>
                </div>
              </div>

              {/* Massive White-Bordered QR (Scan Reliability) */}
              <div className="shrink-0 relative">
                {/* Visual indicator that this is the action point */}
                <div className="absolute -inset-4 bg-orange-500/20 blur-2xl rounded-full animate-pulse" />
                
                <div className="relative bg-white p-5 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                  <div className="h-36 w-36 bg-black flex items-center justify-center rounded-3xl overflow-hidden">
                    <QrCode className="h-32 w-32 text-white" />
                  </div>
                </div>
                
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1.5 rounded-full border border-white/20 shadow-xl whitespace-nowrap">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Scan to Tip</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-5">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[28px] bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-3 h-16 font-bold text-lg transition-all"
        >
          {isCopied ? <Check className="h-6 w-6 text-green-500" /> : <Share2 className="h-6 w-6 text-purple-400" />}
          {isCopied ? "Link Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[28px] bg-purple-600 hover:bg-purple-500 text-white gap-3 h-16 font-black text-lg transition-all hover:scale-[1.02] shadow-xl shadow-purple-500/20"
        >
          {isDownloading ? (
            <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-6 w-6" />
          )}
          {isDownloading ? "..." : "Get Sticker"}
        </Button>
      </div>
      
      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
          Sticker optimized for: Physical printing • High-visibility <br /> Direct creator support • Instant scanning
        </p>
      </div>
    </div>
  );
};