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

  const cleanHandle = creator.handle.replace(/^@/, "").toLowerCase().trim();
  const tippingUrl = `${window.location.origin}/tip/${cleanHandle}`;
  const hasLocation = creator.location && creator.location.trim() !== "";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3, backgroundColor: '#0a0514' });
      const link = document.createElement('a');
      link.download = `TipTab-${cleanHandle}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Card Saved" });
    } catch (err) {
      toast({ title: "Download Failed", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative w-full max-w-[480px] mx-auto transition-transform duration-500 hover:scale-[1.02]">
      <div className={cn("absolute inset-0 blur-[60px] opacity-20 rounded-[48px] pointer-events-none", creator.color)} />
      <div ref={cardRef} className="w-full aspect-[1.58/1] bg-[#0a0514] rounded-[48px] p-8 border border-white/20 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className={cn("h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/30 overflow-hidden", creator.color)}>
              {creator.avatarImage ? <img src={creator.avatarImage} className="w-full h-full object-cover" /> : creator.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-black text-white truncate">{creator.name}</h3>
              <p className="text-purple-400 font-black text-sm">@{cleanHandle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <img src="/src/assets/logo.png" className="h-12 w-12 object-contain" />
             <span className="text-xl font-black italic text-white">TIP<span className="text-orange-500">TAB</span></span>
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div className="space-y-4">
            <p className="text-[16px] font-black uppercase tracking-[0.45em] text-white/50 italic">Tip Card</p>
            {hasLocation && (
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>{creator.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/30 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Zero Fees</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-1.5 rounded-[24px]">
              <div className="h-24 w-24 bg-white rounded-xl overflow-hidden">
                <QRCodeSVG value={tippingUrl} size={110} level="H" className="w-full h-full" />
              </div>
            </div>
            <div className="bg-orange-500 text-white font-black text-[9px] uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <Zap className="h-2.5 w-2.5 fill-white" /> Scan to Tip
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button onClick={() => {navigator.clipboard.writeText(tippingUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000)}} className="rounded-3xl bg-white/5 h-16 font-black">
          {isCopied ? "Copied" : "Share URL"}
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} className="rounded-3xl bg-white/5 h-16 font-black">
          {isDownloading ? "Saving..." : "Download Card"}
        </Button>
      </div>
    </div>
  );
};