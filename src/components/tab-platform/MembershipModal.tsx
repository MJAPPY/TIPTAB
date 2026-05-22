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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, ShieldCheck, CheckCircle2, Wallet, ArrowRight, Sparkles, Calendar, Gift, Tag, Percent, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useXpr, PromoCode } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep = "intro" | "payment" | "success";

const ASSET_CONTRACTS = {
  XPR: { account: 'eosio.token', precision: 4 },
  XMD: { account: 'monedatoken', precision: 6 },
  XUSDC: { account: 'xtokens', precision: 6 },
};

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAsset, setPaymentAsset] = useState<'XPR' | 'XMD' | 'XUSDC'>("XPR");
  const { toast } = useToast();
  const { session, actor, login, isConnected, setIsMember, isMember, membershipFee, membershipFeeXmd, membershipFeeXusdc, applyPromoCode, usePromoCode } = useXpr();

  // Promo code system states
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Reset or initialize step whenever the modal opens
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
      toast({
        title: "Promo Code Applied!",
        description: promo.type === "free" ? "Free 1-year pass applied!" : `${promo.value}% discount applied to membership.`,
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The code entered is invalid or has expired.",
        variant: "destructive"
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    toast({
      title: "Promo Code Removed",
    });
  };

  const calculateDiscountedFee = () => {
    const feeLookup = {
      XPR: parseFloat(membershipFee),
      XMD: parseFloat(membershipFeeXmd),
      XUSDC: parseFloat(membershipFeeXusdc)
    };
    const original = feeLookup[paymentAsset];
    if (!appliedPromo) return original;
    if (appliedPromo.type === 'free') return 0;
    return original * (1 - appliedPromo.value / 100);
  };

  const handleJoin = async () => {
    if (!session || !actor) return;
    
    setIsProcessing(true);
    try {
      const discountedVal = calculateDiscountedFee();
      const assetConfig = ASSET_CONTRACTS[paymentAsset];
      
      // If code grants 100% free access, bypass blockchain transact entirely
      if (discountedVal === 0) {
        const now = new Date().toISOString();
        const membershipKey = `tiptab_membership_${actor}`;
        const membershipDateKey = `tiptab_membership_date_${actor}`;
        
        localStorage.setItem(membershipKey, 'true');
        localStorage.setItem(membershipDateKey, now);
        setIsMember(true);
        
        if (appliedPromo) {
          usePromoCode(appliedPromo.code);
        }
        
        setStep("success");
        toast({
          title: "Membership Activated!",
          description: "Welcome to the TIPTAB creator network.",
        });
        return;
      }

      const permission = session.auth.permission || 'active';
      const formattedFee = `${discountedVal.toFixed(assetConfig.precision)} ${paymentAsset}`;
      
      const membershipAction = {
        account: assetConfig.account, 
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: permission,
        }],
        data: {
          from: actor,
          to: 'tiptab', 
          quantity: formattedFee,
          memo: isMember ? 'TipTab Yearly Membership Renewal' : 'TipTab Membership Activation',
        },
      };

      await session.transact(
        { actions: [membershipAction] }, 
        { 
          broadcast: true,
          title: isMember ? 'Renew TIPTAB Membership' : 'Activate TIPTAB Membership',
          description: `Fee: ${formattedFee}`
        }
      );
      
      const now = new Date().toISOString();
      const membershipKey = `tiptab_membership_${actor}`;
      const membershipDateKey = `tiptab_membership_date_${actor}`;
      
      localStorage.setItem(membershipKey, 'true');
      localStorage.setItem(membershipDateKey, now);
      setIsMember(true);

      if (appliedPromo) {
        usePromoCode(appliedPromo.code);
      }
      
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
    setTimeout(() => {
      setStep("intro");
      setAppliedPromo(null);
      setPromoInput("");
    }, 300);
  };

  const feeLookup = {
    XPR: parseFloat(membershipFee),
    XMD: parseFloat(membershipFeeXmd),
    XUSDC: parseFloat(membershipFeeXusdc)
  };
  const rawFee = feeLookup[paymentAsset];
  const finalFee = calculateDiscountedFee();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#1e1438] border-white/20 text-white sm:max-w-[480px] rounded-[40px] p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)]">
        
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
                  <DialogTitle className="text-4xl font-black text-center tracking-tight italic">
                    {isMember ? "RENEW YOUR SLOT" : "CLAIM YOUR SLOT"}
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-center text-lg font-medium">
                    Maintain your presence on the global map and continue receiving tips directly.
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

              <button 
                onClick={handleNextStep}
                className="w-full h-20 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-2xl rounded-3xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all group active:scale-95 animate-shimmer-silver"
              >
                {isConnected ? "Continue to Payment" : "Connect WebAuth"} <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}

          {step === "payment" && isConnected && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Button variant="ghost" onClick={() => setStep("intro")} className="text-white/60 hover:text-purple-400 -ml-4 font-black tracking-widest uppercase text-xs">
                  ← Back to benefits
                </Button>
                <DialogHeader className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                      Annual Renewal
                    </div>
                  </div>
                  <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase">Network Activation</DialogTitle>
                </DialogHeader>
              </div>

              <div className="bg-white/5 border-2 border-white/10 rounded-[40px] p-8 text-center relative overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Select value={paymentAsset} onValueChange={(val: any) => setPaymentAsset(val)}>
                      <SelectTrigger className="w-[120px] bg-white/5 border-white/20 h-10 rounded-xl font-black text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                        <SelectItem value="XPR" className="font-black cursor-pointer">XPR</SelectItem>
                        <SelectItem value="XMD" className="font-black cursor-pointer">XMD</SelectItem>
                        <SelectItem value="XUSDC" className="font-black cursor-pointer">XUSDC</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-white/40 font-black uppercase tracking-widest text-[9px]">Currency</span>
                  </div>

                  {appliedPromo && (
                    <span className="text-2xl text-white/30 line-through font-black">
                      {rawFee.toLocaleString()} {paymentAsset}
                    </span>
                  )}
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:text-purple-100 transition-colors">
                      {finalFee.toLocaleString()}
                    </span>
                    <span className="text-2xl font-black text-orange-500 italic group-hover:text-purple-400 transition-colors">{paymentAsset}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white/[0.03] p-5 border border-white/10 rounded-2xl">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Enter Promo Code</Label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-xs font-black text-white">{appliedPromo.code}</p>
                        <p className="text-[10px] text-purple-400 font-bold uppercase">{appliedPromo.type === 'free' ? 'Free Pass' : `${appliedPromo.value}% Off`}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="h-8 px-3 rounded-lg text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase">Remove</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. WELCOME100" 
                      value={promoInput} 
                      onChange={(e) => setPromoInput(e.target.value)} 
                      className="bg-white/5 border-white/10 h-11 rounded-xl px-4 text-white font-black"
                    />
                    <Button onClick={handleApplyPromo} className="h-11 bg-purple-600 hover:bg-purple-700 text-white font-black px-5 rounded-xl text-xs uppercase">Apply</Button>
                  </div>
                )}
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
                  className="w-full h-24 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black text-2xl rounded-[32px] shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-b-4 border-black/20 transition-all active:translate-y-1 active:border-b-0"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>AUTHORIZING...</span>
                    </div>
                  ) : (
                    finalFee === 0 ? "CLAIM FREE SLOT" : (isMember ? `RENEW WITH ${paymentAsset}` : `PAY WITH ${paymentAsset}`)
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
                  Your creator status is updated. Start sharing your link!
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleClose}
                  className="h-20 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-2xl rounded-3xl shadow-2xl transition-all"
                >
                  BACK TO DASHBOARD
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};