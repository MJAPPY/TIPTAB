"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Twitter, 
  Instagram, 
  Globe, 
  Video, 
  MapPin, 
  ShieldCheck, 
  Share2,
  Check,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CREATORS, Creator } from "@/data/creators";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const CreatorProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, actor, login, isConnected, recordTip } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@/, "").toLowerCase().trim();
    
    const found = CREATORS.find(c => c.handle.toLowerCase() === cleanHandle);
    if (found) {
      setCreator(found);
    } else {
      const savedUser = localStorage.getItem("tiptab_user_profile");
      if (savedUser) {
        const localUser = JSON.parse(savedUser) as Creator;
        if (localUser.handle.toLowerCase() === cleanHandle) {
          setCreator(localUser);
          return;
        }
      }
      navigate("/");
    }
  }, [handle, navigate]);

  const formatValue = (val: string) => {
    const numericValue = parseFloat(val);
    if (isNaN(numericValue)) return "0";
    return Math.floor(numericValue).toString();
  };

  const handleConnect = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleSendTip = async () => {
    if (!session || !actor) return;
    
    const amountNum = Math.floor(parseFloat(tipAmount));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ 
        title: "Invalid amount", 
        description: "Please enter a valid TAB amount.", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    try {
      const recipient = creator?.handle.replace(/^@/, "").toLowerCase().trim();
      const quantityString = `${amountNum} TAB`;

      const actions = [{
        account: 'tokencreate', 
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: session.auth.permission,
        }],
        data: {
          from: actor,
          to: recipient, 
          quantity: quantityString,
          memo: 'Tipped via TipTab Profile',
        },
      }];

      await session.transact({ actions }, { broadcast: true });
      
      // Update data sync for tips sent
      recordTip(amountNum);

      toast({
        title: "Tip Sent!",
        description: `Successfully sent ${quantityString} to ${creator?.name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Please check your balance and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      toast({ title: "Link Copied!", description: "Profile URL saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast({ title: "Copy Failed", description: "Please copy the URL from your address bar.", variant: "destructive" });
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = { title: `Support ${creator?.name} on TIPTAB`, url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className={cn("absolute inset-0 opacity-40 blur-[100px]", creator.color)} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/40 to-transparent" />
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
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
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">{creator.bio}</p>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Location</h3>
                  <div className="flex items-center gap-2 text-lg font-bold text-white/60">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    {creator.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-40 space-y-6">
              <div className="bg-[#130b21] border border-white/10 rounded-[48px] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black tracking-tight">Support <br /> {creator.name.split(' ')[0]}</h2>
                  <Button variant="ghost" size="icon" onClick={handleShare} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5 text-white/40" />}
                  </Button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-4 gap-3">
                    {["50", "100", "500", "1000"].map(amount => (
                      <Button
                        key={amount}
                        variant="ghost"
                        onClick={() => setTipAmount(formatValue(amount))}
                        className={cn(
                          "h-14 rounded-2xl border-2 font-black text-lg",
                          parseFloat(tipAmount) === parseFloat(amount) ? "border-orange-500 bg-orange-500/10 text-orange-500" : "bg-white/5 border-transparent text-white/60"
                        )}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>

                  <div className="relative group">
                    <Input 
                      placeholder="0" 
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      onBlur={(e) => setTipAmount(formatValue(e.target.value))}
                      className="bg-white/5 border-white/10 h-20 rounded-[32px] text-right text-3xl font-black pl-8 pr-24 focus:ring-orange-500/50 border-2"
                    />
                    <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                      <span className="text-orange-500 font-black text-xl">TAB</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isConnected ? (
                      <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-24 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-2xl rounded-[32px] shadow-xl">
                        {isProcessing ? "Processing..." : "Send Appreciation"}
                      </Button>
                    ) : (
                      <Button onClick={handleConnect} className="w-full h-24 bg-[#a855f7] text-white font-black text-2xl rounded-[32px] shadow-xl animate-shimmer">
                        Connect WebAuth
                      </Button>
                    )}
                  </div>
                </div>
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