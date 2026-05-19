"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, CheckCircle2, Wallet, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep = "intro" | "payment" | "success";

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { session, actor, login, isConnected } = useXpr();

  const handleNextStep = async () => {
    if (step === "intro") {
      if (!isConnected) {
        try {
          await login();
        } catch (err) {
          return;
        }
      }
      setStep("payment");
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
          memo: 'TipTab Membership Activation',
        },
      };

      await session.transact({ actions: [membershipAction] }, { broadcast: true });
      
      setStep("success");
      toast({
        title: "Transaction Successful!",
        description: "Welcome to the TIPTAB creator network.",
      });
    } catch (error: any) {
      console.error("Transact error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Please check your WebAuth wallet and try again.",
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
      <DialogContent className="bg-[#130b21] border-white/20 text-white sm:max-w-[480px] rounded-[40px] p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)]">
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-500 transition-all duration-700"
            style={{ width: step === "intro" ? "33%" : step === "payment" ? "66%" : "100%" }}
          />
        </div>

        <div className="p-10">
          {step === "intro" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-24 w-24 rounded-[32px] bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.5)]">
                  <Sparkles className="h-12 w-12 text-white fill-white" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-center tracking-tight italic">CLAIM YOUR SLOT</DialogTitle>
                  <DialogDescription className="text-white/80 text-center text-lg font-medium">
                    Join the global map and start receiving tips directly from your fans.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Valued Community Member", desc: "Get the exclusive orange checkmark", icon: ShieldCheck },
                  { title: "Zero Platform Fees", desc: "Keep 100% of everything you earn", icon: Zap },
                  { title: "Global Discovery", desc: "Appear on the interactive creator map", icon: Sparkles },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-[24px] bg-white/5 border border-white/10 group hover:border-purple-500/50 transition-colors">
                    <div className="mt-1 h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 shadow-lg">
                      <item.icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base tracking-tight">{item.title}</h4>
                      <p className="text-sm text-white/50 font-bold">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleNextStep}
                className="w-full h-20 bg-white text-black hover:bg-orange-500 hover:text-white font-black text-2xl rounded-3xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all group active:scale-95"
              >
                {isConnected ? "Continue to Payment" : "Connect Wallet"} <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Button variant="ghost" onClick={() => setStep("intro")} className="text-white/60 hover:text-white -ml-4 font-black tracking-widest uppercase text-xs">
                  ← Back to benefits
                </Button>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black italic tracking-tighter">NETWORK ACTIVATION</DialogTitle>
                  <DialogDescription className="text-white/70 font-bold">
                    One-time entry fee to the XPR network node.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="bg-white/5 border-2 border-white/10 rounded-[40px] p-10 text-center relative overflow-hidden group hover:border-orange-500/50 transition-all">
                <div className="absolute top-0 right-0 p-6">
                  <div className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Network Fee
                  </div>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Total Activation Amount</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-7xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">2,500</span>
                  <span className="text-3xl font-black text-orange-500 italic">XPR</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 rounded-[24px] bg-purple-500/10 border-2 border-purple-500/30">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-lg">
                    <Wallet className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Authenticated Wallet</p>
                    <p className="text-lg font-black text-purple-400 italic">@{actor}</p>
                  </div>
                  <CheckCircle2 className="h-7 w-7 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                </div>

                <Button 
                  onClick={handleJoin} 
                  disabled={isProcessing}
                  className="w-full h-24 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-2xl rounded-[32px] shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-b-4 border-black/20 transition-all active:translate-y-1 active:border-b-0"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>AUTHORIZING...</span>
                    </div>
                  ) : (
                    "PAY WITH WEBAUTH"
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.3em] font-black leading-relaxed">
                <ShieldCheck className="h-3 w-3 inline mr-2 text-orange-500" />
                Secured via XPR Network • Destination: @tiptab
              </p>
            </div>
          )}

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
                  Your creator profile is now live on the global map. Start sharing your link!
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => (window.location.href = "/dashboard")}
                  className="h-20 bg-white text-black hover:bg-orange-500 hover:text-white font-black text-2xl rounded-3xl shadow-2xl transition-all"
                >
                  GO TO CREATOR HUB
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white/40 hover:text-white font-black tracking-widest uppercase text-xs"
                >
                  CLOSE DIALOG
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};