"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, TrendingUp, Users, Globe, Zap, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailedReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DetailedReportModal = ({ isOpen, onOpenChange }: DetailedReportModalProps) => {
  const dailyStats = [
    { day: "Mon", count: 12, growth: "+5%" },
    { day: "Tue", count: 18, growth: "+12%" },
    { day: "Wed", count: 15, growth: "-2%" },
    { day: "Thu", count: 22, growth: "+8%" },
    { day: "Fri", count: 28, growth: "+15%" },
    { day: "Sat", count: 34, growth: "+20%" },
    { day: "Sun", count: 31, growth: "+4%" },
  ];

  const categories = [
    { name: "Hospitality", percentage: 35, color: "bg-orange-500" },
    { name: "Content", percentage: 25, color: "bg-purple-500" },
    { name: "Service", percentage: 20, color: "bg-cyan-500" },
    { name: "Art", percentage: 15, color: "bg-pink-500" },
    { name: "Other", percentage: 5, color: "bg-slate-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#130b21] border-white/10 text-white rounded-[40px] p-0 max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 p-8 border-b border-white/5">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">System Intelligence</span>
            </div>
            <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">Network Growth Report</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-sm">
              Granular breakdown of member acquisition and platform velocity.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-8 space-y-10">
            {/* Velocity Section */}
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Daily Onboarding (Last 7 Days)
              </h4>
              <div className="grid grid-cols-7 gap-3 h-48 items-end px-2">
                {dailyStats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div className="text-[9px] font-black text-white/0 group-hover:text-purple-400 transition-colors mb-1">{stat.count}</div>
                    <div 
                      className="w-full bg-white/5 border border-white/10 rounded-t-xl group-hover:bg-purple-500/40 group-hover:border-purple-500/50 transition-all duration-500 relative overflow-hidden"
                      style={{ height: `${(stat.count / 34) * 100}%` }}
                    >
                       <div className="absolute top-0 left-0 w-full h-1 bg-purple-400/50" />
                    </div>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Category Dominance</h4>
                <div className="space-y-4">
                  {categories.map((cat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white/60">{cat.name}</span>
                        <span className="text-white">{cat.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Key Network KPI</h4>
                <div className="space-y-4">
                  {[
                    { label: "Retention Rate", val: "94.2%", icon: Zap },
                    { label: "Viral K-Factor", val: "1.4", icon: Users },
                    { label: "Geo-Expansion", val: "+2 cities/day", icon: Globe }
                  ].map((kpi, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <kpi.icon className="h-4 w-4 text-white/20" />
                        <span className="text-xs font-bold text-white/60">{kpi.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{kpi.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2">Internal Prediction</p>
              <p className="text-lg font-bold text-white/80 italic">
                Network on track to hit <span className="text-white font-black">2,500 Members</span> by end of Quarter.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-8 border-t border-white/5 bg-black/20 flex justify-end">
          <button 
            onClick={() => onOpenChange(false)}
            className="h-12 px-8 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all"
          >
            Close Report
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};