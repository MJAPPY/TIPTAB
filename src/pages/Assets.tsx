"use client";

import React, { useRef, useState } from "react";
import { Header } from "@/components/tab-platform/Header";
import { BrandLogo } from "@/components/tab-platform/BrandLogo";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, FileCode, Check, ArrowLeft } from "lucide-react";
import { toPng } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Assets = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPng = async () => {
    if (!logoRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(logoRef.current, { 
        quality: 1, 
        pixelRatio: 4, // 4x scale for high resolution
        backgroundColor: 'transparent'
      });
      const link = document.createElement('a');
      link.download = 'tiptab-logo.png';
      link.href = dataUrl;
      link.click();
      toast({ title: "PNG Downloaded", description: "High-resolution logo saved." });
    } catch (err) {
      toast({ title: "Download Failed", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSvg = () => {
    // Basic SVG export of the BrandLogo component's inner SVG
    const svgElement = logoRef.current?.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    // Ensure xmlns is present
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.download = 'tiptab-logo.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "SVG Downloaded", description: "Vector logo saved." });
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header />

      <main className="container mx-auto px-6 pt-44 pb-24 max-w-4xl">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                <ImageIcon className="h-3.5 w-3.5" />
                Media Kit
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
                BRAND <span className="text-orange-500">ASSETS</span>
              </h1>
              <p className="text-xl text-white/60 font-medium">
                Official high-resolution logos and vector files for the TIPTAB platform.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Logo Card */}
            <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              
              <div ref={logoRef} className="p-8 bg-black/20 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
                <BrandLogo size="lg" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Button 
                  onClick={downloadPng}
                  disabled={isDownloading}
                  className="h-14 rounded-2xl bg-white text-black hover:bg-purple-500 hover:text-white font-black text-sm uppercase tracking-widest transition-all"
                >
                  {isDownloading ? "Generating..." : <><Download className="mr-2 h-4 w-4" /> PNG (4K)</>}
                </Button>
                <Button 
                  variant="outline"
                  onClick={downloadSvg}
                  className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest transition-all"
                >
                  <FileCode className="mr-2 h-4 w-4" /> SVG Vector
                </Button>
              </div>
            </div>

            {/* Icon Only Card */}
            <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
              
              <div className="p-10 bg-black/20 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
                <BrandLogo size="lg" showText={false} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-black text-lg uppercase tracking-tight italic">Platform Icon</h3>
                <p className="text-sm text-white/40 font-bold">Use this for small avatars or profile markers.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 border border-white/10 rounded-[40px] p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-1">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter">Usage Guidelines</h4>
              <p className="text-white/60 font-medium text-sm">Always maintain the high-contrast aesthetic and preserve clear spacing.</p>
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