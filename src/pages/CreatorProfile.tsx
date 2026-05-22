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
  const { toast } = useToast();
  const { session, actor, login, isConnected, recordTip, featuredHandles, boostStream, boostPrice, boostTabPrice, isMember } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [asset, setAsset] = useState<string>("TAB");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [likeCount, setLikeCount] = useState(130);
  const [fireworkCount, setFireworkCount] = useState(42);
  const [applauseCount, setApplauseCount] = useState(84);

  useEffect(() => {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@/, "").toLowerCase().trim();
    const found = CREATORS.find(c => c.handle.toLowerCase() === cleanHandle);
    if (found) {
      setCreator(found);
    } else {
      const savedUser = localStorage.getItem("tiptab_user_profile");
      if (savedUser) {
        const localUser = JSON.parse(savedUser) as Creator;
        if (localUser.handle.toLowerCase() === cleanHandle) {
          setCreator(localUser);
          return;
        }
      }
      navigate("/");
    }
  }, [handle, navigate]);

  const handleReaction = (type: 'heart' | 'firework' | 'applause') => {
    if (type === 'heart') setLikeCount(prev => prev + 1);
    if (type === 'firework') setFireworkCount(prev => prev + 1);
    if (type === 'applause') setApplauseCount(prev => prev + 1);
    if ((window as any).triggerReaction) (window as any).triggerReaction(type);
  };

  const handleSendTip = async () => {
    if (!session || !actor || !creator) return;
    const amountNum = parseFloat(tipAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const config = ASSET_CONFIGS[asset];
      const quantityString = config.precision === 0 ? `${Math.floor(amountNum)} ${asset}` : `${amountNum.toFixed(config.precision)} ${asset}`;
      const actions = [{
        account: config.code, 
        name: 'transfer',
        authorization: [{ actor, permission: session.auth.permission }],
        data: { from: actor, to: creator.handle.toLowerCase(), quantity: quantityString, memo: 'Tipped via TipTab Profile' },
      }];
      await session.transact({ actions }, { broadcast: true });
      if (asset === "TAB") recordTip(Math.floor(amountNum));
      toast({ title: "Tip Sent!", description: `Sent ${quantityString} to ${creator.name}.` });
    } catch (error: any) {
      toast({ title: "Transaction Failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!creator) return <div className="min-h-screen bg-[#0a0514] flex items-center justify-center"><div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" /></div>;

  const hasLocation = creator.location && creator.location.trim() !== "";

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-black/60">
        {creator.coverImage ? (
          <><img src={creator.coverImage} className="w-full h-full object-cover" style={{ objectPosition: `50% ${creator.coverPosition || 50}%` }} /><div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/65 to-transparent" /></>
        ) : (
          <><div className={cn("absolute inset-0 opacity-40 blur-[100px]", creator.color)} /><div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/40 to-transparent" /></>
        )}
        <LiveReactions />
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className={cn("h-48 w-48 rounded-[48px] flex items-center justify-center text-6xl font-black border-[8px] border-[#0a0514] shadow-2xl overflow-hidden relative shrink-0", creator.color)}>
                {creator.avatarImage ? <img src={creator.avatarImage} className="w-full h-full object-cover" /> : creator.avatar}
              </div>
              <div className="text-center md:text-left space-y-2 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-500" /> Verified Creator
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{creator.name}</h1>
                <p className="text-xl font-bold text-purple-400">@{creator.handle}</p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-12 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">About</h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">{creator.bio}</p>
              </div>

              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/5">
                {hasLocation && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Location</h3>
                    <div className="flex items-center gap-2 text-lg font-bold text-white/60"><MapPin className="h-5 w-5 text-purple-500" />{creator.location}</div>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Connect</h3>
                  <div className="flex items-center gap-4">
                    {creator.twitter && <a href={creator.twitter} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-purple-500 transition-all"><Twitter className="h-5 w-5" /></a>}
                    {creator.website && <a href={creator.website} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500 transition-all"><Globe className="h-5 w-5" /></a>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-40 space-y-6">
              <div className="bg-[#130b21] border border-white/10 rounded-[48px] p-8 md:p-10 shadow-2xl">
                <h2 className="text-2xl font-black mb-8">Support {creator.name.split(' ')[0]}</h2>
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => handleReaction('heart')} className="bg-white/5 border border-white/10 h-10 px-4 rounded-xl gap-2"><Heart className="h-4 w-4 text-red-500" />{likeCount}</Button>
                    <Button variant="ghost" onClick={() => handleReaction('firework')} className="bg-white/5 border border-white/10 h-10 px-4 rounded-xl gap-2">🎇{fireworkCount}</Button>
                  </div>
                  <div className="relative">
                    <Input placeholder="0" value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} className="bg-white/5 border-white/10 h-16 rounded-2xl text-right text-2xl font-black pr-16" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-orange-500">{asset}</span>
                  </div>
                  <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl text-xl font-black">{isProcessing ? "Processing..." : "Send Appreciation"}</Button>
                </div>
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