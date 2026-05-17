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
    <section className="py-32 container mx-auto px-6 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/60">
            <Zap className="h-3 w-3 text-orange-500" />
            Verified Creators
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Inspiration</span>
          </h2>
          <p className="text-xl text-white/50 max-w-xl">
            Directly support the next generation of builders on the XPR Network.
          </p>
        </div>
        
        <Button 
          onClick={onAddYourself}
          className="bg-white text-black hover:bg-white/90 flex items-center gap-2 rounded-2xl h-16 px-10 font-black text-xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-1 active:translate-y-0"
        >
          <Plus className="h-6 w-6" />
          Join The Map
        </Button>
      </div>
      
      <div className="space-y-8 mb-16">
        <div className="flex flex-col lg:flex-row items-center gap-6 bg-white/[0.02] p-3 rounded-[32px] border border-white/5 backdrop-blur-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20" />
            <Input 
              placeholder="Search by name, handle, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 bg-transparent border-transparent h-16 rounded-2xl text-xl focus:ring-0 placeholder:text-white/10 text-white font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-2 w-full lg:w-auto">
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
                  "rounded-2xl h-12 px-6 whitespace-nowrap font-black text-sm uppercase tracking-widest transition-all border-2",
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
        
        <div className="flex items-center justify-between px-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20">
            Showing <span className="text-white/60">{filteredCreators.length}</span> results
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredCreators.map(creator => {
          const theme = getCategoryTheme(creator.category);
          return (
            <div 
              key={creator.id} 
              onClick={() => onSelectCreator(creator)}
              className="group bg-[#130b21]/30 border border-white/5 rounded-[48px] p-10 hover:border-white/20 hover:bg-[#1a102d]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col min-h-[400px]"
            >
              {/* Dynamic Neon Glow */}
              <div 
                className="absolute -top-20 -right-20 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: theme.color }}
              />
              
              <div className="flex items-start justify-between gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div 
                    className={cn(
                      "h-20 w-20 rounded-[28px] flex items-center justify-center text-3xl font-black border-2 border-white/10 shadow-2xl transition-all group-hover:scale-105 overflow-hidden bg-black/40"
                    )}
                    style={{ borderColor: theme.color + '40' }}
                  >
                    {creator.avatarImage ? (
                      <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: theme.color }}>{creator.avatar}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight group-hover:text-white transition-colors">{creator.name}</h3>
                    <p className="font-bold text-lg" style={{ color: theme.color }}>@{creator.handle}</p>
                  </div>
                </div>
                
                <div 
                  className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest bg-black/40"
                  style={{ borderColor: theme.color + '40', color: theme.color }}
                >
                  {creator.category}
                </div>
              </div>
              
              <p className="text-white/50 text-xl leading-relaxed mb-10 line-clamp-3 relative z-10 font-medium">
                {creator.bio}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2.5 text-white/30 text-sm font-bold">
                    <MapPin className="h-4 w-4" style={{ color: theme.color }} />
                    {creator.location}
                  </div>
                  <div className="flex items-center gap-4">
                    {creator.twitter && <Twitter className="h-5 w-5 text-white/20 hover:text-white transition-colors" />}
                    {creator.instagram && <Instagram className="h-5 w-5 text-white/20 hover:text-white transition-colors" />}
                    {creator.videoUrl && <Video className="h-5 w-5 text-white/20 hover:text-white transition-colors" />}
                    {creator.website && <Globe className="h-5 w-5 text-white/20 hover:text-white transition-colors" />}
                  </div>
                </div>
                
                <div 
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all"
                >
                  <QrCode className="h-6 w-6 text-white/40 group-hover:text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};