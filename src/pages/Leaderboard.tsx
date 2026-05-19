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
  totalValue: [125000, 98400, 82100, 45000, 32000, 28000, 15000, 12000, 5000][index] || 1000,
  activityCount: [412, 321, 284, 156, 98, 76, 45, 32, 12][index] || 5,
  label: "Liquid TAB"
})).sort((a, b) => b.totalValue - a.totalValue);

// Generate mock stats for supporters
const MOCK_SUPPORTERS = [
  { id: "s1", name: "WhaleShark", handle: "whaleshark", avatar: "WS", color: "bg-blue-600", totalValue: 540000, activityCount: 1240, label: "Total Sent", location: "Dubai, UAE" },
  { id: "s2", name: "EarlyAdopter", handle: "early", avatar: "EA", color: "bg-purple-600", totalValue: 215000, activityCount: 890, label: "Total Sent", location: "London, UK" },
  { id: "s3", name: "Tab Fanatic", handle: "fanatic", avatar: "TF", color: "bg-orange-500", totalValue: 185000, activityCount: 650, label: "Total Sent", location: "Austin, USA" },
  { id: "s4", name: "CryptoKing", handle: "cking", avatar: "CK", color: "bg-emerald-600", totalValue: 92000, activityCount: 420, label: "Total Sent", location: "Seoul, KR" },
  { id: "s5", name: "XPR Warrior", handle: "warrior", avatar: "XW", color: "bg-red-600", totalValue: 75000, activityCount: 310, label: "Total Sent", location: "Tokyo, JP" },
];

