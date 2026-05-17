import React, { useRef } from "react";
import { QrCode, Zap, MapPin, Share2, Download, Check, ShieldCheck, Heart, Sparkles } from "lucide-react";
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
      link.download = `TIPTAB-PRO-STICKER-${creator.handle}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Sticker Ready!",
        description: "High-resolution sticker file exported successfully.",
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
    <div className="group relative w-full max-w-[520px]">
      {/* Decorative background glow for the UI */}
      <div className="absolute -inset-10 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      {/* The Actual Sticker Area */}
      <div 
        ref={cardRef}
        className="relative p-3"
      >
        {/* Thick Die-Cut Border Wrapper */}
        <div className="w-full aspect-[1.5/1] bg-white rounded-[60px] p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] transform transition-transform duration-700 group-hover:rotate-1 group-hover:scale-[1.01]">
          
          {/* Main Card Surface */}
          <div className="w-full h-full bg-[#0a0514] rounded-[52px] relative overflow-hidden flex flex-col p-10">
            
            {/* High-Vibrancy Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-transparent to-orange-500/20" />
            <div className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-orange-600/15 blur-[100px] rounded-full" />
            
            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              
              {/* Header: Logo & Branding */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full w-fit shadow-lg shadow-orange-500/20">
                    <Sparkles className="h-3.5 w-3.5 fill-white" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Support Creator</span>
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                    {creator.name}
                  </h3>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-black italic tracking-tighter text-white">TIP</span>
                    <span className="text-3xl font-black italic tracking-tighter text-orange-500">TAB</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">XPR NETWORK</p>
                  </div>
                </div>
              </div>

              {/* Main Body: Info & QR */}
              <div className="flex items-end justify-between gap-6">
                <div className="space-y-8 flex-1">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                        <MapPin className="h-5 w-5 text-orange-500" />
                      </div>
                      <span className="text-white/80 text-xl font-bold tracking-tight">{creator.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl w-fit backdrop-blur-xl shadow-inner">
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Verified Creator</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em] pl-1">
                    Secure • Instant • Fee-Free
                  </p>
                </div>

                {/* High-Impact QR Area */}
                <div className="relative shrink-0 group/qr">
                  {/* Floating Action Badge */}
                  <div className="absolute -top-4 -left-4 z-20 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-xl rotate-[-10deg] group-hover/qr:rotate-0 transition-transform">
                    Scan Me
                  </div>
                  
                  {/* Multi-layered QR Container */}
                  <div className="absolute inset-[-15px] bg-white/10 blur-3xl rounded-full animate-pulse" />
                  <div className="relative bg-white p-6 rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-4 border-purple-500/20">
                    <div className="h-36 w-36 bg-black flex items-center justify-center rounded-[32px] overflow-hidden">
                      <QrCode className="h-32 w-32 text-white" />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-5 py-2 rounded-2xl border border-white/10 shadow-2xl whitespace-nowrap z-20">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em]">Support with $TAB</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>
        </div>
      </div>

      {/* Premium Action Buttons */}
      <div className="mt-12 grid grid-cols-2 gap-6">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="rounded-[30px] bg-white/5 border border-white/10 hover:bg-white/15 text-white gap-3 h-20 font-bold text-xl transition-all shadow-2xl hover:border-purple-500/30"
        >
          {isCopied ? <Check className="h-7 w-7 text-green-500" /> : <Share2 className="h-7 w-7 text-purple-400" />}
          {isCopied ? "Link Copied" : "Share URL"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="rounded-[30px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white gap-3 h-20 font-black text-xl transition-all hover:scale-[1.03] shadow-[0_20px_40px_rgba(124,58,237,0.3)] border border-white/10"
        >
          {isDownloading ? (
            <div className="h-7 w-7 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-7 w-7" />
          )}
          {isDownloading ? "Generating..." : "Get Sticker"}
        </Button>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-6 text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">
        <span>Print-Ready 4K</span>
        <div className="h-1 w-1 rounded-full bg-white/20" />
        <span>Die-Cut Optimized</span>
        <div className="h-1 w-1 rounded-full bg-white/20" />
        <span>Public Discovery</span>
      </div>
    </div>
  );
};