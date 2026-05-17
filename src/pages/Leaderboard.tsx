"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft, Zap, Star, Crown, Flame, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CREATORS } from "@/data/creators";

// Mock data for leaderboard (adding tip amounts to existing creators)
const LEADERBOARD_DATA = CREATORS.map((creator, index) => ({
  ...creator,
  totalTips: [125000, 98400, 82100, 45000, 32000, 28000, 15000, 12000, 5000][index] || 1000,
  tipCount: [412, 321, 284, 156, 98, 76, 45, 32, 12][index] || 5,
})).sort((a, b) => b.totalTips - a.totalTips);

const Leaderboard = () => {
  const topThree = LEADERBOARD_DATA.slice(0, 3);
  const others = LEADERBOARD_DATA.slice(3);

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-hidden relative selection:bg-cyan-500/30">
      {/* Intense Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-magenta-500/20 blur-[180px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 blur-[200px] rounded-full -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] -z-10" />

      <header className="container mx-auto px-6 py-12 flex items-center justify-between relative z-10">
        <Link to="/">
          <Button variant="ghost" className="text-white/60 hover:text-cyan-400 gap-2 font-black transition-all hover:bg-cyan-500/10 rounded-xl h-12">
            <ArrowLeft className="h-5 w-5" />
            BACK TO MAP
          </Button>
        </Link>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
              HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400">FAME</span>
            </h1>
          </div>
          <p className="text-cyan-400/60 font-black uppercase tracking-[0.4em] text-[10px] mt-4">
            The XPR Network Top Earners
          </p>
        </div>
        <div className="w-32 hidden md:block" /> {/* Spacer */}
      </header>

      <main className="container mx-auto px-6 pb-24 relative z-10">
        {/* Podium Section */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-24 mt-12">
          {/* 2nd Place */}
          <div className="w-full md:w-72 order-2 md:order-1 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="bg-[#120a21]/80 border-2 border-slate-400/30 rounded-[40px] p-8 text-center relative group hover:border-slate-400 transition-all shadow-[0_0_30px_rgba(148,163,184,0.1)]">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-400 text-black font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">2nd Place</div>
              <div className="h-28 w-28 rounded-3xl mx-auto mb-6 border-4 border-slate-400/50 flex items-center justify-center text-3xl font-black bg-slate-900 overflow-hidden shadow-2xl relative">
                {topThree[1].avatarImage ? (
                  <img src={topThree[1].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="relative z-10">{topThree[1].avatar}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <h3 className="text-2xl font-black mb-1">{topThree[1].name}</h3>
              <p className="text-slate-400 font-bold mb-6">@{topThree[1].handle}</p>
              <div className="text-3xl font-black text-slate-300">
                {topThree[1].totalTips.toLocaleString()} <span className="text-xs text-slate-500">TAB</span>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="w-full md:w-80 order-1 md:order-2 animate-in zoom-in-95 duration-1000">
            <div className="bg-[#1a0f2e]/80 border-4 border-yellow-400/50 rounded-[48px] p-10 text-center relative group hover:border-yellow-400 transition-all shadow-[0_0_60px_rgba(250,204,21,0.2)] scale-110 md:-translate-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Crown className="h-8 w-8 text-yellow-400 animate-bounce" />
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black px-6 py-1.5 rounded-full text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.5)]">Champion</div>
              <div className="h-36 w-36 rounded-[32px] mx-auto mb-8 border-4 border-yellow-400 flex items-center justify-center text-4xl font-black bg-slate-900 overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.3)] relative">
                {topThree[0].avatarImage ? (
                  <img src={topThree[0].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="relative z-10">{topThree[0].avatar}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/40 to-transparent" />
              </div>
              <h3 className="text-3xl font-black mb-1">{topThree[0].name}</h3>
              <p className="text-yellow-400 font-black mb-8">@{topThree[0].handle}</p>
              <div className="text-4xl font-black text-white">
                {topThree[0].totalTips.toLocaleString()} <span className="text-sm text-yellow-400">TAB</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="w-full md:w-72 order-3 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="bg-[#120a21]/80 border-2 border-orange-700/30 rounded-[40px] p-8 text-center relative group hover:border-orange-700/60 transition-all shadow-[0_0_30px_rgba(194,65,12,0.1)]">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-700 text-white font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">3rd Place</div>
              <div className="h-28 w-28 rounded-3xl mx-auto mb-6 border-4 border-orange-700/50 flex items-center justify-center text-3xl font-black bg-slate-900 overflow-hidden shadow-2xl relative">
                {topThree[2].avatarImage ? (
                  <img src={topThree[2].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="relative z-10">{topThree[2].avatar}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 to-transparent" />
              </div>
              <h3 className="text-2xl font-black mb-1">{topThree[2].name}</h3>
              <p className="text-orange-400/60 font-bold mb-6">@{topThree[2].handle}</p>
              <div className="text-3xl font-black text-orange-400/80">
                {topThree[2].totalTips.toLocaleString()} <span className="text-xs text-orange-800">TAB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling List */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-8 py-4 text-cyan-400/40 font-black uppercase tracking-widest text-[10px]">
            <div className="flex items-center gap-12">
              <span className="w-8 text-center">Rank</span>
              <span>Creator</span>
            </div>
            <div className="flex items-center gap-12">
              <span className="hidden sm:inline">Tips</span>
              <span className="w-24 text-right">Total TAB</span>
            </div>
          </div>

          {others.map((creator, i) => (
            <div 
              key={creator.id}
              className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-8">
                <span className="w-8 text-center font-black text-white/20 text-xl group-hover:text-cyan-400 transition-colors">#{i + 4}</span>
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl ${creator.color} flex items-center justify-center text-xl font-black border-2 border-white/10 overflow-hidden relative shadow-lg`}>
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="relative z-10">{creator.avatar}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-lg group-hover:text-white transition-colors">{creator.name}</h4>
                    <p className="text-sm text-white/40 font-bold group-hover:text-cyan-400/60 transition-colors">@{creator.handle}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="hidden sm:flex items-center gap-2 text-white/40 font-bold">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {creator.tipCount} tips
                </div>
                <div className="w-32 text-right">
                  <span className="text-2xl font-black group-hover:text-cyan-400 transition-colors">{creator.totalTips.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-white/20 ml-1 uppercase tracking-widest">TAB</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-32 p-12 rounded-[50px] bg-gradient-to-r from-magenta-600/20 via-purple-600/20 to-cyan-600/20 border-2 border-white/10 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          <Star className="h-12 w-12 text-yellow-400 mx-auto mb-6 animate-spin-slow" />
          <h2 className="text-4xl font-black mb-4">WANT TO BE ON THIS LIST?</h2>
          <p className="text-white/60 text-xl max-w-xl mx-auto font-medium mb-10">
            Join the map, share your TipTab card, and let the network show their appreciation for your hustle.
          </p>
          <Link to="/">
            <Button className="bg-white text-black hover:bg-cyan-400 hover:text-black font-black text-xl rounded-2xl h-16 px-10 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
              JOIN THE NETWORK
            </Button>
          </Link>
        </div>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;