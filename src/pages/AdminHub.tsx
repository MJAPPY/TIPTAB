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
  MapPin,
  Coins,
  Save
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

// Audit logs are now empty for production
const MOCK_AUDIT_LOGS: Record<string, any[]> = {};

// Initial leaderboard recipients with zero rewards for production
const INITIAL_LEADERBOARD_WINNERS = [
  { account: "whaleshark", role: "Supporter", rank: 1, reward: "0" },
  { account: "tiptab", role: "Creator", rank: 2, reward: "0" },
  { account: "carlos_delivery", role: "Creator", rank: 3, reward: "0" },
  { account: "early", role: "Supporter", rank: 4, reward: "0" },
  { account: "mayafit", role: "Creator", rank: 5, reward: "0" },
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
    isMaintenanceMode, 
    setMaintenanceMode, 
    broadcastAlert, 
    networkAlert, 
    membershipFee, 
    membershipFeeXmd,
    membershipFeeXusdc,
    membershipFeeMetal,
    membershipFeeLoan,
    membershipFeeXmt,
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
  const [localFeeMetal, setLocalFeeMetal] = useState(membershipFeeMetal || "2.50");
  const [localFeeLoan, setLocalFeeLoan] = useState(membershipFeeLoan || "10000");
  const [localFeeXmt, setLocalFeeXmt] = useState(membershipFeeXmt || "2.50");
  
  const [localBoost, setLocalBoost] = useState(boostPrice || "1000");
  const [localBoostTab, setLocalBoostTab] = useState(boostTabPrice || "5000");
  const [localBoostXusdc, setLocalBoostXusdc] = useState(boostPriceXusdc || "1.00");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [modCategoryFilter, setModCategoryFilter] = useState("All");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isDetailedReportOpen, setIsDetailedReportOpen] = useState(false);
  const [isResetTreasuryOpen, setIsResetTreasuryOpen] = useState(false);
  const [isResetAnalyticsOpen, setIsResetAnalyticsOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<number>(() => {
    return parseInt(localStorage.getItem("tiptab_last_parity_sync") || "0");
  });

  // Analytics Metrics State loaded from localStorage
  const [analyticsStats, setAnalyticsStats] = useState(() => {
    const saved = localStorage.getItem("tiptab_admin_analytics");
    return saved ? JSON.parse(saved) : {
      activeMembers: 0,
      supporterBase: 0,
      tippingVelocity: 0,
      avgTipSize: 0,
      newProfiles24h: 0,
      performanceBoosts24h: 0
    };
  });

  const handleResetAnalytics = () => {
    const resetData = { activeMembers: 0, supporterBase: 0, tippingVelocity: 0, avgTipSize: 0, newProfiles24h: 0, performanceBoosts24h: 0 };
    setAnalyticsStats(resetData);
    localStorage.setItem("tiptab_admin_analytics", JSON.stringify(resetData));
    setIsResetAnalyticsOpen(false);
    toast({ title: "Analytics Reset Successful" });
  };

  // Profile Delete Confirmation Flow
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [creatorToDelete, setCreatorToDelete] = useState<Creator | null>(null);

  // New Admin creation states
  const [newAdminHandle, setNewAdminHandle] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<'super' | 'moderator' | 'treasurer'>("moderator");
  
  // Double warning flow state for self-removal of a permanent admin
  const [removalStep, setRemovalStep] = useState<"closed" | "warning1" | "warning2">("closed");
  const [confirmInput, setConfirmInput] = useState("");
  const [targetIdForRemoval, setTargetIdForRemoval] = useState<string | null>(null);

  // Editable Leaderboard Payouts State
  const [winners, setWinners] = useState(INITIAL_LEADERBOARD_WINNERS);

  // Promo Code Creation Form State
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<'free' | 'percent'>("percent");
  const [newPromoValue, setNewPromoValue] = useState("50");
  const [newPromoUses, setNewPromoUses] = useState("100");

  // Multi-token Financial Data loaded from localStorage
  const [rawTreasuryData, setRawTreasuryData] = useState(() => {
    const saved = localStorage.getItem("tiptab_treasury_ledger");
    return saved ? JSON.parse(saved) : [
      { symbol: "XPR", totalActivation: 0, boostVolume: 0, color: "text-orange-500", bg: "from-orange-500/10", icon: Zap },
      { symbol: "TAB", totalActivation: 0, boostVolume: 0, color: "text-purple-400", bg: "from-purple-500/10", icon: Sparkles },
      { symbol: "XMD", totalActivation: 0, boostVolume: 0, color: "text-cyan-400", bg: "from-cyan-500/10", icon: Globe },
      { symbol: "XUSDC", totalActivation: 0, boostVolume: 0, color: "text-green-400", bg: "from-green-500/10", icon: HandCoins }
    ];
  });

  const treasuryData = useMemo(() => {
    return rawTreasuryData.map((item: any) => {
      const rewards = item.boostVolume * 0.5;
      const adminBoostShare = item.boostVolume * 0.5;
      const netRevenue = item.totalActivation + adminBoostShare;
      return { ...item, revenue: netRevenue, rewards, splitPolicy: "50/50 Rewards Split" };
    });
  }, [rawTreasuryData]);

  const handleResetTreasury = () => {
    const resetData = rawTreasuryData.map((item: any) => ({ ...item, totalActivation: 0, boostVolume: 0 }));
    setRawTreasuryData(resetData);
    localStorage.setItem("tiptab_treasury_ledger", JSON.stringify(resetData));
    setIsResetTreasuryOpen(false);
    toast({ title: "Ledger Reset Successful" });
  };

  useEffect(() => {
    if (membershipFee && !isDirty) setLocalFee(membershipFee);
    if (membershipFeeXmd && !isDirty) setLocalFeeXmd(membershipFeeXmd);
    if (membershipFeeXusdc && !isDirty) setLocalFeeXusdc(membershipFeeXusdc);
    if (membershipFeeMetal && !isDirty) setLocalFeeMetal(membershipFeeMetal);
    if (membershipFeeLoan && !isDirty) setLocalFeeLoan(membershipFeeLoan);
    if (membershipFeeXmt && !isDirty) setLocalFeeXmt(membershipFeeXmt);
    if (boostPrice && !isDirty) setLocalBoost(boostPrice);
    if (boostTabPrice && !isDirty) setLocalBoostTab(boostTabPrice);
    if (boostPriceXusdc && !isDirty) setLocalBoostXusdc(boostPriceXusdc);
  }, [membershipFee, membershipFeeXmd, membershipFeeXusdc, membershipFeeMetal, membershipFeeLoan, membershipFeeXmt, boostPrice, boostTabPrice, boostPriceXusdc, isDirty]);

  useEffect(() => {
    if (!isConnected || !isAdmin) {
      toast({ title: "Access Denied", description: "Restricted to network administrators.", variant: "destructive" });
      navigate("/");
    }
  }, [isAdmin, isConnected, navigate, toast]);

  const fetchRates = async () => {
    try {
      const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton,metal-pay,loan&vs_currencies=usd");
      const cgData = await cgResponse.json();
      const xprUsd = cgData.proton?.usd;
      
      if (!xprUsd) throw new Error("XPR Price anchor failed");

      const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
      const alcorData = await alcorResponse.json();
      
      const getAlcorRate = (id: string) => {
        const ticker = alcorData.find((m: any) => m.ticker_id === id);
        return ticker ? parseFloat(ticker.last_price) : null;
      };

      // Tickers return amount of XPR per 1 unit of token
      // Request anchor logic: 1 XUSDC = 366 XPR, 3.3 XMT, 2143 LOAN, 5.9 METAL
      const tabXpr = getAlcorRate("TAB_XPR") || 0.36;
      const xmtXpr = 366 / 3.3;  // Matches 3.3 per XUSDC exactly
      const loanXpr = 366 / 2143; // Matches 2143 per XUSDC exactly
      const metalXpr = 366 / 5.9; // Matches 5.9 per XUSDC exactly

      return { xprUsd, tabXpr, xmtXpr, loanXpr, metalXpr };
    } catch (e) { console.error("Price sync failed", e); }
    return null;
  };

  const handleSyncParity = useCallback(async (isAuto = false) => {
    setIsSyncingPrices(true);
    const marketData = await fetchRates();
    
    if (marketData) {
      const { xprUsd, tabXpr, xmtXpr, loanXpr, metalXpr } = marketData;
      const targetFeeUsd = parseFloat(localFeeXusdc);
      const targetBoostUsd = parseFloat(localBoostXusdc);
      
      if (!isNaN(targetFeeUsd)) {
        const calculatedXpr = (targetFeeUsd * 366).toFixed(0);
        const calculatedXmd = targetFeeUsd.toFixed(2);
        const calculatedMetal = (targetFeeUsd * 5.9).toFixed(4);
        const calculatedLoan = (targetFeeUsd * 2143).toFixed(0);
        const calculatedXmt = (targetFeeUsd * 3.3).toFixed(4);
        
        setLocalFee(calculatedXpr);
        setLocalFeeXmd(calculatedXmd);
        setLocalFeeMetal(calculatedMetal);
        setLocalFeeLoan(calculatedLoan);
        setLocalFeeXmt(calculatedXmt);
      }

      if (!isNaN(targetBoostUsd)) {
        const boostXprVal = (targetBoostUsd * 366).toFixed(0);
        const boostTabVal = (parseFloat(boostXprVal) / tabXpr).toFixed(0);
        setLocalBoost(boostXprVal);
        setLocalBoostTab(boostTabVal);
      }
      
      setIsDirty(true);
      if (isAuto) handleCommitAll();

      toast({ title: "Calculated Parity", description: "Rates updated in fields. Click 'Commit All' to save to network." });
    }
    setIsSyncingPrices(false);
  }, [localFeeXusdc, localBoostXusdc, toast]);

  const handleCommitAll = async () => {
    if (adminRole !== 'super') return;
    setIsSyncingPrices(true);
    try {
      await updateMembershipFee(localFee, 'XPR');
      await updateMembershipFee(localFeeXmd, 'XMD');
      await updateMembershipFee(localFeeXusdc, 'XUSDC');
      await updateMembershipFee(localFeeMetal, 'METAL');
      await updateMembershipFee(localFeeLoan, 'LOAN');
      await updateMembershipFee(localFeeXmt, 'XMT');
      await updateBoostPrice(localBoost);
      await updateBoostTabPrice(localBoostTab);
      await updateBoostPriceXusdc(localBoostXusdc);
      
      setIsDirty(false);
      const now = Date.now();
      setLastAutoSync(now);
      localStorage.setItem("tiptab_last_parity_sync", now.toString());
      toast({ title: "Network Configuration Saved", description: "All rates are now live across the platform." });
    } catch (e) {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      setIsSyncingPrices(false);
    }
  };

  const handleUpdateFee = (asset: any) => {
    if (adminRole !== 'super') return;
    let val = "";
    switch(asset) {
      case 'XPR': val = localFee; break;
      case 'XMD': val = localFeeXmd; break;
      case 'XUSDC': val = localFeeXusdc; break;
      case 'METAL': val = localFeeMetal; break;
      case 'LOAN': val = localFeeLoan; break;
      case 'XMT': val = localFeeXmt; break;
    }
    updateMembershipFee(val, asset);
    toast({ title: `${asset} Updated`, description: `Rate set to ${val} ${asset}.` });
  };

  const handleUpdateBoost = (asset: any) => {
    if (adminRole !== 'super') return;
    if (asset === 'XPR') updateBoostPrice(localBoost);
    else if (asset === 'TAB') updateBoostTabPrice(localBoostTab);
    else if (asset === 'XUSDC') updateBoostPriceXusdc(localBoostXusdc);
    toast({ title: `${asset} Boost Updated` });
  };

  const handleRewardWinners = async () => {
    setIsDistributing(true);
    const activeWinners = winners.filter(w => parseFloat(w.reward || "0") > 0).map(w => ({ account: w.account, amount: w.reward }));
    if (activeWinners.length === 0) { setIsDistributing(false); return; }
    const success = await distributeXprRewards(activeWinners);
    if (success) toast({ title: "Rewards Distributed!" });
    setIsDistributing(false);
  };

  const handleRewardValueChange = (index: number, value: string) => { setWinners(prev => prev.map((w, idx) => idx === index ? { ...w, reward: value } : w)); };
  const handleClearRewards = () => { setWinners(prev => prev.map(w => ({ ...w, reward: "0" }))); };

  const handleAutoBalanceRewards = () => {
    const pool = treasuryData.find(d => d.symbol === "XPR")?.rewards || 0;
    if (pool <= 0) return;
    const distribution = [0.4, 0.25, 0.15, 0.1, 0.1];
    setWinners(prev => prev.map((w, idx) => ({ ...w, reward: idx < 5 ? (pool * distribution[idx]).toFixed(0) : "0" })));
  };

  const handleBroadcast = () => {
    if (!alertMessage.trim()) return;
    broadcastAlert(alertMessage);
    setIsAlertModalOpen(false);
    setAlertMessage("");
    toast({ title: "Alert Broadcasted" });
  };

  const toggleMaintenance = () => {
    if (adminRole !== 'super') return;
    const newState = !isMaintenanceMode;
    setMaintenanceMode(newState);
    toast({ title: newState ? "Maintenance Active" : "Network Online", variant: newState ? "destructive" : "default" });
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
    toast({ title: "Promo Created" });
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = newAdminHandle.trim().replace('@', '');
    addAdmin(handle, newAdminRole);
    setNewAdminHandle("");
    toast({ title: "Admin Added" });
  };

  const handleRemoveClick = (admin: AdminUser) => {
    if (!isPermanentAdmin) return;
    const isSelf = admin.handle === actor;
    if (isSelf) {
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
    await logout();
    navigate("/");
  };

  const confirmDeleteProfile = () => {
    if (!creatorToDelete) return;
    const handle = creatorToDelete.handle.replace('@', '').toLowerCase();
    setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
    localStorage.removeItem(`tiptab_profile_${handle}`);
    setIsDeleteModalOpen(false);
  };

  const filteredCreators = useMemo(() => {
    return moderatedCreators.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.handle.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (adminRole === 'super' || adminRole === 'treasurer') { items.push({ id: "codes", label: "Promo Codes", icon: Gift }); items.push({ id: "rewards", label: "Rewards", icon: Trophy }); }
    if (adminRole === 'super' || adminRole === 'moderator') items.push({ id: "moderation", label: "Moderation", icon: Users });
    if (adminRole === 'super') items.push({ id: "admins", label: "Admins", icon: ShieldCheck });
    return items;
  }, [adminRole]);

  const totalRewardsValue = winners.reduce((acc, curr) => acc + parseFloat(curr.reward || "0"), 0);

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-12 pt-36 md:pt-44 max-w-6xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">
              <ShieldAlert className="h-3.5 w-3.5" /> Secure Admin Hub
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Administration</h1>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl">
             {adminNavItems.map((item) => (
               <Button key={item.id} variant="ghost" onClick={() => setActiveTab(item.id)} className={cn("h-12 sm:h-14 px-4 sm:px-6 rounded-2xl gap-2 sm:gap-3 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all", activeTab === item.id ? "bg-purple-600 text-white shadow-[0_10px_30px_rgba(168,85,247,0.3)]" : "text-slate-400 hover:text-purple-400 hover:bg-purple-500/5")}>
                 <item.icon className="h-3 w-3 sm:h-4 w-4" /> <span>{item.label}</span>
               </Button>
             ))}
          </div>
        </div>

        <div className="w-full">
          {activeTab === "analytics" && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: "Active Members", value: analyticsStats.activeMembers.toLocaleString(), icon: UserCheck, color: "text-orange-400" },
                   { label: "Supporter Base", value: analyticsStats.supporterBase.toLocaleString(), icon: Users, color: "text-purple-400" },
                   { label: "Tipping Velocity", value: `${analyticsStats.tippingVelocity}/hr`, icon: Flame, color: "text-red-500" },
                   { label: "Avg Tip Size", value: `${analyticsStats.avgTipSize} TAB`, icon: Zap, color: "text-cyan-400" }
                 ].map((stat, i) => (
                   <Card key={i} className="bg-[#130b21] border border-white/10 p-6 rounded-[32px]">
                     <div className="flex items-center justify-between mb-4">
                       <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}><stat.icon className="h-5 w-5" /></div>
                     </div>
                     <div className="space-y-1"><p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p></div>
                   </Card>
                 ))}
               </div>
            </div>
          )}

          {activeTab === "config" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 bg-[#241a3d] border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 pb-2 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-xl font-black flex items-center gap-3 text-white uppercase italic"><Settings className="h-5 w-5 text-orange-400" /> Fees & Parity</CardTitle>
                      <CardDescription className="text-white/40">Recalibrate based on $1 XUSDC = 366 XPR / 3.3 XMT / 2143 LOAN / 5.9 METAL</CardDescription>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => handleSyncParity()} disabled={isSyncingPrices} className="h-12 px-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-black text-[10px] uppercase tracking-widest gap-2">
                        <Scale className={cn("h-4 w-4", isSyncingPrices && "animate-spin")} /> Recalculate
                      </Button>
                      <Button onClick={handleCommitAll} disabled={!isDirty || isSyncingPrices} className="h-12 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-orange-500/20">
                        <Save className="h-4 w-4" /> Commit All Sync
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-cyan-400">Master Anchor (XUSDC Fee)</Label>
                        <div className="flex gap-2">
                          <Input type="number" value={localFeeXusdc} onChange={(e) => { setLocalFeeXusdc(e.target.value); setIsDirty(true); }} className="bg-white/5 border-white/10 h-14 rounded-xl font-black text-white" />
                          <Button onClick={() => handleUpdateFee('XUSDC')} className="h-14 bg-white/10 hover:bg-white/20 px-4 rounded-xl">Set</Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-orange-400">XPR Proportion (x366)</Label>
                        <div className="flex gap-2">
                          <Input value={localFee} onChange={(e) => { setLocalFee(e.target.value); setIsDirty(true); }} className="bg-white/5 border-white/10 h-14 rounded-xl font-black text-white" />
                          <Button onClick={() => handleUpdateFee('XPR')} className="h-14 bg-white/10 hover:bg-white/20 px-4 rounded-xl">Set</Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-purple-400">XMT Proportion (x3.3)</Label>
                        <div className="flex gap-2">
                          <Input value={localFeeXmt} onChange={(e) => { setLocalFeeXmt(e.target.value); setIsDirty(true); }} className="bg-white/5 border-white/10 h-14 rounded-xl font-black text-white" />
                          <Button onClick={() => handleUpdateFee('XMT')} className="h-14 bg-white/10 hover:bg-white/20 px-4 rounded-xl">Set</Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-blue-400">LOAN Proportion (x2143)</Label>
                        <div className="flex gap-2">
                          <Input value={localFeeLoan} onChange={(e) => { setLocalFeeLoan(e.target.value); setIsDirty(true); }} className="bg-white/5 border-white/10 h-14 rounded-xl font-black text-white" />
                          <Button onClick={() => handleUpdateFee('LOAN')} className="h-14 bg-white/10 hover:bg-white/20 px-4 rounded-xl">Set</Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">METAL Proportion (x5.9)</Label>
                        <div className="flex gap-2">
                          <Input value={localFeeMetal} onChange={(e) => { setLocalFeeMetal(e.target.value); setIsDirty(true); }} className="bg-white/5 border-white/10 h-14 rounded-xl font-black text-white" />
                          <Button onClick={() => handleUpdateFee('METAL')} className="h-14 bg-white/10 hover:bg-white/20 px-4 rounded-xl">Set</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-4 bg-[#241a3d] border-white/5 rounded-[40px] p-10 space-y-6">
                  <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Power className="h-5 w-5 text-red-500" /> Overrides</h3>
                  <Button onClick={toggleMaintenance} className={cn("w-full h-16 rounded-[28px] border font-black text-sm flex items-center justify-between px-8", isMaintenanceMode ? "bg-red-500 text-white" : "bg-red-500/10 border-red-500/20 text-red-500")}>
                    <div className="flex items-center gap-3"><Power className="h-4 w-4" /> {isMaintenanceMode ? "MAINTENANCE ACTIVE" : "MAINTENANCE MODE"}</div>
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "treasury" && (
             <div className="space-y-10 animate-in fade-in duration-300">
                <Card className="bg-[#1a112d] border border-white/10 rounded-[40px] p-10">
                   <CardHeader className="p-0 mb-8"><CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Treasury Ledger</CardTitle></CardHeader>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {treasuryData.map((asset) => (
                        <div key={asset.symbol} className="p-8 rounded-[40px] bg-white/5 border border-white/5">
                           <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Net Admin Revenue</p>
                           <p className="text-4xl font-black text-white tracking-tighter italic">{asset.revenue.toLocaleString()} <span className={cn("text-lg", asset.color)}>{asset.symbol}</span></p>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>
          )}
        </div>
      </div>
      
      <DetailedReportModal isOpen={isDetailedReportOpen} onOpenChange={setIsDetailedReportOpen} />
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20"><Trash2 className="h-10 w-10 text-red-500" /></div>
            <DialogHeader><DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">PURGE PROFILE?</DialogTitle></DialogHeader>
            <div className="flex gap-4">
              <Button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-14 bg-white/5 rounded-2xl font-black">Cancel</Button>
              <Button onClick={confirmDeleteProfile} className="flex-1 h-14 bg-red-500 rounded-2xl font-black">Yes, Purge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;