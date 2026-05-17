import React, { useRef } from "react";
import { QrCode, Zap, MapPin, Share2, Download, Copy, Check } from "lucide-react";
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
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      // Fallback to clipboard
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
        description: "Could not generate card image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full max-w-sm">
      {/* Card Body - The part that gets exported as PNG */}
      <div 
        ref={cardRef}
        className="w-full aspect-[1.586/1] bg-gradient-to-br from-[#1a102d] to-[#0a0514] rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:border-purple-500/50"
      >
        
        {/* Animated Background Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
        
        {/* Card Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl ${creator.color} flex items-center justify-center text-xl font-black border border-white/20 shadow-lg`}>
              {creator.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{creator.name}</h3>
              <p className="text-purple-400 text-sm font-bold">@{creator.handle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs font-black italic tracking-tighter text-white/40 uppercase">Tip<span className="text-orange-500/40">Tab</span></span>
             <Zap className="h-4 w-4 text-orange-500 mt-1 fill-orange-500" />
          </div>
        </div>

        {/* Card Middle - Info */}
        <div className="mt-8 relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-2">
            <MapPin className="h-3.5 w-3.5 text-purple-500" />
            {creator.location}
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">XPR Network Verified</p>
        </div>

        {/* Card Footer - QR Section */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4 relative z-10">
          <div className="bg-white p-2 rounded-2xl shadow-xl transition-transform group-hover:scale-110">
            {/* Real QR simulation for the image */}
            <div className="h-16 w-16 bg-black flex items-center justify-center rounded-lg">
              <QrCode className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Scan to tip</p>
            <p className="text-sm font-bold text-orange-500">PRO CREATOR</p>
          </div>
        </div>

        {/* Chip simulation */}
        <div className="absolute bottom-8 left-8 w-10 h-8 rounded-md bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 border border-yellow-500/30 overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-3 h-full w-full opacity-30">
            <div className="border-r border-b border-yellow-500/50" />
            <div className="border-b border-yellow-500/50" />
            <div className="border-r border-b border-yellow-500/50" />
            <div className="border-b border-yellow-500/50" />
            <div className="border-r border-yellow-500/50" />
            <div className="border-yellow-500/50" />
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button 
          variant="secondary" 
          onClick={handleShare}
          className="flex-1 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 h-14 font-bold transition-all"
        >
          {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
          {isCopied ? "Link Copied" : "Share Tipping Link"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 h-14 font-bold transition-all"
        >
          {isDownloading ? (
            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isDownloading ? "Generating..." : "Download PNG"}
        </Button>
      </div>
      
      <p className="mt-4 text-center text-xs text-white/30 font-medium uppercase tracking-widest">
        Share this card to receive tips instantly
      </p>
    </div>
  );
};