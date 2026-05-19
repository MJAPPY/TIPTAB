"use client";

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft, Zap, Star, Crown, Flame, Medal, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

// Generate mock stats for creators
const CREATOR_LEADERBOARD = CREATORS.map((creator, index) => ({
  ...creator,
  totalValue: [152000, 112400, 94100, 52000, 38000, 31000, 18000, 14000, 8000][index] || 1000,
  activityCount: [482, 356, 298, 174, 112, 84, 52, 38, 18][index] || 5,
  label: "Liquid TAB"
})).sort((a, b) => b.totalValue - a.totalValue);

const MOCK_SUPPORTERS = [
  { id: "s1", name: "Alpha Whale", handle: "alpha", avatar: "AW", color: "bg-blue-600", totalValue: 620000, activityCount: 1420, label: "Total Sent", location: "Dubai, UAE" },
  { id: "s2", name: "Early Believer", handle: "believer", avatar: "EB", color: "bg-purple-600", totalValue: 285000, activityCount: 940, label: "Total Sent", location: "London, UK" },
  { id: "s3", name: "TAB Warrior", handle: "warrior", avatar: "TW", color: "bg-orange-500", totalValue: 198000, activityCount: 710, label: "Total Sent", location: "Miami, USA" },
  { id: "s4", name: "Crypto Patron", handle: "patron", avatar: "CP", color: "bg-emerald-600", totalValue: 112000, activityCount: 480, label: "Total Sent", location: "Seoul, KR" },
  { id: "s5", name: "XPR Legend", handle: "legend", avatar: "XL", color: "bg-red-600", totalValue: 88000, activityCount: 360, label: "Total Sent", location: "Tokyo, JP" },
];

const Leaderboard = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"creators" | "supporters">("creators");
  const { isMember } = useXpr();
  
  const currentData = useMemo(() => {
    return activeTab === "creators" ? CREATOR_LEADERBOARD : MOCK_SUPPORTERS;
  }, [activeTab]);

  const topThree = currentData.slice(0, 3);
  const others = currentData.slice(3, 50);

  return (
    <div className="min-h-screen bg-[#06030e] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/5 blur-[200px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-orange-500/5 blur-[200px] rounded-full -z-10" />
      
      <main className="container mx-auto px-6 pt-44 pb-32 relative z-10">
        <div className="flex flex-col items-center text-center mb-24">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Global Rankings</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-none mb-12">
            NETWORK <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">LEADERS</span>
          </h1>
          
          <div className="inline-flex p-1.5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl">
            <Button
              onClick={() => setActiveTab("creators")}
              className={cn(
                "h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all gap-3",
                activeTab === "creators" ? "bg-purple-600 text-white shadow-2xl" : "text-white/40 hover:text-white"
              )}
            >
              <Zap className="h-4 w-4" />
              Creators
            </Button>
            <Button
              onClick={() => setActiveTab("supporters")}
              className={cn(
                "h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all gap-3",
                activeTab === "supporters" ? "bg-purple-600 text-white shadow-2xl" : "text-white/40 hover:text-white"
              )}
            >
              <Heart className="h-4 w-4" />
              Supporters
            </Button>
          </div>
        </div>

        {/* Podium Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-6 mb-32">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="w-full max-w-sm lg:w-80 order-2 lg:order-1 animate-in slide-in-from-bottom-12 duration-700 delay-100">
              <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 text-center relative group hover:bg-white/[0.08] transition-all">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-400 text-black font-black px-6 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-xl">Silver</div>
                <div className={cn("h-28 w-28 rounded-3xl mx-auto mb-8 border-4 border-slate-400/50 flex items-center justify-center text-3xl font-black overflow-hidden shadow-2xl relative", topThree[1].color)}>
                  {topThree[1].avatarImage ? (
                    <img src={topThree[1].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    topThree[1].avatar
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <h3 className="text-2xl font-black mb-1 truncate">{topThree[1].name}</h3>
                <p className="text-purple-400 font-bold mb-8 italic">@{topThree[1].handle}</p>
                <div className="text-3xl font-black text-white">
                  {topThree[1].totalValue.toLocaleString()} <span className="text-xs text-white/40">TAB</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="w-full max-w-md lg:w-96 order-1 lg:order-2 animate-in zoom-in-95 duration-1000 scale-110 relative z-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-[56px] blur-xl opacity-30 animate-pulse" />
              <div className="bg-[#1a0f2e]/90 border-2 border-orange-500/50 rounded-[56px] p-12 text-center relative group backdrop-blur-3xl">
                <div className="absolute top-4 right-6">
                  <Crown className="h-10 w-10 text-orange-500 animate-bounce" />
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-black px-8 py-2 rounded-full text-xs uppercase tracking-[0.2em] shadow-2xl">Champion</div>
                <div className={cn("h-40 w-40 rounded-[40px] mx-auto mb-10 border-4 border-orange-500 flex items-center justify-center text-5xl font-black overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.3)] relative", topThree[0].color)}>
                  {topThree[0].avatarImage ? (
                    <img src={topThree[0].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    topThree[0].avatar
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 to-transparent" />
                </div>
                <h3 className="text-4xl font-black mb-1 truncate">{topThree[0].name}</h3>
                <p className="text-orange-500 font-black mb-10 italic">@{topThree[0].handle}</p>
                <div className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {topThree[0].totalValue.toLocaleString()} <span className="text-sm text-orange-500/60">TAB</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="w-full max-w-sm lg:w-80 order-3 animate-in slide-in-from-bottom-12 duration-700 delay-200">
              <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 text-center relative group hover:bg-white/[0.08] transition-all">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-800 text-white font-black px-6 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-xl">Bronze</div>
                <div className={cn("h-28 w-28 rounded-3xl mx-auto mb-8 border-4 border-orange-800/50 flex items-center justify-center text-3xl font-black overflow-hidden shadow-2xl relative", topThree[2].color)}>
                  {topThree[2].avatarImage ? (
                    <img src={topThree[2].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    topThree[2].avatar
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <h3 className="text-2xl font-black mb-1 truncate">{topThree[2].name}</h3>
                <p className="text-purple-400 font-bold mb-8 italic">@{topThree[2].handle}</p>
                <div className="text-3xl font-black text-white">
                  {topThree[2].totalValue.toLocaleString()} <span className="text-xs text-white/40">TAB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="max-w-4xl mx-auto space-y-4">
          {others.map((participant, i) => (
            <div 
              key={participant.id}
              className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 flex items-center justify-between group hover:bg-white/5 hover:border-purple-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-8">
                <span className="w-8 text-center font-black text-white/20 text-xl group-hover:text-purple-500 transition-colors">#{i + 4}</span>
                <div className="flex items-center gap-5">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10 overflow-hidden relative shadow-lg", participant.color)}>
                    {participant.avatarImage ? (
                      <img src={participant.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      participant.avatar
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-lg group-hover:text-white transition-colors">{participant.name}</h4>
                    <p className="text-sm text-purple-400/60 font-bold group-hover:text-purple-400 transition-colors">@{participant.handle}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Tips</span>
                  <span className="text-white/60 font-bold">{participant.activityCount}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">{participant.totalValue.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-white/20 ml-2 uppercase tracking-widest">TAB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MembershipModal 
        isOpen={isMembershipOpen} 
        onOpenChange={setIsMembershipOpen} 
      />
    </div>
  );
};

export default Leaderboard;