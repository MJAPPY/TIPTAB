"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, Flame, Medal, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS } from "@/data/creators";

const LEADERBOARD_DATA = CREATORS.map((creator, index) => ({
  ...creator,
  totalTips: [125000, 98400, 82100, 45000, 32000, 28000, 15000, 12000, 5000][index] || 1000,
  tipCount: [412, 321, 284, 156, 98, 76, 45, 32, 12][index] || 5,
})).sort((a, b) => b.totalTips - a.totalTips);

const Leaderboard = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const topThree = LEADERBOARD_DATA.slice(0, 3);
  const others = LEADERBOARD_DATA.slice(3);

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden relative">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      {/* Intense Background Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-magenta-500/10 blur-[180px] rounded-full -z-10 animate-pulse" />
      
      <main className="container mx-auto px-4 pt-56 pb-24 relative z-10">
        <div className="flex flex-col items-center text-center mb-24">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Trophy className="h-20 w-20 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-none">
              TIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400">LEADERBOARD</span>
            </h1>
          </div>
          <p className="text-cyan-400/60 font-black uppercase tracking-[0.5em] text-xs mt-8">
            The Global XPR Network Top Earners
          </p>
        </div>

        {/* Podium */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-12 mb-32">
          {/* 2nd Place */}
          <div className="w-full max-w-sm md:w-80 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#120a21]/80 border-2 border-white/10 rounded-[48px] p-10 text-center relative group hover:border-cyan-500/40 transition-all shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-400 text-black font-black px-6 py-1.5 rounded-xl text-xs uppercase tracking-widest shadow-xl">Silver</div>
              <div className="h-32 w-32 rounded-[32px] mx-auto mb-8 border-4 border-slate-400/30 flex items-center justify-center text-3xl font-black bg-slate-900 overflow-hidden shadow-2xl">
                {topThree[1].avatarImage ? (
                  <img src={topThree[1].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  topThree[1].avatar
                )}
              </div>
              <h3 className="text-3xl font-black mb-1">{topThree[1].name}</h3>
              <p className="text-cyan-400/40 font-black uppercase tracking-widest text-xs mb-8">@{topThree[1].handle}</p>
              <div className="text-4xl font-black text-white">
                {topThree[1].totalTips.toLocaleString()} <span className="text-xs text-white/20 font-black">TAB</span>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="w-full max-w-sm md:w-96 animate-in zoom-in-95 duration-1000 md:scale-110">
            <div className="bg-[#1a0f2e]/80 border-4 border-yellow-400/50 rounded-[56px] p-12 text-center relative group hover:border-yellow-400 transition-all shadow-[0_0_80px_rgba(250,204,21,0.2)] md:-translate-y-12">
              <Crown className="absolute top-4 right-4 h-10 w-10 text-yellow-400 animate-bounce" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black px-8 py-2 rounded-xl text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.5)]">Champion</div>
              <div className="h-40 w-40 rounded-[40px] mx-auto mb-10 border-4 border-yellow-400 flex items-center justify-center text-4xl font-black bg-slate-900 overflow-hidden shadow-2xl">
                {topThree[0].avatarImage ? (
                  <img src={topThree[0].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  topThree[0].avatar
                )}
              </div>
              <h3 className="text-4xl font-black mb-1">{topThree[0].name}</h3>
              <p className="text-yellow-400 font-black uppercase tracking-widest text-xs mb-10">@{topThree[0].handle}</p>
              <div className="text-5xl font-black text-white">
                {topThree[0].totalTips.toLocaleString()} <span className="text-sm text-yellow-400 font-black">TAB</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="w-full max-w-sm md:w-80 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#120a21]/80 border-2 border-white/10 rounded-[48px] p-10 text-center relative group hover:border-orange-500/40 transition-all shadow-2xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-700 text-white font-black px-6 py-1.5 rounded-xl text-xs uppercase tracking-widest shadow-xl">Bronze</div>
              <div className="h-32 w-32 rounded-[32px] mx-auto mb-8 border-4 border-orange-700/30 flex items-center justify-center text-3xl font-black bg-slate-900 overflow-hidden shadow-2xl">
                {topThree[2].avatarImage ? (
                  <img src={topThree[2].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  topThree[2].avatar
                )}
              </div>
              <h3 className="text-3xl font-black mb-1">{topThree[2].name}</h3>
              <p className="text-orange-500/40 font-black uppercase tracking-widest text-xs mb-8">@{topThree[2].handle}</p>
              <div className="text-4xl font-black text-white">
                {topThree[2].totalTips.toLocaleString()} <span className="text-xs text-white/20 font-black">TAB</span>
              </div>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="max-w-4xl mx-auto space-y-4">
          {others.map((creator, i) => (
            <div 
              key={creator.id}
              className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group hover:bg-white/[0.07] hover:border-cyan-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-10">
                <span className="w-8 text-center font-black text-white/10 text-2xl group-hover:text-cyan-400 transition-colors">#{i + 4}</span>
                <div className="flex items-center gap-6">
                  <div className={`h-20 w-20 rounded-2xl ${creator.color} flex items-center justify-center text-xl font-black border-2 border-white/10 overflow-hidden shadow-xl`}>
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      creator.avatar
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-2xl text-white/80 group-hover:text-white transition-colors">{creator.name}</h4>
                    <p className="text-xs text-white/20 font-black uppercase tracking-widest">@{creator.handle}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="hidden sm:flex items-center gap-2 text-white/20 font-black uppercase tracking-widest text-[10px]">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {creator.tipCount} Tips
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black group-hover:text-cyan-400 transition-colors">{creator.totalTips.toLocaleString()}</span>
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