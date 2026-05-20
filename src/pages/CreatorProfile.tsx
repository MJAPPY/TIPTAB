"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft
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

const CreatorProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, actor, login, isConnected, recordTip } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [asset, setAsset] = useState<"TAB" | "XPR">("TAB");
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
    if (asset === "TAB") return Math.floor(numericValue).toString();
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
    if (!session || !actor) return;
    
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
      const recipient = creator?.handle.replace(/^@/, "").toLowerCase().trim();
      const contract = asset === "TAB" ? "tokencreate" : "eosio.token";
      const quantityString = asset === "TAB" ? `${Math.floor(amountNum)} TAB` : `${amountNum.toFixed(4)} XPR`;

      const actions = [{
        account: contract, 
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
      
      // Trigger celebration sequence
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

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const quickAmounts = asset === "TAB" ? ["10", "50", "100", "250"] : ["100", "500", "1000", "5000"];

  const liveStreams = [
    { type: 'YouTube', url: creator.youtubeLive, icon: Youtube, color: 'text-red-500' },
    { type: 'Twitch', url: creator.twitch, icon: Twitch, color: 'text-[#9146FF]' }
  ].filter(s => s.url);

  const featuredEmbedUrl = creator.mediaEmbed || creator.videoUrl || "";

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className={cn("absolute inset-0 opacity-40 blur-[100px]", creator.color)} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0514] via-[#0a0514]/40 to-transparent" />
        <LiveReactions />
        
        {/* Secondary Page-Level Back Button */}
        <div className="absolute top-24 left-6 z-20 md:hidden">
          <Button 
            onClick={() => navigate(-1)} 
            className="h-10 w-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-md p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className={cn(
                "h-48 w-48 rounded-[48px] flex items-center justify-center text-6xl font-black border-[8px] border-[#0a0514] shadow-2xl overflow-hidden relative group",
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
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-xl font-bold text-purple-400">@{creator.handle}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  <span className="text-white/40 font-bold uppercase tracking-widest text-sm">{creator.category}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-12 space-y-8">
              
              {/* Multi-Stream Section */}
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

              {/* TikTok/Instagram specific Link Buttons (Non-Embeddable) */}
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

              {/* Permanent Featured Media Section */}
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
              <div className="bg-[#130b21] border border-white/10 rounded-[48px] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black tracking-tight">Support <br /> {creator.name.split(' ')[0]}</h2>
                  <div className="flex flex-wrap items-center justify-end gap-2 max-w-[240px]">
                    {/* Heart Reaction */}
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('heart')}
                      className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/40 group transition-all flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                      <span className="font-black text-[11px] text-slate-100">{likeCount}</span>
                    </Button>
                    
                    {/* Firework Reaction */}
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('firework')}
                      className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/15 hover:border-orange-500/40 group transition-all flex items-center gap-2"
                    >
                      <span className="text-base group-hover:scale-110 group-hover:rotate-12 transition-transform">🎇</span>
                      <span className="font-black text-[11px] text-slate-100">{fireworkCount}</span>
                    </Button>

                    {/* Applause Reaction */}
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('applause')}
                      className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/15 hover:border-yellow-500/40 group transition-all flex items-center gap-2"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">👏</span>
                      <span className="font-black text-[11px] text-slate-100">{applauseCount}</span>
                    </Button>

                    {/* Share Button */}
                    <Button variant="ghost" size="icon" onClick={handleShare} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4 text-white/40" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-3">
                    <div className="grid grid-cols-4 gap-3 flex-1">
                      {quickAmounts.map(amount => (
                        <Button
                          key={amount}
                          variant="ghost"
                          onClick={() => setTipAmount(formatValue(amount))}
                          className={cn(
                            "h-14 rounded-2xl border-2 font-black text-lg",
                            parseFloat(tipAmount) === parseFloat(amount) ? "border-orange-500 bg-orange-500/10 text-orange-500" : "bg-white/5 border-transparent text-white/60"
                          )}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <Select value={asset} onValueChange={(val: "TAB" | "XPR") => setAsset(val)}>
                      <SelectTrigger className="w-[90px] h-14 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                        <SelectItem value="TAB" className="font-black py-2 cursor-pointer">TAB</SelectItem>
                        <SelectItem value="XPR" className="font-black py-2 cursor-pointer">XPR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative group">
                    <Input 
                      placeholder="0" 
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      onBlur={(e) => setTipAmount(formatValue(e.target.value))}
                      className="bg-white/5 border-white/10 h-20 rounded-[32px] text-right text-3xl font-black pl-8 pr-24 focus:ring-orange-500/50 border-2"
                    />
                    <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                      <span className={cn("font-black text-xl", asset === "TAB" ? "text-orange-500" : "text-purple-400")}>{asset}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isConnected ? (
                      <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-24 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-2xl rounded-[32px] shadow-xl">
                        {isProcessing ? "Processing..." : "Send Appreciation"}
                      </Button>
                    ) : (
                      <Button onClick={handleConnect} className="w-full h-24 bg-[#a855f7] text-white font-black text-2xl rounded-[32px] shadow-xl animate-shimmer">
                        Connect WebAuth
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Info Box */}
              <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <Tv className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-black uppercase tracking-widest text-white/60">Live Support</p>
                </div>
                <p className="text-sm text-white/40 font-medium">
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