import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MapPin, QrCode, Twitter, Globe, X } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES = ["All", "Content", "Dev", "Art", "Education", "Gaming", "Music", "Sports", "Service", "Other"];

interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  category: string;
  avatar: string;
  color: string;
}

const MOCK_CREATORS: Creator[] = [
  {
    id: "1",
    name: "TAB Project",
    handle: "tabxpr",
    bio: "The official TAB project account. Supporting the $TAB ecosystem on XPR Network.",
    location: "London, UK",
    category: "Content",
    avatar: "TAB",
    color: "bg-red-600"
  },
  {
    id: "2",
    name: "Priya Sharma",
    handle: "priyatech",
    bio: "Blockchain developer building DeFi tools on XPR Network.",
    location: "Mumbai, India",
    category: "Dev",
    avatar: "PS",
    color: "bg-purple-600"
  },
  {
    id: "3",
    name: "Alex Rivera",
    handle: "alexarts",
    bio: "Digital artist specializing in 3D animations and NFT collectibles.",
    location: "Barcelona, Spain",
    category: "Art",
    avatar: "AR",
    color: "bg-orange-500"
  },
  {
    id: "4",
    name: "Kofi Mensah",
    handle: "kofibuilds",
    bio: "Fullstack developer and open source contributor.",
    location: "Accra, Ghana",
    category: "Dev",
    avatar: "KM",
    color: "bg-blue-600"
  },
  {
    id: "5",
    name: "Sarah Chen",
    handle: "sarahcodes",
    bio: "Frontend specialist and tech educator. Helping people learn React and Web3.",
    location: "Singapore",
    category: "Education",
    avatar: "SC",
    color: "bg-emerald-600"
  },
  {
    id: "6",
    name: "Marcus Wright",
    handle: "mwright",
    bio: "Professional athlete sharing training tips and behind-the-scenes content.",
    location: "New York, USA",
    category: "Sports",
    avatar: "MW",
    color: "bg-sky-600"
  }
];

interface FeaturedCreatorsProps {
  onAddYourself: () => void;
}

export const FeaturedCreators = ({ onAddYourself }: FeaturedCreatorsProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("");

  const filteredCreators = useMemo(() => {
    return MOCK_CREATORS.filter(creator => {
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
          <p className="text-white/40">Click a card to tip with $TAB</p>
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
        <p className="text-xs text-white/40">{filteredCreators.length} of {MOCK_CREATORS.length} creators</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCreators.map(creator => (
          <div 
            key={creator.id} 
            onClick={() => setSelectedCreator(creator)}
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

      {/* Tipping Modal - inspired by tabtip.PNG */}
      <Dialog open={!!selectedCreator} onOpenChange={(open) => !open && setSelectedCreator(null)}>
        <DialogContent className="bg-[#130b21] border-white/10 text-white sm:max-w-[450px] rounded-[32px] p-0 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-purple-900 to-[#130b21]">
             <Button 
               variant="ghost" 
               size="icon" 
               className="absolute top-4 right-4 text-white/60 hover:text-white"
               onClick={() => setSelectedCreator(null)}
             >
               <X className="h-5 w-5" />
             </Button>
          </div>
          
          <div className="px-8 pb-8 -mt-12 relative">
            <div className={`h-24 w-24 rounded-[32px] ${selectedCreator?.color} flex items-center justify-center text-3xl font-bold border-4 border-[#130b21] shadow-xl mb-4`}>
              {selectedCreator?.avatar}
            </div>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedCreator?.name}</h3>
                <p className="text-purple-500 font-medium">@{selectedCreator?.handle}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="icon" className="rounded-xl bg-white/5 border border-white/10">
                   <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-xl bg-white/5 border border-white/10">
                   <Globe className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-white/60 text-sm mb-8">
              {selectedCreator?.bio}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-white/60">Tip Amount</span>
                <span className="text-orange-500">$TAB Tokens</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {["100", "500", "1000"].map(amount => (
                  <Button
                    key={amount}
                    variant="secondary"
                    onClick={() => setTipAmount(amount)}
                    className={`h-12 rounded-xl border ${tipAmount === amount ? "border-orange-500 bg-orange-500/10 text-orange-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                  >
                    {amount}
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <Input 
                  placeholder="Custom amount..." 
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl text-lg font-bold px-6"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 font-bold">$TAB</span>
              </div>
              
              <Button className="w-full h-16 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-lg mt-4 transition-all group">
                Send Tip <Plus className="ml-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
              </Button>
              
              <p className="text-[10px] text-center text-white/20 uppercase tracking-widest pt-4">
                Instant • Zero Fees • Direct to Creator
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};