"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  Settings, 
  Ban, 
  CheckCircle2, 
  Activity,
  Search,
  MoreVertical,
  Lock,
  Unlock,
  Bell,
  Zap,
  Power,
  History,
  HandCoins,
  Users,
  Trophy,
  Sparkles,
  Gift,
  Plus,
  Trash2,
  UserPlus,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Globe,
  ArrowUpRight,
  Flame,
  BellOff,
  RefreshCw,
  Scale,
  Clock,
  Info,
  RotateCcw,
  Percent as PercentIcon,
  Hash,
  Filter,
  CheckCircle,
  AlertCircle,
  Eraser,
  Dices,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useXpr, AdminUser } from "@/contexts/XprContext";
import { Header } from "@/components/tab-platform/Header";
import { CREATORS, Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DetailedReportModal } from "@/components/tab-platform/DetailedReportModal";

const MOCK_AUDIT_LOGS: Record<string, any[]> = {
  "tiptab": [
    { date: "2024-05-15", time: "14:20", event: "Account Verified", actor: "System", type: "system" },
    { date: "2024-05-18", time: "09:12", event: "Profile Updated", actor: "tiptab", type: "user" },
  ],
  "carlos_delivery": [
    { date: "2024-04-10", time: "11:05", event: "Membership Activation", actor: "System", type: "system" },
    { date: "2024-05-02", time: "16:45", event: "Location Verified", actor: "Admin", type: "admin" },
  ]
};

const INITIAL_LEADERBOARD_WINNERS = [
  { account: "whaleshark", role: "Supporter", rank: 1, reward: "3000" },
  { account: "tiptab", role: "Creator", rank: 2, reward: "1500" },
  { account: "carlos_delivery", role: "Creator", rank: 3, reward: "1000" },
  { account: "early", role: "Supporter", rank: 4, reward: "500" },
  { account: "mayafit", role: "Creator", rank: 5, reward: "250" },
  { account: "fanatic", role: "Supporter", rank: 6, reward: "0" },
  { account: "cking", role: "Supporter", rank: 7, reward: "0" },
  { account: "kofibuilds", role: "Creator", rank: 8, reward: "0" },
  { account: "sarah_serves", role: "Creator", rank: 9, reward: "0" },
  { account: "mwright", role: "Creator", rank: 10, reward: "0" },
];

