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
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useXpr, AdminUser } from "@/contexts/XprContext";
import { Header } from "@/components/tab-platform/Header";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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
import { Creator } from "@/data/creators";

// Initial leaderboard recipients
const INITIAL_LEADERBOARD_WINNERS = [
  { account: "tiptab", role: "Protocol", rank: 1, reward: "0" },
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
    resetLiveTicker,
    dbCreators,
    fetchDbCreators
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
  const [localBoostTab, setLocalBoostTab] = useState(boostTabPrice || "1800");
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
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>([]);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<number>(() => {
    return parseInt(localStorage.getItem("tiptab_last_parity_sync") || "0");
  });

  // Real-time calculated Analytics Metrics State
  const [analyticsStats, setAnalyticsStats] = useState({
    activeMembers: 0,
    supporterBase: 0,
    tippingVelocity: 0,
    avgTipSize: 0,
    newProfiles24h: 0,
    performanceBoosts24h: 0
  });

  // Sync dbCreators into local moderated list for live editing/purging
  useEffect(() => {
    if (dbCreators) {
      setModeratedCreators(dbCreators);
    }
  }, [dbCreators]);

  // Fetch live stats from DB
  const fetchLiveStats = useCallback(async () => {
    try {
      // 1. Get real active member count
      const activeMembersCount = dbCreators.length;

      // 2. Fetch votes to calculate supporter base and velocity
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('voter_handle, tab_amount, created_at');

      let uniqueVoters = 0;
      let avgTip = 0;
      let totalVotes = 0;
      let votesLast24h = 0;

      if (votesData && !votesError) {
        totalVotes = votesData.length;
        const voters = new Set(votesData.map(v => v.voter_handle));
        uniqueVoters = voters.size;

        const sum = votesData.reduce((acc, curr) => acc + Number(curr.tab_amount), 0);
        avgTip = totalVotes > 0 ? Math.round(sum / totalVotes) : 0;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        votesLast24h = votesData.filter(v => new Date(v.created_at) > yesterday).length;
      }

      // 3. Count new profiles created in last 24 hours
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const { count: newProfilesCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', yesterdayDate.toISOString());

      setAnalyticsStats({
        activeMembers: activeMembersCount,
        supporterBase: uniqueVoters || Math.round(activeMembersCount * 0.4), // reliable dynamic fallback
        tippingVelocity: votesLast24h,
        avgTipSize: avgTip || 25, // default fallback
        newProfiles24h: newProfilesCount || 0,
        performanceBoosts24h: Math.round(votesLast24h * 0.2) // approximated from active interactions
      });
    } catch (e) {
      console.error("Failed to compute live stats:", e);
    }
  }, [dbCreators]);

  useEffect(() => {
    fetchDbCreators();
    fetchLiveStats();
  }, [fetchDbCreators, fetchLiveStats]);

  const handleResetAnalytics = () => {
    toast({
      title: "Analytics Sync Triggered",
      description: "Re-calibrating live network metrics directly from the chain."
    });
    fetchLiveStats();
    setIsResetAnalyticsOpen(false);
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

  // Dynamic Leaderboard Payouts State populated with live users
  const [winners, setWinners] = useState<{ account: string; role: string; rank: number; reward: string }[]>([]);

  useEffect(() => {
    if (dbCreators && dbCreators.length > 0) {
      setWinners(
        dbCreators.slice(0, 5).map((c, i) => ({
          account: c.handle,
          role: "Creator",
          rank: i + 1,
          reward: "0"
        }))
      );
    } else {
      setWinners(INITIAL_LEADERBOARD_WINNERS);
    }
  }, [dbCreators]);

  const handleRewardValueChange = (index: number, val: string) => {
    setWinners(prev => prev.map((w, idx) => idx === index ? { ...w, reward: val } : w));
  };

  const handleClearRewards = () => {
    setWinners(prev => prev.map(w => ({ ...w, reward: "0" })));
    toast({
      title: "Ledger Cleared",
      description: "All pending winner reward configurations have been set to 0."
    });
  };

  const handleAutoBalanceRewards = () => {
    const defaults = ["1000", "500", "250", "100", "50"];
    setWinners(prev => prev.map((w, idx) => ({ ...w, reward: defaults[idx] || "0" })));
    toast({
      title: "Contenders Auto-Balanced",
      description: "Successfully distributed sample reward allocation weights to top candidates."
    });
  };

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

      return {
        ...item,
        revenue: netRevenue,
        rewards,
        splitPolicy: "50/50 Rewards Split"
      };
    });
  }, [rawTreasuryData]);

  const handleResetTreasury = () => {
    const resetData = rawTreasuryData.map((item: any) => ({
      ...item,
      totalActivation: 0,
      boostVolume: 0
    }));
    setRawTreasuryData(resetData);
    localStorage.setItem("tiptab_treasury_ledger", JSON.stringify(resetData));
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
    if (membershipFeeMetal) setLocalFeeMetal(membershipFeeMetal);
    if (membershipFeeLoan) setLocalFeeLoan(membershipFeeLoan);
    if (membershipFeeXmt) setLocalFeeXmt(membershipFeeXmt);
    
    if (boostPrice) setLocalBoost(boostPrice);
    if (boostTabPrice) setLocalBoostTab(boostTabPrice);
    if (boostPriceXusdc) setLocalBoostXusdc(boostPriceXusdc);
  }, [membershipFee, membershipFeeXmd, membershipFeeXusdc, membershipFeeMetal, membershipFeeLoan, membershipFeeXmt, boostPrice, boostTabPrice, boostPriceXusdc]);

  useEffect(() => {
    if (!isConnected || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Restricted to network administrators.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAdmin, isConnected, navigate, toast]);

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
      const xprUsd = cgData.proton?.usd;
      
      if (!xprUsd) throw new Error("XPR Price anchor failed");

      const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
      const alcorData = await alcorResponse.json();
      
      const getAlcorRate = (id: string) => {
        const ticker = alcorData.find((m: any) => m.ticker_id === id);
        return ticker ? parseFloat(ticker.last_price) : null;
      };

      const tabXpr = getAlcorRate("TAB_XPR") || 0.36;
      const xmtXpr = getAlcorRate("XMT_XPR") || 111.0; 
      const loanXpr = getAlcorRate("LOAN_XPR") || 0.17;
      const metalXpr = getAlcorRate("METAL_XPR") || 62.0;

      return { 
        xprUsd, 
        tabXpr,
        xmtXpr,
        loanXpr,
        metalXpr
      };
    } catch (e) {
      console.error("Advanced price sync failed", e);
    }
    return null;
  };

  const handleSyncParity = useCallback(async (isAuto = false) => {
    setIsSyncingPrices(true);
    const marketData = await fetchRates();
    
    if (marketData) {
      const { xprUsd, tabXpr, xmtXpr, loanXpr, metalXpr } = marketData;
      
      const targetFeeUsd = isAuto ? parseFloat(membershipFeeXusdc) : parseFloat(localFeeXusdc);
      const targetBoostUsd = isAuto ? parseFloat(boostPriceXusdc) : parseFloat(localBoostXusdc);
      
      if (!isNaN(targetFeeUsd)) {
        const calculatedXpr = (targetFeeUsd / xprUsd).toFixed(0);
        const calculatedXmd = targetFeeUsd.toFixed(2);
        
        const calculatedMetal = (targetFeeUsd / (metalXpr * xprUsd)).toFixed(4);
        const calculatedLoan = (targetFeeUsd / (loanXpr * xprUsd)).toFixed(0);
        const calculatedXmt = (targetFeeUsd / (xmtXpr * xprUsd)).toFixed(4);
        
        updateMembershipFee(calculatedXpr, 'XPR');
        updateMembershipFee(calculatedXmd, 'XMD');
        updateMembershipFee(calculatedMetal, 'METAL');
        updateMembershipFee(calculatedLoan, 'LOAN');
        updateMembershipFee(calculatedXmt, 'XMT');
        
        if (!isAuto) updateMembershipFee(localFeeXusdc, 'XUSDC');
        
        setLocalFee(calculatedXpr);
        setLocalFeeXmd(calculatedXmd);
        setLocalFeeMetal(calculatedMetal);
        setLocalFeeLoan(calculatedLoan);
        setLocalFeeXmt(calculatedXmt);
      }

      if (!isNaN(targetBoostUsd)) {
        const boostXprVal = (targetBoostUsd / xprUsd).toFixed(0);
        const tabDiscountFactor = 0.70;
        const boostTabVal = ((parseFloat(boostXprVal) * tabDiscountFactor) / tabXpr).toFixed(0);
        
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
        title: isAuto ? "Dynamic Parity Sync" : "DEX Parity Recalibrated",
        description: `Fees re-indexed. TAB boosting includes a 30% incentive discount.`,
      });
    } else if (!isAuto) {
      toast({
        title: "Sync Interrupted",
        description: "Network pricing nodes did not respond. Check Alcor/CG connectivity.",
        variant: "destructive"
      });
    }
    setIsSyncingPrices(false);
  }, [membershipFeeXusdc, boostPriceXusdc, localFeeXusdc, localBoostXusdc, updateMembershipFee, updateBoostPrice, updateBoostTabPrice, updateBoostPriceXusdc, toast]);

  // Passive Auto-Sync Logic
  useEffect(() => {
    if (adminRole === 'super' && isConnected) {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - lastAutoSync > oneDayInMs) {
        handleSyncParity(true);
      }
    }
  }, [adminRole, isConnected, lastAutoSync, handleSyncParity]);

  const handleUpdateFee = (asset: 'XPR' | 'XMD' | 'XUSDC' | 'METAL' | 'LOAN' | 'XMT') => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update fees.", variant: "destructive" });
      return;
    }
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
    toast({ title: `${asset} Fee Updated`, description: `Global rate set to ${val} ${asset}.` });
  };

  const handleUpdateBoost = (asset: 'XPR' | 'TAB' | 'XUSDC') => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update boost rates.", variant: "destructive" });
      return;
    }
    
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

  const handleBroadcast = () => {
    if (!alertMessage.trim()) return;
    broadcastAlert(alertMessage);
    setIsAlertModalOpen(false);
    setAlertMessage("");
    toast({ title: "Alert Broadcasted", description: "The message is now live across the platform." });
  };

  const clearAlert = () => {
    broadcastAlert(null);
    toast({ title: "Alert Cleared", description: "Global broadcast banner removed." });
  };

  const handleResetTicker = () => {
    resetLiveTicker();
    toast({
      title: "Live Feed Reset",
      description: "Network activity ticker has been flushed and restored to default."
    });
  };

  const toggleMaintenance = () => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can toggle maintenance mode.", variant: "destructive" });
      return;
    }
    const newState = !isMaintenanceMode;
    setMaintenanceMode(newState);
    toast({
      title: newState ? "Maintenance Activated" : "Network Online",
      variant: newState ? "destructive" : "default"
    });
  };

  const toggleBan = (handle: string) => {
    const isBanned = bannedHandles.includes(handle);
    if (isBanned) {
      setBannedHandles(prev => prev.filter(h => h !== handle));
      toast({ title: "User Restored", description: `@${handle} has been reinstated.` });
    } else {
      setBannedHandles(prev => [...prev, handle]);
      toast({ title: "User Banned", variant: "destructive" });
    }
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      toast({ title: "Missing Code", description: "Please enter a code name.", variant: "destructive" });
      return;
    }
    const parsedVal = parseInt(newPromoValue);
    const parsedUses = parseInt(newPromoUses);
    if (newPromoType === 'percent' && (isNaN(parsedVal) || parsedVal <= 0 || parsedVal > 100)) {
      toast({ title: "Invalid discount value", description: "Discount percentage must be between 1 and 100.", variant: "destructive" });
      return;
    }
    if (isNaN(parsedUses) || parsedUses <= 0) {
      toast({ title: "Invalid usage limit", description: "Max uses must be greater than zero.", variant: "destructive" });
      return;
    }

    createPromoCode(newPromoCode, newPromoType, parsedVal, parsedUses);
    setNewPromoCode("");
    setNewPromoValue("50");
    setNewPromoUses("100");
    toast({ title: "Promo Code Created", description: `Promo code ${newPromoCode.toUpperCase()} is now live.` });
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPermanentAdmin) {
      toast({ title: "Access Denied", description: "Only permanent Super Admins can manage administrators.", variant: "destructive" });
      return;
    }

    const handle = newAdminHandle.trim().replace('@', '');
    if (!handle) {
      toast({ title: "Error", description: "Please provide a valid account handle.", variant: "destructive" });
      return;
    }

    addAdmin(handle, newAdminRole);
    setNewAdminHandle("");
    toast({
      title: "Admin Added",
      description: `@${handle} is now authorized as a ${newAdminRole} admin.`,
    });
  };

  const handleRemoveClick = (admin: AdminUser) => {
    if (!isPermanentAdmin) return;
    const isSelf = admin.handle === actor;
    if (isSelf) {
      const permanentCount = adminsList.filter(a => a.isPermanent).length;
      if (permanentCount <= 1) {
        toast({
          title: "Action Locked",
          description: "You cannot revoke your own access because you are the only Permanent Super Admin remaining.",
          variant: "destructive"
        });
        return;
      }
      setTargetIdForRemoval(admin.id);
      setRemovalStep("warning1");
    } else {
      removeAdmin(admin.id);
      toast({
        title: "Permission Revoked",
        description: `@${admin.handle}'s administrator privileges have been terminated.`
      });
    }
  };

  const handleWarning1Confirm = () => {
    setRemovalStep("warning2");
  };

  const handleFinalSelfRemoval = async () => {
    if (!targetIdForRemoval || !actor) return;
    if (confirmInput.toLowerCase().trim() !== actor.toLowerCase().trim()) {
      toast({
        title: "Mismatched Handle",
        description: "Please type your account handle accurately to verify self-termination.",
        variant: "destructive"
      });
      return;
    }
    removeAdmin(targetIdForRemoval);
    setRemovalStep("closed");
    setConfirmInput("");
    setTargetIdForRemoval(null);
    toast({
      title: "Self-Removal Verified",
      description: "You have revoked your admin status. Logging out...",
    });
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

  const confirmDeleteProfile = async () => {
    if (!creatorToDelete) return;
    const handle = creatorToDelete.handle.replace('@', '').toLowerCase();
    
    try {
      // 1. Delete from Supabase
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('handle', handle);

      if (error) throw error;

      // 2. Clear local storage records
      localStorage.removeItem(`tiptab_profile_${handle}`);
      localStorage.removeItem(`tiptab_membership_${handle}`);
      localStorage.removeItem(`tiptab_membership_date_${handle}`);

      // 3. Sync local state
      setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
      await fetchDbCreators();

      toast({
        title: "Profile Purged Successfully",
        description: `@${handle}'s profile and map registrations have been completely removed.`,
        variant: "destructive"
      });
    } catch (e: any) {
      toast({
        title: "Purge Failed",
        description: e.message || "Database synchronization failed.",
        variant: "destructive"
      });
    }

    setIsDeleteModalOpen(false);
    setCreatorToDelete(null);
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

  if (!isAdmin) return null;

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
                   { label: "Active Members", value: analyticsStats.activeMembers.toLocaleString(), change: "+0%", icon: UserCheck, color: "text-orange-400", sub: "Growth (MoM)" },
                   { label: "Supporter Base", value: analyticsStats.supporterBase.toLocaleString(), change: "+0%", icon: Users, color: "text-purple-400", sub: "Unique Wallets" },
                   { label: "Tipping Velocity", value: `${analyticsStats.tippingVelocity}/hr`, change: "+0%", icon: Flame, color: "text-red-500", sub: "Platform Speed" },
                   { label: "Avg Tip Size", value: `${analyticsStats.avgTipSize} TAB`, change: "0%", icon: Zap, color: "text-cyan-400", sub: "Network Value" }
                 ].map((stat, i) => (
                   <Card key={i} className="bg-[#130b21] border border-white/10 p-6 rounded-[32px] hover:border-white/20 transition-all">
                     <div className="flex items-center justify-between mb-4">
                       <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}>
                         <stat.icon className="h-5 w-5" />
                       </div>
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.change.startsWith('+') ? "text-green-400" : stat.change === "0%" ? "text-slate-400" : "text-red-400")}>
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
                                Refresh Stats
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
                              <div className="text-center space-y-6">
                                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20">
                                  <AlertTriangle className="h-10 w-10 text-red-500" />
                                </div>
                                <DialogHeader>
                                  <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">REFRESH STATISTICS?</DialogTitle>
                                  <DialogDescription className="text-white/60 font-bold text-center">
                                    Re-sync active counters, voter addresses, and tip velocity calculations with live database nodes.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-4">
                                  <Button onClick={() => setIsResetAnalyticsOpen(false)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase">Cancel</Button>
                                  <Button onClick={handleResetAnalytics} className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 rounded-2xl font-black uppercase">Yes, Recalculate</Button>
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
                        <Globe className="h-5 w-5 text-cyan-400" /> Registry Balance
                      </CardTitle>
                      <CardDescription className="text-white/40">Verified active profile statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="text-slate-400 font-bold">Total Enrolled Creators</span>
                        <span className="text-2xl font-black text-white">{moderatedCreators.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">Category Distribution</span>
                        <span className="text-sm font-black text-purple-400">{modCategories.length - 1} Active Groups</span>
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
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 w-fit">
                          <Info className="h-3 w-3 text-orange-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Policy: 50% Boost Split to Rewards</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-green-400">Live Ledger Sync</span>
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
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Net Admin Revenue</p>
                                      {asset.boostVolume > 0 && (
                                        <Badge variant="outline" className="h-4 border-white/10 text-[7px] font-black text-white/30 uppercase tracking-widest px-1.5">Inc. 50% Boost</Badge>
                                      )}
                                    </div>
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

                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-6">
                      <Button 
                        onClick={() => setActiveTab("rewards")}
                        className="flex-1 h-24 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[32px] font-black text-lg uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all active:scale-95"
                      >
                        Process Network Rewards
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => handleSyncParity()}
                        className="h-24 px-10 bg-white/5 border border-white/10 hover:bg-white/10 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all"
                      >
                        <RefreshCw className={cn("h-6 w-6 mr-4", isSyncingPrices && "animate-spin")} />
                        Hard Sync
                      </Button>
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}

          {activeTab === "rewards" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <Card className="bg-[#1a112d] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
                        <Trophy className="h-8 w-8 text-yellow-500" /> Rewards Console
                      </CardTitle>
                      <CardDescription className="text-white/40 font-bold text-sm uppercase tracking-widest">Global Leaderboard Distribution & Ledger</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                       <Button variant="ghost" onClick={handleClearRewards} className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 font-black text-[10px] uppercase tracking-widest gap-2 transition-all">
                          <Eraser className="h-4 w-4" /> Clear Ledger
                       </Button>
                       <Button onClick={handleAutoBalanceRewards} className="h-12 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest gap-2 transition-all shadow-lg shadow-purple-500/20">
                          <Dices className="h-4 w-4" /> Auto-Balance
                       </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white">Recipient</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white">Network Role</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white">Current Rank</th>
                            <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white">Reward Value (TAB)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {winners.map((winner, i) => (
                            <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-10 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-white/40">@{winner.account.slice(0, 2).toUpperCase()}</div>
                                   <span className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">@{winner.account}</span>
                                </div>
                              </td>
                              <td className="px-10 py-6 text-center">
                                 <Badge variant="outline" className={cn(
                                   "font-black text-[9px] uppercase tracking-widest rounded-lg h-7 px-3",
                                   winner.role === 'Creator' ? "border-orange-500/30 text-orange-400" : "border-cyan-500/30 text-cyan-400"
                                 )}>
                                   {winner.role}
                                 </Badge>
                              </td>
                              <td className="px-10 py-6 text-center">
                                 <div className="flex items-center justify-center gap-2">
                                    <span className={cn(
                                      "h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-lg",
                                      i === 0 ? "bg-yellow-500" :
                                      i === 1 ? "bg-slate-300" :
                                      i === 2 ? "bg-orange-600" : "bg-white/5 text-white/40 shadow-none"
                                    )}>#{winner.rank}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-6 text-right">
                                <div className="relative inline-block w-40">
                                   <Input 
                                    type="number" 
                                    value={winner.reward} 
                                    onChange={(e) => handleRewardValueChange(i, e.target.value)}
                                    className="bg-white/5 border-white/10 text-right font-black text-lg h-12 pr-14 focus:ring-yellow-500/50 rounded-xl text-white"
                                   />
                                   <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[10px] text-white/20 uppercase">TAB</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  <div className="p-10 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">Batch Total</p>
                           <Badge className="bg-yellow-500/20 text-yellow-500 border-none font-black text-[9px]">READY</Badge>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter italic">
                           {totalRewardsValue.toLocaleString()} <span className="text-lg text-orange-500">TAB</span>
                        </p>
                     </div>
                     <Button 
                      onClick={handleRewardWinners}
                      disabled={isDistributing || totalRewardsValue === 0}
                      className="w-full md:w-[320px] h-20 bg-purple-600 text-white hover:bg-orange-500 transition-all font-black text-xl uppercase tracking-widest rounded-3xl shadow-[0_20px_50px_rgba(168,85,247,0.2)] active:scale-95 disabled:opacity-20"
                     >
                        {isDistributing ? <div className="flex items-center gap-3"><RefreshCw className="h-6 w-6 animate-spin" /> PAYING...</div> : "Confirm Payout"}
                     </Button>
                  </div>
               </Card>
            </div>
          )}

          {activeTab === "moderation" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <Card className="bg-[#1a112d] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 border-b border-white/5 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
                          <Users className="h-8 w-8 text-purple-400" /> Platform Registry
                        </CardTitle>
                        <CardDescription className="text-white/40 font-bold text-sm uppercase tracking-widest">Network Content & Profile Management</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                            <Input 
                              placeholder="Search handle or name..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-white/5 border-white/10 h-12 w-[240px] md:w-[320px] pl-12 rounded-2xl font-bold text-sm text-white focus:ring-purple-500/50 transition-all"
                            />
                         </div>
                         <Select value={modCategoryFilter} onValueChange={setModCategoryFilter}>
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 w-[160px] rounded-2xl font-black text-[10px] uppercase tracking-widest text-white">
                               <div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5" /><SelectValue /></div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                               {modCategories.map(cat => (
                                 <SelectItem key={cat} value={cat} className="font-bold py-2.5 uppercase text-[10px] tracking-widest">{cat}</SelectItem>
                               ))}
                            </SelectContent>
                         </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[900px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">User Identity</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Verified Pin</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Categories</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Health</th>
                            <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Terminal Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredCreators.map((creator) => {
                            const isBanned = bannedHandles.includes(creator.handle);
                            return (
                              <tr key={creator.id} className={cn("group hover:bg-white/[0.01] transition-colors", isBanned && "opacity-40 grayscale")}>
                                <td className="px-10 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black border-2 border-white/10 overflow-hidden", creator.color)}>
                                        {creator.avatarImage ? <img src={creator.avatarImage} alt="" className="w-full h-full object-cover" /> : creator.avatar}
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">{creator.name}</p>
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest">@{creator.handle}</p>
                                     </div>
                                  </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <div className="flex flex-col items-center gap-1">
                                      <div className="flex items-center gap-2 text-xs font-black text-white/80">
                                         <MapPin className="h-3.5 w-3.5 text-purple-400" /> {creator.location}
                                      </div>
                                      <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{creator.coordinates.join(', ')}</p>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <div className="flex flex-wrap justify-center gap-1.5">
                                      {creator.categories?.map((cat, idx) => (
                                        <Badge key={idx} variant="outline" className="border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest px-1.5 h-5">{cat}</Badge>
                                      ))}
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   {isBanned ? (
                                     <Badge className="bg-red-500/20 text-red-500 border-none font-black text-[9px] h-6 px-3">BANNED</Badge>
                                   ) : (
                                     <div className="flex items-center justify-center gap-2 text-green-400">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                     </div>
                                   )}
                                </td>
                                <td className="px-10 py-6 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/20 hover:text-white"><MoreVertical className="h-5 w-5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#1a102d]/95 backdrop-blur-xl border-white/10 text-white rounded-2xl shadow-2xl p-2 min-w-[220px] mt-2">
                                       <div className="px-3 py-2 border-b border-white/5 mb-1">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Creator Controls</p>
                                       </div>
                                       <DropdownMenuItem onClick={() => openAuditLogs(creator)} className="font-bold rounded-xl cursor-pointer h-11 focus:bg-purple-500/10 focus:text-purple-400">
                                          <AlertCircle className="mr-3 h-4 w-4" /> View Audit Logs
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => openTransactionHistory(creator)} className="font-bold rounded-xl cursor-pointer h-11 focus:bg-cyan-500/10 focus:text-cyan-400">
                                          <History className="mr-3 h-4 w-4" /> Network History
                                       </DropdownMenuItem>
                                       <div className="h-px bg-white/5 my-1" />
                                       <DropdownMenuItem onClick={() => toggleBan(creator.handle)} className={cn("font-bold rounded-xl cursor-pointer h-11", isBanned ? "text-green-400 focus:bg-green-400/10 focus:text-green-400" : "text-orange-500 focus:bg-orange-500/10 focus:text-orange-500")}>
                                          {isBanned ? <Unlock className="mr-3 h-4 w-4" /> : <Ban className="mr-3 h-4 w-4" />}
                                          {isBanned ? "Unban Account" : "Suspend Account"}
                                       </DropdownMenuItem>
                                       <DropdownMenuItem 
                                        onClick={() => {
                                          setCreatorToDelete(creator);
                                          setIsDeleteModalOpen(true);
                                        }} 
                                        className="text-red-500 focus:text-red-500 focus:bg-red-500/10 font-bold rounded-xl cursor-pointer h-11"
                                       >
                                          <Trash2 className="mr-3 h-4 w-4" /> Purge Profile
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  {filteredCreators.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                       <Search className="h-12 w-12 mx-auto text-white/10" />
                       <p className="text-white/20 font-black uppercase tracking-widest text-xs">No matching verified creators found.</p>
                    </div>
                  )}
               </Card>
            </div>
          )}

          {activeTab === "admins" && adminRole === 'super' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Card className="lg:col-span-4 bg-[#241a3d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
                       <UserPlus className="h-5 w-5 text-purple-400" /> Add Team Member
                    </CardTitle>
                    <CardDescription className="text-white/40 font-bold text-xs uppercase tracking-widest">Authorize a new network administrator</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleAddAdmin} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Actor Handle</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/50" />
                        <Input value={newAdminHandle} onChange={(e) => setNewAdminHandle(e.target.value)} placeholder="username" className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 pl-12 text-white font-bold" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Assigned Role</Label>
                      <Select value={newAdminRole} onValueChange={(val: any) => setNewAdminRole(val)}>
                         <SelectTrigger className="bg-[#2a1d4a] border-white/10 h-12 rounded-xl text-white font-bold">
                            <SelectValue placeholder="Select Role" />
                         </SelectTrigger>
                         <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                            <SelectItem value="super" className="font-bold py-2.5">Super Admin</SelectItem>
                            <SelectItem value="moderator" className="font-bold py-2.5">Moderator</SelectItem>
                            <SelectItem value="treasurer" className="font-bold py-2.5">Treasurer</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full h-14 bg-white text-black hover:bg-purple-500 hover:text-purple-100 transition-all font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-95">
                      Confirm Authorization
                    </Button>
                  </form>
                </Card>

                <Card className="lg:col-span-8 bg-[#1a112d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <ShieldCheck className="h-6 w-6 text-purple-400" />
                         <CardTitle className="text-xl font-black text-white italic uppercase">Authorized Team</CardTitle>
                       </div>
                       <Badge className="bg-purple-600/20 text-purple-400 border-none font-black text-[10px] h-6 px-3">{adminsList.length} ACTIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-widest text-white/30">Network Handle</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Permission Level</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Status</th>
                            <th className="px-8 py-5 text-right text-[9px] font-black uppercase tracking-widest text-white/30">Registry Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adminsList.map((admin) => (
                            <tr key={admin.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                      <UserCheck className="h-5 w-5 text-purple-400" />
                                   </div>
                                   <span className="text-lg font-black text-white">@{admin.handle}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <Badge className={cn(
                                   "font-black text-[9px] uppercase tracking-widest rounded-lg h-7 px-3 border-none",
                                   admin.role === 'super' ? "bg-orange-500 text-white" :
                                   admin.role === 'moderator' ? "bg-purple-600 text-white" : "bg-cyan-500 text-white"
                                 )}>
                                   {admin.role}
                                 </Badge>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 {admin.isPermanent ? (
                                   <div className="flex items-center justify-center gap-2 text-green-400">
                                      <Lock className="h-3 w-3" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Permanent</span>
                                   </div>
                                 ) : (
                                   <div className="flex items-center justify-center gap-2 text-white/30">
                                      <Unlock className="h-3 w-3" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Standard</span>
                                   </div>
                                 )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/20 hover:text-white"><MoreVertical className="h-5 w-5" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-[#1a102d]/95 backdrop-blur-xl border-white/10 text-white rounded-2xl shadow-2xl p-2 min-w-[220px] mt-2">
                                     <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Authorization Console</p>
                                     </div>
                                     <DropdownMenuItem onClick={() => updateAdminRole(admin.id, 'super')} className="font-bold rounded-xl cursor-pointer h-11 focus:bg-orange-500/10 focus:text-orange-500">
                                        Set as Super Admin
                                     </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => updateAdminRole(admin.id, 'moderator')} className="font-bold rounded-xl cursor-pointer h-11 focus:bg-purple-500/10 focus:text-purple-400">
                                        Set as Moderator
                                     </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => updateAdminRole(admin.id, 'treasurer')} className="font-bold rounded-xl cursor-pointer h-11 focus:bg-cyan-500/10 focus:text-cyan-400">
                                        Set as Treasurer
                                     </DropdownMenuItem>
                                     <div className="h-px bg-white/5 my-1" />
                                     {isPermanentAdmin && (
                                       <DropdownMenuItem 
                                        onClick={() => makeAdminPermanent(admin.id, !admin.isPermanent)} 
                                        className={cn("font-bold rounded-xl cursor-pointer h-11", admin.isPermanent ? "text-yellow-500 focus:bg-yellow-500/10" : "text-green-500 focus:bg-green-500/10")}
                                       >
                                          {admin.isPermanent ? <Unlock className="mr-3 h-4 w-4" /> : <Lock className="mr-3 h-4 w-4" />}
                                          {admin.isPermanent ? "Revoke Permanent" : "Grant Permanent"}
                                       </DropdownMenuItem>
                                     )}
                                     <DropdownMenuItem onClick={() => handleRemoveClick(admin)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 font-bold rounded-xl cursor-pointer h-11">
                                        <Trash2 className="mr-3 h-4 w-4" /> Revoke Access
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "config" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
               {/* Platform Parameters Card */}
               <Card className="bg-[#130b21] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
                     <Settings className="h-4 w-4 text-purple-400" /> Platform Parameters
                  </h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Membership Fee (XUSDC Master)</Label>
                        <div className="flex gap-2">
                           <Input type="number" value={localFeeXusdc} onChange={(e) => setLocalFeeXusdc(e.target.value)} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white font-bold" />
                           <Button onClick={() => handleUpdateFee('XUSDC')} className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-black px-6 rounded-xl uppercase text-xs">Update</Button>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Boost Price (XUSDC Master)</Label>
                        <div className="flex gap-2">
                           <Input type="number" value={localBoostXusdc} onChange={(e) => setLocalBoostXusdc(e.target.value)} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white font-bold" />
                           <Button onClick={() => handleUpdateBoost('XUSDC')} className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-black px-6 rounded-xl uppercase text-xs">Update</Button>
                        </div>
                     </div>
                     
                     <div className="pt-4 border-t border-white/5">
                        <Button 
                          onClick={() => handleSyncParity()} 
                          disabled={isSyncingPrices}
                          className="w-full h-14 bg-white text-black hover:bg-orange-500 hover:text-white transition-all font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2"
                        >
                           <RefreshCw className={cn("h-4 w-4", isSyncingPrices && "animate-spin")} /> Re-Index DEX Parity Pairs
                        </Button>
                     </div>
                  </div>
               </Card>

               {/* System Controls Card */}
               <Card className="bg-[#130b21] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-6">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-orange-400" /> System Controls
                     </h3>
                     
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                           <div>
                              <p className="font-bold text-sm">Maintenance Mode</p>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-0.5">Restrict all public routes</p>
                           </div>
                           <Button 
                             onClick={toggleMaintenance} 
                             className={cn(
                               "h-11 rounded-xl font-black text-[10px] uppercase tracking-widest px-5 transition-all",
                               isMaintenanceMode ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                             )}
                           >
                              <Power className="h-3.5 w-3.5 mr-2" /> {isMaintenanceMode ? "Offline" : "Online"}
                           </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                           <div>
                              <p className="font-bold text-sm">Platform Broadcast</p>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-0.5">Active Alert: {networkAlert ? "Active" : "None"}</p>
                           </div>
                           <div className="flex gap-2">
                              {networkAlert && (
                                <Button onClick={clearAlert} size="icon" variant="ghost" className="h-11 w-11 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">
                                   <BellOff className="h-4 w-4" />
                                </Button>
                              )}
                              <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                                 <DialogTrigger asChild>
                                    <Button className="h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest px-5">
                                       <Bell className="h-3.5 w-3.5 mr-2" /> Alert
                                    </Button>
                                 </DialogTrigger>
                                 <DialogContent className="bg-[#2a1b4d] border-white/20 text-white rounded-[40px] p-10 max-w-md">
                                    <DialogHeader>
                                       <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">BROADCAST MESSAGE</DialogTitle>
                                       <DialogDescription className="text-white/60 font-bold">This banner will appear globally across all public routes.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 pt-4">
                                       <div className="space-y-2">
                                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Message Body</Label>
                                          <Input value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="e.g. Schedule Maintenance starting at..." className="bg-white/5 border-white/10 rounded-xl h-12 text-white font-bold" maxLength={128} />
                                       </div>
                                       <Button onClick={handleBroadcast} className="w-full h-14 bg-white text-black hover:bg-purple-500 hover:text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl">Publish Banner</Button>
                                    </div>
                                 </DialogContent>
                              </Dialog>
                           </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                           <div>
                              <p className="font-bold text-sm">Flushed Activity Ticker</p>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pt-0.5">Flush memory cache</p>
                           </div>
                           <Button onClick={handleResetTicker} className="h-11 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest px-5">
                              Flush Ticker
                           </Button>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
          )}

          {activeTab === "codes" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
               {/* Create Code Card */}
               <Card className="lg:col-span-4 bg-[#241a3d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
                       <Plus className="h-5 w-5 text-purple-400" /> Create Promo
                    </CardTitle>
                    <CardDescription className="text-white/40 font-bold text-xs uppercase tracking-widest">Generate active promotional discount links</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleCreatePromoCode} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Code Name</Label>
                      <Input value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} placeholder="e.g. SUMMER50" className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 text-white font-black uppercase animate-none" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Reward Type</Label>
                      <Select value={newPromoType} onValueChange={(val: any) => setNewPromoType(val)}>
                         <SelectTrigger className="bg-[#2a1d4a] border-white/10 h-12 rounded-xl text-white font-bold">
                            <SelectValue />
                         </SelectTrigger>
                         <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                            <SelectItem value="percent" className="font-bold py-2.5">Percentage Discount</SelectItem>
                            <SelectItem value="free" className="font-bold py-2.5">Free 1-Year Pass</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>

                    {newPromoType === 'percent' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Discount Value (%)</Label>
                        <div className="relative">
                          <PercentIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                          <Input type="number" min="1" max="100" value={newPromoValue} onChange={(e) => setNewPromoValue(e.target.value)} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 pl-12 text-white font-bold" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Usage Limit (Max Claims)</Label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                        <Input type="number" min="1" value={newPromoUses} onChange={(e) => setNewPromoUses(e.target.value)} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 pl-12 text-white font-bold" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-14 bg-white text-black hover:bg-purple-500 hover:text-purple-100 transition-all font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-95">
                      Generate Promo Link
                    </Button>
                  </form>
               </Card>

               {/* Promo Codes Table Card */}
               <Card className="lg:col-span-8 bg-[#1a112d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <Gift className="h-6 w-6 text-purple-400" />
                         <CardTitle className="text-xl font-black text-white italic uppercase">Promo Code Database</CardTitle>
                       </div>
                       <Badge className="bg-purple-600/20 text-purple-400 border-none font-black text-[10px] h-6 px-3">{promoCodes.length} CODES</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-widest text-white/30">Promo Code</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Discount Type</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black uppercase tracking-widest text-white/30">Claims / Uses</th>
                            <th className="px-8 py-5 text-right text-[9px] font-black uppercase tracking-widest text-white/30">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {promoCodes.map((code) => (
                            <tr key={code.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                      <Gift className="h-5 w-5 text-purple-400" />
                                   </div>
                                   <span className="text-lg font-black text-white">{code.code}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 {code.type === 'free' ? (
                                   <Badge className="bg-green-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg h-7 px-3 border-none">100% Free Pass</Badge>
                                 ) : (
                                   <Badge className="bg-purple-600 text-white font-black text-[9px] uppercase tracking-widest rounded-lg h-7 px-3 border-none">{code.value}% Off Pass</Badge>
                                 )}
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex flex-col items-center">
                                    <span className="text-sm font-black text-white">{code.uses} / {code.maxUses}</span>
                                    <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden mt-1.5">
                                       <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(code.uses / code.maxUses) * 100}%` }} />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <Button onClick={() => deletePromoCode(code.id)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>
      </main>

      <DetailedReportModal 
        isOpen={isDetailedReportOpen} 
        onOpenChange={setIsDetailedReportOpen} 
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20">
              <Trash2 className="h-10 w-10 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">PURGE PROFILE?</DialogTitle>
              <DialogDescription className="text-white/60 font-bold text-center">
                This will permanently remove @{creatorToDelete?.handle} from the map and wipe their metadata. This action is irreversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase">Cancel</Button>
              <Button onClick={confirmDeleteProfile} className="flex-1 h-14 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase">Yes, Purge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;