"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { Search, MapPin, Tv, Radio, Music, Gamepad2, Zap, LayoutGrid, Users, ArrowUpDown, Truck, Coffee, Dumbbell, Trophy, Fish, Hammer, Car, Building, Utensils, Star, Sprout, Briefcase, Link as LinkIcon, Landmark, Newspaper, Sparkles, ShieldCheck, Cloud, Plane, TrainFront, Flame, ShoppingBag, Lightbulb } from "lucide-react";
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
  { name: "Biblical", icon: Zap },
  { name: "Blockchain", icon: LinkIcon },
  { name: "Business", icon: Briefcase },
  { name: "Content", icon: Tv },
  { name: "Critical Think", icon: Lightbulb },
  { name: "Delivery", icon: Truck },
  { name: "DEVS", icon: Zap },
  { name: "Education", icon: Zap },
  { name: "Finance", icon: Landmark },
  { name: "Fishing", icon: Fish },
  { name: "Fitness", icon: Dumbbell },
  { name: "Flips & Thrifters", icon: ShoppingBag },
  { name: "Food", icon: Utensils },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Gardening & Farming", icon: Sprout },
  { name: "Health", icon: Dumbbell },
  { name: "Hospitality", icon: Coffee },
  { name: "Local News", icon: Newspaper },
  { name: "Music", icon: Music },
  { name: "Other", icon: Users },
  { name: "Plane Spot", icon: Plane },
  { name: "Property Reno", icon: Hammer },
  { name: "Realty", icon: Building },
  { name: "Reviewing", icon: Star },
  { name: "Service", icon: Zap },
  { name: "Sports", icon: Trophy },
  { name: "Train Spot", icon: TrainFront },
  { name: "Weather", icon: Cloud }
];

