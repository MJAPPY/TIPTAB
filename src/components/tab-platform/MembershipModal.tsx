"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, CheckCircle2, Wallet, ArrowRight, Sparkles, Calendar, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep = "intro" | "connect" | "payment" | "success";

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { session, actor, login, isConnected, setIsMember, isMember, userProfile } = useXpr();

  // Initialize step when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isConnected) {
        setStep("payment");
      } else {
        setStep("intro");
      }
    }
  }, [isOpen]);

  // Watch for connection to auto-advance to payment screen
  useEffect(() => {
    if (isOpen && isConnected && (step === "intro" || step === "connect")) {
      setStep("payment");
    }
  }, [isOpen, isConnected, step]);

  const handleNextFromIntro = () => {
    if (isConnected) {
      setStep("payment");
    } else {
      setStep("connect");
    }
  };

  const handleConnect = async () => {
    try {
      const newSession = await login();
      if (newSession) {
        setStep("payment");
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleJoin = async () => {
    if (!session || !actor) return;
    
    setIsProcessing(true);
    try {
      const permission = session.auth.permission || 'active';
      
      const membershipAction = {
        account: 'eosio.token', 
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: permission,
        }],
        data: {
          from: actor,
          to: 'tiptab', 
          quantity: '2500.0000 XPR',
          memo: isMember ? 'TipTab Yearly Membership Renewal' : 'TipTab Membership Activation',
        },
      };

      await session.transact({ actions: [membershipAction] }, { broadcast: true });
      
      const now = new Date().toISOString();
      const membershipKey = `tiptab_membership_${actor}`;
      const membershipDateKey = `tiptab_membership_date_${actor}`;
      
      localStorage.setItem(membershipKey, 'true');
      localStorage.setItem(membershipDateKey, now);
      setIsMember(true);
      
      setStep("success");
      toast({
        title: isMember ? "Membership Renewed!" : "Membership Activated!",
        description: "Welcome to the TIPTAB creator network.",
      });
    } catch (error: any) {
      console.error("Transact error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Please check your balance and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStep("intro"), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#130b21] border-white/20 text-white sm:max-w-[480px] rounded-[40px] p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] selection:bg-purple-500/30">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-20">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-500 transition-all duration-700"
            style={{ 
              width: step === "intro" ? "25%" : step === "connect" ? "50%" : step === "payment" ? "75%" : "100%" 
            }}
          />
        </div>

        <div className="p-10 relative">
          {/* Step 1: Benefits Intro */}
          {step === "intro" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-24 w-24 rounded-[32px] bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.5)]">
                  <Sparkles className="h-12 w-12 text-white fill-white" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-center tracking-tight italic">
                    {isMember ? "RENEW YOUR SLOT" : "CLAIM YOUR SLOT"}
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-center text-lg font-medium leading-relaxed">
                    Join the global map and start receiving direct tips from your community.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Yearly Verification", desc: "Maintain your orange checkmark status", icon: Calendar },
                  { title: "Zero Platform Fees", desc: "Keep 100% of everything you earn", icon: Zap },
                  { title: "Global Discovery", desc: "Appear on the interactive creator map", icon: Sparkles },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-[24px] bg-white/5 border border-white/10 group hover:border-purple-500/50 transition-colors">
                    <div className="mt-1 h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 shadow-lg">
                      <item.icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base tracking-tight group-hover:text-purple-400 transition-colors">{item.title}</h4>
                      <p className="text-sm text-white/50 font-bold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleNextFromIntro}
                className="w-full h-20 bg-white text-black hover:bg-orange-500 hover:text-white font-black text-2xl rounded-3xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all group active:scale-95 animate-shimmer-silver"
              >
                Get Started <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          )}

          {/* Step 2: Connect Wallet (Only if not connected) */}
          {step === "connect" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Button variant="ghost" onClick={() => setStep("intro")} className="text-white/60 hover:text-purple-400 -ml-4 font-black tracking-widest uppercase text-[10px] gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back to benefits
                </Button>
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black italic tracking-tighter">CONNECT WALLET</DialogTitle>
                  <DialogDescription className="text-white/70 font-bold text-lg">
                    Link your WebAuth wallet to proceed with activation.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="bg-white/5 border-2 border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden group hover:border-purple-500/50 transition-all flex flex-col items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                   <Wallet className="h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black text-xl italic tracking-tight">Proton WebAuth</p>
                  <p className="text-sm text-white/40 font-bold max-w-[200px]">Secure, zero-fee wallet for the XPR Network.</p>
                </div>
              </div>

              <Button 
                onClick={handleConnect}
                className="w-full h-24 bg-[#a855f7] hover:bg-[#9333ea] text-white font-black text-2xl rounded-[32px] shadow-[0_20px_50px_rgba(168,85,247,0.3)] transition-all group active:scale-95 animate-shimmer"
              >
                Connect WebAuth
              </Button>
            </div>
          )}

          {/* Step 3: Network Activation (Payment) */}
          {step === "payment" && isConnected && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setStep("intro")} className="text-white/60 hover:text-purple-400 -ml-4 font-black tracking-widest uppercase text-[10px] gap-2 group">
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to benefits
                </Button>
                <DialogHeader>
                  <DialogTitle className="text-5xl font-black italic tracking-tighter leading-none mb-2">NETWORK <br /> ACTIVATION</DialogTitle>
                  <DialogDescription className="text-white/60 font-bold text-sm">
                    Yearly network entry fee to the XPR network node.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Price Display Box */}
              <div className="bg-white/5 border-2 border-white/10 rounded-[48px] p-12 text-center relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-inner">
                <div className="absolute top-6 right-8">
                  <div className="px-4 py-1.5 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg group-hover:bg-purple-600 transition-colors">
                    Yearly Fee
                  </div>
                </div>
                <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px] mb-4 group-hover:text-purple-400 transition-colors">Total Activation Amount</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-8xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:text-purple-100 transition-colors">2,500</span>
                  <span className="text-4xl font-black text-orange-500 italic group-hover:text-purple-400 transition-colors">XPR</span>
                </div>
              </div>

              {/* Authenticated Wallet Display */}
              <div className="space-y-8">
                <div className="flex items-center gap-5 p-6 rounded-[32px] bg-[#1a102d] border-2 border-purple-500/20 group hover:border-purple-500/40 transition-all">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-black border-2 border-white/10 overflow-hidden shrink-0", userProfile?.color)}>
                    {userProfile?.avatarImage ? (
                      <img src={userProfile.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Wallet className="h-6 w-6 text-white/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Authenticated Wallet</p>
                    <p className="text-2xl font-black text-purple-400 italic truncate tracking-tight">@{actor}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-green-500/30 flex items-center justify-center bg-green-500/5">
                    <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                  </div>
                </div>

                {/* Main Action Button */}
                <Button 
                  onClick={handleJoin} 
                  disabled={isProcessing}
                  className="w-full h-24 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black text-2xl rounded-[32px] shadow-[0_25px_50px_-12px_rgba(249,115,22,0.4)] border-b-4 border-black/20 transition-all active:translate-y-1 active:border-b-0 group"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>AUTHORIZING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>{isMember ? "RENEW WITH WEBAUTH" : "PAY WITH WEBAUTH"}</span>
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2.5 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] pt-2">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                Secured via XPR Network • Destination: @tiptab
              </div>
            </div>
          )}

          {/* Step 4: Success Screen */}
          {step === "success" && (
            <div className="space-y-10 py-10 animate-in zoom-in-95 duration-500 text-center">
              <div className="relative">
                <div className="mx-auto h-32 w-32 rounded-[40px] bg-green-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.5)]">
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-green-500/20 blur-3xl -z-10" />
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter italic">YOU'RE IN!</h2>
                <p className="text-white/80 text-xl max-w-[320px] mx-auto leading-relaxed font-bold">
                  Your creator status is updated. Start sharing your link!
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleClose}
                  className="h-20 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-2xl rounded-3xl shadow-2xl transition-all"
                >
                  GO TO DASHBOARD
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};