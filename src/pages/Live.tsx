"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { Search, MapPin, Tv, Radio, Music, Gamepad2, Zap, LayoutGrid, Users, ArrowUpDown, Truck, Coffee, Dumbbell, Trophy, Fish, Hammer, Car, Building, Utensils, Star, Sprout, Briefcase, Link as LinkIcon, Landmark, Newspaper, Sparkles, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useXpr } from "@/contexts/XprContext";

const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Art", icon: Zap },
  { name: "Automotive", icon: Car },
  { name: "Blockchain", icon: LinkIcon },
  { name: "Business", icon: Briefcase },
  { name: "Content", icon: Tv },
  { name: "Delivery", icon: Truck },
  { name: "Dev", icon: Zap },
  { name: "Education", icon: Zap },
  { name: "Finance", icon: Landmark },
  { name: "Fishing", icon: Fish },
  { name: "Fitness", icon: Dumbbell },
  { name: "Food", icon: Utensils },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Gardening & Farming", icon: Sprout },
  { name: "Hospitality", icon: Coffee },
  { name: "Local News", icon: Newspaper },
  { name: "Music", icon: Music },
  { name: "Other", icon: Users },
  { name: "Property Reno", icon: Hammer },
  { name: "Realty", icon: Building },
  { name: "Reviewing", icon: Star },
  { name: "Service", icon: Zap },
  { name: "Sports", icon: Trophy }
];

