"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { Search, MapPin, Tv, Radio, Music, Gamepad2, Zap, LayoutGrid, Users, ArrowUpDown, Truck, Coffee, Dumbbell, Trophy, Fish, Hammer, Car, Building, Utensils, Star, Sprout } from "lucide-react";
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

const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Delivery", icon: Truck },
  { name: "Hospitality", icon: Coffee },
  { name: "Food", icon: Utensils },
  { name: "Reviewing", icon: Star },
  { name: "Content", icon: Tv },
  { name: "Music", icon: Music },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Sports", icon: Trophy },
  { name: "Fishing", icon: Fish },
  { name: "Gardening & Farming", icon: Sprout },
  { name: "Property Reno", icon: Hammer },
  { name: "Automotive", icon: Car },
  { name: "Realty", icon: Building },
  { name: "Fitness", icon: Dumbbell },
  { name: "Service", icon: Zap },
  { name: "Other", icon: Users }
];

const Live = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const navigate = useNavigate();

  // Filter and Sort creators
  const liveCreators = useMemo(() => {
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
      // Assuming higher ID means newer registration
      return [...filtered].sort((a, b) => Number(b.id) - Number(a.id));
    } else if (sortBy === "oldest") {
      return [...filtered].sort((a, b) => Number(a.id) - Number(b.id));
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-44 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
              PERFORMANCE <span className="text-orange-500">HUB</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-xl">
              Real-time appreciation for creators, artists, and pros currently broadcasting live with XPR network integration.
            </p>
          </div>
          <div className="pt-2 md:pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-black uppercase tracking-[0.3em] text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Radio className="h-4 w-4" />
              Live on Network
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[40px] mb-12 flex flex-col gap-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-purple-500 transition-colors" />
              <Input 
                placeholder="Search by name, handle, or city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 bg-white/5 border-white/10 h-14 text-lg font-bold placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-purple-500/50"
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
        {liveCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveCreators.map((creator) => (
              <div 
                key={creator.id}
                onClick={() => navigate(`/tip/${creator.handle}`)}
                className="group relative bg-[#130b21] border border-white/10 rounded-[40px] overflow-hidden hover:border-purple-500/50 transition-all duration-500 cursor-pointer shadow-2xl"
              >
                <div className="aspect-video relative overflow-hidden bg-black/40">
                  <div className={cn("absolute inset-0 opacity-20 blur-2xl", creator.color)} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Radio className="h-12 w-12 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-red-600 hover:bg-red-600 text-[10px] font-black tracking-widest rounded-lg border-none">LIVE</Badge>
                    <Badge className="bg-black/60 backdrop-blur-md text-[10px] font-black tracking-widest rounded-lg border-white/10">
                      {creator.twitch ? 'TWITCH' : creator.youtubeLive ? 'YOUTUBE' : 'BROADCAST'}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white/80">
                      <MapPin className="h-3 w-3 text-purple-400" />
                      {creator.location}
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10", creator.color)}>
                      {creator.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight group-hover:text-purple-400 transition-colors">{creator.name}</h3>
                      <p className="text-sm font-bold text-white/40">@{creator.handle}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-2 font-medium">
                    {creator.bio}
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{creator.category}</span>
                    <Button variant="ghost" className="h-8 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 text-[10px] font-black uppercase tracking-widest px-4">
                      Join Stream
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Tv className="h-10 w-10 text-white/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight italic">NO LIVE SESSIONS FOUND</h3>
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