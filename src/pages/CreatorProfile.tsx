"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Zap, Twitter, Instagram, Globe, Video, MapPin, ShieldCheck, Share2, Check, Wallet, Heart, Music, Tv, Radio, ArrowLeft, Sparkles } from "lucide-react";
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
  const { toast } = useToast();
  const { session, actor, login, isConnected, recordTip, isMember, featuredHandles, boostStream, boostPrice, boostPriceTab } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [asset, setAsset] = useState<string>("TAB");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [boostAsset, setBoostAsset] = useState<'XPR' | 'TAB'>('TAB');

  useEffect(() => {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@/, "").toLowerCase().trim();
    const found = CREATORS.find(c => c.handle.toLowerCase() === cleanHandle) || 
                  (localStorage.getItem("tiptab_user_profile") ? JSON.parse(localStorage.getItem("tiptab_user_profile")!) : null);
    if (found && (found.handle.toLowerCase() === cleanHandle || found.handle === cleanHandle)) setCreator(found);
    else navigate("/");
  }, [handle, navigate]);

  const handleBoost = async () => {
    if (!isMember) { setIsMembershipOpen(true); return; }
    setIsProcessing(true);
    const success = await boostStream(creator!.handle, boostAsset);
    setIsProcessing(false);
    if (success) toast({ title: "Performance Boosted!" });
    else toast({ title: "Boost Failed", variant: "destructive" });
  };

  const handleSendTip = async () => {
    if (!session || !actor || !creator) return;
    const amountNum = parseFloat(tipAmount);
    setIsProcessing(true);
    try {
      const config = ASSET_CONFIGS[asset];
      const quantity = config.precision === 0 ? `${Math.floor(amountNum)} ${asset}` : `${amountNum.toFixed(config.precision)} ${asset}`;
      await session.transact({ actions: [{ account: config.code, name: 'transfer', authorization: [{ actor, permission: 'active' }], data: { from: actor, to: creator.handle.replace('@', '').toLowerCase(), quantity, memo: 'Tip' } }] }, { broadcast: true });
      if (asset === "TAB") recordTip(Math.floor(amountNum));
      toast({ title: "Tip Sent!" });
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  if (!creator) return null;
  const isOwner = actor === creator.handle.replace('@', '').toLowerCase();
  const isBoosted = featuredHandles.includes(creator.handle.replace('@', '').toLowerCase());

  return (
    <div className="min-h-screen bg-[#0a0514] text-white">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <div className="relative h-[40vh] bg-black/60 overflow-hidden">
        {creator.coverImage && <img src={creator.coverImage} className="w-full h-full object-cover opacity-60" style={{ objectPosition: `50% ${creator.coverPosition}%` }} alt="" />}
        <LiveReactions />
      </div>
      <main className="container mx-auto px-6 -mt-32 relative z-10 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
           <div className={cn("h-48 w-48 rounded-[48px] flex items-center justify-center text-6xl font-black border-[8px] border-[#0a0514] shadow-2xl overflow-hidden", creator.color)}>
            {creator.avatarImage ? <img src={creator.avatarImage} className="w-full h-full object-cover" alt="" /> : creator.avatar}
           </div>
           <h1 className="text-5xl md:text-7xl font-black">{creator.name}</h1>
           <p className="text-xl text-white/60">{creator.bio}</p>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {isOwner && (
            <div className="bg-[#130b21] border border-orange-500/30 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl font-black italic uppercase">Boost Stream</h3>
              <p className="text-sm text-slate-400 mt-2">Get featured on the Live Hub.</p>
              
              <div className="mt-8 space-y-4">
                {!isBoosted ? (
                  <>
                    <div className="flex gap-2">
                      <Button onClick={() => setBoostAsset('TAB')} className={cn("flex-1 h-14 rounded-xl font-black", boostAsset === 'TAB' ? "bg-orange-500" : "bg-white/5 border border-white/10")}>{boostPriceTab} TAB</Button>
                      <Button onClick={() => setBoostAsset('XPR')} className={cn("flex-1 h-14 rounded-xl font-black", boostAsset === 'XPR' ? "bg-purple-600" : "bg-white/5 border border-white/10")}>{boostPrice} XPR</Button>
                    </div>
                    <Button onClick={handleBoost} disabled={isProcessing} className="w-full h-16 bg-white text-black font-black rounded-2xl text-lg transition-all active:scale-95">
                      {isProcessing ? "Processing..." : `Boost with ${boostAsset}`}
                    </Button>
                  </>
                ) : (
                  <div className="h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-black uppercase">Featured Status Active</div>
                )}
              </div>
            </div>
          )}

          <div className="bg-[#130b21] border border-white/10 rounded-[48px] p-10 shadow-2xl">
             <h2 className="text-3xl font-black mb-8">Send Tip</h2>
             <div className="flex gap-3 mb-6">
                <Input value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} className="h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-black px-6" />
                <Select value={asset} onValueChange={setAsset}>
                  <SelectTrigger className="w-[100px] h-16 bg-white/5 border-white/10 rounded-2xl font-black"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a102d] text-white border-white/10">{Object.keys(ASSET_CONFIGS).map(a => <SelectItem key={a} value={a} className="font-black">{a}</SelectItem>)}</SelectContent>
                </Select>
             </div>
             <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-20 bg-gradient-to-r from-orange-500 to-purple-600 font-black text-2xl rounded-[32px]">Send appreciation</Button>
          </div>
        </div>
      </main>
      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default CreatorProfile;