const Live = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const { actor, isMember, featuredHandles, boostStream, boostPrice } = useXpr();
  const navigate = useNavigate();

  // Filter and Sort creators
  const filteredCreators = useMemo(() => {
    let filtered = CREATORS.filter((c) => {
      const hasLiveLink = c.twitch || c.youtubeLive || c.tiktok || c.instagramLive;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      
      return hasLiveLink && matchesSearch && matchesCategory;
    });

    if (sortBy === "alphabetical") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "random") {
      return [...filtered].sort(() => Math.random() - 0.5);
    } else if (sortBy === "newest") {
      return [...filtered].sort((a, b) => Number(b.id) - Number(a.id));
    } else if (sortBy === "oldest") {
      return [...filtered].sort((a, b) => Number(a.id) - Number(b.id));
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredCreators = useMemo(() => {
    return filteredCreators.filter(c => featuredHandles.includes(c.handle.replace('@', '')));
  }, [filteredCreators, featuredHandles]);

  const regularCreators = useMemo(() => {
    return filteredCreators.filter(c => !featuredHandles.includes(c.handle.replace('@', '')));
  }, [filteredCreators, featuredHandles]);

  const handleBoost = async (handle: string) => {
    if (!isMember) {
      setIsMembershipOpen(true);
      return;
    }
    await boostStream(handle);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-44 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic text-white">
              PERFORMANCE <span className="text-orange-500">HUB</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-xl">
              Real-time appreciation for creators, artists, and pros currently broadcasting <span className="text-red-500 font-black animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] italic">LIVE</span>.
            </p>
          </div>
          <div className="pt-2 md:pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-black uppercase tracking-[0.3em] text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Radio className="h-4 w-4" />
              Live on Network
            </div>
          </div>
        </div>

        {/* Featured Section */}
        {featuredCreators.length > 0 && (
          <div className="mb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
                <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400">Featured Performances</h2>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCreators.map((creator) => (
                <div 
                  key={`featured-${creator.id}`}
                  onClick={() => navigate(`/tip/${creator.handle}`)}
                  className="group relative bg-white/[0.03] border-2 border-orange-500/30 rounded-[40px] overflow-hidden hover:border-orange-500 transition-all duration-500 cursor-pointer shadow-[0_0_50px_rgba(249,115,22,0.15)] ring-4 ring-orange-500/5 flex flex-col h-full"
                >
                  <div className="aspect-video relative overflow-hidden bg-black/40 shrink-0">
                    <div className={cn("absolute inset-0 opacity-20 blur-2xl", creator.color)} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radio className="h-12 w-12 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px] font-black tracking-widest rounded-lg border-none">FEATURED</Badge>
                      <Badge className="bg-red-600/80 backdrop-blur-md text-[10px] font-black tracking-widest rounded-lg border-white/10">LIVE</Badge>
                    </div>
                  </div>

                  <div className="p-8 relative flex-1 flex flex-col justify-between">
                    <div className="absolute -top-12 right-8 h-20 w-20 rounded-[28px] bg-white border-4 border-[#0a0514] flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500 z-10">
                       <div className={cn("h-full w-full flex items-center justify-center text-xl font-black text-white", creator.color)}>
                        {creator.avatar}
                       </div>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-xl font-black tracking-tight group-hover:text-orange-400 transition-colors">{creator.name}</h3>
                        <p className="text-sm font-bold text-white/40">@{creator.handle}</p>
                      </div>
                      <p className="text-white/60 text-sm line-clamp-2 font-medium">
                        {creator.bio}
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{creator.category}</span>
                      <div className="flex items-center gap-2 text-[10px] font-black text-white/40">
                        <MapPin className="h-3 w-3" />
                        {creator.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[40px] mb-12 flex flex-col gap-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-purple-500 transition-colors" />
              <Input 
                placeholder="Search by name, handle, or city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 bg-white/5 border-white/10 h-14 text-lg font-bold placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-purple-500/50 text-white"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px] h-14 bg-white/10 border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white focus:ring-purple-500">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                <SelectItem value="newest" className="font-black text-[10px] uppercase tracking-widest py-3">Newest First</SelectItem>
                <SelectItem value="oldest" className="font-black text-[10px] uppercase tracking-widest py-3">Oldest First</SelectItem>
                <SelectItem value="alphabetical" className="font-black text-[10px] uppercase tracking-widest py-3">Name (A-Z)</SelectItem>
                <SelectItem value="random" className="font-black text-[10px] uppercase tracking-widest py-3">Random Mix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.name}
                variant="ghost"
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "h-12 px-6 rounded-2xl gap-2 font-black text-[11px] uppercase tracking-widest transition-all border-2",
                  selectedCategory === cat.name 
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg" 
                    : "bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10"
                )}
              >
                <cat.icon className="h-4 w-4" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid Section */}
        {regularCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularCreators.map((creator) => {
              const isOwner = actor === creator.handle.replace('@', '');
              const isBoosted = featuredHandles.includes(creator.handle.replace('@', ''));
              
              return (
                <div 
                  key={creator.id}
                  className="group relative bg-[#130b21] border border-white/10 rounded-[40px] overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.3)] transition-all duration-500 shadow-2xl flex flex-col h-full"
                >
                  <div className="aspect-video relative overflow-hidden bg-black/40 shrink-0" onClick={() => navigate(`/tip/${creator.handle}`)}>
                    <div className={cn("absolute inset-0 opacity-20 blur-2xl", creator.color)} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radio className="h-12 w-12 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-red-600 hover:bg-red-600 text-[10px] font-black tracking-widest rounded-lg border-none">LIVE</Badge>
                      <Badge className="bg-black/60 backdrop-blur-md text-[10px] font-black tracking-widest rounded-lg border-white/10 uppercase">
                        {creator.twitch ? 'TWITCH' : creator.youtubeLive ? 'YOUTUBE' : 'BROADCAST'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-8 relative flex-1 flex flex-col justify-between">
                    <div className="space-y-4 flex-1" onClick={() => navigate(`/tip/${creator.handle}`)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10 text-white shrink-0", creator.color)}>
                            {creator.avatar}
                          </div>
                          <div>
                            <h3 className="text-xl font-black tracking-tight group-hover:text-purple-400 transition-colors text-white">{creator.name}</h3>
                            <p className="text-sm font-bold text-white/40">@{creator.handle}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-white/60 text-sm line-clamp-2 font-medium">
                        {creator.bio}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-auto">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{creator.category}</span>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-tight">
                          <MapPin className="h-3 w-3" /> {creator.location}
                        </div>
                      </div>
                      
                      {isOwner && !isBoosted && (
                        <Button 
                          onClick={() => handleBoost(creator.handle)}
                          className={cn(
                            "h-10 rounded-xl font-black text-[10px] uppercase tracking-widest px-5 transition-all shadow-lg",
                            isMember 
                              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20" 
                              : "bg-white/10 text-white/40 hover:bg-orange-500 hover:text-white"
                          )}
                        >
                          {isMember ? (
                            <><Zap className="h-3 w-3 mr-2 fill-white" /> Boost for {boostPrice} XPR</>
                          ) : (
                            <><ShieldCheck className="h-3 w-3 mr-2" /> Verify to Boost</>
                          )}
                        </Button>
                      )}

                      {!isOwner && (
                        <Button 
                          variant="ghost" 
                          onClick={() => navigate(`/tip/${creator.handle}`)}
                          className="h-10 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-5 transition-all"
                        >
                          Join Stream
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Tv className="h-10 w-10 text-white/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight italic text-white">NO LIVE SESSIONS FOUND</h3>
              <p className="text-white/40 font-bold max-w-sm mx-auto text-sm">
                Try adjusting your search or category filters to find active creators.
              </p>
            </div>
          </div>
        )}
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Live;