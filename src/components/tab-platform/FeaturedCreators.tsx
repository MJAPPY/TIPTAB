import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe, Instagram, Video } from "lucide-react";
import { useState, useMemo } from "react";
import { Creator } from "@/data/creators";

const CATEGORIES = ["All", "Content", "Dev", "Art", "Education", "Gaming", "Music", "Sports", "Service", "Other"];

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
    <section className="py-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Featured Creators</h2>
          <p className="text-white/60 text-lg">Discover and support builders from around the world</p>
        </div>
        
        <Button 
          onClick={onAddYourself}
          className="bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 rounded-2xl h-14 px-8 font-bold text-lg shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Yourself
        </Button>
      </div>
      
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-4 bg-white/[0.03] p-2 rounded-[28px] border border-white/10 backdrop-blur-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input 
              placeholder="Search by name, @username, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 bg-white/5 border-transparent h-14 rounded-2xl text-lg focus:ring-purple-500 focus:bg-white/10 transition-all placeholder:text-white/30"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-2 w-full lg:w-auto">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant="ghost"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl h-12 px-6 whitespace-nowrap font-bold transition-all ${
                  activeCategory === cat 
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                  : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <p className="text-sm font-medium text-white/40">
            <span className="text-white font-bold">{filteredCreators.length}</span> of {creators.length} creators found
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCreators.map(creator => (
          <div 
            key={creator.id} 
            onClick={() => onSelectCreator(creator)}
            className="group bg-[#130b21]/50 border border-white/10 rounded-[40px] p-8 hover:border-purple-500/50 hover:bg-[#1a102d] transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Hover Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-all" />
            
            <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className={`h-16 w-16 rounded-2xl ${creator.color} flex items-center justify-center text-2xl font-black border border-white/20 shadow-xl group-hover:scale-110 transition-transform overflow-hidden`}>
                  {creator.avatarImage ? (
                    <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    creator.avatar
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-purple-400 transition-colors">{creator.name}</h3>
                  <p className="text-purple-500 font-bold text-base">@{creator.handle}</p>
                </div>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
                {creator.category}
              </div>
            </div>
            
            <p className="text-white/70 text-lg leading-relaxed mb-8 line-clamp-2 relative z-10">
              {creator.bio}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  {creator.location}
                </div>
                <div className="flex items-center gap-3">
                  {creator.twitter && <Twitter className="h-4 w-4 text-white/40 hover:text-blue-400 transition-colors" />}
                  {creator.instagram && <Instagram className="h-4 w-4 text-white/40 hover:text-pink-400 transition-colors" />}
                  {creator.videoUrl && <Video className="h-4 w-4 text-white/40 hover:text-red-400 transition-colors" />}
                  {creator.website && <Globe className="h-4 w-4 text-white/40 hover:text-green-400 transition-colors" />}
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all">
                <QrCode className="h-5 w-5 text-white/80" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};