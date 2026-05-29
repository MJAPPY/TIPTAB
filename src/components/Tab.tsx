"use client";

import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "./tab-platform/Header";
import { Hero } from "./tab-platform/Hero";
import { StatsBanner } from "./tab-platform/Sections";
import { WorldMap } from "./tab-platform/WorldMap";
import { TopVotedCreators } from "./tab-platform/TopVotedCreators";
import { FeaturedCreators } from "./tab-platform/FeaturedCreators";
import { HowItWorks } from "./tab-platform/HowItWorks";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { TippingModal } from "./tab-platform/TippingModal";
import { ActivityTicker } from "./tab-platform/ActivityTicker";
import { Toaster } from "@/components/ui/toaster";
import { Creator } from "@/data/creators";
import { useXpr } from "@/contexts/XprContext";
import { supabase } from "@/integrations/supabase/client";

export const Tab = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const { actor, userProfile, isMember, dbCreators } = useXpr();
  const [topVotedHandles, setTopVotedHandles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopVoted = async () => {
      const year = new Date().getFullYear();
      const quarter = Math.floor(new Date().getMonth() / 3) + 1;
      const quarterId = `Q${year}-${quarter}`;

      const { data, error } = await supabase
        .from('votes')
        .select('candidate_handle, tab_amount')
        .eq('week_identifier', quarterId);

      if (data && !error) {
        const totals: Record<string, number> = {};
        data.forEach(v => {
          totals[v.candidate_handle] = (totals[v.candidate_handle] || 0) + Number(v.tab_amount);
        });
        const sorted = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([handle]) => handle);
        setTopVotedHandles(sorted);
      }
    };
    fetchTopVoted();
  }, []);

  // Optimized logic to ensure local user profile overrides seed data on the map and lists
  // AND priorities Top Voted pros for the Hero section display logic
  const displayCreators = useMemo(() => {
    let list = [...dbCreators];

    if (actor && userProfile) {
      const cleanActor = actor.toLowerCase();
      const membershipKey = `tiptab_membership_${actor}`;
      const isActuallyMember = isMember || localStorage.getItem(membershipKey) === 'true';

      if (isActuallyMember) {
        const existsIdx = list.findIndex(c => c.handle.toLowerCase() === cleanActor);
        if (existsIdx !== -1) {
          list[existsIdx] = userProfile;
        } else {
          list = [userProfile, ...list];
        }
      }
    }
    
    return list;
  }, [actor, userProfile, isMember, dbCreators]);

  const heroCreators = useMemo(() => {
    if (topVotedHandles.length > 0) {
      const voted = displayCreators.filter(c => topVotedHandles.includes(c.handle.toLowerCase().replace('@', '')));
      if (voted.length > 0) return voted;
    }
    return displayCreators;
  }, [displayCreators, topVotedHandles]);

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
        <div className="relative">
          <Hero creators={heroCreators} onJoin={() => setIsMembershipOpen(true)} />
        </div>
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

        <TopVotedCreators 
          creators={displayCreators}
          topVotedHandles={topVotedHandles}
          onViewProfile={handleViewProfile}
        />

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
            <img src="/logo.png" alt="TIPTAB Logo" className="h-24 w-24 sm:h-40 sm:w-40 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-105 transition-transform duration-500" />
            <span className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white group-hover:text-[#a855f7] transition-colors duration-300">
              TIP<span className="text-orange-500">TAB</span>
            </span>
          </Link>
          <div className="space-y-4 mb-10 sm:mb-12 max-w-xl mx-auto px-4">
            <p className="text-white/40 text-sm sm:text-lg font-medium">
              Empowering the global workforce through direct, fee-free tipping on the <span className="text-purple-400">XPR Network</span>. Join the future of appreciation.
            </p>
            <p className="text-orange-500/80 font-black italic tracking-tight text-lg sm:text-xl uppercase drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              “Tipping is the appreciation of value”
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-white/60 font-bold text-sm sm:text-base">
            <Link to="/docs" className="hover:text-purple-400 transition-colors">FAQ</Link>
            <Link to="/assets" className="hover:text-orange-400 transition-colors">Assets</Link>
            <a 
              href="https://x.com/tabtokenxpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-400 transition-colors"
            >
              X
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