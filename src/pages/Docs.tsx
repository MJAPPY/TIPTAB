"use client";

import React, { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const Docs = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);

  const sections = [
    {
      title: "Getting Started",
      icon: Wallet,
      content: "To use TIPTAB, you need a WebAuth wallet. This is your secure gateway to the XPR Network. Once connected, you can manage your TAB and XPR balances directly from your dashboard.",
      items: [
        "Download WebAuth.com wallet on iOS or Android.",
        "Create your unique @handle.",
        "Connect to TIPTAB using the 'Connect Wallet' button."
      ]
    },
    {
      title: "Supporting Creators",
      icon: Zap,
      content: "Tipping is instant and carries zero platform fees. 100% of your tip goes directly to the recipient's wallet on-chain.",
      items: [
        "Browse the Global Map to find creators near you.",
        "Click a pin to open the Tipping Modal.",
        "Select your amount in TAB or XPR and authorize via WebAuth."
      ]
    },
    {
      title: "Becoming a Creator",
      icon: ShieldCheck,
      content: "Any service worker, professional, or digital creator can join the map. There is a yearly network activation fee of 2,500 XPR to prevent spam and maintain network quality.",
      items: [
        "Click 'Join The Map' or 'Become a Creator'.",
        "Pay the yearly activation fee.",
        "Set up your public profile and download your unique TipTab card."
      ]
    }
  ];

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

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-36 pb-24 max-w-5xl">
        <div className="space-y-12">
          {/* Hero Section */}
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

          {/* Quick Start Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6 hover:bg-white/[0.07] transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <section.icon className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black tracking-tight italic">{section.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{section.content}</p>
                <ul className="space-y-3 pt-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-xs font-bold text-white/80">
                      <ChevronRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
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

          {/* CTA Footer */}
          <div className="bg-gradient-to-r from-orange-600/20 to-purple-600/20 border border-white/10 rounded-[48px] p-12 text-center space-y-8 mt-12">
            <h2 className="text-4xl font-black italic tracking-tighter">READY TO JOIN THE MAP?</h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto font-medium">
              Start receiving tips directly to your wallet. No middleman, no fees, just pure appreciation.
            </p>
            <Button 
              onClick={() => setIsMembershipOpen(true)}
              className="h-20 px-12 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[32px] font-black text-2xl transition-all shadow-2xl active:scale-95"
            >
              Get Started Now <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Docs;