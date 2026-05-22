"use client";

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Zap, Star, Crown, Flame, Medal, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

// Reduced seed data for clean deployment
const INITIAL_CREATOR_DATA = [
  { id: "1", name: "TAB Project", handle: "tiptab", avatar: "TAB", color: "bg-red-600", totalValue: 5000, activityCount: 12, location: "" },
  { id: "c20", name: "New Hustler", handle: "join_now", avatar: "NH", color: "bg-purple-500", totalValue: 0, activityCount: 0, location: "" },
];

const CREATOR_LEADERBOARD = INITIAL_CREATOR_DATA.sort((a, b) => b.activityCount - a.activityCount);

const MOCK_SUPPORTERS: any[] = [];

const Leaderboard = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"creators" | "supporters">("creators");
  const { actor, isMember, balances } = useXpr();
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const currentData = useMemo(() => {
    if (activeTab === "creators") return CREATOR_LEADERBOARD;

    // Build Supporter list and include current user if they are a Supporter
    const savedUser = localStorage.getItem("tiptab_user_profile");
    let combinedSupporters = [...MOCK_SUPPORTERS];

    if (savedUser && !isMember && actor) {
      const localUser = JSON.parse(savedUser) as Creator;
      if (!combinedSupporters.find(s => s.handle === localUser.handle)) {
        combinedSupporters.push({
          id: localUser.id,
          name: localUser.name,
          handle: localUser.handle,
          avatar: localUser.avatar,
          avatarImage: localUser.avatarImage,
          color: localUser.color,
          totalValue: parseInt(localStorage.getItem(`tiptab_tips_sent_${actor}`) || "0"), 
          activityCount: parseInt(localStorage.getItem(`tiptab_tips_sent_${actor}`) || "0"),
          label: "Tips Sent",
          location: localUser.location
        });
      }
    }

    return combinedSupporters.sort((a, b) => b.activityCount - a.activityCount);
  }, [activeTab, isMember, actor]);

  const DISPLAY_LIMIT = 20; 
  const topThree = currentData.slice(0, 3);
  const others = currentData.slice(3, DISPLAY_LIMIT);

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

        {/* Podium Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 md:gap-6 mb-24 lg:mb-32">
          {currentData.length === 0 ? (
            <div className="py-20 text-center opacity-40 italic font-bold">Waiting for network activity...</div>
          ) : (
            <>
              {/* Podium rendering logic for top 3 */}
              {topThree.map((participant, index) => {
                const rank = index === 0 ? "1st" : index === 1 ? "2nd" : "3rd";
                const isFirst = index === 0;
                return (
                  <div key={participant.id} className={cn("w-full max-w-sm md:w-72 order-2 animate-in slide-in-from-bottom-8 duration-700", isFirst && "scale-105 md:scale-110 order-1")}>
                    <div className={cn(
                      "bg-[#120a21]/80 border-2 rounded-[40px] p-6 md:p-8 text-center relative group hover:border-white transition-all shadow-2xl",
                      isFirst ? "border-yellow-400/60" : "border-slate-400/50"
                    )}>
                      <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-white/10 text-white font-black px-4 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-widest shadow-lg">
                        {rank} Place
                      </div>
                      <div className={cn("h-24 md:h-28 w-24 md:w-28 rounded-3xl mx-auto mb-6 border-4 flex items-center justify-center text-3xl font-black overflow-hidden shadow-2xl relative", participant.color, isFirst ? "border-yellow-400" : "border-slate-400")}>
                        {participant.avatarImage ? (
                          <img src={participant.avatarImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="relative z-10 text-white">{participant.avatar}</span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black mb-1 truncate px-2">{participant.name}</h3>
                      <p className="text-white/60 font-bold mb-6 text-sm md:text-base">@{participant.handle}</p>
                      <div className="text-2xl md:text-3xl font-black text-slate-100">
                        {participant.activityCount.toLocaleString()} <span className="text-xs text-slate-400 font-black">TIPS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* List Section */}
        <div className="max-w-4xl mx-auto space-y-4">
          {others.map((participant, i) => (
            <div 
              key={participant.id}
              className="bg-white/5 border border-white/10 rounded-[24px] md:rounded-3xl p-4 md:p-6 flex items-center justify-between group hover:bg-white/15 hover:border-cyan-400/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 md:gap-8">
                <span className="w-8 text-center font-black text-white/60 text-lg md:text-xl">#{i + 4}</span>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={cn("h-12 md:h-16 w-12 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-xl font-black border-2 border-white/20 overflow-hidden relative shadow-lg", participant.color)}>
                    {participant.avatarImage ? (
                      <img src={participant.avatarImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="relative z-10 text-white">{participant.avatar}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm md:text-lg group-hover:text-purple-100 transition-colors truncate">{participant.name}</h4>
                    <p className="text-xs md:text-sm text-white/70 font-bold">@{participant.handle}</p>
                  </div>
                </div>
              </div>

              <div className="w-20 md:w-32 text-right">
                <span className="text-xl md:text-2xl font-black">{participant.activityCount.toLocaleString()}</span>
                <span className="text-[9px] md:text-[10px] font-black text-orange-500 ml-1 uppercase tracking-widest">Tips</span>
              </div>
            </div>
          ))}
          
          {currentData.length === 0 && activeTab === "supporters" && (
            <div className="py-20 text-center space-y-4 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
               <Heart className="h-12 w-12 mx-auto text-white/10" />
               <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">No supporters detected yet.</p>
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