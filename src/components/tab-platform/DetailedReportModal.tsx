"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap, 
  ArrowUpRight, 
  FileDown, 
  Info, 
  MapPin,
  Calendar,
  CalendarDays,
  CalendarRange
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toPng } from 'html-to-image';
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";

interface DetailedReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DetailedReportModal = ({ isOpen, onOpenChange }: DetailedReportModalProps) => {
  const [timeframe, setTimeframe] = useState("weekly");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const stats = {
    weekly: [
      { label: "Mon", count: 12 }, { label: "Tue", count: 18 }, { label: "Wed", count: 15 },
      { label: "Thu", count: 22 }, { label: "Fri", count: 28 }, { label: "Sat", count: 34 }, { label: "Sun", count: 31 }
    ],
    monthly: [
      { label: "W1", count: 84 }, { label: "W2", count: 112 }, { label: "W3", count: 145 }, { label: "W4", count: 198 }
    ],
    yearly: [
      { label: "Q1", count: 840 }, { label: "Q2", count: 1250 }, { label: "Q3", count: 1890 }, { label: "Q4", count: 2420 }
    ]
  };

  const locations = [
    { city: "London", country: "UK", members: 412, growth: "+12%" },
    { city: "Austin", country: "USA", members: 284, growth: "+18%" },
    { city: "Seoul", country: "KR", members: 195, growth: "+22%" },
    { city: "Madrid", country: "ES", members: 156, growth: "+5%" },
    { city: "Melbourne", country: "AU", members: 142, growth: "+9%" },
  ];

  const currentData = stats[timeframe as keyof typeof stats];
  const maxVal = Math.max(...currentData.map(d => d.count));

  const exportToPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, { 
        quality: 1, 
        pixelRatio: 2.5,
        backgroundColor: '#0a0514' 
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`tiptab-network-report-${timeframe}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0514] border-white/10 text-white rounded-[40px] p-0 max-w-4xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-t-purple-500/20">
        <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Intelligence Report</span>
            </div>
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">Platform Velocity</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3">
             <Tabs value={timeframe} onValueChange={setTimeframe} className="bg-white/5 p-1 rounded-2xl border border-white/10">
               <TabsList className="bg-transparent border-none p-0">
                 <TabsTrigger value="weekly" className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest h-9 px-4">Weekly</TabsTrigger>
                 <TabsTrigger value="monthly" className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest h-9 px-4">Monthly</TabsTrigger>
                 <TabsTrigger value="yearly" className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest h-9 px-4">Yearly</TabsTrigger>
               </TabsList>
             </Tabs>
             <Button 
              onClick={exportToPdf}
              disabled={isExporting}
              className="h-11 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black text-[10px] uppercase tracking-widest px-6 gap-2 transition-all shadow-xl shadow-white/5"
             >
               {isExporting ? <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <FileDown className="h-4 w-4" />}
               PDF Export
             </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[75vh]">
          <div ref={reportRef} className="p-10 space-y-12 bg-[#0a0514]">
            {/* Document Header (Visible in Export) */}
            <div className="flex items-center justify-between pb-8 border-b border-white/10 mb-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
                  <img src="/logo.png" className="h-full w-full object-contain relative z-10" alt="TIPTAB" />
                </div>
                <div className="font-black italic tracking-tighter text-2xl leading-none">
                  <span className="text-white">TIP</span><span className="text-orange-500">TAB</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Network Intel Terminal</p>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Visual Chart Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Acquisition Trend ({timeframe})
                </h4>
                <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-purple-500" /> New Members</div>
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-white/10" /> Goal</div>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 h-56 px-4 relative">
                <div className="absolute inset-0 border-b border-white/5 pointer-events-none" />
                {currentData.map((stat, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="text-[10px] font-black text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{stat.count}</div>
                    <div 
                      className="w-full bg-white/5 border border-white/10 rounded-t-2xl group-hover:bg-purple-600/40 group-hover:border-purple-500/50 transition-all duration-500 relative overflow-hidden"
                      style={{ height: `${(stat.count / maxVal) * 100}%` }}
                    >
                       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-cyan-500" />
                    </div>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* K-Factor Card */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-gradient-to-br from-orange-600/10 to-transparent border border-orange-500/20 rounded-[32px] p-8 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="h-16 w-16 text-orange-500 fill-orange-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-black italic tracking-tighter uppercase text-orange-500">Viral K-Factor</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><Info className="h-4 w-4 text-white/20 hover:text-white" /></TooltipTrigger>
                          <TooltipContent className="bg-[#1a102d] border-white/20 p-4 max-w-xs rounded-xl">
                            <p className="text-xs font-medium leading-relaxed">
                              The K-factor represents exponential growth. $K = i \times c$ where $i$ is invites per user and $c$ is conversion rate.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-5xl font-black text-white tracking-tighter">1.42</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Status: <span className="text-green-400">Expanding</span></p>
                      <p className="text-sm font-bold text-white/70 leading-snug">
                        Each existing member currently brings in average of 1.4 new verified creators. Any value over 1.0 indicates organic sustainability.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8 space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Platform Efficiency
                   </h4>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-white/40">Session Duration</span>
                       <span className="text-white">8m 42s</span>
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-white/40">Bounce Rate</span>
                       <span className="text-white text-green-400">14.2%</span>
                     </div>
                   </div>
                </div>
              </div>

              {/* Location Table Section */}
              <div className="md:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Geo-Distribution Hubs
                  </h4>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Top 5 Hotspots</span>
                </div>

                <div className="bg-[#130b21] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <thead className="bg-white/[0.03] border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-white/30">Location</th>
                        <th className="px-6 py-4 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Members</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-white/30">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {locations.map((loc, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white">{loc.city}</span>
                              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{loc.country}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-base font-black text-slate-200">{loc.members.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 font-black text-[10px]">{loc.growth}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-white/[0.01] text-center border-t border-white/5">
                     <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Syncing 124 other global cities...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[36px] bg-gradient-to-r from-purple-600/10 via-orange-600/5 to-purple-600/10 border border-white/10 text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Quarterly Projection</p>
              <p className="text-2xl font-black text-white tracking-tighter italic leading-tight">
                Network trajectory confirms target of <span className="text-orange-500 underline underline-offset-8 decoration-orange-500/40">5,000 Verified Creators</span> by fiscal Year-End.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};