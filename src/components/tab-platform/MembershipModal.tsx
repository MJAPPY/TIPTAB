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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, CheckCircle2, Wallet, ArrowRight, Sparkles, Calendar, Gift, Hourglass } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useXpr, PromoCode } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";
import { TOKEN_LOGOS } from "@/constants/logos";
import { supabase } from "@/integrations/supabase/client";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep = "intro" | "payment" | "success";

const ASSET_CONTRACTS = {
  XPR: { account: 'eosio.token', precision: 4 },
  XMD: { account: 'xmd.token', precision: 6 },
  XUSDC: { account: 'xtokens', precision: 6 },
  METAL: { account: 'token.metal', precision: 8 },
  LOAN: { account: 'loan.token', precision: 4 },
  XMT: { account: 'xtokens', precision: 8 },
};

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [years, setYears] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAsset, setPaymentAsset] = useState<keyof typeof ASSET_CONTRACTS>("XPR");
  const { toast } = useToast();
  const { session, actor, login, isConnected, setIsMember, isMember, membershipFee, membershipFeeXmd, membershipFeeXusdc, membershipFeeMetal, membershipFeeLoan, membershipFeeXmt, applyPromoCode, usePromoCode, userProfile, fetchDbCreators } = useXpr();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isConnected) setStep("payment");
      else setStep("intro");
    }
  }, [isOpen, isConnected]); 

  const handleNextStep = async () => {
    if (!isConnected) {
      try {
        const newSession = await login();
        if (newSession) setStep("payment");
      } catch (err) { console.error(err); }
    } else { setStep("payment"); }
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const promo = applyPromoCode(promoInput);
    if (promo) {
      setAppliedPromo(promo);
      toast({ title: "Promo Code Applied!", description: promo.type === "free" ? "Free pass applied!" : `${promo.value}% discount applied.` });
    } else {
      toast({ title: "Invalid Code", description: "The code entered is invalid or expired.", variant: "destructive" });
    }
  };

  const handleRemovePromo = () => { setAppliedPromo(null); setPromoInput(""); };

  const calculateDiscountedFee = () => {
    const feeLookup = {
      XPR: parseFloat(membershipFee),
      XMD: parseFloat(membershipFeeXmd),
      XUSDC: parseFloat(membershipFeeXusdc),
      METAL: parseFloat(membershipFeeMetal),
      LOAN: parseFloat(membershipFeeLoan),
      XMT: parseFloat(membershipFeeXmt)
    };
    const original = feeLookup[paymentAsset] * years;
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
      
      if (discountedVal === 0) {
        await finishActivation();
        return;
      }

      const formattedFee = `${discountedVal.toFixed(assetConfig.precision)} ${paymentAsset}`;
      const membershipAction = {
        account: assetConfig.account, 
        name: 'transfer',
        authorization: [{ actor: session.auth.actor, permission: session.auth.permission || 'active' }],
        data: { from: actor, to: 'tiptab', quantity: formattedFee, memo: isMember ? `Renewal: ${years} Years` : `Activation: ${years} Years` },
      };

      await session.transact({ actions: [membershipAction] }, { broadcast: true });
      await finishActivation();
    } catch (error: any) {
      toast({ title: "Transaction Failed", description: error.message || "Network error.", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const finishActivation = async () => {
    const now = new Date();
    const expiryKey = `tiptab_membership_expiry_${actor}`;
    const currentExpiryStr = localStorage.getItem(expiryKey);
    let currentExpiry = new Date();
    
    // Extend existing expiry if active, otherwise set starting from now
    if (currentExpiryStr && new Date(currentExpiryStr) > now) {
      currentExpiry = new Date(currentExpiryStr);
    }
    
    currentExpiry.setFullYear(currentExpiry.getFullYear() + years);
    const newExpiryStr = currentExpiry.toISOString();

    localStorage.setItem(`tiptab_membership_${actor}`, 'true');
    localStorage.setItem(expiryKey, newExpiryStr);

    const membershipDateKey = `tiptab_membership_date_${actor}`;
    if (!localStorage.getItem(membershipDateKey)) {
      localStorage.setItem(membershipDateKey, now.toISOString());
    }

    setIsMember(true);
    if (appliedPromo) usePromoCode(appliedPromo.code);
    
    // Save/Upsert profile to Supabase with membership active
    if (actor && userProfile) {
      try {
        await supabase.from('profiles').upsert({
          handle: actor,
          name: userProfile.name || actor,
          bio: userProfile.bio || "Just joined the TIP TAB network!",
          location: userProfile.location || "",
          coordinates: userProfile.coordinates || [0, 0],
          categories: userProfile.categories || ["Other"],
          avatar: userProfile.avatar || actor.slice(0, 2).toUpperCase(),
          avatar_image: userProfile.avatarImage || "",
          cover_image: userProfile.coverImage || "",
          cover_position: userProfile.coverPosition ?? 50,
          color: userProfile.color || "bg-purple-600",
          twitter: userProfile.twitter || "",
          website: userProfile.website || "",
          video_url: userProfile.videoUrl || "",
          instagram: userProfile.instagram || "",
          spotify: userProfile.spotify || "",
          snipverse: userProfile.snipverse || "",
          facebook: userProfile.facebook || "",
          kick: userProfile.kick || "",
          rumble: userProfile.rumble || "",
          twitch: userProfile.twitch || "",
          tiktok: userProfile.tiktok || "",
          youtube_live: userProfile.youtubeLive || "",
          instagram_live: userProfile.instagramLive || "",
          is_member: true
        });
        await fetchDbCreators();
      } catch (err) {
        console.error("Failed to sync profile to Supabase on activation", err);
      }
    }

    setStep("success");
    toast({ title: "Membership Activated!" });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setStep("intro"); setYears(1); setAppliedPromo(null); setPromoInput(""); }, 300);
  };

  const feeLookup = {
    XPR: parseFloat(membershipFee),
    XMD: parseFloat(membershipFeeXmd),
    XUSDC: parseFloat(membershipFeeXusdc),
    METAL: parseFloat(membershipFeeMetal),
    LOAN: parseFloat(membershipFeeLoan),
    XMT: parseFloat(membershipFeeXmt)
  };
  const finalFee = calculateDiscountedFee();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#1e1438] border-white/20 text-white sm:max-w-[480px] rounded-[40px] p-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-50">
          <div className="h-full bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-500 transition-all duration-700" style={{ width: step === "intro" ? "33%" : step === "payment" ? "66%" : "100%" }} />
        </div>

        <ScrollArea className="flex-1 w-full">
          <div className="p-6 md:p-10">
            {step === "intro" && (
              <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4 text-center">
                  <div className="mx-auto h-20 w-20 md:h-24 md:w-24 rounded-[32px] bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.5)]">
                    <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-white fill-white" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-3xl md:text-4xl font-black text-center tracking-tight italic uppercase">
                      {isMember ? "RENEW YOUR SLOT" : "CLAIM YOUR SLOT"}
                    </DialogTitle>
                    <DialogDescription className="text-white/80 text-center text-base md:text-lg font-medium">
                      Maintain your presence on the global map and continue receiving tips directly.
                    </DialogDescription>
                  </DialogHeader>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: "Multi-Year Expirations", desc: "Pay up to 5 years in advance", icon: Calendar },
                    { title: "Zero Platform Fees", desc: "Keep 100% of everything you earn", icon: Zap },
                    { title: "Global Discovery", desc: "Appear on the interactive creator map", icon: Sparkles },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 md:p-5 rounded-[24px] bg-white/5 border border-white/10 group hover:border-purple-500/50 transition-colors">
                      <div className="mt-1 h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm md:text-base tracking-tight">{item.title}</h4>
                        <p className="text-xs md:text-sm text-white/50 font-bold">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleNextStep} className="w-full h-16 md:h-20 bg-white text-black hover:bg-purple-600 hover:text-white font-black text-lg md:text-2xl rounded-[28px] md:rounded-[32px] shadow-2xl transition-all flex items-center justify-center gap-3">
                  <span>{isConnected ? "Continue to Payment" : "Connect WebAuth"}</span>
                  <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            )}

            {step === "payment" && isConnected && (
              <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Button variant="ghost" onClick={() => setStep("intro")} className="text-white/60 hover:text-purple-400 -ml-4 font-black tracking-widest uppercase text-[10px]">← Back</Button>
                  <DialogHeader>
                    <DialogTitle className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-tight">Network Activation</DialogTitle>
                  </DialogHeader>
                </div>

                <div className="space-y-3 bg-white/[0.03] p-4 border border-white/10 rounded-2xl">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2"><Hourglass className="h-3.5 w-3.5 text-purple-400" /> Pass Duration</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((y) => (
                      <Button
                        key={y}
                        type="button"
                        onClick={() => setYears(y)}
                        className={cn(
                          "h-11 rounded-xl font-black text-xs transition-all border",
                          years === y 
                            ? "bg-orange-500 border-orange-600 text-white shadow-lg" 
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {y} {y === 1 ? "Yr" : "Yrs"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border-2 border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 text-center relative overflow-hidden group hover:border-purple-500/50 transition-all">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Select value={paymentAsset} onValueChange={(val: any) => setPaymentAsset(val)}>
                        <SelectTrigger className="w-[110px] md:w-[130px] bg-white/5 border-white/20 h-10 md:h-12 rounded-xl font-black text-xs text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                          {Object.keys(ASSET_CONTRACTS).map(s => (
                            <SelectItem key={s} value={s} className="font-black py-2 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <img src={TOKEN_LOGOS[s]} className="h-4 w-4" alt="" /> {s}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="h-10 w-10 rounded-full bg-white/5 p-1.5 flex items-center justify-center border border-white/10">
                        <img src={TOKEN_LOGOS[paymentAsset]} alt="" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {appliedPromo && <span className="text-xl text-white/30 line-through font-black">{(feeLookup[paymentAsset] * years).toLocaleString()} {paymentAsset}</span>}
                    <div className="flex items-center justify-center gap-3 md:gap-4">
                      <span className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        {finalFee.toLocaleString(undefined, { maximumFractionDigits: paymentAsset === 'XPR' || paymentAsset === 'LOAN' ? 0 : 4 })}
                      </span>
                      <span className="text-xl md:text-2xl font-black text-orange-500 italic">{paymentAsset}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-white/[0.03] p-4 border border-white/10 rounded-2xl">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Promo Code</Label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl">
                      <div className="flex items-center gap-3"><Gift className="h-5 w-5 text-purple-400" /><p className="text-xs font-black text-white">{appliedPromo.code}</p></div>
                      <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="text-red-400 font-bold text-xs uppercase">Remove</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input placeholder="code here" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} className="bg-white/5 border-white/10 h-11 rounded-xl px-4 text-white font-black" />
                      <Button onClick={handleApplyPromo} className="h-11 bg-purple-600 hover:bg-purple-700 text-white font-black px-5 rounded-xl uppercase text-xs">Apply</Button>
                    </div>
                  )}
                </div>

                <Button onClick={handleJoin} disabled={isProcessing} className="w-full h-16 md:h-24 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-xl md:text-2xl rounded-[28px] md:rounded-[32px] shadow-2xl transition-all">
                  {isProcessing ? "AUTHORIZING..." : (finalFee === 0 ? "CLAIM FREE SLOT" : `PAY WITH ${paymentAsset}`)}
                </Button>

                <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.3em] font-black pb-4">Secured via XPR Network • @tiptab</p>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-8 py-10 animate-in zoom-in-95 duration-500 text-center">
                <div className="mx-auto h-28 w-28 rounded-[36px] bg-green-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.5)]">
                  <CheckCircle2 className="h-14 w-14 text-white" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter italic">YOU'RE IN!</h2>
                <Button onClick={handleClose} className="h-16 md:h-20 w-full bg-white text-black hover:bg-purple-500 hover:text-white font-black text-xl rounded-[28px] md:rounded-3xl shadow-2xl">BACK TO DASHBOARD</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};