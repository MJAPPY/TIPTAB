"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  Zap, 
  Twitter, 
  Instagram, 
  Globe, 
  Video, 
  MapPin, 
  ShieldCheck, 
  Share2,
  Check,
  Wallet,
  Heart,
  Music,
  Tv,
  Twitch,
  Youtube,
  Radio,
  ArrowLeft,
  Sparkles
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
  const { session, actor, login, isConnected, recordTip, isMember, featuredHandles, boostStream, boostPrice, boostTabPrice } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [asset, setAsset] = useState<string>("TAB");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Interaction Counts
  const [likeCount, setLikeCount] = useState(130);
  const [fireworkCount, setFireworkCount] = useState(42);
  const [applauseCount, setApplauseCount] = useState(84);

  // Ensure page starts at top when handle changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [handle]);

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

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleReaction = (type: 'heart' | 'firework' | 'applause') => {
    if (type === 'heart') setLikeCount(prev => prev + 1);
    if (type === 'firework') setFireworkCount(prev => prev + 1);
    if (type === 'applause') setApplauseCount(prev => prev + 1);
    
    if ((window as any).triggerReaction) {
      (window as any).triggerReaction(type);
    }
  };

  const formatValue = (val: string) => {
    const numericValue = parseFloat(val);
    if (isNaN(numericValue)) return "0";
    const config = ASSET_CONFIGS[asset];
    if (config.precision === 0) return Math.floor(numericValue).toString();
    return numericValue.toFixed(config.precision);
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
        description: `Please enter a valid ${asset} amount.`, 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    try {
      const recipient = creator.handle.replace(/^@/, "").toLowerCase().trim();
      const config = ASSET_CONFIGS[asset];
      const quantityString = config.precision === 0 
        ? `${Math.floor(amountNum)} ${asset}` 
        : `${amountNum.toFixed(config.precision)} ${asset}`;

      const actions = [{
        account: config.code, 
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: session.auth.permission,
        }],
        data: {
          from: actor,
          to: recipient, 
          quantity: quantityString,
          memo: 'Tipped via TipTab Profile',
        },
      }];

      await session.transact({ actions }, { broadcast: true });
      
      if (asset === "TAB") {
        recordTip(Math.floor(amountNum));
      }

      toast({
        title: "Tip Sent!",
        description: `Successfully sent ${quantityString} to ${creator?.name}.`,
      });
      
      const trigger = (window as any).triggerReaction;
      if (trigger) {
        const sequence = ['heart', 'firework', 'applause', 'firework', 'heart', 'applause', 'firework'];
        sequence.forEach((type, i) => {
          setTimeout(() => trigger(type as any), i * 150);
        });
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Please check your balance and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      toast({ title: "Link Copied!", description: "Profile URL saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast({ title: "Copy Failed", description: "Please copy the URL from your address bar.", variant: "destructive" });
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = { title: `Support ${creator?.name} on TIPTAB`, url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const onBoost = async (paymentAsset: 'XPR' | 'TAB') => {
    if (!isMember) {
      setIsMembershipOpen(true);
      return;
    }
    setIsProcessing(true);
    const success = await boostStream(creator!.handle, paymentAsset);
    setIsProcessing(false);
    if (success) {
      toast({
        title: "Performance Boosted!",
        description: `Your stream is now featured on the Live Hub using ${paymentAsset}.`,
      });
    } else {
      toast({
        title: "Boost Failed",
        description: `Please check your ${paymentAsset} balance and try again.`,
        variant: "destructive"
      });
    }
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Gate content for unlogged users
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
        <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
        <div className="pt-44 flex flex-col items-center justify-center p-6 text-center space-y-10">
           <div className="relative">
             <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
             <div className={cn("h-48 w-48 rounded-[48px] flex items-center justify-center text-6xl font-black border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative", creator.color)}>
               {creator.avatarImage ? (
                 <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 creator.avatar
               )}
             </div>
           </div>
           <div className="space-y-4">
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-slate-100">
               Login to view <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">@{creator.handle}</span>
             </h2>
             <p className="text-slate-400 font-bold text-xl max-w-lg mx-auto leading-relaxed">
               Authentication is required to view full performance profiles, verified location data, and community reactions.
             </p>
           </div>
           <div className="flex flex-col gap-4 w-full max-w-sm">
             <Button onClick={handleConnect} className="h-24 px-12 bg-white text-black hover:bg-purple-500 hover:text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95 animate-shimmer-silver">
               <Wallet className="h-6 w-6 mr-3" /> Connect WebAuth
             </Button>
             <Button variant="ghost" onClick={handleBack} className="text-white/40 hover:text-white font-bold text-sm uppercase tracking-widest h-12">
               Return to Global Map
             </Button>
           </div>
        </div>
        <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
      </div>
    );
  }

  // Adjusted quick tiers: TAB is high numeric, stablecoins/XPR are lower
  const quickAmounts = asset === "TAB" ? ["10", "50", "100", "250"] : ["1", "5", "10", "25"];

  const liveStreams = [
    { type: 'YouTube', url: creator.youtubeLive, icon: Youtube, color: 'text-red-500' },
    { type: 'Twitch', url: creator.twitch, icon: Twitch, color: 'text-[#9146FF]' }
  ].filter(s => s.url);

  const featuredEmbedUrl = creator.mediaEmbed || creator.videoUrl || "";
  const isOwner = actor === creator.handle.replace('@', '').toLowerCase();
  const isBoosted = featuredHandles.includes(creator.handle.replace('@', '').toLowerCase());

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-black/60">
        {creator.coverImage ? (
          <>
            <img 
              src={creator.coverImage} 
              alt="Cover banner" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              style={{ objectPosition: `50% ${creator.coverPosition || 50}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/65 to-transparent" />
          </>
        ) : (
          <>
            <div className={cn("absolute inset-0 opacity-40 blur-[100px]", creator.color)} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/40 to-transparent" />
          </>
        )}
        <LiveReactions />
        
        <div className="absolute top-24 left-6 z-20 md:hidden">
          <Button 
            onClick={handleBack} 
            className="h-12 w-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-md p-0 flex items-center justify-center active:scale-95"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className={cn(
                "h-48 w-48 rounded-[48px] flex items-center justify-center text-6xl font-black border-[8px] border-[#0a0514] shadow-2xl overflow-hidden relative group shrink-0",
                creator.color
              )}>
                {creator.avatarImage ? (
                  <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  creator.avatar
                )}
              </div>
              
              <div className="text-center md:text-left space-y-2 pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-500" /> Verified Creator
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{creator.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="text-xl font-bold text-purple-400">@{creator.handle}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  <div className="flex gap-2">
                    {creator.categories && creator.categories.map((cat, idx) => (
                      <span key={idx} className="text-white/40 font-bold uppercase tracking-widest text-sm">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-12 space-y-8">
              
              {liveStreams.length > 0 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                  {liveStreams.map((stream, idx) => (
                    <div key={idx} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Live on {stream.type}</h3>
                        </div>
                        <a 
                          href={stream.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={cn("text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2", stream.color)}
                        >
                          <stream.icon className="h-3 w-3" /> External Link
                        </a>
                      </div>
                      <EmbedPlayer url={stream.url!} />
                    </div>
                  ))}
                </div>
              )}

              {(creator.tiktok || creator.instagramLive) && (
                <div className={cn("flex flex-wrap gap-4 pt-8", liveStreams.length > 0 ? "border-t border-white/5" : "")}>
                  {creator.tiktok && (
                    <Button asChild className="rounded-2xl bg-black border border-white/20 hover:bg-white/10 h-12 px-6 gap-3 group">
                      <a href={creator.tiktok} target="_blank" rel="noopener noreferrer">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-2.26.74-4.63 2.58-5.91 1.64-1.15 3.7-1.49 5.66-1.02v4.53c-.31-.19-.71-.24-1.07-.23-.39.03-.77.17-1.02.47-.5.62-.14 1.53.55 1.81.47.24 1.13.14 1.51-.25.23-.27.35-.63.35-.98.01-3.55-.01-7.1.02-10.65z"/></svg>
                        <span className="font-black text-xs uppercase tracking-widest">TikTok Live</span>
                      </a>
                    </Button>
                  )}
                  {creator.instagramLive && (
                    <Button asChild className="rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] h-12 px-6 gap-3 group">
                      <a href={creator.instagramLive} target="_blank" rel="noopener noreferrer">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <Instagram className="h-5 w-5" />
                        <span className="font-black text-xs uppercase tracking-widest">IG Live</span>
                      </a>
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">About</h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">{creator.bio}</p>
              </div>

              {featuredEmbedUrl && (
                <div className="space-y-6 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Music className="h-4 w-4 text-purple-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                      Featured Content
                    </h3>
                  </div>
                  <EmbedPlayer url={featuredEmbedUrl} />
                </div>
              )}

              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/5">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Location</h3>
                  <div className="flex items-center gap-2 text-lg font-bold text-white/60">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    {creator.location}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Connect</h3>
                  <div className="flex items-center gap-4">
                    {creator.twitter && (
                      <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-purple-500 transition-all">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {creator.instagram && (
                      <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-500 transition-all">
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {creator.spotify && (
                      <a href={creator.spotify} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#1DB954] transition-all group">
                        <svg className="h-5 w-5 fill-white group-hover:fill-white" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.216.354-.675.467-1.028.249-2.857-1.745-6.452-2.14-10.686-1.172-.406.092-.817-.16-.908-.566-.092-.406.16-.817.566-.908 4.642-1.062 8.624-.606 11.806 1.34.354.216.467.675.25 1.028zm1.474-3.26c-.272.441-.848.583-1.288.311-3.266-2.008-8.246-2.593-12.108-1.42-.497.151-1.025-.129-1.176-.626-.151-.497.129-1.025.626-1.176 4.417-1.341 9.904-.691 13.636 1.601.44.272.583.847.31 1.288zm.126-3.411c-3.917-2.326-10.372-2.541-14.131-1.399-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.307-1.307 11.436-1.05 15.961 1.637.54.321.716 1.018.395 1.558-.321.54-1.017.717-1.558.396z"/></svg>
                      </a>
                    )}
                    {creator.website && (
                      <a href={creator.website} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500 transition-all">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-40 space-y-6">
              
              {isOwner && (
                <div className="bg-gradient-to-br from-orange-500/15 via-[#130b21] to-[#130b21] border border-orange-500/30 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 fill-orange-500" /> Control Desk
                    </span>
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">Stream Controller</h3>
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed pt-2">
                    Feature your performance at the top of the <span className="text-orange-400 font-bold">Live Hub</span> for maximum visibility and better tips.
                  </p>
                  
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Hub Status</span>
                    {isBoosted ? (
                      <span className="text-xs font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" /> Boosted Live
                      </span>
                    ) : (
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                        Standard Live
                      </span>
                    )}
                  </div>

                  {!isBoosted && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={() => onBoost('XPR')}
                        disabled={isProcessing}
                        className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 border-b-4 border-black/20"
                      >
                        {isProcessing ? "Wait..." : `Boost (${Number(boostPrice).toLocaleString()} XPR)`}
                      </Button>
                      <Button
                        onClick={() => onBoost('TAB')}
                        disabled={isProcessing}
                        className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 border-b-4 border-black/20"
                      >
                        {isProcessing ? "Wait..." : `Boost (${Number(boostTabPrice).toLocaleString()} TAB)`}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#130b21] border border-white/10 rounded-[48px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Support <br /> {creator.name.split(' ')[0]}</h2>
                  <div className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2 max-w-[200px] md:max-w-[240px]">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('heart')}
                      className="h-9 px-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/40 group transition-all flex items-center gap-2"
                    >
                      <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                      <span className="font-black text-[10px] text-slate-100">{likeCount}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('firework')}
                      className="h-9 px-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/15 hover:border-orange-500/40 group transition-all flex items-center gap-2"
                    >
                      <span className="text-sm group-hover:scale-110 group-hover:rotate-12 transition-transform">🎇</span>
                      <span className="font-black text-[10px] text-slate-100">{fireworkCount}</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('applause')}
                      className="h-9 px-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/15 hover:border-yellow-500/40 group transition-all flex items-center gap-2"
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform">👏</span>
                      <span className="font-black text-[10px] text-slate-100">{applauseCount}</span>
                    </Button>

                    <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                      {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5 text-white/40" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {quickAmounts.map(amount => (
                        <Button
                          key={amount}
                          variant="ghost"
                          onClick={() => setTipAmount(formatValue(amount))}
                          className={cn(
                            "h-12 md:h-14 rounded-xl md:rounded-2xl border-2 font-black text-sm md:text-lg transition-all",
                            parseFloat(tipAmount) === parseFloat(amount) ? "border-orange-500 bg-orange-500/10 text-orange-500" : "bg-white/5 border-transparent text-white/60"
                          )}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <Select value={asset} onValueChange={(val: string) => setAsset(val)}>
                      <SelectTrigger className="w-full sm:w-[90px] h-12 md:h-14 bg-white/5 border-2 border-white/10 rounded-xl md:rounded-2xl font-black text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                        {Object.keys(ASSET_CONFIGS).map(s => (
                          <SelectItem key={s} value={s} className="font-black py-2 cursor-pointer">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative group">
                    <Input 
                      placeholder="0" 
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      onBlur={(e) => setTipAmount(formatValue(e.target.value))}
                      className="bg-white/5 border-white/10 h-16 md:h-20 rounded-2xl md:rounded-[32px] text-right text-2xl md:text-3xl font-black pl-8 pr-28 md:pr-32 focus:ring-orange-500/50 border-2"
                    />
                    <div className="absolute inset-y-0 right-6 md:right-8 flex items-center pointer-events-none">
                      <span className={cn("font-black text-lg md:text-xl", asset === "TAB" ? "text-orange-500" : "text-purple-400")}>{asset}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isConnected ? (
                      <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-20 md:h-24 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-xl md:text-2xl rounded-2xl md:rounded-[32px] shadow-xl transition-all active:scale-95">
                        {isProcessing ? "Processing..." : "Send Appreciation"}
                      </Button>
                    ) : (
                      <Button onClick={handleConnect} className="w-full h-20 md:h-24 bg-[#a855f7] text-white font-black text-xl md:text-2xl rounded-2xl md:rounded-[32px] shadow-xl animate-shimmer">
                        Connect WebAuth
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <Tv className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-black uppercase tracking-widest text-white/60">Live Support</p>
                </div>
                <p className="text-xs md:text-sm text-white/40 font-medium">
                  Tips sent to this creator are settled instantly on the XPR Network. Zero fees applied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CreatorProfile;