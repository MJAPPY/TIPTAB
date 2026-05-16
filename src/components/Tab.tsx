import { useState } from "react";
import { Header } from "./tab-platform/Header";
import { Hero } from "./tab-platform/Hero";
import { StatsBanner, CreatorMap } from "./tab-platform/Sections";
import { FeaturedCreators } from "./tab-platform/FeaturedCreators";
import { MembershipModal } from "./tab-platform/MembershipModal";
import { Toaster } from "@/components/ui/toaster";

export const Tab = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      
      <main>
        <Hero />
        <StatsBanner />
        <CreatorMap />
        <FeaturedCreators onAddYourself={() => setIsMembershipOpen(true)} />
      </main>
      
      <footer className="py-20 border-t border-white/5 bg-black/20 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <span className="text-3xl font-black italic tracking-tighter">
              <span className="text-orange-500">TAB</span>
            </span>
          </div>
          <p className="text-white/40 max-w-md mx-auto mb-10">
            Empowering creators through direct, fee-free tipping on the XPR Network. Join the future of creator support.
          </p>
          <div className="flex justify-center gap-8 text-white/60 font-medium">
            <a href="#" className="hover:text-purple-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Telegram</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 text-white/20 text-xs">
            © {new Date().getFullYear()} TAB Platform. Built on XPR Network.
          </div>
        </div>
      </footer>
      
      <MembershipModal 
        isOpen={isMembershipOpen} 
        onOpenChange={setIsMembershipOpen} 
      />
      
      <Toaster />
    </div>
  );
};