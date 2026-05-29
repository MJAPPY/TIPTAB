"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Zap, Star, Crown, Flame, Medal, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { useXpr } from "@/contexts/XprContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  handle: string;
  location: string;
  color: string;
  avatar: string;
  avatarImage: string;
  totalValue: number;
  activityCount: number;
}

const Leaderboard = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"creators" | "supporters">("creators");
  const [creatorsList, setCreatorsList] = useState<LeaderboardEntry[]>([]);
  const [supportersList, setSupportersList] = useState<LeaderboardEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { actor } = useXpr();
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const fetchLiveLeaderboard = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch all profiles to populate avatar/name details
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      const profileMap = new Map<string, any>();
      if (profiles && !profilesError) {
        profiles.forEach(p => {
          profileMap.set(p.handle.toLowerCase().trim(), p);
        });
      }

      // 2. Fetch all votes from database
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("voter_handle, candidate_handle, tab_amount");

      if (votes && !votesError) {
        const creatorsGroup: Record<string, { totalValue: number; activityCount: number }> = {};
        const supportersGroup: Record<string, { totalValue: number; activityCount: number }> = {};

        votes.forEach(v => {
          const candidate = v.candidate_handle?.toLowerCase().trim();
          const voter = v.voter_handle?.toLowerCase().trim();
          const amount = Number(v.tab_amount || 0);

          if (candidate) {
            if (!creatorsGroup[candidate]) creatorsGroup[candidate] = { totalValue: 0, activityCount: 0 };
            creatorsGroup[candidate].totalValue += amount;
            creatorsGroup[candidate].activityCount += 1;
          }

          if (voter) {
            if (!supportersGroup[voter]) supportersGroup[voter] = { totalValue: 0, activityCount: 0 };
            supportersGroup[voter].totalValue += amount;
            supportersGroup[voter].activityCount += 1;
          }
        });

        // Map creators
        const mappedCreators: LeaderboardEntry[] = Object.entries(creatorsGroup).map(([handle, stats]) => {
          const profile = profileMap.get(handle);
          return {
            id: `creator-${handle}`,
            name: profile?.name || handle,
            handle: handle,
            location: profile?.location || "Global Network",
            color: profile?.color || "bg-purple-600",
            avatar: profile?.avatar || handle.slice(0, 2).toUpperCase(),
            avatarImage: profile?.avatar_image || "",
            totalValue: stats.totalValue,
            activityCount: stats.activityCount
          };
        }).sort((a, b) => b.totalValue - a.totalValue);

        // Map supporters
        const mappedSupporters: LeaderboardEntry[] = Object.entries(supportersGroup).map(([handle, stats]) => {
          const profile = profileMap.get(handle);
          return {
            id: `supporter-${handle}`,
            name: profile?.name || handle,
            handle: handle,
            location: profile?.location || "Supporter Hub",
            color: profile?.color || "bg-cyan-600",
            avatar: profile?.avatar || handle.slice(0, 2).toUpperCase(),
            avatarImage: profile?.avatar_image || "",
            totalValue: stats.totalValue,
            activityCount: stats.activityCount
          };
        }).sort((a, b) => b.totalValue - a.totalValue);

        setCreatorsList(mappedCreators);
        setSupportersList(mappedSupporters);
      }
    } catch (e) {
      console.error("Failed to load live leaderboard stats:", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLiveLeaderboard();
    const interval = setInterval(fetchLiveLeaderboard, 20000);
    return () => clearInterval(interval);
  }, []);

  const currentData = useMemo(() => {
    return activeTab === "creators" ? creatorsList : supportersList;
  }, [activeTab, creatorsList, supportersList]);

  const topThree = currentData.slice(0, 3);
  const others = currentData.slice(3, 20);

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden relative selection:bg-cyan-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-magenta-500/20 blur-[120px] md:blur-[180px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-cyan-500/10 blur-[150px] md:blur-[200px] rounded-full -z-10" />
      
      <main className="container mx-auto px-4 md:px-6 pt-48 pb-24 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="w-full flex justify-start mb-8 lg:hidden">
             <Button variant="ghost" onClick={handleBack} className="text-white/40 hover:text-purple-400 gap-2 p-0 h-auto">
               <ArrowLeft className="h-5 w-5" />
               <span className="font-bold">Back</span>
             </Button>
          </div>

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
                activeTab === "creators" ? "bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]" : "text-white/40 hover:text-purple-400"
              )}
            >
              <Zap className={cn("h-4 w-4", activeTab === "creators" ? "text-orange-500 fill-orange-500" : "")} />
              Creators
            </Button>
            <Button
              onClick={() => setActiveTab("supporters")}
              className={cn(
                "h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all gap-3",
                activeTab === "supporters" ? "bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]" : "text-white/40 hover:text-purple-400"
              )}
            >
              <Heart className={cn("h-4 w-4", activeTab === "supporters" ? "text-red-500 fill-red-500" : "")} />
              Supporters
            </Button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/40 font-black tracking-widest text-xs uppercase">Syncing Leaderboard...</p>
          </div>
        ) : currentData.length > 0 ? (
          <>
            {/* Podium Section */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-6 mb-24 lg:mb-32">
              
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="w-full max-w-sm md:w-80 order-2 md:order-1 animate-in zoom-in-95 duration-1000">
                  <div className="bg-[#100a21]/80 border-4 border-slate-300/40 rounded-[48px] p-8 text-center relative group hover:border-slate-300 transition-all shadow-[0_0_40px_rgba(148,163,184,0.15)] overflow-hidden">
                    <div className="absolute top-2 right-2 p-4">
                      <Medal className="h-6 w-6 text-slate-300" />
                    </div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-black font-black px-5 py-1 rounded-full text-xs uppercase tracking-widest">Runner Up</div>
                    <div className={cn("h-28 w-28 rounded-[28px] mx-auto mb-6 border-4 border-slate-300 flex items-center justify-center text-3xl font-black overflow-hidden relative shadow-lg", topThree[1].color)}>
                      {topThree[1].avatarImage ? (
                        <img src={topThree[1].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="relative z-10 text-white">{topThree[1].avatar}</span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black mb-1 truncate px-2">{topThree[1].name}</h3>
                    <p className="text-slate-400 font-black mb-6 text-xs">@{topThree[1].handle}</p>
                    <div className="text-2xl md:text-3xl font-black text-white">
                      {topThree[1].totalValue.toLocaleString()} <span className="text-[10px] text-slate-300 font-black">TAB</span>
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
                      {topThree[0].avatarImage ? (
                        <img src={topThree[0].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
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
                <div className="w-full max-w-sm md:w-80 order-3 animate-in zoom-in-95 duration-1000">
                  <div className="bg-[#100a21]/80 border-4 border-orange-500/30 rounded-[48px] p-8 text-center relative group hover:border-orange-500 transition-all shadow-[0_0_40px_rgba(249,115,22,0.15)] overflow-hidden">
                    <div className="absolute top-2 right-2 p-4">
                      <Medal className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-black px-5 py-1 rounded-full text-xs uppercase tracking-widest">3rd Place</div>
                    <div className={cn("h-28 w-28 rounded-[28px] mx-auto mb-6 border-4 border-orange-500 flex items-center justify-center text-3xl font-black overflow-hidden relative shadow-lg", topThree[2].color)}>
                      {topThree[2].avatarImage ? (
                        <img src={topThree[2].avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="relative z-10 text-white">{topThree[2].avatar}</span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black mb-1 truncate px-2">{topThree[2].name}</h3>
                    <p className="text-orange-400 font-black mb-6 text-xs">@{topThree[2].handle}</p>
                    <div className="text-2xl md:text-3xl font-black text-white">
                      {topThree[2].totalValue.toLocaleString()} <span className="text-xs text-orange-500 font-black">TAB</span>
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
                  onClick={() => navigate(`/tip/${participant.handle}`)}
                  className="bg-white/5 border border-white/10 rounded-[24px] md:rounded-3xl p-4 md:p-6 flex items-center justify-between group hover:bg-white/15 hover:border-cyan-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="w-8 text-center font-black text-white/60 text-lg md:text-xl group-hover:text-purple-400 transition-colors">#{i + 4}</span>
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={cn("h-12 md:h-16 w-12 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-xl font-black border-2 border-white/20 overflow-hidden relative shadow-lg", participant.color)}>
                        {participant.avatarImage ? (
                          <img src={participant.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
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
                    <div className="hidden sm:flex items-center gap-2 text-white/40 font-black text-xs md:text-sm">
                      {participant.activityCount.toLocaleString()} <span className="text-[9px] uppercase tracking-widest">Activities</span>
                    </div>
                    <div className="w-24 md:w-32 text-right">
                      <span className="text-xl md:text-2xl font-black group-hover:text-purple-400 transition-colors">{participant.totalValue.toLocaleString()}</span>
                      <span className="text-[9px] md:text-[10px] font-black text-orange-500 ml-1 uppercase tracking-widest">TAB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center space-y-6 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10 max-w-2xl mx-auto">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-white/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight italic text-white uppercase">Network syncing...</h3>
              <p className="text-white/40 font-bold max-w-sm mx-auto text-sm">
                No active {activeTab} data found. Connect your wallet and join the map to appear here.
              </p>
            </div>
          </div>
        )}

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