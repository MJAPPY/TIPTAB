import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MembershipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MembershipModal = ({ isOpen, onOpenChange }: MembershipModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleJoin = async () => {
    setIsProcessing(true);
    try {
      // Simulate XPR Network transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Welcome to TAB!",
        description: "Your 2,500 XPR membership has been activated. You can now receive tips!",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Please check your wallet and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#130b21] border-white/10 text-white sm:max-w-[425px] rounded-[32px]">
        <DialogHeader className="space-y-4">
          <div className="mx-auto h-20 w-20 rounded-[24px] bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <Zap className="h-10 w-10 text-white fill-white" />
          </div>
          <DialogTitle className="text-3xl font-black text-center">Become a Creator</DialogTitle>
          <DialogDescription className="text-white/60 text-center">
            Join the TAB ecosystem and start receiving instant tips with zero fees.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Membership Fee</span>
            <span className="text-xl font-bold">2,500 XPR</span>
          </div>
          
          <ul className="space-y-3">
            {[
              "Verified Creator Badge",
              "Receive instant tips in $TAB",
              "Global map visibility",
              "Zero platform fees forever",
              "Access to creator dashboard"
            ].map(feature => (
              <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleJoin} 
            disabled={isProcessing}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-all"
          >
            {isProcessing ? "Processing Transaction..." : "Join with WebAuth"}
          </Button>
        </DialogFooter>
        
        <p className="text-[10px] text-center text-white/20 uppercase tracking-widest mt-4">
          <ShieldCheck className="h-3 w-3 inline mr-1" />
          Securely handled via WebAuth
        </p>
      </DialogContent>
    </Dialog>
  );
};