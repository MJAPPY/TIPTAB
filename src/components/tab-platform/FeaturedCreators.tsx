import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe, Instagram, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { Creator } from "@/data/creators";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "All", color: "#a855f7" },
  { name: "Content", color: "#ff00ff" },
  { name: "Dev", color: "#00ffff" },
  { name: "Art", color: "#39ff14" },
  { name: "Service", color: "#ff5f1f" },
  { name: "Other", color: "#ffffff" }
];

interface FeaturedCreatorsProps {
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
  onAddYourself: () => void;
}

export const FeaturedCreators = ({ creators, onSelectCreator, onAddYourself }: FeaturedCreatorsProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const matchesCategory = activeCategory === "All" || creator.category === activeCategory;
      const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           creator.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [creators, activeCategory, searchQuery]);

  return (
    <section className="py-32 container mx-auto px-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">
            <Zap className="h-3 w-3 fill-current" />
            Verified Network
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">
            Global <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20 italic">Creators</span>
          </h2>
        </div>
        
        <Button 
          onClick={onAddYourself}
          className="bg-white text-black hover:bg-purple-600 hover:text-white flex items-center gap-4 rounded-2xl h-20 px-12 font-black text-2xl shadow-2xl transition-all active:scale-95 group"
        >
          <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform" />
          Join Map
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCreators.map(creator => (
          <div 
            key={creator.id} 
            onClick={() => onSelectCreator(creator)}
            className="group bg-[#130b21]/40 border border-white/5 rounded-[48px] p-10 hover:border-purple-500/40 hover:bg-[#1a102d]/80 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-start justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center text-3xl font-black border-4 border-white/10 shadow-2xl overflow-hidden bg-black/40 group-hover:scale-105 transition-transform duration-500", creator.color)}>
                  {creator.avatarImage ? (
                    <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    creator.avatar
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-colors">{creator.name}</h3>
                  <p className="font-black text-sm tracking-widest text-white/30 uppercase">@{creator.handle}</p>
                </div>
              </div>
              <div className="px-4 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/60">
                {creator.category}
              </div>
            </div>
            
            <p className="text-white/40 text-xl leading-relaxed mb-10 line-clamp-2 font-medium tracking-tight group-hover:text-white/80 transition-colors">
              {creator.bio}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 text-white/20 font-black uppercase tracking-widest text-[11px]">
                <MapPin className="h-4 w-4 text-purple-500" />
                {creator.location}
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 group-hover:bg-purple-600 group-hover:border-purple-400 transition-all shadow-xl group-hover:shadow-purple-600/40">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Tip Me</span>
                <QrCode className="h-5 w-5 text-white/40 group-hover:text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};