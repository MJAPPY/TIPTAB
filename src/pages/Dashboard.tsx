"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TipTabCard } from "@/components/tab-platform/TipTabCard";
import { ProfileEditor } from "@/components/tab-platform/ProfileEditor";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isConnected, actor, balances, refreshBalances, recordTip, session, login, isLoading: isAuthLoading, isMember, membershipDate, userProfile, updateUserProfile } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferSymbol, setTransferSymbol] = useState("TAB");
  const [isSending, setIsSending] = useState(false);

  // Analytics Metrics State
  const [tipsReceived, setTipsReceived] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);

  const alcorUrl = "https://alcor.exchange/v/xpr/swap?input=xpr-eosio.token&output=tab-tokencreate";
  const metalPayUrl = "https://onramp.metalpay.com/buy/xpr";

  // Setup/load unique simulated analytics for the actor
  useEffect(() => {
    if (!actor) return;
    
    // Seed consistent starting metrics based on user actor handle
    const viewsKey = `tiptab_views_${actor}`;
    const receivedKey = `tiptab_tips_received_${actor}`;
    const engagementKey = `tiptab_engagement_${actor}`;

    let savedViews = localStorage.getItem(viewsKey);
    let savedReceived = localStorage.getItem(receivedKey);
    let savedEngagement = localStorage.getItem(engagementKey);

    if (!savedViews) {
      const initialViews = Math.floor(Math.random() * 800) + 450;
      localStorage.setItem(viewsKey, initialViews.toString());
      savedViews = initialViews.toString();
    }
    if (!savedReceived) {
      const initialReceived = Math.floor(Math.random() * 5000) + 1250;
      localStorage.setItem(receivedKey, initialReceived.toString());
      savedReceived = initialReceived.toString();
    }
    if (!savedEngagement) {
      const initialEngagement = (Math.random() * 15 + 8).toFixed(1);
      localStorage.setItem(engagementKey, initialEngagement);
      savedEngagement = initialEngagement;
    }

    setProfileViews(parseInt(savedViews));
    setTipsReceived(parseInt(savedReceived));
    setEngagementRate(parseFloat(savedEngagement));
  }, [actor]);

  const formatPrecision = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    return transferSymbol === "TAB" ? Math.floor(num).toString() : num.toFixed(4);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    
    // Simulate realistic small view update on refresh
    if (actor) {
      setProfileViews(prev => {
        const next = prev + Math.floor(Math.random() * 3) + 1;
        localStorage.setItem(`tiptab_views_${actor}`, next.toString());
        return next;
      });
    }

    setTimeout(() => setIsRefreshing(false), 800);
    toast({ title: "Balances Updated", description: "Synced with XPR Network." });
  };

  const handleTransfer = async () => {
    if (!session || !actor) return;
    const amountNum = transferSymbol === "TAB" ? Math.floor(parseFloat(transferAmount)) : parseFloat(transferAmount);
    if (!transferAmount || isNaN(amountNum) || amountNum <= 0 || !transferRecipient) {
      toast({ title: "Invalid Input", description: "Please enter a valid amount and recipient.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const contract = transferSymbol === "TAB" ? "tokencreate" : "eosio.token";
      const formattedQuantity = transferSymbol === "TAB" ? `${amountNum} TAB` : `${amountNum.toFixed(4)} ${transferSymbol}`;
      
      const actions = [{
        account: contract,
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: session.auth.permission,
        }],
        data: {
          from: actor,
          to: transferRecipient.toLowerCase().trim(),
          quantity: formattedQuantity,
          memo: 'Sent from TIP TAB Dashboard',
        },
      }];

      await session.transact({ actions }, { broadcast: true });
      
      // Update local tracking if it's TAB
      if (transferSymbol === "TAB") {
        recordTip(amountNum);
      }

      toast({
        title: "Transfer Complete",
        description: `Successfully sent ${formattedQuantity} to @${transferRecipient}`,
      });
      
      setTransferAmount("");
      setTransferRecipient("");
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
    if (actor === 'tiptab') return false; // Lifetime never expires
    if (!membershipDate) return false;
    const expiry = new Date(membershipDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    const now = new Date();
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 30; // Within 30 days
  };

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

  const navigationItems = useMemo(() => {
    const items = [
      { id: "analytics", icon: TrendingUp, label: "Analytics" },
      { id: "payouts", icon: Wallet, label: "Payouts" },
    ];
    
    if (isMember) {
      items.splice(1, 0, { id: "card", icon: CreditCard, label: "Card" });
    }
    
    items.push({ id: "settings", icon: UserIcon, label: "Profile" });
    
    return items;
  }, [isMember]);

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header />
      
      {/* Cinematic Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-900/10 to-transparent -z-10" />
      <div className="absolute top-48 left-1/4 w-[600px] h-[600px] bg-magenta-500/5 blur-[180px] rounded-full -z-10 animate-pulse" />
      
      <main className="container mx-auto px-4 md:px-6 py-8 pt-32 sm:pt-44 relative z-10 pb-24">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="space-y-3 sm:space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
              {isMember ? "Creator Portal" : "Supporter Portal"}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none text-slate-100">
              Welcome, <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">@{actor}</span>
            </h1>
          </div>
          
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          <div className="lg:col-span-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="analytics" className="space-y-6 sm:space-y-10 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Financial Balance Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Liquid TAB Card */}
                  <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all flex flex-col h-[280px] sm:h-[310px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-all" />
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Liquid TAB</CardDescription>
                        <Button variant="ghost" size="icon" onClick={handleManualRefresh} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/5 text-white/30 hover:text-purple-400 transition-all">
                          <RefreshCw className={cn("h-2.5 w-2.5 sm:h-4 sm:w-4", isRefreshing && "animate-spin")} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 sm:mt-6 flex flex-col flex-1">
                      <div className="flex flex-col items-start gap-1 flex-1">
                        <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-slate-100 break-all leading-none">
                          {Number(balances.tab).toLocaleString()}
                        </span>
                        <span className="text-sm sm:text-xl font-black text-orange-500 italic uppercase">TAB</span>
                      </div>
                      <div className="mt-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-green-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest shrink-0">
                          <ShieldCheck className="h-3 w-3" />
                          Network Live
                        </div>
                        <Button 
                          asChild
                          variant="outline"
                          className="w-full sm:w-auto h-9 sm:h-10 px-4 rounded-xl border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white font-black text-[10px] uppercase tracking-widest gap-2"
                        >
                          <a href={alcorUrl} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Get TAB
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liquid XPR Card */}
                  <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col h-[280px] sm:h-[310px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all" />
                    <CardHeader className="p-0">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Liquid XPR</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 sm:mt-6 flex flex-col flex-1">
                      <div className="flex flex-col items-start gap-1 flex-1">
                        <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-100 break-all leading-none">
                          {Number(balances.xpr).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </span>
                        <span className="text-sm sm:text-xl font-black text-purple-400 italic uppercase">XPR</span>
                      </div>
                      <div className="mt-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                        <Button 
                          asChild
                          variant="outline"
                          className="w-full sm:flex-1 h-9 sm:h-10 px-4 rounded-xl border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-2"
                        >
                          <a href={alcorUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Alcor DEX
                          </a>
                        </Button>
                        <Button 
                          asChild
                          variant="outline"
                          className="w-full sm:flex-1 h-9 sm:h-10 px-4 rounded-xl border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-2"
                        >
                          <a href={metalPayUrl} target="_blank" rel="noopener noreferrer">
                            <CreditCard className="h-3.5 w-3.5" />
                            Card Buy
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Membership Card */}
                  <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col h-[280px] sm:h-[310px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all" />
                    <CardHeader className="p-0">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Network Membership</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 sm:mt-6 flex flex-col flex-1">
                      <div className="flex flex-col items-start gap-1 flex-1">
                        {isMember ? (
                          <>
                            <span className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">Active Plan</span>
                            <div className="flex items-center gap-2 text-blue-400 mt-2">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs sm:text-sm font-bold">Expires: {getExpiryDate()}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-xl sm:text-2xl font-black text-slate-400 uppercase tracking-tight">No Active Plan</span>
                            <p className="text-xs text-slate-500 mt-2 font-medium">Join the network to appear on the map and receive tips.</p>
                          </>
                        )}
                      </div>
                      <div className="mt-auto pt-4">
                        {isMember ? (
                          actor !== 'tiptab' && (
                            <Button 
                              onClick={() => setIsMembershipModalOpen(true)}
                              className={cn(
                                "w-full h-10 sm:h-12 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all",
                                isNearingExpiry() 
                                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg" 
                                  : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white"
                              )}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Renew Membership
                            </Button>
                          )
                        ) : (
                          <Button 
                            onClick={() => setIsMembershipModalOpen(true)}
                            className="w-full h-10 sm:h-12 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Become a Creator
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Simulated Public Engagement Metrics Rows */}
                <div className="pt-4">
                  <div className="h-px bg-white/10 w-full mb-8" />
                  <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/40 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" /> Channel Metrics & Discovery
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Tipped Received Analytics Card */}
                    <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all flex flex-col h-[220px]">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/5 blur-3xl rounded-full group-hover:bg-green-500/10 transition-all" />
                      <CardHeader className="p-0">
                        <div className="flex items-center justify-between">
                          <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Total Tips Received</CardDescription>
                          <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <HandCoins className="h-4 w-4 text-green-400" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                        <div className="flex flex-col items-start">
                          <span className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-100">
                            {tipsReceived.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-green-400 uppercase tracking-wider mt-1">TAB Earned</span>
                        </div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Accumulated tip rewards</p>
                      </CardContent>
                    </Card>

                    {/* Profile Discovery Views Card */}
                    <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all flex flex-col h-[220px]">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-all" />
                      <CardHeader className="p-0">
                        <div className="flex items-center justify-between">
                          <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Profile Impressions</CardDescription>
                          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Eye className="h-4 w-4 text-cyan-400" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                        <div className="flex flex-col items-start">
                          <span className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-100">
                            {profileViews.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-cyan-400 uppercase tracking-wider mt-1">Unique views</span>
                        </div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Global map and bio visits</p>
                      </CardContent>
                    </Card>

                    {/* Engagement / Conversion Rate Card */}
                    <Card className="bg-[#130b21]/40 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all flex flex-col h-[220px]">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full group-hover:bg-pink-500/10 transition-all" />
                      <CardHeader className="p-0">
                        <div className="flex items-center justify-between">
                          <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Community Engagement</CardDescription>
                          <div className="h-8 w-8 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                            <Users className="h-4 w-4 text-pink-400" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 mt-4 flex flex-col flex-1 justify-between">
                        <div className="flex flex-col items-start">
                          <span className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-100">
                            {engagementRate}%
                          </span>
                          <span className="text-xs font-black text-pink-400 uppercase tracking-wider mt-1">Conversion Ratio</span>
                        </div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2">Viewers converted to supporters</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="max-w-3xl mx-auto">
                  <Card className="bg-[#130b21] border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 sm:p-10">
                      <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-white/30" />
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-black italic uppercase mb-6 sm:mb-10 tracking-tighter text-slate-100">Execute <span className="text-orange-500">Transfer</span></h3>
                    
                    <div className="space-y-6 sm:space-y-10">
                      <div className="space-y-3 sm:space-y-4">
                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Recipient Actor</Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                          <Input 
                            placeholder="username" 
                            value={transferRecipient} 
                            onChange={(e) => setTransferRecipient(e.target.value)} 
                            className="bg-white/5 border-white/10 h-14 sm:h-20 rounded-2xl sm:rounded-[28px] font-bold text-base sm:text-xl text-slate-100 pl-12 sm:pl-16 focus:ring-purple-500/50 focus:bg-white/10 transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Amount & Asset</Label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="relative flex-1">
                            <Input 
                              placeholder="0" 
                              value={transferAmount} 
                              onChange={(e) => setTransferAmount(e.target.value)} 
                              onBlur={(e) => setTransferAmount(formatPrecision(e.target.value))} 
                              className="bg-white/5 border-white/10 h-14 sm:h-20 rounded-2xl sm:rounded-[28px] font-black text-xl sm:text-3xl text-slate-100 px-6 sm:px-8 focus:ring-orange-500/50 focus:bg-white/10 transition-all" 
                            />
                          </div>
                          <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                            <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] bg-white/5 border-white/10 h-14 sm:h-20 rounded-2xl sm:rounded-[28px] font-black text-lg sm:text-xl text-slate-100 transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-2xl">
                              <SelectItem value="TAB" className="font-black py-3 cursor-pointer">TAB</SelectItem>
                              <SelectItem value="XPR" className="font-black py-3 cursor-pointer">XPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button 
                          onClick={handleTransfer} 
                          disabled={isSending} 
                          className="w-full h-16 sm:h-24 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-lg sm:text-2xl rounded-2xl sm:rounded-[32px] shadow-2xl shadow-white/5 transition-all active:scale-[0.98]"
                        >
                          {isSending ? (
                            <div className="flex items-center gap-3">
                              <div className="h-5 w-5 sm:h-8 sm:w-8 border-2 sm:border-4 border-black/20 border-t-black rounded-full animate-spin" />
                              <span>SENDING...</span>
                            </div>
                          ) : (
                            "Execute Transfer"
                          )}
                        </Button>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 pt-2">
                          <Button 
                            asChild
                            variant="ghost"
                            className="h-10 rounded-xl text-white/40 hover:text-orange-500 font-bold text-xs uppercase tracking-widest gap-2"
                          >
                            <a href={alcorUrl} target="_blank" rel="noopener noreferrer">
                              <ShoppingCart className="h-4 w-4" />
                              Buy on Alcor
                            </a>
                          </Button>
                          <div className="hidden sm:block h-4 w-px bg-white/10" />
                          <Button 
                            asChild
                            variant="ghost"
                            className="h-10 rounded-xl text-white/40 hover:text-cyan-400 font-bold text-xs uppercase tracking-widest gap-2"
                          >
                            <a href={metalPayUrl} target="_blank" rel="noopener noreferrer">
                              <CreditCard className="h-4 w-4" />
                              Buy with Card
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {isMember && (
                <TabsContent value="card" className="mt-0 animate-in zoom-in-95 duration-500">
                  <div className="max-w-xl mx-auto px-2">
                    <div className="text-center mb-8 sm:mb-10 space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-100">Your Network Pass</h2>
                      <p className="text-slate-400 font-medium text-xs sm:text-base">Share this card anywhere to receive zero-fee tips.</p>
                    </div>
                    {userProfile && <TipTabCard creator={userProfile} />}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto px-2">
                  <div className="mb-8 space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-100">Account Settings</h2>
                    <p className="text-slate-400 font-medium text-sm sm:text-base">Manage your identity and discovery on the network.</p>
                  </div>
                  {userProfile && (
                    <ProfileEditor 
                      initialData={userProfile} 
                      onSave={updateUserProfile} 
                      minimal={!isMember} 
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <MembershipModal 
        isOpen={isMembershipModalOpen} 
        onOpenChange={setIsMembershipModalOpen} 
      />
    </div>
  );
};

export default Dashboard;