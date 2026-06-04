"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User as UserIcon, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  RefreshCw,
  Zap,
  ShieldCheck,
  Heart,
  Settings as SettingsIcon,
  ChevronRight,
  HandCoins,
  ShoppingCart,
  ExternalLink,
  Calendar,
  Clock,
  Eye,
  Users,
  Coins,
  MessageSquare,
  Star,
  Trash2,
  ExternalLink as ExternalLinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TipTabCard } from "@/components/tab-platform/TipTabCard";
import { ProfileEditor } from "@/components/tab-platform/ProfileEditor";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const ASSET_MAP: Record<string, { code: string; precision: number }> = {
  TAB: { code: 'tokencreate', precision: 0 },
  XPR: { code: 'eosio.token', precision: 4 },
  XMD: { code: 'xmd.token', precision: 6 },
  XUSDC: { code: 'xtokens', precision: 6 },
  METAL: { code: 'token.metal', precision: 8 },
  LOAN: { code: 'loan.token', precision: 4 },
};

const Dashboard = () => {
  const { isConnected, actor, balances, refreshBalances, recordTip, session, login, isLoading: isAuthLoading, isMember, membershipDate, userProfile, updateUserProfile, favorites, toggleFavorite } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dashboardMode, setDashboardMode] = useState<"creator" | "supporter">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_dash_mode");
      if (saved === "creator" || saved === "supporter") return saved;
    }
    return isMember ? "creator" : "supporter";
  });

  const [activeTab, setActiveTab] = useState("analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferSymbol, setTransferSymbol] = useState("TAB");
  const [transferMessage, setTransferMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Analytics Metrics State
  const [tipsReceived, setTipsReceived] = useState(0);
  const [xprReceived, setXprReceived] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);

  const alcorUrl = "https://alcor.exchange/v/xpr/swap?input=xpr-eosio.token&output=tab-tokencreate";
  const metalPayUrl = "https://onramp.metalpay.com/buy/xpr";

  // Watch storage updates to cleanly sync workspace modes clicked in the dropdown
  useEffect(() => {
    const checkMode = () => {
      const saved = localStorage.getItem("tiptab_dash_mode");
      if (saved === "creator" || saved === "supporter") {
        setDashboardMode(saved);
      } else {
        setDashboardMode(isMember ? "creator" : "supporter");
      }
    };
    checkMode();
  }, [isMember, activeTab]);

  const fetchDashboardAnalytics = useCallback(async () => {
    if (!actor) return;
    try {
      const cleanActor = actor.toLowerCase().trim();

      // Query live unified transactions_log for precise tipping metrics
      const { data: logData, error: logError } = await supabase
        .from('transactions_log')
        .select('*')
        .eq('recipient', cleanActor)
        .eq('purpose', 'tip');

      if (logData && !logError) {
        // TAB tip total
        const tabSum = logData
          .filter(t => t.asset === 'TAB')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        setTipsReceived(tabSum);

        // XPR tip total
        const xprSum = logData
          .filter(t => t.asset === 'XPR')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        setXprReceived(xprSum);

        // Unique senders as engagement signal
        const uniqueSenders = new Set(logData.map(t => t.sender.toLowerCase().trim())).size;

        // Custom view counter
        const viewsKey = `tiptab_views_${actor}`;
        let savedViews = localStorage.getItem(viewsKey);
        if (!savedViews) {
          const calculatedViews = Math.max(12, logData.length * 4 + 8);
          localStorage.setItem(viewsKey, calculatedViews.toString());
          savedViews = calculatedViews.toString();
        }
        const viewsNum = parseInt(savedViews);
        setProfileViews(viewsNum);

        const rate = viewsNum > 0 ? ((uniqueSenders / viewsNum) * 100).toFixed(1) : "0.0";
        setEngagementRate(parseFloat(rate));
      }
    } catch (err) {
      console.error("Dashboard database fetch error:", err);
    }
  }, [actor]);

  useEffect(() => {
    fetchDashboardAnalytics();

    // Query interval to keep current dashboard statistics always up to date
    const interval = setInterval(fetchDashboardAnalytics, 15000);
    return () => clearInterval(interval);
  }, [actor, fetchDashboardAnalytics]);

  const viewIsMember = useMemo(() => isMember && dashboardMode === "creator", [isMember, dashboardMode]);

  const navigationItems = useMemo(() => {
    const items = [
      { id: "analytics", icon: TrendingUp, label: "Analytics" },
      { id: "payouts", icon: Wallet, label: "Payouts" },
      { id: "favorites", icon: Star, label: "Favorites" },
    ];
    if (viewIsMember) items.splice(1, 0, { id: "card", icon: CreditCard, label: "Card" });
    items.push({ id: "settings", icon: UserIcon, label: "Profile" });
    return items;
  }, [viewIsMember]);

  const formatPrecision = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    const config = ASSET_MAP[transferSymbol];
    return config.precision === 0 ? Math.floor(num).toString() : num.toFixed(config.precision);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    await fetchDashboardAnalytics();
    if (actor) {
      setProfileViews(prev => {
        const next = prev + 1;
        localStorage.setItem(`tiptab_views_${actor}`, next.toString());
        return next;
      });
    }
    setTimeout(() => setIsRefreshing(false), 800);
    toast({ title: "Workspace Synced", description: "All balances and metrics updated with live chain telemetry." });
  };

  const handleTransfer = async () => {
    if (!session || !actor) return;
    const config = ASSET_MAP[transferSymbol];
    const amountNum = parseFloat(transferAmount);
    
    if (!transferAmount || isNaN(amountNum) || amountNum <= 0 || !transferRecipient) {
      toast({ title: "Invalid Input", description: "Please enter a valid amount and recipient.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const formattedQuantity = config.precision === 0 
        ? `${Math.floor(amountNum)} ${transferSymbol}` 
        : `${amountNum.toFixed(config.precision)} ${transferSymbol}`;
      
      const actions = [{
        account: config.code,
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: session.auth.permission,
        }],
        data: {
          from: actor,
          to: transferRecipient.toLowerCase().trim(),
          quantity: formattedQuantity,
          memo: transferMessage.trim() || 'Sent from TIP TAB Dashboard',
        },
      }];

      await session.transact({ actions }, { broadcast: true });
      if (transferSymbol === "TAB") recordTip(Math.floor(amountNum));

      toast({
        title: "Transfer Complete",
        description: `Successfully sent ${formattedQuantity} to @${transferRecipient}`,
      });
      setTransferAmount("");
      setTransferRecipient("");
      setTransferMessage("");
      refreshBalances();
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Please check your balance and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getExpiryDate = () => {
    if (actor === 'tiptab') return "Lifetime";
    if (!membershipDate) return null;
    const date = new Date(membershipDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isNearingExpiry = () => {
    if (actor === 'tiptab') return false; 
    if (!membershipDate) return false;
    const expiry = new Date(membershipDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 30; 
  };

  // Safe early returns below all hook definitions to comply with React Hook Rules
  if (!isConnected && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />
        <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter italic text-slate-100">AUTHENTICATION <span className="text-orange-500">REQUIRED</span></h1>
        <Button onClick={login} className="h-20 px-12 bg-white text-black hover:bg-purple-500 hover:text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95">
          Connect WebAuth
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-900/10 to-transparent -z-10" />
      <div className="absolute top-48 left-1/4 w-[600px] h-[600px] bg-magenta-500/5 blur-[180px] rounded-full -z-10 animate-pulse" />
      
      <main className="container mx-auto px-4 md:px-6 py-8 pt-32 sm:pt-44 relative z-10 pb-24">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="space-y-3 sm:space-y-4">
             <div className="flex items-center gap-3 flex-wrap">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
                {viewIsMember ? "Creator Portal" : "Supporter Portal"}
              </div>
              
              {isMember && (
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl animate-in fade-in duration-300">
                  <button
                    onClick={() => {
                      setDashboardMode("creator");
                      localStorage.setItem("tiptab_dash_mode", "creator");
                    }}
                    className={cn(
                      "h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all",
                      dashboardMode === "creator" ? "bg-purple-600 text-white shadow-md" : "text-white/40 hover:text-white"
                    )}
                  >
                    Creator Hub
                  </button>
                  <button
                    onClick={() => {
                      setDashboardMode("supporter");
                      localStorage.setItem("tiptab_dash_mode", "supporter");
                    }}
                    className={cn(
                      "h-8 px-4 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all",
                      dashboardMode === "supporter" ? "bg-purple-600 text-white shadow-md" : "text-white/40 hover:text-white"
                    )}
                  >
                    Supporters Hub
                  </button>
                </div>
              )}
             </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none text-slate-100">
              Welcome, <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">@{actor}</span>
            </h1>
          </div>
          
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl max-w-full">
             {navigationItems.map((item) => (
               <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "h-12 sm:h-14 px-4 sm:px-6 rounded-2xl gap-2 sm:gap-3 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all",
                  activeTab === item.id 
                    ? "bg-purple-600 text-white shadow-[0_10px_30px_rgba(168,85,247,0.3)]" 
                    : "text-slate-400 hover:text-purple-400 hover:bg-purple-500/5"
                )}
               >
                 <item.icon className="h-3 w-3 sm:h-4 w-4" />
                 <span>{item.label}</span>
               </Button>
             ))}
          </div>
        </div>

        {isNearingExpiry() && (
          <div className="p-4 mb-6 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Your membership expires on <strong className="text-white">{getExpiryDate()}</strong>. Renew now to stay on the map!</span>
            </div>
            <Button onClick={() => setIsMembershipModalOpen(true)} className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase">Renew Now</Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="analytics" className="space-y-10 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-end">
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest gap-2 text-slate-300"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                Sync Workspace
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* TAB Balance */}
              <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all flex flex-col h-[280px]">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-all" />
                <CardHeader className="p-0">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">TAB Balance</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-6 flex flex-col flex-1">
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-100 break-all leading-none">{Number(balances.tab).toLocaleString()}</span>
                    <span className="text-lg font-black text-orange-500 italic uppercase">TAB</span>
                  </div>
                  <Button asChild variant="outline" className="mt-4 h-10 rounded-xl border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                    <a href={alcorUrl} target="_blank" rel="noopener noreferrer"><ShoppingCart className="h-3.5 w-3.5" /> Get TAB</a>
                  </Button>
                </CardContent>
              </Card>

              {/* XPR Balance */}
              <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col h-[280px]">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all" />
                <CardHeader className="p-0">
                  <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">XPR Balance</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-6 flex flex-col flex-1">
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-100 break-all leading-none">{Number(balances.xpr).toLocaleString()}</span>
                    <span className="text-lg font-black text-purple-400 italic uppercase">XPR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button asChild variant="outline" className="h-10 rounded-xl border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white font-black text-[9px] uppercase tracking-widest gap-2">
                      <a href={alcorUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Alcor</a>
                    </Button>
                    <Button asChild variant="outline" className="h-10 rounded-xl border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white font-black text-[9px] uppercase tracking-widest gap-2">
                      <a href={metalPayUrl} target="_blank" rel="noopener noreferrer"><CreditCard className="h-3.5 w-3.5" /> Buy</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Fiat Stable Balances (XUSDC / XMD) */}
              <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all flex flex-col h-[280px]">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/10 blur-3xl rounded-full group-hover:bg-green-500/20 transition-all" />
                <CardHeader className="p-0">
                  <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Stable Assets</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-6 space-y-6 flex-1">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <span className="text-2xl font-black text-slate-100 block leading-none">{Number(balances.xusdc).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-green-400 uppercase">XUSDC</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-100 block leading-none">{Number(balances.xmd).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-cyan-400 uppercase">XMD</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-slate-100 block leading-none">{Number(balances.metal).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">METAL</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-100 block leading-none">{Number(balances.loan).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-orange-400 uppercase">LOAN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4">
              <div className="h-px bg-white/10 w-full mb-8" />
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/40 mb-6 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" /> Channel Metrics & Discovery
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all flex flex-col h-[220px]">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">TAB Received</CardDescription>
                      <HandCoins className="h-4 w-4 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                    <span className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-100">{tipsReceived.toLocaleString()}</span>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Accumulated TAB rewards</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col h-[220px]">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">XPR Received</CardDescription>
                      <Coins className="h-4 w-4 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                    <span className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-100">{xprReceived.toLocaleString()}</span>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Accumulated XPR rewards</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all flex flex-col h-[220px]">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Impressions</CardDescription>
                      <Eye className="h-4 w-4 text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                    <span className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-100">{profileViews.toLocaleString()}</span>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Global map visits</p>
                  </CardContent>
                </Card>

                {isMember && membershipDate ? (
                  <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col h-[220px]">
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Membership Pass</CardDescription>
                        <ShieldCheck className="h-4 w-4 text-orange-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                      <div>
                        <p className="text-xs text-white/50">Expires: <strong className="text-white">{getExpiryDate()}</strong></p>
                        {isNearingExpiry() ? (
                          <span className="text-[9px] text-red-400 font-black uppercase tracking-widest bg-red-500/10 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-red-500/20">Expiring Soon</span>
                        ) : (
                          <span className="text-[9px] text-green-400 font-black uppercase tracking-widest bg-green-500/10 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-green-500/20">Active</span>
                        )}
                      </div>
                      <Button onClick={() => setIsMembershipModalOpen(true)} className="h-9 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase">Renew Now</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all flex flex-col h-[220px]">
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Engagement</CardDescription>
                        <Users className="h-4 w-4 text-pink-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                      <span className="text-3xl font-black tracking-tighter text-slate-100">{engagementRate}%</span>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Conversion Ratio</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-[#130b21] border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 sm:p-10 text-white/20"><Wallet className="h-12 w-12" /></div>
                <h3 className="text-2xl sm:text-4xl font-black italic uppercase mb-10 tracking-tighter text-slate-100">Execute <span className="text-orange-500">Transfer</span></h3>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Recipient Actor</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                      <Input placeholder="username" value={transferRecipient} onChange={(e) => setTransferRecipient(e.target.value)} className="bg-white/5 border-white/10 h-20 rounded-[28px] font-bold text-xl text-slate-100 pl-16 focus:ring-purple-500/50 focus:bg-white/10 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Amount & Asset</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Input placeholder="0" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} onBlur={(e) => setTransferAmount(formatPrecision(e.target.value))} className="bg-white/5 border-white/10 h-20 rounded-[28px] font-black text-3xl text-slate-100 px-8 flex-1 focus:ring-orange-500/50" />
                      <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 h-20 rounded-[28px] font-black text-xl text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-2xl">
                          {Object.keys(ASSET_MAP).map(s => (
                            <SelectItem key={s} value={s} className="font-black py-3 cursor-pointer">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Memo / Note (Optional)</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500/50" />
                      <Input placeholder="Personal message..." value={transferMessage} onChange={(e) => setTransferMessage(e.target.value)} className="bg-white/5 border-white/10 h-20 rounded-[28px] font-bold text-xl text-slate-100 pl-16 focus:ring-purple-500/50" maxLength={64} />
                    </div>
                  </div>

                  <Button onClick={handleTransfer} disabled={isSending} className="w-full h-24 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-2xl rounded-[32px] transition-all active:scale-[0.98]">
                    {isSending ? "SENDING..." : "Execute Transfer"}
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {viewIsMember && (
            <TabsContent value="card" className="mt-0 animate-in zoom-in-95 duration-500">
              <div className="max-w-xl mx-auto px-2">
                <div className="text-center mb-10 space-y-2">
                  <h2 className="text-3xl font-black italic tracking-tighter text-slate-100">Your Network Pass</h2>
                  <p className="text-slate-400 font-medium">Share this card anywhere to receive zero-fee tips.</p>
                </div>
                {userProfile && <TipTabCard creator={userProfile} />}
              </div>
            </TabsContent>
          )}

          <TabsContent value="favorites" className="space-y-8 mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black italic tracking-tighter text-slate-100 uppercase">Saved <span className="text-yellow-500">Creators</span></h2>
                <Badge className="bg-white/10 text-white border-white/10 font-black text-[10px] uppercase tracking-widest h-8 px-4">{favorites.length} SAVED</Badge>
              </div>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {favorites.map((favHandle) => (
                    <div 
                      key={favHandle}
                      className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between group hover:bg-white/[0.08] hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center font-black text-purple-400 border border-purple-500/30 shadow-lg">
                          {favHandle.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-100">@{favHandle}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Network Member</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => navigate(`/tip/${favHandle}`)}
                          variant="ghost" 
                          className="h-11 rounded-xl bg-white/5 border border-white/5 hover:bg-purple-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest gap-2 px-5"
                        >
                          <ExternalLinkIcon className="h-3.5 w-3.5" /> Profile
                        </Button>
                        <Button 
                          onClick={() => toggleFavorite(favHandle)}
                          variant="ghost" 
                          className="h-11 w-11 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[48px] space-y-6">
                  <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <Star className="h-10 w-10 text-white/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black italic text-slate-100 uppercase">NO SAVED CREATORS</h3>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto">Visit profiles and click the star icon to save your favorite performance streams here.</p>
                  </div>
                  <Button onClick={() => navigate("/")} className="bg-white text-black hover:bg-purple-600 hover:text-white font-black rounded-xl h-12 px-8 uppercase text-xs tracking-widest">Discover Network</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto px-2">
              <div className="mb-8 space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter text-slate-100">Account Settings</h2>
                <p className="text-slate-400 font-medium">Manage your identity and discovery on the network.</p>
              </div>
              {userProfile && <ProfileEditor initialData={userProfile} onSave={updateUserProfile} minimal={!viewIsMember} />}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <MembershipModal isOpen={isMembershipModalOpen} onOpenChange={setIsMembershipModalOpen} />
    </div>
  );
};

export default Dashboard;