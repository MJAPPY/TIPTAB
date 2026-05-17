"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Zap, 
  ArrowLeft, 
  Twitter, 
  Instagram, 
  Globe, 
  Video, 
  MapPin, 
  ShieldCheck, 
  Share2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CREATORS, Creator } from "@/data/creators";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CreatorProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("100");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const found = CREATORS.find(c => c.handle.toLowerCase() === handle?.toLowerCase());
    if (found) {
      setCreator(found);
    } else {
      // Check local storage for the user's own profile if not in mock data
      const savedUser = localStorage.getItem("tiptab_user_profile");
      if (savedUser) {
        const localUser = JSON.parse(savedUser) as Creator;
        if (localUser.handle.toLowerCase() === handle?.toLowerCase()) {
          setCreator(localUser);
          return;
        }
      }
      navigate("/404");
    }
  }, [handle, navigate]);

  const handleSendTip = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: "Tip Sent!",
      description: `Successfully sent ${tipAmount} TAB to ${creator?.name}.`,
    });
    setIsProcessing(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Support ${creator?.name} on TIPTAB`,
      text: `Hey! Check out my TIPTAB profile and support my hustle on the XPR Network.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard if sharing fails or is cancelled
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast({ title: "Link Copied!", description: "Profile link has been copied to your clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!creator) return null;

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      {/* Hero Background with Creator Color */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className={cn("absolute inset-0 opacity-40 blur-[100px]", creator.color)} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/40 to-transparent" />
        
        {/* Animated Particles/Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className={cn(
                "h-48 w-48 rounded-[48px] flex items-center justify-center text-6xl font-black border-[8px] border-[#0a0514] shadow-2xl overflow-hidden relative group",
                creator.color
              )}>
                {creator.avatarImage ? (
                  <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  creator.avatar
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="text-center md:text-left space-y-2 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-500" /> Verified Creator
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{creator.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-xl font-bold text-purple-400">@{creator.handle}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  <span className="text-white/40 font-bold uppercase tracking-widest text-sm">{creator.category}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-12 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">About</h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">
                  {creator.bio}
                </p>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Location</h3>
                  <div className="flex items-center gap-2 text-lg font-bold text-white/60">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    {creator.location}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Network</h3>
                  <div className="flex items-center gap-2 text-lg font-bold text-white/60">
                    <Zap className="h-5 w-5 text-orange-500" />
                    XPR Network
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex gap-4">
                {creator.twitter && (
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10" asChild>
                    <a href={creator.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="h-6 w-6" /></a>
                  </Button>
                )}
                {creator.instagram && (
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10" asChild>
                    <a href={creator.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-6 w-6" /></a>
                  </Button>
                )}
                {creator.videoUrl && (
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10" asChild>
                    <a href={creator.videoUrl} target="_blank" rel="noopener noreferrer"><Video className="h-6 w-6" /></a>
                  </Button>
                )}
                {creator.website && (
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10" asChild>
                    <a href={creator.website} target="_blank" rel="noopener noreferrer"><Globe className="h-6 w-6" /></a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tipping Interface */}
          <div className="lg:col-span-5">
            <div className="sticky top-40 space-y-6">
              <div className="bg-[#130b21] border border-white/10 rounded-[48px] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] rounded-full" />
                
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black tracking-tight">Support <br /> {creator.name.split(' ')[0]}</h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleShare}
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10"
                  >
                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-white/40" />}
                  </Button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-4 gap-3">
                    {["50", "100", "500", "1000"].map(amount => (
                      <Button
                        key={amount}
                        variant="ghost"
                        onClick={() => setTipAmount(amount)}
                        className={cn(
                          "h-14 rounded-2xl border-2 font-black transition-all text-lg",
                          tipAmount === amount 
                            ? "border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]" 
                            : "bg-white/5 border-transparent hover:bg-white/10 text-white/60"
                        )}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                      <span className="text-white/20 font-black tracking-widest text-[10px] uppercase">Custom Tip</span>
                    </div>
                    <Input 
                      placeholder="0" 
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="bg-white/5 border-white/10 h-20 rounded-[32px] text-right text-3xl font-black pl-8 pr-24 focus:ring-orange-500/50 focus:bg-white/10 transition-all border-2"
                    />
                    <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                      <span className="text-orange-500 font-black text-xl">TAB</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendTip}
                    disabled={isProcessing}
                    className="w-full h-24 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-2xl rounded-[32px] shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all active:scale-[0.98] group overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      {isProcessing ? (
                        <div className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Appreciation</span>
                          <Zap className="h-8 w-8 fill-white group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </div>
                  </Button>

                  <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                      <ShieldCheck className="h-3.5 w-3.5" /> Zero Fees
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                      <Zap className="h-3.5 w-3.5" /> Instant
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center">
                <p className="text-white/40 text-sm font-medium">
                  Payments are secured by the XPR Network. 100% of your tip goes directly to the creator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default CreatorProfile;