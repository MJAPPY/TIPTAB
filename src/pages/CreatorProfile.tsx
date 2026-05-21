"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  Zap, Twitter, Instagram, Globe, Video, MapPin, ShieldCheck, Share2, Check, Wallet, Heart, Music, Tv, Twitch, Youtube, Radio, ArrowLeft, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CREATORS, Creator } from "@/data/creators";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { EmbedPlayer } from "@/components/tab-platform/EmbedPlayer";
import { LiveReactions } from "@/components/tab-platform/LiveReactions";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const ASSET_CONFIGS: Record<string, { code: string; precision: number }> = {
  TAB: { code: 'tokencreate', precision: 0 },
  XPR: { code: 'eosio.token', precision: 4 },
  XMD: { code: 'monedatoken', precision: 6 },
  XUSDC: { code: 'xtokens', precision: 6 },
  METAL: { code: 'token.metal', precision: 8 },
  LOAN: { code: 'loan.token', precision: 4 },
};

const CreatorProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, actor, login, isConnected, recordTip, isMember, featuredHandles, boostStream, boostPrice } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [asset, setAsset] = useState<string>("TAB");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@/, "").toLowerCase().trim();
    const found = CREATORS.find(c => c.handle.toLowerCase() === cleanHandle);
    if (found) setCreator(found);
    else navigate("/");
  }, [handle, navigate]);

  const handleSendTip = async () => {
    if (!session || !actor || !creator) return;
    setIsProcessing(true);
    try {
      const recipient = creator.handle.replace(/^@/, "").toLowerCase().trim();
      const config = ASSET_CONFIGS[asset];
      const amountNum = parseFloat(tipAmount);
      const quantityString = config.precision === 0 ? `${Math.floor(amountNum)} ${asset}` : `${amountNum.toFixed(config.precision)} ${asset}`;

      await session.transact({ actions: [{
        account: config.code, name: 'transfer',
        authorization: [{ actor, permission: session.auth.permission }],
        data: { from: actor, to: recipient, quantity: quantityString, memo: 'Tip via TipTab' }
      }]}, { broadcast: true });
      
      if (asset === "TAB") recordTip(Math.floor(amountNum));
      toast({ title: "Tip Sent!" });
    } catch (e) {
      toast({ title: "Failed", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  if (!creator) return null;

  return (
    <div className="min-h-screen bg-[#0a0514] text-white">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <div className="relative h-[40vh] overflow-hidden">
        {creator.coverImage && <img src={creator.coverImage} className="w-full h-full object-cover" style={{ objectPosition: `50% ${creator.coverPosition}%` }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] to-transparent" />
        <LiveReactions />
      </div>

      <main className="container mx-auto px-6 -mt-24 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className={cn("h-40 w-40 rounded-[40px] flex items-center justify-center text-5xl font-black border-[6px] border-[#0a0514] shadow-2xl overflow-hidden", creator.color)}>
                {creator.avatar}
              </div>
              <div className="text-center md:text-left space-y-2">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter">{creator.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-lg font-bold text-purple-400 mr-2">@{creator.handle}</span>
                  {(creator.categories || []).map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40">{c}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-[40px] space-y-6">
              <p className="text-xl leading-relaxed text-white/80">{creator.bio}</p>
              {creator.mediaEmbed && <EmbedPlayer url={creator.mediaEmbed} />}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-[#130b21] p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
               <h3 className="text-2xl font-black italic">Support {creator.name.split(' ')[0]}</h3>
               <div className="space-y-4">
                 <div className="flex gap-2">
                   {["10", "50", "100", "250"].map(v => (
                     <Button key={v} variant="ghost" onClick={() => setTipAmount(v)} className={cn("flex-1 h-12 rounded-xl font-black", tipAmount === v ? "bg-orange-500 text-white" : "bg-white/5 text-white/40")}>{v}</Button>
                   ))}
                 </div>
                 <Input value={tipAmount} onChange={e => setTipAmount(e.target.value)} className="bg-white/5 border-white/10 h-16 rounded-2xl text-right font-black text-2xl pr-20" />
                 <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-20 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-2xl rounded-[32px] shadow-xl">
                   {isProcessing ? "Sending..." : "Send Tip"}
                 </Button>
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