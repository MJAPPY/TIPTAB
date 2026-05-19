"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Twitter, Globe, Zap, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useXpr } from "@/contexts/XprContext";

interface TippingModalProps {
  creator: Creator | null;
  onClose: () => void;
}

export const TippingModal = ({ creator, onClose }: TippingModalProps) => {
  const [tipAmount, setTipAmount] = useState<string>("50.0000");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { session, actor, login, isConnected } = useXpr();

  const formatValue = (val: string) => {
    const numericValue = parseFloat(val);
    if (isNaN(numericValue)) return "0.0000";
    return numericValue.toFixed(4);
  };

  const handleConnect = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleSendTip = async () => {
    if (!session || !actor || !creator) return;
    
    const amountNum = parseFloat(tipAmount);
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
      // Clean handle to get the actual XPR account name
      const recipient = creator.handle.replace(/^@/, "").toLowerCase().trim();
      const quantityString = `${amountNum.toFixed(4)} TAB`;
      const permission = session.auth.permission || 'active';

      const transferAction = {
        account: 'tokencreate', // Correct contract name for TAB on XPR Network
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: permission,
        }],
        data: {
          from: actor,
          to: recipient, 
          quantity: quantityString,
          memo: 'Tipped via TipTab Map',
        },
      };

      await session.transact({ actions: [transferAction] }, { broadcast: true });
      
      toast({
        title: "Tip Sent Successfully!",
        description: `Sent ${quantityString} to ${creator.name}.`,
      });
      onClose();
    } catch (error: any) {
      console.error("Transact error:", error);
      toast({ 
        title: "Transaction failed", 
        description: error.message || "Network error. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!creator) return null;

  const quickAmounts = ["50", "100", "500", "1000"];

  return (
    <Dialog open={!!creator} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0d071a]/95 backdrop-blur-[32px] border-white/10 text-white sm:max-w-[460px] rounded-[40px] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-t-purple-500/20">
        <div className="relative h-24 w-full overflow-hidden">
          <div className={cn("absolute inset-0 opacity-30", creator.color)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d071a] to-transparent" />
        </div>
        
        <div className="px-10 pb-10 -mt-10 relative z-10">
          <div className="flex items-end justify-between mb-6">
            <div className={cn(
              "h-28 w-28 rounded-[36px] flex items-center justify-center text-4xl font-black border-[6px] border-[#0d071a] shadow-2xl overflow-hidden",
              creator.color
            )}>
              {creator.avatarImage ? (
                <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
              ) : (
                creator.avatar
              )}
            </div>
            
            <div className="flex gap-2 mb-2">
              {creator.twitter && (
                <Button variant="outline" size="icon" className="rounded-xl bg-white/5 border-white/10 hover:border-white/30 h-10 w-10" asChild>
                  <a href={creator.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4" /></a>
                </Button>
              )}
              {creator.website && (
                <Button variant="outline" size="icon" className="rounded-xl bg-white/5 border-white/10 hover:border-white/30 h-10 w-10" asChild>
                  <a href={creator.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a>
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-1 mb-6">
            <h3 className="text-3xl font-black tracking-tight">{creator.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">@{creator.handle}</span>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{creator.category}</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Select Amount</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <ShieldCheck className="h-3 w-3 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Secure Tip</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="ghost"
                  onClick={() => setTipAmount(formatValue(amount))}
                  className={cn(
                    "h-12 rounded-2xl border-2 font-black transition-all",
                    parseFloat(tipAmount) === parseFloat(amount) 
                      ? "border-orange-500 bg-orange-500/10 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]" 
                      : "bg-white/5 border-transparent hover:bg-white/10 text-white/60 hover:text-white"
                  )}
                >
                  {amount}
                </Button>
              ))}
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <span className="text-white/20 font-black tracking-widest text-[10px] uppercase">Custom Amount</span>
              </div>
              <Input 
                placeholder="0.0000" 
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                onBlur={(e) => setTipAmount(formatValue(e.target.value))}
                className="bg-white/5 border-white/10 h-16 rounded-3xl text-right text-2xl font-black pl-8 pr-20 focus:ring-orange-500/50 focus:bg-white/10 transition-all border-2"
              />
              <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                <span className="text-orange-500 font-black">TAB</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {isConnected ? (
                <Button 
                  onClick={handleSendTip}
                  disabled={isProcessing}
                  className="w-full h-20 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-black text-2xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)] mt-2 transition-all active:scale-[0.98] group overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isProcessing ? (
                      <>
                        <div className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Tip</span>
                        <Zap className="h-6 w-6 fill-white group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect}
                  disabled={isProcessing}
                  className="w-full h-20 bg-[#a855f7] hover:bg-[#9333ea] text-white font-black text-xl md:text-2xl rounded-3xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Wallet className="h-6 w-6" />
                  Connect to Tip
                </Button>
              )}
            </div>
            
            <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.3em] pt-2 font-black">
              Processed via XPR Network • Zero Fees
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};