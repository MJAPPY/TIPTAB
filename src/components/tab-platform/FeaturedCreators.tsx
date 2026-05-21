import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe, Instagram, Video, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { Creator } from "@/data/creators";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "All", color: "#a855f7" },
  { name: "Delivery", color: "#f97316" }, 
  { name: "Hospitality", color: "#eab308" }, 
  { name: "Content", color: "#ec4899" },
  { name: "Music", color: "#ef4444" },
  { name: "Gaming", color: "#8b5cf6" },
  { name: "Art", color: "#22c55e" },
  { name: "Dev", color: "#06b6d4" },
  { name: "Sports", color: "#3b82f6" },
  { name: "Fishing", color: "#0ea5e9" },
  { name: "Property Reno", color: "#94a3b8" },
  { name: "Automotive", color: "#f43f5e" },
  { name: "Realty", color: "#4f46e5" },
  { name: "Fitness", color: "#10b981" },
  { name: "Education", color: "#84cc16" },
  { name: "Service", color: "#64748b" },
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

  const getCategoryTheme = (categoryName: string) => {
    return CATEGORIES.find(c => c.name === categoryName) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <section className="py-20 container mx-auto px-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
            Verified Network
          </div>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] text-white">
            Discover <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 italic">Featured Pros</span>
          </h2>
        </div>
        
        <Button 
          onClick={onAddYourself}
          className="bg-white text-black hover:bg-purple-500 hover:text-purple-100 flex items-center gap-3 rounded-[24px] h-16 px-10 font-black text-xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all active:scale-95 group"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
          Join The Map
        </Button>
      </div>
      
      <div className="space-y-8 mb-16">
        <div className="flex flex-col gap-6 bg-white/[0.05] p-6 md:p-8 rounded-[40px] border border-white/20 backdrop-blur-3xl shadow-2xl">
          <div className="relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-purple-500 transition-colors" />
            <Input 
              placeholder="Search by name, handle, or city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(setSearchQuery(e.target.value))}
              className="pl-16 bg-white/5 border-white/10 h-16 rounded-[24px] text-xl focus-visible:ring-2 focus-visible:ring-purple-500/50 placeholder:text-white/30 text-white font-bold tracking-tight"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.name}
                variant="ghost"
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "rounded-2xl h-12 px-6 whitespace-nowrap font-black text-[11px] uppercase tracking-[0.15em] transition-all border-2",
                  activeCategory === cat.name 
                  ? "bg-purple-500/20 border-purple-500/60 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
                  : "bg-white/5 border-transparent text-white/60 hover:text-purple-400 hover:bg-purple-500/10"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredCreators.map(creator => {
          const theme = getCategoryTheme(creator.category);
          return (
            <div 
              key={creator.id} 
              onClick={() => onSelectCreator(creator)}
              className="group bg-[#130b21]/60 border border-white/10 rounded-[48px] p-8 hover:border-purple-500/50 hover:bg-[#1a102d]/80 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col min-h-[340px] shadow-2xl"
            >
              <div 
                className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: theme.color }}
              />
              
              <div className="flex items-start justify-between gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div 
                    className="h-20 w-20 rounded-[32px] flex items-center justify-center text-2xl font-black border-4 border-white/10 shadow-2xl overflow-hidden bg-black/40 group-hover:scale-105 transition-transform duration-500"
                    style={{ borderColor: theme.color + '60' }}
                  >
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: theme.color }}>{creator.avatar}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-colors">{creator.name}</h3>
                    <p className="font-bold text-sm tracking-wide opacity-70 text-white/80">@{creator.handle}</p>
                  </div>
                </div>
                
                <div 
                  className="px-4 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40"
                  style={{ borderColor: theme.color + '50', color: theme.color }}
                >
                  {creator.category}
                </div>
              </div>
              
              <p className="text-white/70 text-lg leading-relaxed mb-8 line-clamp-2 relative z-10 font-medium tracking-tight group-hover:text-purple-300 transition-colors">
                {creator.bio}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2.5 text-white/60 text-xs font-black uppercase tracking-widest group-hover:text-purple-300 transition-colors">
                    <MapPin className="h-4 w-4" style={{ color: theme.color }} />
                    {creator.location}
                  </div>
                  <div className="flex items-center gap-4">
                    {creator.twitter && <Twitter className="h-4 w-4 text-white/40 hover:text-purple-400 transition-colors" />}
                    {creator.instagram && <Instagram className="h-4 w-4 text-white/40 hover:text-purple-400 transition-colors" />}
                    {creator.website && <Globe className="h-4 w-4 text-white/40 hover:text-purple-400 transition-colors" />}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-3 group-hover:bg-purple-500 group-hover:border-purple-400 transition-all shadow-xl group-hover:shadow-purple-500/40">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 group-hover:text-white">Tip Me</span>
                  <QrCode className="h-4 w-4 text-white/40 group-hover:text-white group-hover:scale-110 transition-all" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};