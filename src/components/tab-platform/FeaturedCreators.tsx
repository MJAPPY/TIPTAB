import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe, Instagram, Video, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { Creator } from "@/data/creators";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "All", color: "white" },
  { name: "Content", color: "#ff00ff", glow: "shadow-[0_0_15px_rgba(255,0,255,0.4)]" },
  { name: "Dev", color: "#00ffff", glow: "shadow-[0_0_15px_rgba(0,255,255,0.4)]" },
  { name: "Art", color: "#39ff14", glow: "shadow-[0_0_15px_rgba(57,255,20,0.4)]" },
  { name: "Education", color: "#ffff00", glow: "shadow-[0_0_15px_rgba(255,255,0,0.4)]" },
  { name: "Gaming", color: "#bc13fe", glow: "shadow-[0_0_15px_rgba(188,19,254,0.4)]" },
  { name: "Music", color: "#ff3131", glow: "shadow-[0_0_15px_rgba(255,49,49,0.4)]" },
  { name: "Sports", color: "#1f51ff", glow: "shadow-[0_0_15px_rgba(31,81,255,0.4)]" },
  { name: "Service", color: "#ff5f1f", glow: "shadow-[0_0_15px_rgba(255,95,31,0.4)]" },
  { name: "Other", color: "#ffffff", glow: "shadow-[0_0_15px_rgba(255,255,255,0.4)]" }
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
    <section className="py-24 container mx-auto px-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/60">
            <Zap className="h-3 w-3 text-orange-500" />
            Verified Creators
          </div>
          <h2 className="text-5xl font-black tracking-tighter leading-none">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Creators</span>
          </h2>
        </div>
        
        <Button 
          onClick={onAddYourself}
          className="bg-white text-black hover:bg-white/90 flex items-center gap-2 rounded-2xl h-14 px-8 font-black text-lg shadow-xl transition-all"
        >
          <Plus className="h-5 w-5" />
          Join The Map
        </Button>
      </div>
      
      <div className="space-y-6 mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-4 bg-white/[0.03] p-2 rounded-[28px] border border-white/10 backdrop-blur-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input 
              placeholder="Search creators..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 bg-transparent border-transparent h-14 rounded-2xl text-lg focus:ring-0 placeholder:text-white/20 text-white font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 w-full lg:w-auto">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.name}
                variant="ghost"
                onClick={() => setActiveCategory(cat.name)}
                style={{ 
                  borderColor: activeCategory === cat.name ? cat.color : 'transparent',
                  color: activeCategory === cat.name ? cat.color : undefined
                }}
                className={cn(
                  "rounded-xl h-10 px-4 whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all border-2",
                  activeCategory === cat.name 
                  ? "bg-white/5" 
                  : "bg-transparent text-white/30 hover:text-white hover:bg-white/5"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCreators.map(creator => {
          const theme = getCategoryTheme(creator.category);
          return (
            <div 
              key={creator.id} 
              onClick={() => onSelectCreator(creator)}
              className="group bg-[#130b21]/60 border border-white/10 rounded-[32px] p-6 hover:border-white/20 hover:bg-[#1a102d]/80 transition-all cursor-pointer relative overflow-hidden flex flex-col min-h-[300px]"
            >
              {/* Dynamic Neon Glow */}
              <div 
                className="absolute -top-16 -right-16 w-48 h-48 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: theme.color }}
              />
              
              <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div 
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10 shadow-xl overflow-hidden bg-black/40"
                    style={{ borderColor: theme.color + '60' }}
                  >
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: theme.color }}>{creator.avatar}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">{creator.name}</h3>
                    <p className="font-bold text-sm" style={{ color: theme.color }}>@{creator.handle}</p>
                  </div>
                </div>
                
                <div 
                  className="px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-black/40"
                  style={{ borderColor: theme.color + '60', color: theme.color }}
                >
                  {creator.category}
                </div>
              </div>
              
              <p className="text-white/80 text-base leading-relaxed mb-6 line-clamp-2 relative z-10 font-medium">
                {creator.bio}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                    <MapPin className="h-3.5 w-3.5" style={{ color: theme.color }} />
                    {creator.location}
                  </div>
                  <div className="flex items-center gap-3">
                    {creator.twitter && <Twitter className="h-4 w-4 text-white/30 hover:text-white transition-colors" />}
                    {creator.instagram && <Instagram className="h-4 w-4 text-white/30 hover:text-white transition-colors" />}
                    {creator.videoUrl && <Video className="h-4 w-4 text-white/30 hover:text-white transition-colors" />}
                    {creator.website && <Globe className="h-4 w-4 text-white/30 hover:text-white transition-colors" />}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 group-hover:bg-white/10 transition-all">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Tip</span>
                  <QrCode className="h-4 w-4 text-white/40 group-hover:text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};