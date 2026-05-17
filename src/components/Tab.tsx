import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

export const Tab = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // Sync local user profile updates to the display list
  const displayCreators = useMemo(() => {
    const savedUser = localStorage.getItem("tiptab_user_profile");
    if (!savedUser) return CREATORS;
    
    const localUser = JSON.parse(savedUser) as Creator;
    // Check if user is already in CREATORS (by handle or ID)
    const exists = CREATORS.find(c => c.id === localUser.id);
    if (exists) {
      return CREATORS.map(c => c.id === localUser.id ? localUser : c);
    }
    return [localUser, ...CREATORS];
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <ActivityTicker />
      
      <main className="pt-40">
        <Hero creators={displayCreators} />
        <StatsBanner />
        
        <section className="py-12 container mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-purple-500 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <h2 className="text-lg font-bold">Global Creator Network</h2>
            <span className="text-white/40 text-xs">— click a pin to tip instantly</span>
          </div>
          <WorldMap creators={displayCreators} onSelectCreator={setSelectedCreator} />
        </section>

        <HowItWorks />

        <FeaturedCreators 
          creators={displayCreators}
          onSelectCreator={setSelectedCreator} 
          onAddYourself={() => setIsMembershipOpen(true)} 
        />
      </main>
      
      <footer className="py-24 border-t border-white/5 bg-black/20 mt-20">
        <div className="container mx-auto px-6 text-center">
          <Link to="/" className="mb-12 flex flex-col items-center gap-8 group inline-flex">
            <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-40 w-40 object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.2)] group-hover:scale-105 transition-transform duration-500" />
            <span className="text-5xl font-black italic tracking-tighter text-white group-hover:text-[#ff3131] transition-colors duration-300">
              TIP<span className="text-orange-500">TAB</span>
            </span>
          </Link>
          <p className="text-white/40 max-w-md mx-auto mb-12 text-lg">
            Empowering creators through direct, fee-free tipping on the XPR Network. Join the future of creator support.
          </p>
          <div className="flex justify-center gap-10 text-white/60 font-bold">
            <a href="#" className="hover:text-purple-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Telegram</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 text-white/20 text-xs font-medium tracking-widest uppercase">
            © {new Date().getFullYear()} TIPTAB Platform. Built on XPR Network.
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