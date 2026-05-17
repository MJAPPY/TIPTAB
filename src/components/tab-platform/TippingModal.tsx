import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Twitter, Globe, X } from "lucide-react";
import { useState } from "react";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";

interface TippingModalProps {
  creator: Creator | null;
  onClose: () => void;
}

export const TippingModal = ({ creator, onClose }: TippingModalProps) => {
  const [tipAmount, setTipAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSendTip = async () => {
    if (!tipAmount || isNaN(Number(tipAmount))) {
      toast({ title: "Invalid amount", description: "Please enter a valid TAB amount.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Tip Sent Successfully!",
        description: `You've sent ${tipAmount} TAB to ${creator?.name}.`,
      });
      onClose();
    } catch (error) {
      toast({ title: "Transaction failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={!!creator} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#130b21] border-white/10 text-white sm:max-w-[450px] rounded-[32px] p-0 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-purple-900 to-[#130b21]">
           <Button 
             variant="ghost" 
             size="icon" 
             className="absolute top-4 right-4 text-white/60 hover:text-white"
             onClick={onClose}
           >
             <X className="h-5 w-5" />
           </Button>
        </div>
        
        <div className="px-8 pb-8 -mt-12 relative">
          <div className={`h-24 w-24 rounded-[32px] ${creator?.color} flex items-center justify-center text-3xl font-bold border-4 border-[#130b21] shadow-xl mb-4`}>
            {creator?.avatar}
          </div>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">{creator?.name}</h3>
              <p className="text-purple-500 font-medium">@{creator?.handle}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="rounded-xl bg-white/5 border border-white/10">
                 <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-xl bg-white/5 border border-white/10">
                 <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-white/60 text-sm mb-8">
            {creator?.bio}
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-white/60">Tip Amount</span>
              <span className="text-orange-500">TAB Tokens</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {["100", "500", "1000"].map(amount => (
                <Button
                  key={amount}
                  variant="secondary"
                  onClick={() => setTipAmount(amount)}
                  className={`h-12 rounded-xl border ${tipAmount === amount ? "border-orange-500 bg-orange-500/10 text-orange-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                >
                  {amount}
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <Input 
                placeholder="Custom amount..." 
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="bg-white/5 border-white/10 h-14 rounded-2xl text-lg font-bold px-6"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 font-bold">TAB</span>
            </div>
            
            <Button 
              onClick={handleSendTip}
              disabled={isProcessing}
              className="w-full h-16 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-lg mt-4 transition-all group"
            >
              {isProcessing ? "Processing..." : <>Send Tip <Plus className="ml-2 h-5 w-5 group-hover:rotate-90 transition-transform" /></>}
            </Button>
            
            <p className="text-[10px] text-center text-white/20 uppercase tracking-widest pt-4">
              Instant • Zero Fees • Direct to Creator
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};