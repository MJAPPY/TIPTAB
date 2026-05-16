import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe } from "lucide-react";
import { useState, useMemo } from "react";
import { CREATORS, Creator } from "@/data/creators";

const CATEGORIES = ["All", "Content", "Dev", "Art", "Education", "Gaming", "Music", "Sports", "Service", "Other"];

interface FeaturedCreatorsProps {
  onSelectCreator: (creator: Creator) => void;
  onAddYourself: () => void;
}

export const FeaturedCreators = ({ onSelectCreator, onAddYourself }: FeaturedCreatorsProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreators = useMemo(() => {
    return CREATORS.filter(creator => {
      const matchesCategory = activeCategory === "All" || creator.category === activeCategory;
      const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           creator.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section className="py-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Creators</h2>
          <p className="text-white/40">Discover and support builders from around the world</p>
        </div>
        
        <Button 
          onClick={onAddYourself}
          className="bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center gap-2 rounded-xl self-start md:self-center"
        >
          <Plus className="h-4 w-4" />
          Add Yourself
        </Button>
      </div>
      
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder="Search by name, @username, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white/5 border-white/10 h-12 rounded-xl focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "secondary"}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full h-10 px-6 whitespace-nowrap ${
                  activeCategory === cat ? "bg-[#a855f7]" : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">{filteredCreators.length} of {CREATORS.length} creators</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCreators.map(creator => (
          <div 
            key={creator.id} 
            onClick={() => onSelectCreator(creator)}
            className="group bg-[#130b21] border border-white/10 rounded-[32px] p-6 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${creator.color} flex items-center justify-center text-xl font-bold border border-white/20`}>
                  {creator.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">{creator.name}</h3>
                  <p className="text-purple-500 font-medium text-sm">@{creator.handle}</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                {creator.category}
              </div>
            </div>
            
            <p className="text-white/60 text-sm mb-6 line-clamp-2">
              {creator.bio}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-white/40 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  {creator.location}
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="h-3.5 w-3.5 text-white/40 hover:text-blue-400 cursor-pointer" />
                  <Globe className="h-3.5 w-3.5 text-white/40 hover:text-green-400 cursor-pointer" />
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};