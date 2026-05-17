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
import { cn } from "@/lib/utils";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type OnboardingStep = "intro" | "payment" | "success";

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleNextStep = () => {
    if (step === "intro") setStep("payment");
  };

  const handleJoin = async () => {
    setIsProcessing(true);
    try {
      // Simulate XPR Network transaction
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setStep("success");
      toast({
        title: "Transaction Successful!",
        description: "Welcome to the TIPTAB creator network.",
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Please check your WebAuth wallet and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after a delay so the closing animation finishes
    setTimeout(() => setStep("intro"), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#130b21] border-white/10 text-white sm:max-w-[480px] rounded-[40px] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-500"
            style={{ width: step === "intro" ? "33%" : step === "payment" ? "66%" : "100%" }}
          />
        </div>

        <div className="p-8">
          {step === "intro" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-24 w-24 rounded-[32px] bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                  <Sparkles className="h-12 w-12 text-white fill-white" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-center tracking-tight">Claim Your Slot</DialogTitle>
                  <DialogDescription className="text-white/60 text-center text-lg">
                    Join the global map and start receiving tips directly from your fans.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Verified Status", desc: "Get the exclusive orange checkmark", icon: ShieldCheck },
                  { title: "Zero Platform Fees", desc: "Keep 100% of everything you earn", icon: Zap },
                  { title: "Global Discovery", desc: "Appear on the interactive creator map", icon: Sparkles },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="mt-1 h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white/90">{item.title}</h4>
                      <p className="text-sm text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleNextStep}
                className="w-full h-16 bg-white text-black hover:bg-white/90 font-black text-xl rounded-2xl shadow-xl transition-all group"
              >
                Continue to Payment <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Button variant="ghost" onClick={() => setStep("intro")} className="text-white/40 hover:text-white -ml-4">
                  ← Back
                </Button>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black">Activation</DialogTitle>
                  <DialogDescription className="text-white/60">
                    One-time network entry fee
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Best Value
                  </div>
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs mb-2">Membership Fee</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl font-black tracking-tighter">2,500</span>
                  <span className="text-2xl font-bold text-orange-500">TAB</span>
                </div>
                <p className="mt-4 text-sm text-white/40 italic">approx. 25.00 USD</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <Wallet className="h-5 w-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">WebAuth Wallet Connected</p>
                    <p className="text-xs text-white/40 font-mono">0x71...4F2a</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>

                <Button 
                  onClick={handleJoin} 
                  disabled={isProcessing}
                  className="w-full h-16 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-xl rounded-2xl shadow-2xl transition-all"
                >
                  {isProcessing ? "Authorizing..." : "Pay with WebAuth"}
                </Button>
              </div>

              <p className="text-[10px] text-center text-white/20 uppercase tracking-widest leading-relaxed">
                <ShieldCheck className="h-3 w-3 inline mr-1" />
                Securely handled via XPR Network • Instant Activation
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-8 py-10 animate-in zoom-in-95 duration-500 text-center">
              <div className="relative">
                <div className="mx-auto h-32 w-32 rounded-[40px] bg-green-500 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </div>
                {/* Decorative particles */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-green-500/20 blur-3xl -z-10" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight">You're In!</h2>
                <p className="text-white/60 text-lg max-w-[300px] mx-auto leading-relaxed">
                  Your creator profile is now live on the global map. Start sharing your link!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => window.location.href = "/dashboard"}
                  className="h-14 bg-white text-black font-black text-lg rounded-2xl"
                >
                  Go to Creator Hub
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white/40 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};