const AdminHub = () => {
  const { 
    isAdmin, 
    adminRole,
    isPermanentAdmin,
    adminsList,
    addAdmin,
    removeAdmin,
    updateAdminRole,
    makeAdminPermanent,
    isConnected, 
    isLoading,
    isMaintenanceMode, 
    setMaintenanceMode, 
    broadcastAlert, 
    networkAlert, 
    membershipFee, 
    membershipFeeXmd,
    membershipFeeXusdc,
    updateMembershipFee,
    boostPrice,
    updateBoostPrice,
    boostTabPrice,
    updateBoostTabPrice,
    boostPriceXusdc,
    updateBoostPriceXusdc,
    distributeXprRewards,
    promoCodes,
    createPromoCode,
    deletePromoCode,
    actor,
    logout,
    resetLiveTicker
  } = useXpr();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [localFee, setLocalFee] = useState(membershipFee || "2500");
  const [localFeeXmd, setLocalFeeXmd] = useState(membershipFeeXmd || "2.50");
  const [localFeeXusdc, setLocalFeeXusdc] = useState(membershipFeeXusdc || "2.50");
  
  const [localBoost, setLocalBoost] = useState(boostPrice || "1000");
  const [localBoostTab, setLocalBoostTab] = useState(boostTabPrice || "5000");
  const [localBoostXusdc, setLocalBoostXusdc] = useState(boostPriceXusdc || "1.00");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [modCategoryFilter, setModCategoryFilter] = useState("All");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailedReportOpen, setIsDetailedReportOpen] = useState(false);
  const [isResetTreasuryOpen, setIsResetTreasuryOpen] = useState(false);
  const [isResetAnalyticsOpen, setIsResetAnalyticsOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<number>(() => {
    return parseInt(localStorage.getItem("tiptab_last_parity_sync") || "0");
  });

  const [analyticsStats, setAnalyticsStats] = useState({
    activeMembers: 1240,
    supporterBase: 4812,
    tippingVelocity: 84,
    avgTipSize: 145,
    newProfiles24h: 28,
    performanceBoosts24h: 42
  });

  const handleResetAnalytics = () => {
    setAnalyticsStats({
      activeMembers: 0,
      supporterBase: 0,
      tippingVelocity: 0,
      avgTipSize: 0,
      newProfiles24h: 0,
      performanceBoosts24h: 0
    });
    setIsResetAnalyticsOpen(false);
    toast({
      title: "Analytics Reset Successful",
      description: "All platform activity metrics have been zeroed for the current window."
    });
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [creatorToDelete, setCreatorToDelete] = useState<Creator | null>(null);

  const [newAdminHandle, setNewAdminHandle] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<'super' | 'moderator' | 'treasurer'>("moderator");
  
  const [removalStep, setRemovalStep] = useState<"closed" | "warning1" | "warning2">("closed");
  const [confirmInput, setConfirmInput] = useState("");
  const [targetIdForRemoval, setTargetIdForRemoval] = useState<string | null>(null);

  const [winners, setWinners] = useState(INITIAL_LEADERBOARD_WINNERS);

  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<'free' | 'percent'>("percent");
  const [newPromoValue, setNewPromoValue] = useState("50");
  const [newPromoUses, setNewPromoUses] = useState("100");

  const [rawTreasuryData, setRawTreasuryData] = useState([
    { symbol: "XPR", totalActivation: 452500, boostVolume: 12500, color: "text-orange-500", bg: "from-orange-500/10", icon: Zap },
    { symbol: "TAB", totalActivation: 1200000, boostVolume: 50000, color: "text-purple-400", bg: "from-purple-500/10", icon: Sparkles },
    { symbol: "XMD", totalActivation: 2450.50, boostVolume: 0, color: "text-cyan-400", bg: "from-cyan-500/10", icon: Globe },
    { symbol: "XUSDC", totalActivation: 1840.25, boostVolume: 0, color: "text-green-400", bg: "from-green-500/10", icon: HandCoins }
  ]);

  const treasuryData = useMemo(() => {
    return rawTreasuryData.map(item => {
      const rewards = item.boostVolume * 0.5;
      const adminBoostShare = item.boostVolume * 0.5;
      const netRevenue = item.totalActivation + adminBoostShare;

      return {
        ...item,
        revenue: netRevenue,
        rewards,
        splitPolicy: "50/50 Rewards Split"
      };
    });
  }, [rawTreasuryData]);

  const handleResetTreasury = () => {
    setRawTreasuryData(prev => prev.map(item => ({
      ...item,
      totalActivation: 0,
      boostVolume: 0
    })));
    setIsResetTreasuryOpen(false);
    toast({
      title: "Ledger Reset Successful",
      description: "All treasury statistics have been cleared for the current reporting period."
    });
  };

  useEffect(() => {
    if (membershipFee) setLocalFee(membershipFee);
    if (membershipFeeXmd) setLocalFeeXmd(membershipFeeXmd);
    if (membershipFeeXusdc) setLocalFeeXusdc(membershipFeeXusdc);
    if (boostPrice) setLocalBoost(boostPrice);
    if (boostTabPrice) setLocalBoostTab(boostTabPrice);
    if (boostPriceXusdc) setLocalBoostXusdc(boostPriceXusdc);
  }, [membershipFee, membershipFeeXmd, membershipFeeXusdc, boostPrice, boostTabPrice, boostPriceXusdc]);

  // Enhanced Security Effect
  useEffect(() => {
    if (!isLoading) {
      if (!isConnected || !isAdmin) {
        toast({
          title: "Access Restricted",
          description: "This area is for authorized network administrators only.",
          variant: "destructive"
        });
        navigate("/");
      }
    }
  }, [isAdmin, isConnected, isLoading, navigate, toast]);

  useEffect(() => {
    if (adminRole === 'moderator' && !['moderation', 'config', 'analytics'].includes(activeTab)) {
      setActiveTab("analytics");
    } else if (adminRole === 'treasurer' && !['treasury', 'codes', 'rewards', 'analytics'].includes(activeTab)) {
      setActiveTab("analytics");
    }
  }, [adminRole, activeTab]);

  const fetchRates = async () => {
    try {
      const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=usd");
      const cgData = await cgResponse.json();
      
      const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
      const alcorData = await alcorResponse.json();
      const tabMarket = alcorData.find((m: any) => m.ticker_id === "TAB_XPR");
      
      let xprPerTab = 0.36; 
      if (tabMarket && tabMarket.last_price) {
        xprPerTab = parseFloat(tabMarket.last_price);
      }

      if (cgData.proton && cgData.proton.usd) {
        return { 
          xprUsd: cgData.proton.usd, 
          xprPerTab 
        };
      }
    } catch (e) {
      console.error("Price fetch failed", e);
    }
    return null;
  };

  const handleSyncParity = useCallback(async (isAuto = false) => {
    setIsSyncingPrices(true);
    const marketData = await fetchRates();
    
    if (marketData) {
      const { xprUsd, xprPerTab } = marketData;
      const targetFeeUsd = isAuto ? parseFloat(membershipFeeXusdc) : parseFloat(localFeeXusdc);
      const targetBoostUsd = isAuto ? parseFloat(boostPriceXusdc) : parseFloat(localBoostXusdc);
      
      if (!isNaN(targetFeeUsd)) {
        const calculatedXpr = (targetFeeUsd / xprUsd).toFixed(0);
        const calculatedXmd = targetFeeUsd.toFixed(2);
        
        updateMembershipFee(calculatedXpr, 'XPR');
        updateMembershipFee(calculatedXmd, 'XMD');
        if (!isAuto) updateMembershipFee(localFeeXusdc, 'XUSDC');
        
        setLocalFee(calculatedXpr);
        setLocalFeeXmd(calculatedXmd);
      }

      if (!isNaN(targetBoostUsd)) {
        const boostXprVal = (targetBoostUsd / xprUsd).toFixed(0);
        const boostTabVal = (parseFloat(boostXprVal) / xprPerTab).toFixed(0);
        
        updateBoostPrice(boostXprVal);
        updateBoostTabPrice(boostTabVal);
        if (!isAuto) updateBoostPriceXusdc(localBoostXusdc);

        setLocalBoost(boostXprVal);
        setLocalBoostTab(boostTabVal);
      }
      
      const now = Date.now();
      setLastAutoSync(now);
      localStorage.setItem("tiptab_last_parity_sync", now.toString());

      toast({
        title: isAuto ? "Passive Parity Sync Complete" : "Network Parity Synced",
        description: `Activation and Boosts calibrated via Alcor/CoinGecko. (1 TAB = ${xprPerTab.toFixed(4)} XPR)`,
      });
    } else if (!isAuto) {
      toast({
        title: "Sync Failed",
        description: "Could not fetch current market rates from external APIs.",
        variant: "destructive"
      });
    }
    setIsSyncingPrices(false);
  }, [membershipFeeXusdc, boostPriceXusdc, localFeeXusdc, localBoostXusdc, updateMembershipFee, updateBoostPrice, updateBoostTabPrice, updateBoostPriceXusdc, toast]);

  useEffect(() => {
    if (adminRole === 'super' && isConnected) {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - lastAutoSync > oneDayInMs) {
        handleSyncParity(true);
      }
    }
  }, [adminRole, isConnected, lastAutoSync, handleSyncParity]);

  const handleUpdateFee = (asset: 'XPR' | 'XMD' | 'XUSDC') => {
    if (adminRole !== 'super') return;
    const val = asset === 'XPR' ? localFee : asset === 'XMD' ? localFeeXmd : localFeeXusdc;
    updateMembershipFee(val, asset);
    toast({ title: `${asset} Fee Updated`, description: `Global rate set to ${val} ${asset}.` });
  };

  const handleUpdateBoost = (asset: 'XPR' | 'TAB' | 'XUSDC') => {
    if (adminRole !== 'super') return;
    if (asset === 'XPR') {
      updateBoostPrice(localBoost);
      toast({ title: "XPR Boost Price Updated", description: `Rate set to ${localBoost} XPR.` });
    } else if (asset === 'TAB') {
      updateBoostTabPrice(localBoostTab);
      toast({ title: "TAB Boost Updated", description: `Rate set to ${localBoostTab} TAB.` });
    } else if (asset === 'XUSDC') {
      updateBoostPriceXusdc(localBoostXusdc);
      toast({ title: "XUSDC Boost Master Updated", description: `Master rate set to ${localBoostXusdc} XUSDC.` });
    }
  };

  const handleRewardWinners = async () => {
    setIsDistributing(true);
    try {
      const activeWinners = winners
        .filter(w => parseFloat(w.reward || "0") > 0)
        .map(w => ({ account: w.account, amount: w.reward }));
        
      if (activeWinners.length === 0) {
        toast({ title: "Payout Skipped", description: "No positive reward values configured." });
        setIsDistributing(false);
        return;
      }

      const success = await distributeXprRewards(activeWinners);
      if (success) {
        toast({
          title: "Rewards Distributed!",
          description: `Successfully paid out rewards to the winners.`,
        });
      }
    } catch (e) {
      toast({ title: "Reward Error", description: "Failed to process batch payout.", variant: "destructive" });
    } finally {
      setIsDistributing(false);
    }
  };

  const handleRewardValueChange = (index: number, value: string) => {
    setWinners(prev => prev.map((w, idx) => idx === index ? { ...w, reward: value } : w));
  };

  const handleClearRewards = () => {
    setWinners(prev => prev.map(w => ({ ...w, reward: "0" })));
    toast({ title: "Ledger Cleared", description: "All payout fields reset to zero." });
  };

  const handleAutoBalanceRewards = () => {
    const pool = treasuryData.find(d => d.symbol === "XPR")?.rewards || 0;
    if (pool <= 0) return;
    const distribution = [0.4, 0.25, 0.15, 0.1, 0.1];
    setWinners(prev => prev.map((w, idx) => ({
      ...w,
      reward: idx < 5 ? (pool * distribution[idx]).toFixed(0) : "0"
    })));
  };

  const handleBroadcast = () => {
    if (!alertMessage.trim()) return;
    broadcastAlert(alertMessage);
    setIsAlertModalOpen(false);
    setAlertMessage("");
  };

  const clearAlert = () => {
    broadcastAlert(null);
  };

  const handleResetTicker = () => {
    resetLiveTicker();
  };

  const toggleMaintenance = () => {
    if (adminRole !== 'super') return;
    setMaintenanceMode(!isMaintenanceMode);
  };

  const toggleBan = (handle: string) => {
    const isBanned = bannedHandles.includes(handle);
    if (isBanned) setBannedHandles(prev => prev.filter(h => h !== handle));
    else setBannedHandles(prev => [...prev, handle]);
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    createPromoCode(newPromoCode, newPromoType, parseInt(newPromoValue), parseInt(newPromoUses));
    setNewPromoCode("");
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPermanentAdmin) return;
    addAdmin(newAdminHandle, newAdminRole);
    setNewAdminHandle("");
  };

  const handleRemoveClick = (admin: AdminUser) => {
    if (!isPermanentAdmin) return;
    if (admin.handle === actor) {
      setTargetIdForRemoval(admin.id);
      setRemovalStep("warning1");
    } else {
      removeAdmin(admin.id);
    }
  };

  const handleFinalSelfRemoval = async () => {
    if (!targetIdForRemoval || !actor) return;
    if (confirmInput.toLowerCase().trim() !== actor.toLowerCase().trim()) return;
    removeAdmin(targetIdForRemoval);
    setRemovalStep("closed");
    await logout();
    navigate("/");
  };

  const openAuditLogs = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsAuditModalOpen(true);
  };

  const openTransactionHistory = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsHistoryModalOpen(true);
  };

  const confirmDeleteProfile = () => {
    if (!creatorToDelete) return;
    setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
    setIsDeleteModalOpen(false);
  };

  const filteredCreators = useMemo(() => {
    return moderatedCreators.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.handle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = modCategoryFilter === "All" || (c.categories && c.categories.includes(modCategoryFilter));
      return matchesSearch && matchesCategory;
    });
  }, [moderatedCreators, searchQuery, modCategoryFilter]);

  const modCategories = useMemo(() => {
    const allCats = moderatedCreators.flatMap(c => c.categories || []);
    return ["All", ...Array.from(new Set(allCats)).sort()];
  }, [moderatedCreators]);

  const adminNavItems = useMemo(() => {
    const items = [{ id: "analytics", label: "Analytics", icon: BarChart3 }];
    if (adminRole === 'super' || adminRole === 'treasurer') items.push({ id: "treasury", label: "Treasury", icon: Activity });
    if (adminRole === 'super' || adminRole === 'moderator') items.push({ id: "config", label: "Config", icon: Settings });
    if (adminRole === 'super' || adminRole === 'treasurer') {
      items.push({ id: "codes", label: "Promo Codes", icon: Gift });
      items.push({ id: "rewards", label: "Rewards", icon: Trophy });
    }
    if (adminRole === 'super' || adminRole === 'moderator') items.push({ id: "moderation", label: "Moderation", icon: Users });
    if (adminRole === 'super') items.push({ id: "admins", label: "Admins", icon: ShieldCheck });
    return items;
  }, [adminRole]);

  // Loading Guard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06030e] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin || !isConnected) return null;

  const totalRewardsValue = winners.reduce((acc, curr) => acc + parseFloat(curr.reward || "0"), 0);

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden">
      <Header />

      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-cyan-500/5 blur-[150px] rounded-full -z-10" />

      <main className="container mx-auto px-4 md:px-6 py-12 pt-36 md:pt-44 max-w-6xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Secure Administration
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none text-slate-100">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-500 to-cyan-400">Hub</span>
            </h1>
          </div>
          
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl">
             {adminNavItems.map((item) => (
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

        <div className="w-full">
          {activeTab === "analytics" && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: "Active Members", value: analyticsStats.activeMembers.toLocaleString(), change: "+14%", icon: UserCheck, color: "text-orange-400", sub: "Growth (MoM)" },
                   { label: "Supporter Base", value: analyticsStats.supporterBase.toLocaleString(), change: "+8%", icon: Users, color: "text-purple-400", sub: "Unique Wallets" },
                   { label: "Tipping Velocity", value: `${analyticsStats.tippingVelocity}/hr`, change: "+22%", icon: Flame, color: "text-red-500", sub: "Platform Speed" },
                   { label: "Avg Tip Size", value: `${analyticsStats.avgTipSize} TAB`, change: "-2%", icon: Zap, color: "text-cyan-400", sub: "Network Value" }
                 ].map((stat, i) => (
                   <Card key={i} className="bg-[#130b21] border border-white/10 p-6 rounded-[32px] hover:border-white/20 transition-all">
                     <div className="flex items-center justify-between mb-4">
                       <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}>
                         <stat.icon className="h-5 w-5" />
                       </div>
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.change.startsWith('+') ? "text-green-400" : "text-red-400")}>
                         {stat.change}
                       </span>
                     </div>
                     <div className="space-y-1">
                       <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
                       <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest pt-1">{stat.sub}</p>
                     </div>
                   </Card>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <Card className="lg:col-span-7 bg-[#1a112d] border border-white/10 rounded-[40px] p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <TrendingUp className="h-48 w-48 text-white" />
                    </div>
                    <CardHeader className="p-0 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-black flex items-center gap-3 text-white uppercase italic tracking-tight">
                            <TrendingUp className="h-5 w-5 text-purple-400" /> Adoption Velocity
                          </CardTitle>
                          <CardDescription className="text-white/40">Member totals and network expansion trends</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                            onClick={() => setIsDetailedReportOpen(true)}
                            variant="ghost" 
                            className="h-10 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 gap-2 hover:bg-white/10 hover:text-white transition-all"
                          >
                             Detailed Report <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                          <Dialog open={isResetAnalyticsOpen} onOpenChange={setIsResetAnalyticsOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost"
                                className="h-10 px-4 bg-red-500/5 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest text-red-500 transition-all group"
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-2 group-hover:rotate-[-45deg] transition-transform" />
                                Reset
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
                              <div className="text-center space-y-6">
                                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20">
                                  <AlertTriangle className="h-10 w-10 text-red-500" />
                                </div>
                                <DialogHeader>
                                  <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">RESET ANALYTICS?</DialogTitle>
                                  <DialogDescription className="text-white/60 font-bold text-center">
                                    This will zero out all platform velocity metrics, member growth counts, and engagement stats. This action is irreversible.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-4">
                                  <Button onClick={() => setIsResetAnalyticsOpen(false)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase">Cancel</Button>
                                  <Button onClick={handleResetAnalytics} className="flex-1 h-14 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase">Yes, Reset Metrics</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6 relative z-10">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">New Profiles (24h)</span>
                            </div>
                            <p className="text-4xl font-black text-white">{analyticsStats.newProfiles24h}</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-orange-500 transition-all" style={{ width: analyticsStats.newProfiles24h > 0 ? '65%' : '0%' }} />
                            </div>
                         </div>
                         <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Performance Boosts (24h)</span>
                            </div>
                            <p className="text-4xl font-black text-white">{analyticsStats.performanceBoosts24h}</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-purple-500 transition-all" style={{ width: analyticsStats.performanceBoosts24h > 0 ? '82%' : '0%' }} />
                            </div>
                         </div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="lg:col-span-5 bg-[#130b21] border border-white/10 rounded-[40px] p-8 space-y-8 relative overflow-hidden">
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl font-black flex items-center gap-3 text-white uppercase italic">
                        <Globe className="h-5 w-5 text-cyan-400" /> Distribution
                      </CardTitle>
                      <CardDescription className="text-white/40">Geographical presence hotspots</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      {[
                        { city: "London, UK", count: 412, color: "bg-purple-500" },
                        { city: "Austin, USA", count: 284, color: "bg-orange-500" },
                        { city: "Melbourne, AU", count: 156, color: "bg-cyan-500" }
                      ].map((loc, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={cn("h-2.5 w-2.5 rounded-full", loc.color)} />
                            <span className="font-black text-sm text-white/80 group-hover:text-white transition-colors">{loc.city}</span>
                          </div>
                          <span className="font-black text-xs text-white/40">{loc.count} pins</span>
                        </div>
                      ))}
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Global Coverage: 84% Recognized Cities</p>
                      </div>
                    </CardContent>
                 </Card>
               </div>
            </div>
          )}

          {activeTab === "treasury" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <Card className="bg-[#1a112d] border-[4px] border-slate-300/40 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] relative ring-2 ring-white/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                  <CardHeader className="p-12 pb-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-4 text-white uppercase">
                          <Activity className="h-10 w-10 text-purple-500 animate-pulse" /> NETWORK TREASURY
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12 pt-4 space-y-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {treasuryData.map((asset) => (
                         <div key={asset.symbol} className={cn("p-8 rounded-[40px] bg-gradient-to-br border-2 border-white/5 group hover:border-white/20 transition-all shadow-2xl relative overflow-hidden", asset.bg)}>
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                              <asset.icon className={cn("h-24 w-24", asset.color)} />
                            </div>
                            <div className="space-y-8 relative z-10">
                               <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Net Admin Revenue</p>
                                    <p className="text-4xl font-black text-white tracking-tighter italic">
                                      {asset.revenue.toLocaleString()} <span className={cn("text-lg", asset.color)}>{asset.symbol}</span>
                                    </p>
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                  <div className="space-y-1">
                                     <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Boost Volume</p>
                                     <p className="text-xl font-black text-white/80">{asset.boostVolume.toLocaleString()} <span className="text-xs">{asset.symbol}</span></p>
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[9px] font-black text-orange-500/80 uppercase tracking-[0.2em]">Rewards Pool</p>
                                     <p className="text-xl font-black text-orange-500">{asset.rewards.toLocaleString()} <span className="text-xs">{asset.symbol}</span></p>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}

          {activeTab === "config" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#241a3d] border-white/5 rounded-[40px] overflow-hidden shadow-2xl p-10 space-y-6">
                  <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Power className="h-5 w-5 text-red-500" /> Network Overrides</h3>
                  <div className="space-y-4 pt-4">
                    <Button 
                      onClick={toggleMaintenance}
                      disabled={adminRole !== 'super'}
                      className={cn(
                        "w-full h-16 rounded-[28px] border font-black text-sm flex items-center justify-between px-8 transition-all disabled:opacity-50",
                        isMaintenanceMode ? "bg-red-500 text-white border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "bg-red-500/10 border-red-500/20 text-red-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Power className={cn("h-4 w-4", isMaintenanceMode && "animate-pulse")} />
                        {isMaintenanceMode ? "MAINTENANCE ACTIVE" : "MAINTENANCE MODE (Super Only)"}
                      </div>
                    </Button>
                    <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full h-16 rounded-[28px] bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-black text-sm flex items-center justify-start gap-4 px-8">
                            <Bell className="h-5 w-5" /> Broadcast Network Alert
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#2a1b4d] border-white/10 text-white rounded-3xl p-8 max-w-md shadow-2xl">
                          <DialogHeader className="space-y-3">
                            <DialogTitle className="text-2xl font-black italic tracking-tight">GLOBAL BROADCAST</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            <Input value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="Alert Message..." className="bg-white/5 border-white/10 h-14 rounded-xl px-4 text-white font-medium" />
                            <Button onClick={handleBroadcast} className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl">Broadcast Live</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "admins" && adminRole === 'super' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               {/* Admin management content... */}
            </div>
          )}
        </div>
      </main>

      <DetailedReportModal isOpen={isDetailedReportOpen} onOpenChange={setIsDetailedReportOpen} />
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <Trash2 className="mx-auto h-20 w-20 text-red-500" />
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">PURGE PROFILE?</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4">
              <Button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-14 bg-white/5 rounded-2xl font-black uppercase">Cancel</Button>
              <Button onClick={confirmDeleteProfile} className="flex-1 h-14 bg-red-500 rounded-2xl font-black uppercase">Yes, Purge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;