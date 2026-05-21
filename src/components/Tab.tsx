import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "./tab-platform/Header";
import { Hero } from "./tab-platform/Hero";
import { StatsBanner } from "./tab-platform/Sections";
import { WorldMap } from "./tab-platform/WorldMap";
import { FeaturedCreators } from "./tab-platform/FeaturedCreators";
import { HowItWorks } from "./tab-platform/HowItWorks";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { TippingModal } from "./tab-platform/TippingModal";
import { ActivityTicker } from "./tab-platform/ActivityTicker";
import { Toaster } from "@/components/ui/toaster";
import { CREATORS, Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";

export const Tab = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const { actor, isConnected } = useXpr();
  const navigate = useNavigate();

  // Sync local user profile updates to the display list (Map is for Creators only)
  const displayCreators = useMemo(() => {
    const savedUser = localStorage.getItem("tiptab_user_profile");
    if (!savedUser) return CREATORS;
    
    const localUser = JSON.parse(savedUser) as Creator;
    
    // Check if this specific actor has a membership activation record
    const membershipKey = `tiptab_membership_${actor}`;
    const isLocalUserMember = localStorage.getItem(membershipKey) === 'true';

    // Only add to the map/featured list if they are a member
    if (!isLocalUserMember) return CREATORS;

    const exists = CREATORS.find(c => c.id === localUser.id);
    if (exists) {
      return CREATORS.map(c => c.id === localUser.id ? localUser : c);
    }
    return [localUser, ...CREATORS];
  }, [actor]);

  const handleViewProfile = (creator: Creator) => {
    navigate(`/tip/${creator.handle}`);
  };

  const handleOpenTipping = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <ActivityTicker />
      
      <main className="pt-24 md:pt-32">
        <Hero creators={displayCreators} onJoin={() => setIsMembershipOpen(true)} />
        <StatsBanner />
        
        <section className="py-12 container mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-purple-500 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">Live on XPR Network</h2>
            <span className="text-white/40 text-[10px] sm:text-xs">— click a pin to view profile</span>
          </div>
          <WorldMap creators={displayCreators} onSelectCreator={handleViewProfile} />
        </section>

        <HowItWorks />

        <FeaturedCreators 
          creators={displayCreators}
          onSelectCreator={handleOpenTipping} 
          onViewProfile={handleViewProfile}
          onAddYourself={() => setIsMembershipOpen(true)} 
        />
      </main>
      
      <footer className="py-16 sm:py-24 border-t border-white/5 bg-black/20 mt-20">
        <div className="container mx-auto px-6 text-center">
          <Link to="/" className="mb-8 sm:mb-12 flex flex-col items-center gap-4 sm:gap-8 group inline-flex">
            <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-24 w-24 sm:h-40 sm:w-40 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-105 transition-transform duration-500" />
            <span className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white group-hover:text-[#a855f7] transition-colors duration-300">
              TIP<span className="text-orange-500">TAB</span>
            </span>
          </Link>
          <p className="text-white/40 max-w-md mx-auto mb-10 sm:mb-12 text-sm sm:text-lg font-medium px-4">
            Empowering the global workforce through direct, fee-free tipping on the <span className="text-purple-400">XPR Network</span>. Join the future of appreciation.
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-white/60 font-bold text-sm sm:text-base">
            <Link to="/docs" className="hover:text-purple-400 transition-colors">Documentation</Link>
            <Link to="/assets" className="hover:text-orange-400 transition-colors">Assets</Link>
            <a 
              href="https://x.com/tabtokenxpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors"
            >
              Twitter
            </a>
            <a 
              href="https://snipverse.com/tabxpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors"
            >
              Snipverse
            </a>
            <Link to="/docs?section=support" className="hover:text-orange-400 transition-colors">Support Hub</Link>
          </div>
          <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 text-white/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] px-4">
            © {new Date().getFullYear()} TIPTAB Platform. SECURED BY XPR NETWORK.
          </div>
        </div>
      </footer>
      
      <MembershipModal 
        isOpen={isMembershipOpen} 
        onOpenChange={setIsMembershipOpen} 
      />

      <TippingModal 
        creator={selectedCreator} 
        onClose={() => setSelectedCreator(null)} 
      />
      
      <Toaster />
    </div>
  );
};