import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe, Instagram, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { Creator } from "@/data/creators";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "All", color: "#a855f7" }, { name: "Art", color: "#22c55e" }, { name: "Automotive", color: "#f43f5e" },
  { name: "Biblical", color: "#fbbf24" }, { name: "Blockchain", color: "#f59e0b" }, { name: "Business", color: "#3b82f6" },
  { name: "Content", color: "#ec4899" }, { name: "Delivery", color: "#f97316" }, { name: "Dev", color: "#06b6d4" },
  { name: "Education", color: "#84cc16" }, { name: "Finance", color: "#10b981" }, { name: "Fishing", color: "#0ea5e9" },
  { name: "Fitness", color: "#10b981" }, { name: "Food", color: "#fbbf24" }, { name: "Gaming", color: "#8b5cf6" },
  { name: "Gardening & Farming", color: "#22c55e" }, { name: "Health", color: "#ef4444" }, { name: "Hospitality", color: "#eab308" },
  { name: "Local News", color: "#60a5fa" }, { name: "Music", color: "#ef4444" }, { name: "Other", color: "#ffffff" },
  { name: "Property Reno", color: "#94a3b8" }, { name: "Realty", color: "#4f46e5" }, { name: "Reviewing", color: "#6366f1" },
  { name: "Service", color: "#64748b" }, { name: "Sports", color: "#3b82f6" }
];

interface FeaturedCreatorsProps {
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
  onViewProfile: (creator: Creator) => void;
  onAddYourself: () => void;
}

export const FeaturedCreators = ({ creators, onSelectCreator, onViewProfile, onAddYourself }: FeaturedCreatorsProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const cats = creator.categories || [];
      const matchesCategory = activeCategory === "All" || cats.includes(activeCategory);
      const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           creator.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [creators, activeCategory, searchQuery]);

  return (
    <section className="py-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
        <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] text-white">
          Discover <br /><span className="text-white/40 italic">Featured Pros</span>
        </h2>
        <Button onClick={onAddYourself} className="bg-white text-black hover:bg-purple-500 hover:text-white rounded-3xl h-16 px-10 font-black text-xl">
          Join Map
        </Button>
      </div>
      
      <div className="space-y-8 mb-16">
        <Input placeholder="Search network..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white/5 border-white/10 h-16 rounded-[24px] text-xl px-8" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.name}
              variant="ghost"
              onClick={() => setActiveCategory(cat.name)}
              className={cn("rounded-xl h-10 px-5 font-black text-[10px] uppercase border transition-all", activeCategory === cat.name ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-transparent text-white/40")}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCreators.map(creator => (
          <div key={creator.id} onClick={() => onViewProfile(creator)} className="bg-[#130b21] border border-white/10 rounded-[40px] p-8 hover:border-purple-500 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl", creator.color)}>
                  {creator.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{creator.name}</h3>
                  <p className="font-bold text-sm text-purple-400">@{creator.handle}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[150px]">
                {(creator.categories || []).slice(0, 2).map(c => (
                  <span key={c} className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[9px] font-black uppercase text-white/60">{c}</span>
                ))}
              </div>
            </div>
            <p className="text-white/60 text-lg mb-8 line-clamp-2">{creator.bio}</p>
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
               <div className="flex items-center gap-2 text-white/40 text-xs font-black uppercase tracking-widest"><MapPin className="h-4 w-4" /> {creator.location}</div>
               <Button onClick={(e) => { e.stopPropagation(); onSelectCreator(creator); }} className="bg-purple-600 text-white rounded-xl h-10 px-6 font-black uppercase text-[10px]">Tip</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};