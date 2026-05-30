"use client";

import React, { useRef, useState } from "react";
import { Header } from "@/components/tab-platform/Header";
import { BrandLogo } from "@/components/tab-platform/BrandLogo";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, FileCode, Check, ArrowLeft, Coins } from "lucide-react";
import { toPng } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Assets = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPng = async (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!ref.current) return;
    setIsDownloading(true);
    try {
      // Use pixelRatio 4 for clean, high-resolution vector-like printing outputs.
      // backgroundColor null guarantees beautiful alpha-channel transparent background.
      // Dynamic inline layout padding has been moved to natural DOM classes to avoid displacement artifacts.
      const dataUrl = await toPng(ref.current, { 
        quality: 1, 
        pixelRatio: 4, 
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "High-Res PNG Saved", description: "Production asset downloaded." });
    } catch (err) {
      toast({ title: "Download Failed", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header />

      <main className="container mx-auto px-6 pt-44 pb-24 max-w-6xl">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                <ImageIcon className="h-3.5 w-3.5" />
                Network Media Kit
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
                BRAND <span className="text-orange-500">ASSETS</span>
              </h1>
              <p className="text-xl text-white/60 font-medium max-w-2xl">
                Official high-resolution logos for print and digital media.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Logo Card */}
            <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[48px] p-8 md:p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              
              <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
                {/* Natural padding on the captured wrapper element avoids displacement boundaries during export */}
                <div ref={logoRef} className="p-16 bg-transparent flex items-center justify-center">
                  <BrandLogo size="lg" isStatic={true} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md relative z-10">
                <button 
                  onClick={() => downloadPng(logoRef, 'tiptab-full-logo')}
                  disabled={isDownloading}
                  className="h-14 rounded-2xl bg-white text-black hover:bg-purple-600 hover:text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download PNG
                </button>
                <button 
                  className="h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <FileCode className="h-4 w-4" /> Request SVG
                </button>
              </div>
            </div>

            {/* Token Asset Card */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[48px] p-8 md:p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
              
              <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
                {/* Natural padding wrapper for the token badge icon export */}
                <div ref={tokenRef} className="p-16 bg-transparent flex items-center justify-center">
                  <BrandLogo size="lg" showText={false} isStatic={true} />
                </div>
              </div>

              <div className="text-center space-y-4 w-full relative z-10">
                <div className="space-y-1">
                  <h3 className="font-black text-xl uppercase tracking-tight italic text-orange-500">TAB TOKEN</h3>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Master Icon</p>
                </div>
                <button 
                  onClick={() => downloadPng(tokenRef, 'tab-token-logo')}
                  disabled={isDownloading}
                  className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Save Icon (PNG)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 border border-white/10 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Coins className="h-8 w-8 text-orange-500" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-2xl font-black italic uppercase tracking-tighter">Asset Standards</h4>
                <p className="text-white/60 font-medium text-sm">Static assets are exported at high DPI with transparency for professional use.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/docs")}
              className="font-black text-xs uppercase tracking-widest text-purple-400 hover:text-white"
            >
              Full Brand Docs <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assets;