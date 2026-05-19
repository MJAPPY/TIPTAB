"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const Docs = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const { isMember, isConnected, login } = useXpr();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isMember) {
      navigate("/dashboard");
    } else {
      setIsMembershipOpen(true);
    }
  };

  const handleConnectClick = async () => {
    if (isConnected) {
      navigate("/dashboard");
    } else {
      await login();
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
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
              NETWORK <span className="text-orange-500">GUIDELINES</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">
              Everything you need to know about the most direct appreciation network available anywhere, built on the XPR Network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Getting Started Card */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-purple-400" />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black tracking-tight italic">Getting Started</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">To use TIPTAB, you need a WebAuth wallet. This is your secure gateway to the XPR Network.</p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3 text-xs font-bold text-white/80"><ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />Download WebAuth wallet.</li>
                  <li className="flex items-start gap-3 text-xs font-bold text-white/80"><ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />Connect your account.</li>
                </ul>
              </div>
              <Button 
                onClick={handleConnectClick}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl h-12"
              >
                {isConnected ? "Go to Wallet" : "Connect Now"}
              </Button>
            </div>

            {/* Supporting Creators Card */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all flex flex-col">
              <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Zap className="h-7 w-7 text-cyan-400" />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black tracking-tight italic">Giving Tips</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">Tipping is instant and carries zero platform fees. 100% goes directly to the creator.</p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3 text-xs font-bold text-white/80"><ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />Find a pin on the map.</li>
                  <li className="flex items-start gap-3 text-xs font-bold text-white/80"><ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />Send TAB or XPR.</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate("/")}
                className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl h-12 border border-white/10"
              >
                View Global Map
              </Button>
            </div>

            {/* Becoming a Creator Card */}
            <div className="bg-white/5 border-2 border-orange-500/20 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-orange-500" />
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black tracking-tight italic">Be a Creator</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">Join the map and receive tips. Yearly activation fee of 2,500 XPR applies.</p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3 text-xs font-bold text-white/80"><ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />Activate Membership.</li>
                  <li className="flex items-start gap-3 text-xs font-bold text-white/80"><ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />Set location in Dashboard.</li>
                </ul>
              </div>
              <Button 
                onClick={handleCtaClick}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl h-12 shadow-lg shadow-orange-500/20"
              >
                {isMember ? "Dashboard" : "Join The Map"}
              </Button>
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

          <div className="bg-gradient-to-r from-orange-600/20 to-purple-600/20 border border-white/10 rounded-[48px] p-12 text-center space-y-8 mt-12">
            <h2 className="text-4xl font-black italic tracking-tighter">READY TO JOIN THE MAP?</h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto font-medium">
              Start receiving tips directly to your wallet. No middleman, no fees, just pure appreciation.
            </p>
            <Button 
              onClick={handleCtaClick}
              className="h-20 px-12 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[32px] font-black text-2xl transition-all shadow-2xl active:scale-95"
            >
              {isMember ? "Go to Dashboard" : "Get Started Now"} <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Docs;