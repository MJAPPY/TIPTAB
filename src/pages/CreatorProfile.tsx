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
  Sparkles,
  MessageSquare,
  Star,
  Facebook,
  ExternalLink,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Creator } from "@/data/creators";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { EmbedPlayer } from "@/components/tab-platform/EmbedPlayer";
import { LiveReactions } from "@/components/tab-platform/LiveReactions";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ASSET_CONFIGS: Record<string, { code: string; precision: number }> = {
  TAB: { code: 'tokencreate', precision: 0 },
  XPR: { code: 'eosio.token', precision: 4 },
  XMD: { code: 'moneda.token', precision: 6 },
  XUSDC: { code: 'xtokens', precision: 6 },
  METAL: { code: 'token.metal', precision: 8 },
  LOAN: { code: 'loan.token', precision: 4 },
};

// Target production URL for sharing
const PRODUCTION_URL = "https://tiptab.sh";

const CreatorProfile = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, actor, login, isConnected, recordTip, isMember, featuredHandles, boostStream, boostPrice, boostTabPrice, userProfile, isFavorite, toggleFavorite, dbCreators } = useXpr();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState("50");
  const [asset, setAsset] = useState<string>("TAB");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
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
    
    const loadCreator = async () => {
      // Priority 1: Check if viewing own profile (live context data)
      if (actor === cleanHandle && userProfile) {
        setCreator(userProfile);
        return;
      }

      // Priority 2: Check database creators list in memory
      const foundInDb = dbCreators.find(c => c.handle.toLowerCase() === cleanHandle);
      if (foundInDb) {
        setCreator(foundInDb);
        return;
      }

      // Priority 3: Direct Supabase Fetch (Crucial for cold launches/QR scans!)
      try {
        const { data: dbProfile, error: dbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('handle', cleanHandle)
          .maybeSingle();

        if (dbProfile && !dbError) {
          const mappedProfile: Creator = {
            id: `user_${cleanHandle}`,
            name: dbProfile.name || cleanHandle,
            handle: dbProfile.handle,
            bio: dbProfile.bio || "",
            location: dbProfile.location || "",
            coordinates: dbProfile.coordinates || [0, 0],
            categories: dbProfile.categories || ["Other"],
            avatar: dbProfile.avatar || cleanHandle.slice(0, 2).toUpperCase(),
            avatarImage: dbProfile.avatar_image || "",
            coverImage: dbProfile.cover_image || "",
            coverPosition: dbProfile.cover_position ?? 50,
            color: dbProfile.color || "bg-purple-600",
            twitter: dbProfile.twitter || "",
            website: dbProfile.website || "",
            videoUrl: dbProfile.video_url || "",
            instagram: dbProfile.instagram || "",
            spotify: dbProfile.spotify || "",
            snipverse: dbProfile.snipverse || "",
            facebook: dbProfile.facebook || "",
            kick: dbProfile.kick || "",
            rumble: dbProfile.rumble || "",
            twitch: dbProfile.twitch || "",
            tiktok: dbProfile.tiktok || "",
            youtubeLive: dbProfile.youtube_live || "",
            instagramLive: dbProfile.instagram_live || "",
          };
          setCreator(mappedProfile);
          return;
        }
      } catch (e) {
        console.error("Direct profile load error", e);
      }
      
      // Priority 4: Check for any local storage overrides for this specific handle
      const localOverride = localStorage.getItem(`tiptab_profile_${cleanHandle}`);
      if (localOverride) {
        setCreator(JSON.parse(localOverride));
        return;
      }
      
      // Priority 5: Fallback to general user profile (legacy key)
      const savedUser = localStorage.getItem("tiptab_user_profile");
      if (savedUser) {
        const localUser = JSON.parse(savedUser) as Creator;
        if (localUser.handle.toLowerCase() === cleanHandle) {
          setCreator(localUser);
          return;
        }
      }

      // Only navigate away if we are certain the profile does not exist anywhere
      navigate("/");
    };

    loadCreator();
  }, [handle, navigate, actor, userProfile, dbCreators]);

  // Load reactions dynamically based on creator and global reset flag
  useEffect(() => {
    if (!creator) return;
    const handleLower = creator.handle.toLowerCase().replace('@', '').trim();
    const globalReset = localStorage.getItem("tiptab_global_reactions_reset") === "true";
    
    const likes = localStorage.getItem(`tiptab_reactions_likes_${handleLower}`);
    const fireworks = localStorage.getItem(`tiptab_reactions_fireworks_${handleLower}`);
    const applause = localStorage.getItem(`tiptab_reactions_applause_${handleLower}`);
    
    setLikeCount(likes ? parseInt(likes) : (globalReset ? 0 : 130));
    setFireworkCount(fireworks ? parseInt(fireworks) : (globalReset ? 0 : 42));
    setApplauseCount(applause ? parseInt(applause) : (globalReset ? 0 : 84));
  }, [creator]);

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleReaction = (type: 'heart' | 'firework' | 'applause') => {
    if (!creator) return;
    const handleLower = creator.handle.toLowerCase().replace('@', '').trim();

    if (type === 'heart') {
      setLikeCount(prev => {
        const next = prev + 1;
        localStorage.setItem(`tiptab_reactions_likes_${handleLower}`, next.toString());
        return next;
      });
    }
    if (type === 'firework') {
      setFireworkCount(prev => {
        const next = prev + 1;
        localStorage.setItem(`tiptab_reactions_fireworks_${handleLower}`, next.toString());
        return next;
      });
    }
    if (type === 'applause') {
      setApplauseCount(prev => {
        const next = prev + 1;
        localStorage.setItem(`tiptab_reactions_applause_${handleLower}`, next.toString());
        return next;
      });
    }
    
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
          memo: message.trim() || 'Tipped via TipTab Profile',
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
      
      setMessage("");
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

  const copyToClipboard = () => {
    if (!creator) return;
    const cleanHandle = creator.handle.replace(/^@/, "").toLowerCase().trim();
    const shareUrl = `${PRODUCTION_URL}/tip/${cleanHandle}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({ title: "Link Copied!", description: "Profile URL saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast({ title: "Copy Failed", description: "Please copy the URL from your address bar.", variant: "destructive" });
    });
  };

  const handleShare = () => {
    setIsShareOpen(true);
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

  const handleToggleFavorite = () => {
    if (!isConnected) {
      handleConnect();
      return;
    }
    toggleFavorite(creator!.handle);
    const currentlyFav = isFavorite(creator!.handle);
    toast({
      title: currentlyFav ? "Removed from Favorites" : "Added to Favorites",
      description: currentlyFav ? `Removed @${creator?.handle} from your saves.` : `Saved @${creator?.handle} to your dashboard.`,
    });
  };

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Adjusted quick tiers: TAB is high numeric, stablecoins/XPR are lower
  const quickAmounts = asset === "TAB" ? ["10", "50", "100", "250"] : ["1", "5", "10", "25"];

  const liveStreams = [
    { type: 'YouTube', url: creator.youtubeLive, icon: Youtube, color: 'text-red-500' },
    { type: 'Twitch', url: creator.twitch, icon: Twitch, color: 'text-[#9146FF]' },
    { type: 'Kick', url: creator.kick, icon: Radio, color: 'text-[#53FC18]' },
    { type: 'Rumble', url: creator.rumble, icon: Video, color: 'text-[#85C742]' }
  ].filter(s => s.url);

  const featuredEmbedUrl = creator.mediaEmbed || creator.videoUrl || "";
  const isOwner = actor === creator.handle.replace('@', '').toLowerCase();
  const isBoosted = featuredHandles.includes(creator.handle.replace('@', '').toLowerCase());
  const favorited = isFavorite(creator.handle);
  const cleanHandle = creator.handle.replace(/^@/, "").toLowerCase().trim();
  const shareUrl = `${PRODUCTION_URL}/tip/${cleanHandle}`;

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      <LiveReactions />

      <div className="relative h-[30vh] xs:h-[35vh] md:h-[50vh] w-full overflow-hidden bg-black/60">
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
        
        <div className="absolute top-20 md:top-24 left-4 md:left-6 z-20 md:hidden">
          <Button 
            onClick={handleBack} 
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 border border-white/20 backdrop-blur-md p-0 flex items-center justify-center active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-6 -mt-20 xs:-mt-24 md:-mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
              <div className={cn(
                "h-36 w-36 md:h-48 md:w-48 rounded-[36px] md:rounded-[48px] flex items-center justify-center text-4xl md:text-6xl font-black border-[6px] md:border-[8px] border-[#0a0514] shadow-2xl overflow-hidden relative group shrink-0",
                creator.color
              )}>
                {creator.avatarImage ? (
                  <img src={creator.avatarImage} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  creator.avatar
                )}
              </div>
              
              <div className="text-center md:text-left space-y-2 pb-2 md:pb-4 flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 md:mb-2 w-fit mx-auto md:mx-0">
                    <ShieldCheck className="h-3 md:h-3.5 w-3 md:w-3.5 text-orange-500" /> Verified Creator
                  </div>
                  <Button 
                    onClick={handleToggleFavorite}
                    variant="ghost" 
                    className={cn(
                      "h-9 md:h-10 rounded-xl gap-2 font-black uppercase text-[9px] md:text-[10px] tracking-widest px-3 md:px-4 transition-all border-2 mx-auto md:mx-0",
                      favorited ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500" : "bg-white/5 border-transparent text-white/40 hover:text-white"
                    )}
                  >
                    <Star className={cn("h-3 md:h-3.5 w-3 md:w-3.5", favorited && "fill-yellow-500")} />
                    <span className="hidden xs:inline">{favorited ? "Saved" : "Add to Favorites"}</span>
                    <span className="xs:hidden">{favorited ? "Saved" : "Save"}</span>
                  </Button>
                </div>
                <h1 className="text-4xl xs:text-5xl md:text-7xl font-black tracking-tighter leading-none">{creator.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 md:gap-3">
                  <span className="text-lg md:text-xl font-bold text-purple-400">@{creator.handle}</span>
                  <div className="h-1 md:h-1.5 w-1 md:w-1.5 rounded-full bg-white/10" />
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {creator.categories && creator.categories.map((cat, idx) => (
                      <span key={idx} className="text-white/40 font-bold uppercase tracking-widest text-xs md:text-sm">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-12 space-y-6 md:space-y-8">
              
              {liveStreams.length > 0 && (
                <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                  {liveStreams.map((stream, idx) => (
                    <div key={idx} className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <div className="relative flex h-2.5 md:h-3 w-2.5 md:w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 md:h-3 w-2.5 md:w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                          </div>
                          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-red-500">Live on {stream.type}</h3>
                        </div>
                        <a 
                          href={stream.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={cn("text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5 md:gap-2", stream.color)}
                        >
                          <stream.icon className="h-3 w-3" /> <span className="hidden xs:inline">External Link</span>
                        </a>
                      </div>
                      <EmbedPlayer url={stream.url!} />
                    </div>
                  ))}
                </div>
              )}

              {(creator.tiktok || creator.instagramLive) && (
                <div className={cn("flex flex-wrap gap-3 md:gap-4 pt-6 md:pt-8", liveStreams.length > 0 ? "border-t border-white/5" : "")}>
                  {creator.tiktok && (
                    <Button asChild className="flex-1 xs:flex-none rounded-xl md:rounded-2xl bg-black border border-white/20 hover:bg-white/10 h-11 md:h-12 px-4 md:px-6 gap-2.5 md:gap-3 group">
                      <a href={creator.tiktok} target="_blank" rel="noopener noreferrer">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <svg className="h-4 w-4 md:h-5 md:w-5 fill-white" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.34-3.37-3.65-5.71-.28-2.26.74-4.63 2.58-5.91 1.64-1.15 3.7-1.49 5.66-1.02v4.53c-.31-.19-.71-.24-1.07-.23-.39.03-.77.17-1.02.47-.5.62-.14 1.53.55 1.81.47.24 1.13.14 1.51-.25.23-.27.35-.63.35-.98.01-3.55-.01-7.1.02-10.65z"/></svg>
                        <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">TikTok Live</span>
                      </a>
                    </Button>
                  )}
                  {creator.instagramLive && (
                    <Button asChild className="flex-1 xs:flex-none rounded-xl md:rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] h-11 md:h-12 px-4 md:px-6 gap-2.5 md:gap-3 group">
                      <a href={creator.instagramLive} target="_blank" rel="noopener noreferrer">
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="font-black text-[10px] md:text-xs uppercase tracking-widest">IG Live</span>
                      </a>
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-3 md:space-y-4">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/30">About</h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">{creator.bio}</p>
              </div>

              {featuredEmbedUrl && (
                <div className="space-y-6 pt-6 md:pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <Music className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500" />
                    <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/30">
                      Featured Content
                    </h3>
                  </div>
                  <EmbedPlayer url={featuredEmbedUrl} />
                </div>
              )}

              <div className="flex flex-col xs:flex-row flex-wrap gap-6 md:gap-8 pt-6 md:pt-8 border-t border-white/5">
                <div className="space-y-2">
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/30">Location</h3>
                  <div className="flex items-center gap-2 text-base md:text-lg font-bold text-white/60">
                    <MapPin className="h-4 md:h-5 w-4 md:w-5 text-purple-500" />
                    {creator.location}
                  </div>
                </div>
                
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/30">Connect</h3>
                  <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                    {creator.twitter && (
                      <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-purple-500 transition-all shrink-0">
                        <Twitter className="h-4 md:h-5 w-4 md:w-5" />
                      </a>
                    )}
                    {creator.instagram && (
                      <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-pink-500 transition-all shrink-0">
                        <Instagram className="h-4 md:h-5 w-4 md:w-5" />
                      </a>
                    )}
                    {creator.snipverse && (
                      <a href={creator.snipverse} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-purple-600 transition-all shrink-0">
                        <MessageSquare className="h-4 md:h-5 w-4 md:w-5" />
                      </a>
                    )}
                    {creator.kick && (
                      <a href={creator.kick} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#53FC18] transition-all shrink-0">
                        <Radio className="h-4 w-4" />
                      </a>
                    )}
                    {creator.rumble && (
                      <a href={creator.rumble} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#85C742] transition-all shrink-0">
                        <Video className="h-4 md:h-5 w-4 md:w-5" />
                      </a>
                    )}
                    {creator.facebook && (
                      <a href={creator.facebook} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-all shrink-0">
                        <Facebook className="h-4 md:h-5 w-4 md:w-5" />
                      </a>
                    )}
                    {creator.spotify && (
                      <a href={creator.spotify} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#1DB954] transition-all group shrink-0">
                        <svg className="h-4 md:h-5 w-4 md:w-5 fill-white group-hover:fill-white" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.216.354-.675.467-1.028.249-2.857-1.745-6.452-2.14-10.686-1.172-.406.092-.817-.16-.908-.566-.092-.406.16-.817.566-.908 4.642-1.062 8.624-.606 11.806 1.34.354.216.467.675.25 1.028zm1.474-3.26c-.272.441-.848.583-1.288.311-3.266-2.008-8.246-2.593-12.108-1.42-.497.151-1.025-.129-1.176-.626-.151-.497.129-1.025.626-1.176 4.417-1.341 9.904-.691 13.636 1.601.44.272.583.847.31 1.288zm.126-3.411c-3.917-2.326-10.372-2.541-14.131-1.399-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.307-1.307 11.436-1.05 15.961 1.637.54.321.716 1.018.395 1.558-.321.54-1.017.717-1.558.396z"/></svg>
                      </a>
                    )}
                    {creator.website && (
                      <a href={creator.website} target="_blank" rel="noopener noreferrer" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500 transition-all shrink-0">
                        <Globe className="h-4 md:h-5 w-4 md:w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 md:top-40 space-y-6">
              
              {isOwner && (
                <div className="bg-[#130b21] border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 md:p-8">
                    <Sparkles className="h-5 md:h-6 w-5 md:w-6 text-orange-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-orange-400 flex items-center gap-1.5">
                      <Zap className="h-3 md:h-3.5 w-3 md:w-3.5 fill-orange-500" /> Control Desk
                    </span>
                    <h3 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tight">Stream Controller</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed pt-2">
                    Feature your performance at the top of the <span className="text-orange-400 font-bold">Live Hub</span> for maximum visibility.
                  </p>
                  
                  <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between mb-4 mt-4">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">Hub Status</span>
                    {isBoosted ? (
                      <span className="text-[10px] md:text-xs font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-green-500/20 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" /> Boosted
                      </span>
                    ) : (
                      <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/10">
                        Standard
                      </span>
                    )}
                  </div>

                  {!isBoosted && (
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      <Button
                        onClick={() => onBoost('XPR')}
                        disabled={isProcessing}
                        className="h-14 md:h-16 bg-white/5 border border-white/10 text-white/60 hover:text-white font-black text-[10px] md:text-sm uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-95"
                      >
                        {isProcessing ? "Wait..." : `BOOST (${Number(boostPrice).toLocaleString()} XPR)`}
                      </Button>
                      <Button
                        onClick={() => onBoost('TAB')}
                        disabled={isProcessing}
                        className="h-14 md:h-16 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-[10px] md:text-sm uppercase tracking-widest rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all active:scale-95 border-b-4 border-black/20 relative overflow-hidden group/btn"
                      >
                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[7px] font-black px-2 py-0.5 rounded-bl-lg tracking-tighter group-hover/btn:scale-110 transition-transform">BEST VALUE</div>
                        {isProcessing ? "Wait..." : `BOOST (${Number(boostTabPrice).toLocaleString()} TAB)`}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#130b21] border border-white/10 rounded-[32px] md:rounded-[48px] p-6 xs:p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="flex flex-col xs:flex-row items-center justify-between gap-6 mb-8 md:mb-10">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-center xs:text-left">Support <br className="hidden xs:block" /> {creator.name.split(' ')[0]}</h2>
                  <div className="flex flex-wrap items-center justify-center xs:justify-end gap-1.5 md:gap-2 max-w-full">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('heart')}
                      className="h-8 md:h-9 px-2 md:px-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/40 group transition-all flex items-center gap-1.5 md:gap-2"
                    >
                      <Heart className="h-3 w-3 md:h-3.5 md:w-3.5 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                      <span className="font-black text-[9px] md:text-[10px] text-slate-100">{likeCount}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('firework')}
                      className="h-8 md:h-9 px-2 md:px-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/15 hover:border-orange-500/40 group transition-all flex items-center gap-1.5 md:gap-2"
                    >
                      <span className="text-xs md:text-sm group-hover:scale-110 group-hover:rotate-12 transition-transform">🎇</span>
                      <span className="font-black text-[9px] md:text-[10px] text-slate-100">{fireworkCount}</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      onClick={() => handleReaction('applause')}
                      className="h-8 md:h-9 px-2 md:px-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/15 hover:border-yellow-500/40 group transition-all flex items-center gap-1.5 md:gap-2"
                    >
                      <span className="text-xs md:text-sm group-hover:scale-110 transition-transform">👏</span>
                      <span className="font-black text-[9px] md:text-[10px] text-slate-100">{applauseCount}</span>
                    </Button>

                    <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 md:h-9 w-8 md:w-9 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                       <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-white/40" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="flex gap-3">
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {quickAmounts.map(amount => (
                        <Button
                          key={amount}
                          variant="ghost"
                          onClick={() => setTipAmount(formatValue(amount))}
                          className={cn(
                            "h-11 md:h-14 rounded-xl md:rounded-2xl border-2 font-black text-sm md:text-lg transition-all",
                            parseFloat(tipAmount) === parseFloat(amount) ? "border-orange-500 bg-orange-500/10 text-orange-500" : "bg-white/5 border-transparent text-white/60"
                          )}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <Select value={asset} onValueChange={(val: string) => setAsset(val)}>
                      <SelectTrigger className="w-[80px] md:w-[100px] h-11 md:h-14 bg-white/5 border-2 border-white/10 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs text-white shrink-0">
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
                      className="bg-white/5 border-white/10 h-16 md:h-20 rounded-2xl md:rounded-[32px] text-right text-2xl md:text-3xl font-black pl-8 pr-24 md:pr-32 focus:ring-orange-500/50 border-2"
                    />
                    <div className="absolute inset-y-0 right-5 md:right-8 flex items-center pointer-events-none">
                      <span className={cn("font-black text-base md:text-xl", asset === "TAB" ? "text-orange-500" : "text-purple-400")}>{asset}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/30 font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px] ml-2">Personal Message (Optional)</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/40" />
                      <Input 
                        placeholder="Amazing stream, thank you!" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-white/5 border-white/10 h-14 md:h-16 rounded-xl md:rounded-2xl pl-12 text-base md:text-lg font-medium focus:ring-purple-500/50"
                        maxLength={64}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isConnected ? (
                      <Button onClick={handleSendTip} disabled={isProcessing} className="w-full h-16 md:h-24 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-lg md:text-2xl rounded-2xl md:rounded-[32px] shadow-xl transition-all active:scale-95">
                        {isProcessing ? "Processing..." : "Send Appreciation"}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={handleConnect}
                          className="w-full h-16 md:h-24 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-black text-lg md:text-2xl rounded-2xl md:rounded-[32px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          Tip via WebAuth App <Zap className="h-5 w-5 fill-white" />
                        </Button>
                        <Button 
                          onClick={handleConnect} 
                          variant="outline" 
                          className="w-full h-12 rounded-xl border-white/10 text-white/60 hover:text-white bg-white/5"
                        >
                          <Wallet className="h-4 w-4 mr-2" /> Connect WebAuth on Browser
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-8 rounded-[24px] md:rounded-[40px] bg-white/[0.02] border border-white/5 space-y-3 md:space-y-4">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <Tv className="h-4 md:h-5 w-4 md:w-5 text-orange-500" />
                  <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-white/60">Live Support</p>
                </div>
                <p className="text-[10px] md:text-sm text-white/40 font-medium">
                  Tips sent to this creator are settled instantly on the XPR Network. Zero fees applied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />

      {/* Enhanced Share Options Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="bg-[#1e1438]/95 backdrop-blur-3xl border-white/10 text-white rounded-[40px] p-8 max-w-sm shadow-[0_0_100px_rgba(0,0,0,0.8)] border-t-purple-500/20">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-[24px] bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
               <Share2 className="h-8 w-8 text-purple-400" />
            </div>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Share Profile</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-sm">Let the network know about this creator.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-1 gap-3">
               <Button 
                onClick={copyToClipboard}
                className="h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest gap-3 justify-start px-6 transition-all"
               >
                 {isCopied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-purple-400" />}
                 {isCopied ? "Link Copied" : "Copy Profile Link"}
               </Button>

               <Button 
                asChild
                className="h-16 rounded-2xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 text-white font-black text-sm uppercase tracking-widest gap-3 justify-start px-6 transition-all"
               >
                 <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out @${cleanHandle} on @tabtokenxpr!`)}&url=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                 >
                   <Twitter className="h-5 w-5 text-[#1DA1F2] fill-[#1DA1F2]" />
                   Share on X (Twitter)
                 </a>
               </Button>

               <Button 
                asChild
                className="h-16 rounded-2xl bg-purple-600/10 border border-purple-600/30 hover:bg-purple-600/20 text-white font-black text-sm uppercase tracking-widest gap-3 justify-start px-6 transition-all"
               >
                 <a 
                  href={`https://snipverse.com/submit?url=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                 >
                   <MessageSquare className="h-5 w-5 text-purple-400 fill-purple-400" />
                   Share on Snipverse
                 </a>
               </Button>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Live production link</p>
               <p className="text-[11px] font-bold text-purple-400 truncate select-all">{shareUrl}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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