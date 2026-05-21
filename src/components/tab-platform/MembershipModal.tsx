"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ShieldCheck, CheckCircle2, Wallet, ArrowRight, Sparkles, Calendar, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useXpr, PromoCode } from "@/contexts/XprContext";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep = "intro" | "payment" | "success";

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { session, actor, login, isConnected, setIsMember, isMember, membershipFee, applyPromoCode, usePromoCode } = useXpr();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isConnected) {
        setStep("payment");
      } else {
        setStep("intro");
      }
    }
  }, [isOpen, isConnected]); 

  const handleNextStep = async () => {
    if (!isConnected) {
      try {
        const newSession = await login();
        if (newSession) {
          setStep("payment");
        }
      } catch (err) {
        console.error("Login process interrupted:", err);
      }
    } else {
      setStep("payment");
    }
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const promo = applyPromoCode(promoInput);
    if (promo) {
      setAppliedPromo(promo);
      toast({ title: "Promo Code Applied!" });
    } else {
      toast({ title: "Invalid Code", variant: "destructive" });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
  };

  const calculateDiscountedFee = () => {
    const original = parseFloat(membershipFee);
    if (!appliedPromo) return original;
    if (appliedPromo.type === 'free') return 0;
    return original * (1 - appliedPromo.value / 100);
  };

  const handleJoin = async () => {
    if (!session || !actor) return;
    
    setIsProcessing(true);
    try {
      const discountedVal = calculateDiscountedFee();
      
      if (discountedVal === 0) {
        finalizeMembership();
        return;
      }

      const permission = session.auth.permission || 'active';
      const formattedFee = `${discountedVal.toFixed(4)} XPR`;
      
      const membershipAction = {
        account: 'eosio.token', 
        name: 'transfer',
        authorization: [{ actor, permission }],
        data: {
          from: actor,
          to: 'tiptab', 
          quantity: formattedFee,
          memo: isMember ? 'TipTab Yearly Renewal' : 'TipTab Activation',
        },
      };

      await session.transact({ actions: [membershipAction] }, { broadcast: true });
      finalizeMembership();
    } catch (error: any) {
      toast({ title: "Transaction Failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeMembership = () => {
    const now = new Date().toISOString();
    localStorage.setItem(`tiptab_membership_${actor}`, 'true');
    localStorage.setItem(`tiptab_membership_date_${actor}`, now);
    setIsMember(true);
    if (appliedPromo) usePromoCode(appliedPromo.code);
    setStep("success");
    toast({ title: "Membership Activated!" });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("intro");
      setAppliedPromo(null);
      setPromoInput("");
    }, 300);
  };

  const finalFee = calculateDiscountedFee();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#1e1438] border-white/20 text-white sm:max-w-[440px] rounded-[32px] p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-500 transition-all duration-700"
            style={{ width: step === "intro" ? "33%" : step === "payment" ? "66%" : "100%" }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {step === "intro" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-3 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white fill-white" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tight italic">
                    {isMember ? "RENEW SLOT" : "CLAIM SLOT"}
                  </DialogTitle>
                  <DialogDescription className="text-white/60 text-sm font-medium">
                    Maintain your interactive pin on the global map.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="space-y-3">
                {[
                  { title: "Network Status", desc: "Verified orange checkmark", icon: Calendar },
                  { title: "Zero Fees", desc: "Keep 100% of tips", icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">{item.title}</h4>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleNextStep}
                className="w-full h-16 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-xl rounded-2xl transition-all group active:scale-95 animate-shimmer-silver"
              >
                {isConnected ? "Next Step" : "Connect WebAuth"}
              </button>
            </div>
          )}

          {step === "payment" && isConnected && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Payment</DialogTitle>
              </DialogHeader>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[9px] mb-2">ACCESS FEE</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-black tracking-tighter">{finalFee.toLocaleString()}</span>
                  <span className="text-xl font-black text-orange-500 italic">XPR</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="Promo Code" 
                  value={promoInput} 
                  onChange={(e) => setPromoInput(e.target.value)} 
                  className="bg-white/5 border-white/10 h-11 rounded-xl text-white font-black"
                />
                <Button onClick={handleApplyPromo} className="h-11 bg-purple-600 hover:bg-purple-700 font-black px-4 rounded-xl text-xs uppercase">Apply</Button>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Wallet className="h-5 w-5 text-purple-400" />
                   <span className="text-sm font-black text-purple-400 italic">@{actor}</span>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>

              <Button 
                onClick={handleJoin} 
                disabled={isProcessing}
                className="w-full h-20 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-xl rounded-3xl shadow-xl transition-all active:scale-95"
              >
                {isProcessing ? "Processing..." : (finalFee === 0 ? "CLAIM FREE SLOT" : "PAY WITH WEBAUTH")}
              </Button>

              <p className="text-[9px] text-center text-white/30 uppercase tracking-[0.2em] font-black">
                Secured via XPR Network
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6 py-6 animate-in zoom-in-95 text-center">
              <div className="mx-auto h-20 w-20 rounded-[28px] bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter italic">YOU'RE IN!</h2>
              <Button 
                onClick={handleClose}
                className="h-16 w-full bg-white text-black hover:bg-purple-500 hover:text-white font-black text-lg rounded-2xl"
              >
                DONE
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};