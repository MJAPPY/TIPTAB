"use client";

import React, { useMemo } from "react";
import { Trophy, Crown, Sparkles, MapPin, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator } from "@/data/creators";
import { cn } from "@/lib/utils";

interface TopVotedCreatorsProps {
  creators: Creator[];
  topVotedHandles: string[];
  onViewProfile: (creator: Creator) => void;
}

export const TopVotedCreators = ({ creators, topVotedHandles, onViewProfile }: TopVotedCreatorsProps) => {
  // Map and sort the creators based on their placement in topVotedHandles
  const topThree = useMemo(() => {
    // If we have live votes in the database
    if (topVotedHandles && topVotedHandles.length > 0) {
      const voted = topVotedHandles
        .map((handle) => creators.find((c) => c.handle.toLowerCase().replace("@", "") === handle.toLowerCase()))
        .filter((c): c is Creator => !!c)
        .slice(0, 3);
      
      if (voted.length > 0) return voted;
    }
    
    // Fallback: Show the top 3 active network creators so the homepage is always gorgeous
    return creators.slice(0, 3);
  }, [creators, topVotedHandles]);

  if (topThree.length === 0) return null;

  return (
    <section className="py-12 container mx-auto px-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/[0.01] blur-[130px] -z-10 pointer-events-none" />
      
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse">
          <Trophy className="h-3.5 w-3.5" />
          Quarterly Champions
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
          TOP VOTED <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-500">PROS</span>
        </h2>
        <p className="text-white/40 text-sm md:text-base max-w-xl font-medium">
          The community has spoken. These are the top-voted superstars of this quarter's active pool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {topThree.map((creator, index) => {
          const podiumColor = index === 0 ? "border-yellow-400/50 shadow-yellow-500/10" : index === 1 ? "border-slate-300/40 shadow-slate-400/10" : "border-orange-500/30 shadow-orange-500/10";
          const podiumBadge = index === 0 ? "bg-yellow-400 text-black font-black" : index === 1 ? "bg-slate-300 text-black font-black" : "bg-orange-500 text-white font-black";
          const placementText = index === 0 ? "1st Place" : index === 1 ? "2nd Place" : "3rd Place";

          return (
            <div 
              key={creator.id}
              onClick={() => onViewProfile(creator)}
              className={cn(
                "group relative bg-[#130b21]/70 border-2 rounded-[40px] p-8 flex flex-col justify-between hover:bg-[#1a102d]/90 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl",
                podiumColor,
                index === 0 ? "md:scale-105 md:-translate-y-2 z-10" : ""
              )}
            >
              <div className="absolute top-0 right-0 p-6 opacity-20">
                {index === 0 && <Crown className="h-10 w-10 text-yellow-400 animate-bounce" />}
                {index > 0 && <Sparkles className="h-8 w-8 text-white/30" />}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10 overflow-hidden bg-black/40 group-hover:scale-105 transition-transform duration-500 shrink-0",
                    creator.color
                  )}>
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      creator.avatar
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest mb-1", podiumBadge)}>
                      {placementText}
                    </span>
                    <h3 className="text-xl font-black text-white truncate group-hover:text-purple-400 transition-colors leading-tight">
                      {creator.name}
                    </h3>
                    <p className="text-xs font-bold text-white/50">@{creator.handle}</p>
                  </div>
                </div>

                <p className="text-white/70 text-sm leading-relaxed line-clamp-2 font-medium">
                  {creator.bio}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  {creator.location}
                </div>
                <div className="flex items-center gap-1 text-purple-400 text-xs font-black uppercase tracking-widest group-hover:translate-x-1.5 transition-transform">
                  Profile <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};