const Leaderboard = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"creators" | "supporters">("creators");
  const { actor, isMember } = useXpr();
  
  const currentData = useMemo(() => {
    if (activeTab === "creators") return CREATOR_LEADERBOARD;

    // Build Supporter list and include current user if they are a Supporter
    const savedUser = localStorage.getItem("tiptab_user_profile");
    let combinedSupporters = [...MOCK_SUPPORTERS];

    if (savedUser && !isMember) {
      const localUser = JSON.parse(savedUser) as Creator;
      combinedSupporters.push({
        id: localUser.id,
        name: localUser.name,
        handle: localUser.handle,
        avatar: localUser.avatar,
        avatarImage: localUser.avatarImage,
        color: localUser.color,
        totalValue: 0, // Mock value for display
        activityCount: 0,
        label: "Total Sent",
        location: localUser.location
      });
    }

    return combinedSupporters.sort((a, b) => b.totalValue - a.totalValue);
  }, [activeTab, isMember]);

  const DISPLAY_LIMIT = 50;
  const topThree = currentData.slice(0, 3);
  const others = currentData.slice(3, DISPLAY_LIMIT);

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden relative selection:bg-cyan-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-magenta-500/20 blur-[120px] md:blur-[180px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-cyan-500/10 blur-[150px] md:blur-[200px] rounded-full -z-10" />
      
      <main className="container mx-auto px-4 md:px-6 pt-48 pb-24 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8">
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter leading-none">
              TIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400">LEADERBOARD</span>
            </h1>
          </div>
          
          <div className="inline-flex p-2 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl mb-12">
            <Button
              onClick={() => setActiveTab("creators")}
              className={cn(
                "h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all gap-3",
                activeTab === "creators" ? "bg-white text-black shadow-2xl" : "text-white/40 hover:text-purple-400"
              )}
            >
              <Zap className={cn("h-4 w-4", activeTab === "creators" ? "text-orange-500 fill-orange-500" : "")} />
              Creators
            </Button>
            <Button
              onClick={() => setActiveTab("supporters")}
              className={cn(
                "h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all gap-3",
                activeTab === "supporters" ? "bg-white text-black shadow-2xl" : "text-white/40 hover:text-purple-400"
              )}
            >
              <Heart className={cn("h-4 w-4", activeTab === "supporters" ? "text-red-500 fill-red-500" : "")} />
              Supporters
            </Button>
          </div>
        </div>

        {/* Podium Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-6 mb-24 lg:mb-32">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="w-full max-w-sm md:w-72 order-2 md:order-1 animate-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="bg-[#120a21]/80 border-2 border-slate-400/50 rounded-[40px] p-6 md:p-8 text-center relative group hover:border-slate-400 transition-all shadow-[0_0_30px_rgba(148,163,184,0.1)]">
                <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-slate-300 text-black font-black px-4 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-widest shadow-lg">2nd Place</div>
                <div className={cn("h-24 md:h-28 w-24 md:w-28 rounded-3xl mx-auto mb-6 border-4 border-slate-400 flex items-center justify-center text-3xl font-black overflow-hidden shadow-2xl relative", topThree[1].color)}>
                  {("avatarImage" in topThree[1] && topThree[1].avatarImage) ? (
                    <img src={topThree[1].avatarImage as string} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="relative z-10 text-white">{topThree[1].avatar}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-1 truncate px-2">{topThree[1].name}</h3>
                <p className="text-slate-200 font-bold mb-6 text-sm md:text-base">@{topThree[1].handle}</p>
                <div className="text-2xl md:text-3xl font-black text-slate-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {topThree[1].totalValue.toLocaleString()} <span className="text-xs text-slate-400 font-black">TAB</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="w-full max-w-sm md:w-80 order-1 md:order-2 animate-in zoom-in-95 duration-1000 scale-105 md:scale-110">
              <div className="bg-[#1a0f2e]/80 border-4 border-yellow-400/60 rounded-[48px] p-8 md:p-10 text-center relative group hover:border-yellow-400 transition-all shadow-[0_0_60px_rgba(250,204,21,0.2)] md:-translate-y-8 overflow-hidden">
                <div className="absolute top-2 right-2 p-2 md:p-4">
                  <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 animate-bounce" />
                </div>
                <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black px-6 py-1.5 rounded-full text-xs md:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.5)]">Champion</div>
                <div className={cn("h-32 md:h-36 w-32 md:w-36 rounded-[32px] mx-auto mb-8 border-4 border-yellow-400 flex items-center justify-center text-4xl font-black overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.3)] relative", topThree[0].color)}>
                  {("avatarImage" in topThree[0] && topThree[0].avatarImage) ? (
                    <img src={topThree[0].avatarImage as string} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="relative z-10 text-white">{topThree[0].avatar}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/40 to-transparent" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-1 truncate px-2">{topThree[0].name}</h3>
                <p className="text-yellow-300 font-black mb-8 text-sm md:text-base">@{topThree[0].handle}</p>
                <div className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                  {topThree[0].totalValue.toLocaleString()} <span className="text-xs md:text-sm text-yellow-400 font-black">TAB</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="w-full max-w-sm md:w-72 order-3 animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="bg-[#120a21]/80 border-2 border-orange-700/50 rounded-[40px] p-6 md:p-8 text-center relative group hover:border-orange-700 transition-all shadow-[0_0_30px_rgba(194,65,12,0.1)]">
                <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-orange-600 text-white font-black px-4 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-widest shadow-lg">3rd Place</div>
                <div className={cn("h-24 md:h-28 w-24 md:w-28 rounded-3xl mx-auto mb-6 border-4 border-orange-700 flex items-center justify-center text-3xl font-black overflow-hidden shadow-2xl relative", topThree[2].color)}>
                  {("avatarImage" in topThree[2] && topThree[2].avatarImage) ? (
                    <img src={topThree[2].avatarImage as string} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="relative z-10 text-white">{topThree[2].avatar}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 to-transparent" />
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-1 truncate px-2">{topThree[2].name}</h3>
                <p className="text-orange-300 font-bold mb-6 text-sm md:text-base">@{topThree[2].handle}</p>
                <div className="text-2xl md:text-3xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                  {topThree[2].totalValue.toLocaleString()} <span className="text-xs text-orange-600 font-black">TAB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 text-cyan-200 font-black uppercase tracking-widest text-[9px] md:text-[10px]">
            <div className="flex items-center gap-6 md:gap-12">
              <span className="w-8 text-center">Rank</span>
              <span>Participant</span>
            </div>
            <div className="flex items-center gap-6 md:gap-12">
              <span className="hidden sm:inline">{activeTab === "creators" ? "Tips Received" : "Tips Sent"}</span>
              <span className="w-20 md:w-24 text-right">{currentData[0]?.label}</span>
            </div>
          </div>

          {others.map((participant, i) => (
            <div 
              key={participant.id}
              className="bg-white/5 border border-white/10 rounded-[24px] md:rounded-3xl p-4 md:p-6 flex items-center justify-between group hover:bg-white/15 hover:border-cyan-400/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 md:gap-8">
                <span className="w-8 text-center font-black text-white/60 text-lg md:text-xl group-hover:text-purple-400 transition-colors">#{i + 4}</span>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={cn("h-12 md:h-16 w-12 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-xl font-black border-2 border-white/20 overflow-hidden relative shadow-lg", participant.color)}>
                    {("avatarImage" in participant && participant.avatarImage) ? (
                      <img src={participant.avatarImage as string} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="relative z-10 text-white">{participant.avatar}</span>
                    )}
                  </div>
                  <div className="max-w-[100px] sm:max-w-none">
                    <h4 className="font-black text-sm md:text-lg group-hover:text-purple-100 transition-colors truncate">{participant.name}</h4>
                    <p className="text-xs md:text-sm text-white/70 font-bold group-hover:text-purple-400 transition-colors truncate">@{participant.handle}</p>
                    <p className="text-[9px] text-slate-500 font-bold mt-0.5">{participant.location}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-12">
                <div className="hidden sm:flex items-center gap-2 text-white/80 font-black text-xs md:text-sm">
                  {activeTab === "creators" ? (
                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                  ) : (
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  )}
                  {participant.activityCount} {activeTab === "creators" ? "Tips" : "Tips Sent"}
                </div>
                <div className="w-20 md:w-32 text-right">
                  <span className="text-xl md:text-2xl font-black group-hover:text-purple-400 transition-colors">{participant.totalValue.toLocaleString()}</span>
                  <span className="text-[9px] md:text-[10px] font-black text-white/40 ml-1 uppercase tracking-widest">TAB</span>
                </div>
              </div>
            </div>
          ))}
          
          {currentData.length > DISPLAY_LIMIT && (
            <div className="pt-10 text-center">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                + {currentData.length - DISPLAY_LIMIT} more participants in the ranking
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-24 md:mt-32 p-8 md:p-16 rounded-[40px] md:rounded-[60px] bg-gradient-to-r from-magenta-600/30 via-purple-600/30 to-cyan-600/30 border-2 border-white/20 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
          <Star className="h-10 w-10 md:h-12 md:w-12 text-yellow-400 mx-auto mb-6 animate-spin-slow drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter italic">WANT TO BE ON THIS LIST?</h2>
          <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto font-bold mb-10 leading-relaxed drop-shadow-md">
            Join the map, share your TipTab card, and let the network show their appreciation for your hustle.
          </p>
          <Button 
            onClick={() => setIsMembershipOpen(true)}
            className="bg-white text-black hover:bg-purple-500 hover:text-white font-black text-lg md:text-2xl rounded-full h-16 md:h-20 px-8 md:px-12 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all active:scale-95"
          >
            JOIN THE NETWORK
          </Button>
        </div>
      </main>

      <MembershipModal 
        isOpen={isMembershipOpen} 
        onOpenChange={setIsMembershipOpen} 
      />

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