const Live = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const { actor, userProfile, isMember, featuredHandles, boostStream, boostPrice } = useXpr();
  const navigate = useNavigate();

  // Combined creator list including local updates
  const allCreators = useMemo(() => {
    let list = [...CREATORS];

    if (actor && userProfile) {
      const cleanActor = actor.toLowerCase();
      const membershipKey = `tiptab_membership_${actor}`;
      const isActuallyMember = isMember || localStorage.getItem(membershipKey) === 'true';

      if (isActuallyMember) {
        const existsIdx = list.findIndex(c => c.handle.toLowerCase() === cleanActor);
        if (existsIdx !== -1) {
          list[existsIdx] = userProfile;
        } else {
          list = [userProfile, ...list];
        }
      }
    }
    
    return list;
  }, [actor, userProfile, isMember]);

  // Unified Filter logic
  const filteredCreators = useMemo(() => {
    return allCreators.filter((c) => {
      const hasLiveLink = c.twitch || c.youtubeLive || c.tiktok || c.instagramLive;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const creatorCategories = c.categories || [];
      const matchesCategory = selectedCategory === "All" || creatorCategories.includes(selectedCategory);
      
      return hasLiveLink && matchesSearch && matchesCategory;
    });
  }, [allCreators, searchQuery, selectedCategory]);

  // Clean handles for accurate comparison
  const boostedList = useMemo(() => 
    featuredHandles.map(h => h.toLowerCase().replace('@', '')), 
  [featuredHandles]);

  const featuredCreators = useMemo(() => {
    return filteredCreators.filter(c => boostedList.includes(c.handle.toLowerCase().replace('@', '')));
  }, [filteredCreators, boostedList]);

  const regularCreators = useMemo(() => {
    let filtered = filteredCreators.filter(c => !boostedList.includes(c.handle.toLowerCase().replace('@', '')));
    
    // Sort regular grid
    if (sortBy === "alphabetical") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "random") {
      return [...filtered].sort(() => Math.random() - 0.5);
    } else {
      return [...filtered].sort((a, b) => Number(b.id) - Number(a.id));
    }
  }, [filteredCreators, boostedList, sortBy]);

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

        {/* FEATURED / BOOSTED SECTION */}
        {featuredCreators.length > 0 && (
          <div className="mb-20 space-y-10 animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="relative p-1 rounded-[48px] bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-orange-500/20 overflow-hidden">
               <div className="bg-[#0f0a1f]/90 backdrop-blur-3xl rounded-[46px] p-8 md:p-12 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                  
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight uppercase italic text-white text-center">
                      <span className="text-orange-500">Featured</span> Performance Network
                    </h2>
                    <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {featuredCreators.map((creator) => (
                      <div 
                        key={`featured-${creator.id}`}
                        onClick={() => navigate(`/tip/${creator.handle}`)}
                        className="group relative bg-white/[0.04] border-2 border-orange-500/40 rounded-[40px] overflow-hidden hover:border-orange-500 transition-all duration-500 cursor-pointer shadow-[0_30px_70px_-15px_rgba(249,115,22,0.3)] hover:scale-[1.02] ring-8 ring-orange-500/[0.03]"
                      >
                        <div className="aspect-video relative overflow-hidden bg-black/40">
                          <div className={cn("absolute inset-0 opacity-30 blur-3xl", creator.color)} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Flame className="h-16 w-16 text-orange-500/30 group-hover:scale-125 transition-transform duration-700" />
                          </div>
                          
                          <div className="absolute top-5 left-5 flex gap-2">
                            <Badge className="bg-orange-500 text-white border-none shadow-[0_0_15px_rgba(249,115,22,0.6)] px-3 py-1 font-black italic rounded-xl text-[10px] tracking-widest uppercase">
                              <Sparkles className="h-3 w-3 mr-1.5 inline fill-white" /> Featured
                            </Badge>
                            <Badge className="bg-red-600/90 backdrop-blur-md text-[10px] font-black tracking-widest rounded-xl border-white/10">LIVE</Badge>
                          </div>
                        </div>

                        <div className="p-8 space-y-4 relative">
                          <div className="absolute -top-12 right-8 h-20 w-20 rounded-[28px] bg-[#0a0514] border-4 border-orange-500 flex items-center justify-center overflow-hidden shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                             <div className={cn("h-full w-full flex items-center justify-center text-xl font-black text-white", creator.color)}>
                              {creator.avatarImage ? <img src={creator.avatarImage} alt="" className="w-full h-full object-cover" /> : creator.avatar}
                             </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-black tracking-tight group-hover:text-orange-400 transition-colors">{creator.name}</h3>
                            <p className="text-sm font-bold text-orange-400/60">@{creator.handle}</p>
                          </div>
                          <p className="text-white/70 text-sm line-clamp-2 font-medium leading-relaxed">
                            {creator.bio}
                          </p>
                          <div className="pt-5 flex items-center justify-between border-t border-white/10">
                            <div className="flex gap-2">
                              {creator.categories && creator.categories.map((cat, idx) => (
                                <span key={idx} className="text-[10px] font-black uppercase tracking-widest text-orange-400/80">{cat}</span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                              <MapPin className="h-3 w-3 text-orange-500" />
                              {creator.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

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

        {/* REGULAR GRID SECTION */}
        {regularCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularCreators.map((creator) => {
              const isOwner = actor === creator.handle.replace('@', '');
              
              return (
                <div 
                  key={creator.id}
                  className="group relative bg-[#130b21] border border-white/10 rounded-[40px] overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.3)] transition-all duration-500 shadow-2xl"
                >
                  <div className="aspect-video relative overflow-hidden bg-black/40" onClick={() => navigate(`/tip/${creator.handle}`)}>
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

                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between" onClick={() => navigate(`/tip/${creator.handle}`)}>
                      <div className="flex items-center gap-4">
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10 text-white", creator.color)}>
                          {creator.avatarImage ? <img src={creator.avatarImage} alt="" className="w-full h-full object-cover" /> : creator.avatar}
                        </div>
                        <div>
                          <h3 className="text-xl font-black tracking-tight group-hover:text-purple-400 transition-colors text-white">{creator.name}</h3>
                          <p className="text-sm font-bold text-white/40">@{creator.handle}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-sm line-clamp-2 font-medium" onClick={() => navigate(`/tip/${creator.handle}`)}>
                      {creator.bio}
                    </p>

                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1">
                          {creator.categories && creator.categories.map((cat, idx) => (
                            <span key={idx} className="text-[10px] font-black uppercase tracking-widest text-purple-400">{cat}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-tight">
                          <MapPin className="h-3 w-3" /> {creator.location}
                        </div>
                      </div>
                      
                      {isOwner && (
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