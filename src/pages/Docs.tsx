"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Wallet, 
  MapPin, 
  Users, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  MessageCircle,
  Mail,
  Eye,
  ShieldAlert,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const Docs = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const { isMember, isConnected, login } = useXpr();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to support section if requested via URL
  useEffect(() => {
    if (location.search.includes("section=support")) {
      const el = document.getElementById("support-hub");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const faqs = [
    {
      q: "What is TAB?",
      a: "TAB is a utility token on the XPR Network designed for the tipping economy. It offers high-speed settlement and is the primary currency of the TIPTAB ecosystem."
    },
    {
      q: "Are there any hidden fees?",
      a: "No. TIPTAB takes 0% from tips. The only cost is the yearly network activation fee for creators and standard XPR Network resource usage (which is usually free for end-users via WebAuth)."
    },
    {
      q: "How do I get my location on the map?",
      a: "Once you are a member, go to your Dashboard > Profile. Enter your city in the location field. Our geocoder will automatically place your pin on the global map."
    }
  ];

  const handleCtaClick = () => {
    if (isMember) {
      navigate("/dashboard");
    } else {
      setIsMembershipOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-36 pb-24 max-w-5xl">
        <div className="space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-black uppercase tracking-widest text-purple-400">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
                NETWORK <span className="text-orange-500">GUIDELINES</span>
              </h1>
              <p className="text-orange-500/80 font-black italic tracking-[0.15em] text-lg md:text-xl uppercase drop-shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                “Tipping is the appreciation of value”
              </p>
            </div>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">
              Everything you need to know about the most direct appreciation network available anywhere, built on the XPR Network.
            </p>
          </div>

          {/* Core Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-purple-400" />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black tracking-tight italic">Getting Started</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">To use TIPTAB, you need a WebAuth wallet. This is your secure gateway to the XPR Network.</p>
              </div>
              <Button onClick={isConnected ? () => navigate("/dashboard") : login} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl h-12">
                {isConnected ? "Go to Wallet" : "Connect Now"}
              </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Zap className="h-7 w-7 text-cyan-400" />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black tracking-tight italic">Giving Tips</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">Tipping is instant and carries zero platform fees. 100% goes directly to the creator.</p>
              </div>
              <Button onClick={() => navigate("/")} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl h-12 border border-white/10">
                View Global Map
              </Button>
            </div>

            <div className="bg-white/5 border-2 border-orange-500/20 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-orange-500" />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black tracking-tight italic">Be a Creator</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">Join the map and receive tips. Yearly activation fee applies.</p>
              </div>
              <Button onClick={handleCtaClick} className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl h-12 shadow-lg shadow-orange-500/20">
                {isMember ? "Dashboard" : "Join The Map"}
              </Button>
            </div>
          </div>

          {/* Support Hub Section */}
          <div id="support-hub" className="space-y-10 pt-16 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-orange-500" />
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">SUPPORT HUB</h2>
                </div>
                <p className="text-white/50 font-bold text-lg max-w-xl">
                  Connect with the team or the community for technical assistance and network inquiries.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Snipverse Card */}
              <div className="bg-[#130b21] border border-white/10 rounded-[40px] p-10 space-y-6 group hover:border-purple-500/40 transition-all">
                <div className="h-16 w-16 rounded-[24px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-black italic uppercase">Social Hub</h4>
                  <p className="text-white/40 font-medium">Follow TIPTAB on Snipverse for updates, community discussions, and project milestones.</p>
                </div>
                <Button asChild className="w-full h-14 bg-white/5 hover:bg-purple-600 text-white font-black rounded-2xl border border-white/10 transition-all">
                  <a href="https://snipverse.com/tabxpr" target="_blank" rel="noopener noreferrer">Visit Snipverse</a>
                </Button>
              </div>

              {/* Direct Support Card (Anti-Spam) */}
              <div className="bg-[#130b21] border border-white/10 rounded-[40px] p-10 space-y-6 group hover:border-orange-500/40 transition-all">
                <div className="h-16 w-16 rounded-[24px] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-orange-400" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-black italic uppercase">Direct Inquiry</h4>
                  <p className="text-white/40 font-medium">For business or critical account issues. Protected by human verification.</p>
                </div>
                
                <div className="relative">
                  {showEmail ? (
                    <div className="w-full h-14 bg-white/5 border border-orange-500/30 rounded-2xl flex items-center justify-center px-4 animate-in fade-in zoom-in-95">
                      <span className="font-black text-orange-400 tracking-wider">tiptab@proton.me</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setShowEmail(true)}
                      className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                    >
                      <Eye className="h-5 w-5" /> Reveal Support Email
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-12">
            <div className="flex items-center gap-4">
              <HelpCircle className="h-8 w-8 text-purple-500" />
              <h2 className="text-3xl font-black italic tracking-tighter">FREQUENTLY ASKED</h2>
            </div>
            <div className="bg-[#130b21] border border-white/10 rounded-[40px] p-2 sm:p-10">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-white/5 px-4">
                    <AccordionTrigger className="text-lg font-black hover:text-orange-500 transition-colors py-6 italic text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60 text-base font-medium pb-8 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Docs;