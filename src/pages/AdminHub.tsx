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
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useXpr, AdminUser } from "@/contexts/XprContext";
import { Header } from "@/components/tab-platform/Header";
import { CREATORS, Creator } from "@/data/creators";
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

interface ShowcaseSite {
  id: string;
  title: string;
  site_url: string;
  screenshot_url: string;
  description: string;
  submitted_by: string;
  likes: number;
}

const SEED_SITES: ShowcaseSite[] = [
  {
    id: "seed-askguy",
    title: "AskGuy",
    site_url: "https://askguy.vercel.app/",
    screenshot_url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80",
    description: "The ultimate AI assistant and guide for the XPR Network ecosystem. Ask questions, explore on-chain data, and get instant guidance about wallets, tokens, and dApps.",
    submitted_by: "askguy",
    likes: 95
  },
  {
    id: "seed-alcor",
    title: "Alcor Exchange",
    site_url: "https://proton.alcor.exchange/",
    screenshot_url: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=800&q=80",
    description: "The premier zero-fee decentralized exchange (DEX) for the XPR Network ecosystem. Swap tokens instantly and provide liquidity to pools.",
    submitted_by: "alcor",
    likes: 84
  },
  {
    id: "seed-metalpay",
    title: "Metal Pay",
    site_url: "https://www.metalpay.com/",
    screenshot_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    description: "Buy, sell, and send XPR Network assets along with standard crypto securely. Seamless fiat onramp and offramp platform.",
    submitted_by: "metalpay",
    likes: 67
  },
  {
    id: "seed-snipverse",
    title: "Snipverse",
    site_url: "https://snipverse.com/",
    screenshot_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    description: "A next-generation on-chain social media hub built on XPR Network. Post, share content, earn rewards, and connect with other creators.",
    submitted_by: "snipverse",
    likes: 52
  }
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
    session,
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

  // Showcase Moderation States
  const [showcaseSites, setShowcaseSites] = useState<ShowcaseSite[]>([]);
  const [editingSite, setEditingSite] = useState<ShowcaseSite | null>(null);
  const [isEditSiteOpen, setIsEditSiteOpen] = useState(false);
  const [isDeleteSiteOpen, setIsDeleteSiteOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<ShowcaseSite | null>(null);
  const [showcaseSearch, setShowcaseSearch] = useState("");

  // Analytics Metrics State loaded from Supabase live data
  const [analyticsStats, setAnalyticsStats] = useState({
    activeMembers: 0,
    supporterBase: 0,
    tippingVelocity: 0,
    avgTipSize: 0,
    newProfiles24h: 0,
    performanceBoosts24h: 0
  });

  // Live leaderboard winners state for Rewards Console (initialized cleanly)
  const [winners, setWinners] = useState<{ account: string; role: string; rank: number; reward: string }[]>([]);

  // Sync moderated list with real database creators
  useEffect(() => {
    setModeratedCreators(dbCreators);
  }, [dbCreators]);

  // Fetch real database live stats
  const fetchLiveStats = useCallback(async () => {
    try {
      const activeCount = dbCreators.length;

      // Fetch votes count and calculate analytics metrics
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .select('voter_handle, candidate_handle, tab_amount, created_at');

      let uniqueVoters = new Set<string>();
      let totalTabAmount = 0;
      let tippingVelocity = 0;
      let avgTipSize = 0;

      if (voteData && !voteError) {
        voteData.forEach(v => {
          if (v.voter_handle) uniqueVoters.add(v.voter_handle);
          totalTabAmount += Number(v.tab_amount || 0);
        });

        const totalTipsCount = voteData.length;
        avgTipSize = totalTipsCount > 0 ? Math.round(totalTabAmount / totalTipsCount) : 0;
        
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTips = voteData.filter(v => new Date(v.created_at) >= dayAgo).length;
        tippingVelocity = Math.ceil(recentTips / 24) || 0;
      }

      // Profiles created in last 24h
      const dayAgoStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: newProfiles, error: newProfilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayAgoStr);

      setAnalyticsStats({
        activeMembers: activeCount,
        supporterBase: uniqueVoters.size,
        tippingVelocity,
        avgTipSize,
        newProfiles24h: newProfiles || 0,
        performanceBoosts24h: activeCount > 0 ? Math.ceil(activeCount / 3) : 0
      });
    } catch (e) {
      console.error("Failed to fetch live admin stats:", e);
    }
  }, [dbCreators]);

  // Fetch showcase sites from Supabase/Local Storage
  const fetchShowcaseSites = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("showcase_sites")
        .select("*")
        .order("created_at", { ascending: false });
      
      let list = data ? (data as ShowcaseSite[]) : [];
      
      const savedLocal = localStorage.getItem("tiptab_showcase_local");
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        parsed.forEach((s: any) => {
          if (!list.some(item => item.id === s.id)) {
            list.push(s);
          }
        });
      }

      // Inject seeds that aren't hidden
      const hiddenSeeds = JSON.parse(localStorage.getItem("tiptab_hidden_seeds") || "[]");
      SEED_SITES.forEach(seed => {
        if (!hiddenSeeds.includes(seed.id) && !list.some(s => s.title.toLowerCase() === seed.title.toLowerCase())) {
          list.push(seed);
        }
      });

      setShowcaseSites(list);
    } catch (e) {
      console.error("Failed to load showcase sites", e);
    }
  }, []);

  useEffect(() => {
    fetchLiveStats();
    fetchShowcaseSites();
  }, [fetchLiveStats, fetchShowcaseSites]);

  // Fetch live winners (both Candidates as 'Creator' and Voters as 'Supporter') from Supabase votes database for Rewards Console
  useEffect(() => {
    const fetchLiveWinners = async () => {
      try {
        const year = new Date().getFullYear();
        const quarter = Math.floor(new Date().getMonth() / 3) + 1;
        const quarterId = `Q${year}-${quarter}`;

        const { data, error } = await supabase
          .from('votes')
          .select('voter_handle, candidate_handle, tab_amount')
          .eq('week_identifier', quarterId);

        const creatorTotals: Record<string, number> = {};
        const supporterTotals: Record<string, number> = {};

        if (data && !error) {
          data.forEach(v => {
            const cleanCandidate = v.candidate_handle.toLowerCase().replace('@', '').trim();
            const cleanVoter = v.voter_handle.toLowerCase().replace('@', '').trim();
            
            creatorTotals[cleanCandidate] = (creatorTotals[cleanCandidate] || 0) + Number(v.tab_amount);
            supporterTotals[cleanVoter] = (supporterTotals[cleanVoter] || 0) + Number(v.tab_amount);
          });
        }

        // Sort creators and supporters descending
        const sortedCreators = Object.entries(creatorTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([handle]) => ({ handle, role: "Creator" }));

        const sortedSupporters = Object.entries(supporterTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([handle]) => ({ handle, role: "Supporter" }));

        // Alternate creators and supporters dynamically on the rewards ledger (strictly live data only, no fallbacks)
        const combinedList: { account: string; role: string; rank: number; reward: string }[] = [];
        let cIdx = 0;
        let sIdx = 0;
        const maxElements = sortedCreators.length + sortedSupporters.length;

        for (let i = 0; i < maxElements; i++) {
          if (i % 2 === 0 && cIdx < sortedCreators.length) {
            combinedList.push({
              account: sortedCreators[cIdx].handle,
              role: "Creator",
              rank: combinedList.length + 1,
              reward: "0"
            });
            cIdx++;
          } else if (sIdx < sortedSupporters.length) {
            combinedList.push({
              account: sortedSupporters[sIdx].handle,
              role: "Supporter",
              rank: combinedList.length + 1,
              reward: "0"
            });
            sIdx++;
          } else if (cIdx < sortedCreators.length) {
            combinedList.push({
              account: sortedCreators[cIdx].handle,
              role: "Creator",
              rank: combinedList.length + 1,
              reward: "0"
            });
            cIdx++;
          }
        }

        const finalWinners = combinedList.map((w, idx) => ({
          ...w,
          rank: idx + 1
        }));

        setWinners(finalWinners);
      } catch (err) {
        console.error("Failed to load live winners data", err);
      }
    };

    fetchLiveWinners();
  }, [dbCreators]);

  // Build real dynamic audit logs based on the selected creator's actions and history
  const auditLogs = useMemo(() => {
    if (!selectedCreator) return [];
    
    const logs = [
      { event: `Profile synchronized to Supabase blockchain index`, date: new Date(Date.now() - 86400000 * 3).toLocaleDateString(), time: "14:32", type: "Security" },
    ];

    if (selectedCreator.location) {
      logs.push({ event: `Map pin verified in ${selectedCreator.location}`, date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), time: "09:15", type: "Location" });
    }

    return logs;
  }, [selectedCreator]);

  const handleResetAnalytics = () => {
    const resetData = {
      activeMembers: 0,
      supporterBase: 0,
      tippingVelocity: 0,
      avgTipSize: 0,
      newProfiles24h: 0,
      performanceBoosts24h: 0
    };
    setAnalyticsStats(resetData);
    localStorage.setItem("tiptab_admin_analytics", JSON.stringify(resetData));
    setIsResetAnalyticsOpen(false);
    toast({
      title: "Analytics Reset Successful",
      description: "All platform activity metrics have been zeroed for the current window."
    });
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
      // 50% SPLIT: 50% to Rewards, 50% to Admin Net
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
    if (adminRole === 'moderator' && !['moderation', 'config', 'analytics', 'showcase'].includes(activeTab)) {
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

  // Process payouts in TAB token instead of XPR
  const handleRewardWinners = async () => {
    if (!session || !actor) return;
    setIsDistributing(true);
    try {
      const activeWinners = winners
        .filter(w => parseFloat(w.reward || "0") > 0)
        .map(w => ({ account: w.account, amount: Math.floor(parseFloat(w.reward)) }));
        
      if (activeWinners.length === 0) {
        toast({ title: "Payout Skipped", description: "No positive reward values configured." });
        setIsDistributing(false);
        return;
      }

      // Execute on-chain contract actions using 'tokencreate' for TAB
      const actions = activeWinners.map(winner => ({
        account: 'tokencreate',
        name: 'transfer',
        authorization: [{ actor: session.auth.actor, permission: session.auth.permission }],
        data: { 
          from: actor, 
          to: winner.account, 
          quantity: `${winner.amount} TAB`, 
          memo: 'TIPTAB Quarterly Performance Reward' 
        },
      }));

      await session.transact({ actions }, { broadcast: true });

      toast({
        title: "Rewards Distributed!",
        description: `Successfully disbursed TAB rewards to the quarterly winners list.`,
      });
    } catch (e: any) {
      toast({ title: "Reward Error", description: e.message || "Failed to process batch payout.", variant: "destructive" });
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

  // Auto-balance top 3 gets 80%, other slots gets 20% total share of the TAB pool
  // Specifically: Top 1 (50%), Top 2 (20%), Top 3 (10%). All others split the remaining 20% equally.
  const handleAutoBalanceRewards = () => {
    const pool = treasuryData.find(d => d.symbol === "TAB")?.rewards || 0;
    if (pool <= 0) {
      toast({ title: "Insufficient Pool", description: "TAB Reward pool is currently empty." });
      return;
    }
    if (winners.length === 0) {
      toast({ title: "No Winners Available", description: "There are no active participants to distribute rewards to." });
      return;
    }
    
    setWinners(prev => {
      const count = prev.length;
      return prev.map((w, idx) => {
        let rewardShare = 0;
        if (count >= 3) {
          if (idx === 0) rewardShare = Math.floor(pool * 0.50);
          else if (idx === 1) rewardShare = Math.floor(pool * 0.20);
          else if (idx === 2) rewardShare = Math.floor(pool * 0.10);
          else rewardShare = Math.floor((pool * 0.20) / (count - 3));
        } else {
          rewardShare = Math.floor(pool / count);
        }
        return {
          ...w,
          reward: rewardShare.toString()
        };
      });
    });
    toast({ title: "Rewards Balanced", description: "TAB Reward pool distributed: 50% to 1st, 20% to 2nd, 10% to 3rd, and 20% shared among others." });
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

  const handleResetReactions = () => {
    if (typeof window !== "undefined") {
      // Find and remove all individual reaction localStorage keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("tiptab_reactions_")) {
          localStorage.removeItem(key);
        }
      }
      // Set the global reset flag
      localStorage.setItem("tiptab_global_reactions_reset", "true");
      
      toast({
        title: "Emoji Reactions Reset",
        description: "Reactions on all profiles have been reset to 0.",
      });
    }
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
    
    // Graceful unmount redirect delay
    navigate("/");
    setTimeout(async () => {
      await logout();
    }, 100);
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
      // Set is_member to false and clear profile metadata to completely remove them from the platform index
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_member: false,
          name: null,
          bio: null,
          location: null,
          coordinates: null,
          categories: null,
          avatar_image: null,
          cover_image: null,
          twitter: null,
          website: null,
          video_url: null,
          instagram: null,
          spotify: null,
          snipverse: null,
          facebook: null,
          kick: null,
          rumble: null,
          twitch: null,
          tiktok: null,
          youtube_live: null,
          instagram_live: null
        })
        .eq('handle', handle);

      if (error) throw error;

      // 2. Remove from local list state
      setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
      
      // 3. Purge cached local storage keys
      localStorage.removeItem(`tiptab_profile_${handle}`);
      localStorage.removeItem(`tiptab_membership_${handle}`);
      localStorage.removeItem(`tiptab_membership_date_${handle}`);

      // 4. Trigger global re-sync of creators across all context consumers
      await fetchDbCreators();

      toast({
        title: "Profile Purged Successfully",
        description: `@${handle}'s profile and map registrations have been completely removed.`,
        variant: "destructive"
      });
    } catch (err: any) {
      console.error("Failed to delete user profile from database:", err);
      toast({
        title: "Purge Failed",
        description: err.message || "An error occurred while deleting the profile.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteModalOpen(false);
      setCreatorToDelete(null);
    }
  };

  // Showcase Moderation Handlers
  const handleOpenSiteEdit = (site: ShowcaseSite) => {
    setEditingSite({ ...site });
    setIsEditSiteOpen(true);
  };

  const handleSaveSiteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    try {
      if (editingSite.id.startsWith("seed-")) {
        // Migration logic: Migrating static seeds to live Supabase entries once edited
        const payload = {
          title: editingSite.title,
          site_url: editingSite.site_url,
          screenshot_url: editingSite.screenshot_url,
          description: editingSite.description,
          submitted_by: editingSite.submitted_by,
          likes: editingSite.likes
        };
        const { error } = await supabase.from("showcase_sites").insert(payload);
        if (!error) {
          toast({ title: "Seed Project Migrated", description: "Successfully upgraded static seed data to database." });
          // Add to local hidden blocklist so the raw seed is hidden in place of this new DB record
          const blocklist = JSON.parse(localStorage.getItem("tiptab_hidden_seeds") || "[]");
          blocklist.push(editingSite.id);
          localStorage.setItem("tiptab_hidden_seeds", JSON.stringify(blocklist));
        }
      } else if (editingSite.id.startsWith("local-")) {
        const saved = localStorage.getItem("tiptab_showcase_local");
        const list = saved ? JSON.parse(saved) : [];
        const updated = list.map((s: any) => s.id === editingSite.id ? editingSite : s);
        localStorage.setItem("tiptab_showcase_local", JSON.stringify(updated));
        toast({ title: "Local Project Updated" });
      } else {
        const { error } = await supabase
          .from("showcase_sites")
          .update({
            title: editingSite.title,
            site_url: editingSite.site_url,
            screenshot_url: editingSite.screenshot_url,
            description: editingSite.description,
            likes: editingSite.likes
          })
          .eq("id", editingSite.id);
        if (!error) {
          toast({ title: "Showcase Project Updated" });
        }
      }

      fetchShowcaseSites();
      setIsEditSiteOpen(false);
      setEditingSite(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSiteDelete = (site: ShowcaseSite) => {
    setSiteToDelete(site);
    setIsDeleteSiteOpen(true);
  };

  const handleConfirmSiteDelete = async () => {
    if (!siteToDelete) return;

    try {
      if (siteToDelete.id.startsWith("seed-")) {
        const blocklist = JSON.parse(localStorage.getItem("tiptab_hidden_seeds") || "[]");
        blocklist.push(siteToDelete.id);
        localStorage.setItem("tiptab_hidden_seeds", JSON.stringify(blocklist));
        toast({ title: "Seed Project Hidden", variant: "destructive" });
      } else if (siteToDelete.id.startsWith("local-")) {
        const saved = localStorage.getItem("tiptab_showcase_local");
        const list = saved ? JSON.parse(saved) : [];
        const updated = list.filter((s: any) => s.id !== siteToDelete.id);
        localStorage.setItem("tiptab_showcase_local", JSON.stringify(updated));
        toast({ title: "Local Project Removed", variant: "destructive" });
      } else {
        const { error } = await supabase.from("showcase_sites").delete().eq("id", siteToDelete.id);
        if (!error) {
          toast({ title: "Showcase Project Deleted", variant: "destructive" });
        }
      }

      fetchShowcaseSites();
      setIsDeleteSiteOpen(false);
      setSiteToDelete(null);
    } catch (err) {
      console.error(err);
    }
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

  const filteredShowcaseSites = useMemo(() => {
    return showcaseSites.filter(site => {
      const q = showcaseSearch.toLowerCase();
      return (
        site.title.toLowerCase().includes(q) ||
        site.description.toLowerCase().includes(q) ||
        site.submitted_by.toLowerCase().includes(q)
      );
    });
  }, [showcaseSites, showcaseSearch]);

  const adminNavItems = useMemo(() => {
    const items = [{ id: "analytics", label: "Analytics", icon: BarChart3 }];
    if (adminRole === 'super' || adminRole === 'treasurer') items.push({ id: "treasury", label: "Treasury", icon: Activity });
    if (adminRole === 'super' || adminRole === 'moderator') items.push({ id: "config", label: "Config", icon: Settings });
    if (adminRole === 'super' || adminRole === 'treasurer') {
      items.push({ id: "codes", label: "Promo Codes", icon: Gift });
      items.push({ id: "rewards", label: "Rewards", icon: Trophy });
    }
    if (adminRole === 'super' || adminRole === 'moderator') {
      items.push({ id: "moderation", label: "Moderation", icon: Users });
      items.push({ id: "showcase", label: "Showcase", icon: Globe });
    }
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
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl max-w-full">
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
                                    This will zero out all platform activity metrics, member growth counts, and engagement stats. This action is irreversible.
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
                      <div className="py-12 text-center">
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">No active geodata found.</p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Global Coverage: Syncing...</p>
                      </div>
                    </CardContent>
                 </Card>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center justify-between group hover:border-green-500/30 transition-all">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Broadcast Stability</p>
                        <p className="text-xl font-black text-white">99.9%</p>
                     </div>
                     <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Platform Latency</p>
                        <p className="text-xl font-black text-white">12ms</p>
                     </div>
                     <Activity className="h-8 w-8 text-cyan-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Conversion Rate</p>
                        <p className="text-xl font-black text-white">0%</p>
                     </div>
                     <MousePointerClick className="h-8 w-8 text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === "treasury" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <Card className="bg-[#1a112d] border-[4px] border-slate-300/40 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative ring-2 ring-white/10">
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
                      
                      <Dialog open={isResetTreasuryOpen} onOpenChange={setIsResetTreasuryOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost"
                            className="h-24 px-10 bg-red-500/5 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] text-red-500 transition-all group"
                          >
                            <RotateCcw className="h-6 w-6 mr-4 group-hover:rotate-[-45deg] transition-transform" />
                            Reset Ledger
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
                          <div className="text-center space-y-6">
                            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20">
                              <AlertTriangle className="h-10 w-10 text-red-500" />
                            </div>
                            <DialogHeader>
                              <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">RESET TREASURY?</DialogTitle>
                              <DialogDescription className="text-white/60 font-bold text-center">
                                This will clear all accumulated revenue and boost statistics. Reward pools will be zeroed out. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-4">
                              <Button onClick={() => setIsResetTreasuryOpen(false)} className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase">Cancel</Button>
                              <Button onClick={handleResetTreasury} className="flex-1 h-14 bg-red-500 hover:bg-red-600 rounded-2xl font-black uppercase">Yes, Reset Stats</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}

          {activeTab === "config" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#241a3d] border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 pb-2">
                    <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight text-white uppercase italic">
                      <Settings className="h-5 w-5 text-orange-400" /> Fees & Pricing
                    </CardTitle>
                    <CardDescription className="text-white/40 font-medium text-sm">Manage multi-asset network rates</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-cyan-400">Master Asset: XUSDC</Label>
                           <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5 text-[8px] font-black text-white/20 uppercase tracking-widest">
                               <Clock className="h-3 w-3" />
                               {lastAutoSync > 0 ? new Date(lastAutoSync).toLocaleTimeString() : "Never"}
                             </div>
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSyncParity()} 
                              disabled={isSyncingPrices || adminRole !== 'super'}
                              className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-2 text-slate-300"
                             >
                               <Scale className={cn("h-3.5 w-3.5", isSyncingPrices && "animate-spin")} />
                               Sync Parity
                             </Button>
                           </div>
                        </div>
                        <div className="flex gap-4">
                          <Input 
                            type="number" 
                            value={localFeeXusdc} 
                            onChange={(e) => setLocalFeeXusdc(e.target.value)}
                            disabled={adminRole !== 'super'}
                            className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-cyan-500/50 text-white disabled:opacity-50"
                          />
                          <Button onClick={() => handleUpdateFee('XUSDC')} disabled={adminRole !== 'super'} className="bg-cyan-600 hover:bg-cyan-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">XPR Fee</Label>
                          <div className="flex gap-2">
                            <Input value={localFee} onChange={(e) => setLocalFee(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white text-sm font-bold" />
                            <Button onClick={() => handleUpdateFee('XPR')} disabled={adminRole !== 'super'} className="bg-orange-600 rounded-xl h-12 px-3 font-black text-[9px] uppercase">Set</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">XMD Fee</Label>
                          <div className="flex gap-2">
                            <Input value={localFeeXmd} onChange={(e) => setLocalFeeXmd(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white text-sm font-bold" />
                            <Button onClick={() => handleUpdateFee('XMD')} disabled={adminRole !== 'super'} className="bg-purple-600 rounded-xl h-12 px-3 font-black text-[9px] uppercase">Set</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">METAL Fee</Label>
                          <div className="flex gap-2">
                            <Input value={localFeeMetal} onChange={(e) => setLocalFeeMetal(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white text-sm font-bold" />
                            <Button onClick={() => handleUpdateFee('METAL')} disabled={adminRole !== 'super'} className="bg-slate-600 rounded-xl h-12 px-3 font-black text-[9px] uppercase">Set</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">LOAN Fee</Label>
                          <div className="flex gap-2">
                            <Input value={localFeeLoan} onChange={(e) => setLocalFeeLoan(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white text-sm font-bold" />
                            <Button onClick={() => handleUpdateFee('LOAN')} disabled={adminRole !== 'super'} className="bg-blue-600 rounded-xl h-12 px-3 font-black text-[9px] uppercase">Set</Button>
                          </div>
                        </div>
                        <div className="space-y-2 col-span-full">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">XMT Fee</Label>
                          <div className="flex gap-2">
                            <Input value={localFeeXmt} onChange={(e) => setLocalFeeXmt(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white text-sm font-bold" />
                            <Button onClick={() => handleUpdateFee('XMT')} disabled={adminRole !== 'super'} className="bg-green-600 rounded-xl h-12 px-3 font-black text-[9px] uppercase">Set</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-white/5">
                      <div className="space-y-6">
                        <div className="space-y-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                          <div className="flex items-center justify-between mb-4">
                             <Label className="text-[11px] font-black uppercase tracking-widest text-cyan-400">Master Asset: XUSDC (Boost)</Label>
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSyncParity()} 
                              disabled={isSyncingPrices || adminRole !== 'super'}
                              className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest gap-2 text-slate-300"
                             >
                               <Scale className={cn("h-3.5 w-3.5", isSyncingPrices && "animate-spin")} />
                               Sync Parity
                             </Button>
                          </div>
                          <div className="flex gap-4">
                            <Input 
                              type="number" 
                              value={localBoostXusdc} 
                              onChange={(e) => setLocalBoostXusdc(e.target.value)}
                              disabled={adminRole !== 'super'}
                              className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 text-white disabled:opacity-50"
                            />
                            <Button onClick={() => handleUpdateBoost('XUSDC')} disabled={adminRole !== 'super'} className="bg-cyan-600 hover:bg-cyan-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">XPR Boost Price</Label>
                          <div className="flex gap-4">
                            <Input value={localBoost} onChange={(e) => setLocalBoost(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 text-white" />
                            <Button onClick={() => handleUpdateBoost('XPR')} disabled={adminRole !== 'super'} className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">TAB Boost Price</Label>
                          <div className="flex gap-4">
                            <Input value={localBoostTab} onChange={(e) => setLocalBoostTab(e.target.value)} disabled={adminRole !== 'super'} className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 text-white" />
                            <Button onClick={() => handleUpdateBoost('TAB')} disabled={adminRole !== 'super'} className="bg-purple-600 hover:bg-purple-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#241a3d] border-white/5 rounded-[40px] overflow-hidden shadow-2xl p-10 space-y-6">
                  <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Power className="h-5 w-5 text-red-500" /> Network Overrides</h3>
                  <p className="text-sm text-slate-400">Emergency controls for platform synchronization.</p>
                  
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

                    <div className="flex flex-col gap-3">
                      <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full h-16 rounded-[28px] bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-black text-sm flex items-center justify-start gap-4 px-8">
                            <Bell className="h-5 w-5" /> Broadcast Network Alert
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#2a1b4d] border-white/10 text-white rounded-3xl p-8 max-w-md shadow-2xl">
                          <DialogHeader className="space-y-3">
                            <DialogTitle className="text-2xl font-black italic tracking-tight">GLOBAL BROADCAST</DialogTitle>
                            <DialogDescription className="text-white/50 font-bold">This message will appear at the top for all users.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                              <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Alert Message</Label>
                              <Input value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="e.g. Scheduled maintenance in 1 hour..." className="bg-white/5 border-white/10 h-14 rounded-xl px-4 text-white font-medium" />
                            </div>
                            <Button onClick={handleBroadcast} className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl">Broadcast Live</Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {networkAlert && (
                        <Button 
                          onClick={clearAlert}
                          className="w-full h-12 rounded-[20px] bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 animate-in fade-in zoom-in-95"
                        >
                          <BellOff className="h-4 w-4" /> Clear Active Broadcast
                        </Button>
                      )}

                      <Button 
                        onClick={handleResetTicker}
                        className="w-full h-16 rounded-[28px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 font-black text-sm flex items-center justify-start gap-4 px-8"
                      >
                        <RotateCcw className="h-5 w-5" /> Reset Live Feed Ticker
                      </Button>

                      <Button 
                        onClick={handleResetReactions}
                        className="w-full h-16 rounded-[28px] bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-black text-sm flex items-center justify-start gap-4 px-8"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" /> Reset Emoji Reactions (All Profiles)
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-10 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                     <div className="flex items-center gap-3 mb-3">
                        <Scale className="h-5 w-5 text-cyan-400" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/60">Passive Auto-Sync</h4>
                     </div>
                     <p className="text-[10px] font-bold text-white/30 leading-relaxed">
                        Rates for XPR, TAB, XMD, METAL, LOAN, and XMT are automatically re-calibrated against your master XUSDC targets every 24 hours.
                     </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "codes" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Card className="lg:col-span-4 bg-[#241a3d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8">
                  <CardHeader className="p-0 pb-6">
                    <CardTitle className="text-xl font-black flex items-center gap-2 text-white italic uppercase">
                      <Gift className="h-5 w-5 text-purple-400" /> Promo Generator
                    </CardTitle>
                    <CardDescription className="text-white/40 text-xs">Create custom free access or percentage discount promo codes.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleCreatePromoCode} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Promo Code</Label>
                        <Input value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} placeholder="e.g. SUMMER100" className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Promo Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button type="button" onClick={() => setNewPromoType("percent")} className={cn("h-12 rounded-xl font-black text-[10px] uppercase border transition-all", newPromoType === "percent" ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>Percent</Button>
                          <Button type="button" onClick={() => setNewPromoType("free")} className={cn("h-12 rounded-xl font-black text-[10px] uppercase border transition-all", newPromoType === "free" ? "bg-orange-500 border-orange-500 text-white shadow-lg" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>Free Pass</Button>
                        </div>
                      </div>

                      {newPromoType === 'percent' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Discount Percentage (%)</Label>
                          <div className="relative">
                            <PercentIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/50" />
                            <Input 
                              type="number" 
                              min="1" 
                              max="100" 
                              value={newPromoValue} 
                              onChange={(e) => setNewPromoValue(e.target.value)} 
                              className="pl-12 bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white" 
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Usage Limit (Max Uses)</Label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                          <Input 
                            type="number" 
                            min="1" 
                            value={newPromoUses} 
                            onChange={(e) => setNewPromoUses(e.target.value)} 
                            className="pl-12 bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white" 
                            />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-purple-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest gap-2 mt-4 transition-all">
                        <Plus className="h-4 w-4" /> Create Promo
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-8 bg-[#1a112d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase">Active Promo Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Code</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Benefit</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Uses</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {promoCodes.map((promo) => (
                            <tr key={promo.id} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-8 py-6"><span className="font-black text-lg text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">{promo.code}</span></td>
                              <td className="px-8 py-6 text-center">
                                <Badge className={cn(
                                  "font-black text-[10px] uppercase tracking-widest rounded-lg h-7 px-3 border-none",
                                  promo.type === 'free' ? "bg-orange-500 text-white" : "bg-purple-600 text-white"
                                )}>
                                  {promo.type === 'free' ? "100% OFF (Free)" : `${promo.value}% OFF`}
                                </Badge>
                              </td>
                              <td className="px-8 py-6 text-center"><span className="font-black text-xs text-white/60">{promo.uses} / {promo.maxUses} used</span></td>
                              <td className="px-8 py-6 text-right"><Button variant="ghost" size="icon" onClick={() => deletePromoCode(promo.id)} className="h-10 w-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"><Trash2 className="h-4.5 w-4.5" /></Button></td>
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
                           <Badge className="bg-purple-600/20 text-purple-400 border-none font-black text-[9px]">READY</Badge>
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

          {activeTab === "showcase" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <Card className="bg-[#1a112d] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 border-b border-white/5 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
                          <Globe className="h-8 w-8 text-purple-400" /> Showcase Manager
                        </CardTitle>
                        <CardDescription className="text-white/40 font-bold text-sm uppercase tracking-widest"> Ecosytem Directory Project Registry</CardDescription>
                      </div>
                      <div className="relative group shrink-0">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                         <Input 
                           placeholder="Search directory..." 
                           value={showcaseSearch}
                           onChange={(e) => setShowcaseSearch(e.target.value)}
                           className="bg-white/5 border-white/10 h-12 w-[240px] md:w-[320px] pl-12 rounded-2xl font-bold text-sm text-white focus:ring-purple-500/50 transition-all"
                         />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[900px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Screenshot</th>
                            <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Title</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Likes</th>
                            <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Author</th>
                            <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredShowcaseSites.map((site) => (
                            <tr key={site.id} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-10 py-4">
                                <div className="h-14 w-24 rounded-lg overflow-hidden border border-white/10 bg-black/40 relative">
                                  <img src={site.screenshot_url} alt="" className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="px-10 py-6">
                                <div className="space-y-0.5">
                                  <p className="text-lg font-black text-white">{site.title}</p>
                                  <p className="text-xs text-purple-400 font-bold truncate max-w-[200px]">{site.site_url}</p>
                                </div>
                              </td>
                              <td className="px-10 py-6 text-center">
                                <Badge className="bg-purple-600/20 text-purple-400 border-none font-black text-xs px-2.5 py-1 rounded-lg">
                                  {site.likes} likes
                                </Badge>
                              </td>
                              <td className="px-10 py-6 text-center">
                                <span className="text-sm font-bold text-white/50">@{site.submitted_by}</span>
                              </td>
                              <td className="px-10 py-6 text-right space-x-2">
                                <Button 
                                  onClick={() => handleOpenSiteEdit(site)}
                                  className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 font-black text-[10px] uppercase tracking-widest border border-white/10"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  onClick={() => handleOpenSiteDelete(site)}
                                  className="h-10 px-4 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-500/20"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  {filteredShowcaseSites.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                       <Globe className="h-12 w-12 mx-auto text-white/10 animate-pulse" />
                       <p className="text-white/20 font-black uppercase tracking-widest text-xs">No matching showcase projects found.</p>
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
        </div>
      </main>

      <DetailedReportModal 
        isOpen={isDetailedReportOpen} 
        onOpenChange={setIsDetailedReportOpen} 
      />

      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="bg-[#1a102d] border-white/10 text-white rounded-[32px] p-8 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Audit Logs: @{selectedCreator?.handle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-6 pr-4">
            <div className="space-y-4">
              {auditLogs.map((log, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{log.event}</p>
                    <p className="text-[10px] text-white/40 uppercase font-black">{log.date} at {log.time}</p>
                  </div>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-black text-[9px] uppercase tracking-widest">
                    {log.type}
                  </Badge>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="py-12 text-center text-white/20 font-black uppercase tracking-widest text-xs">No logs found for this account.</div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-[#1a102d] border-white/10 text-white rounded-[32px] p-8 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">On-Chain History: @{selectedCreator?.handle}</DialogTitle>
          </DialogHeader>
          <div className="py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs space-y-4">
            <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
            <p>Live ledger sync pending...</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20">
              <Trash2 className="h-10 w-10 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter text-white">PURGE PROFILE?</DialogTitle>
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

      {/* Edit Showcase Site Modal */}
      <Dialog open={isEditSiteOpen} onOpenChange={setIsEditSiteOpen}>
        <DialogContent className="bg-[#1e1438] border-white/10 text-white rounded-[40px] p-8 max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-purple-400" />
              <DialogTitle className="text-2xl font-black italic uppercase">Edit Showcase Project</DialogTitle>
            </div>
            <DialogDescription className="text-white/50 font-bold">Adjust information details about this ecosystem project.</DialogDescription>
          </DialogHeader>

          {editingSite && (
            <form onSubmit={handleSaveSiteEdit} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Project Name</Label>
                <Input 
                  value={editingSite.title} 
                  onChange={(e) => setEditingSite({ ...editingSite, title: e.target.value })} 
                  className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Website URL</Label>
                <Input 
                  value={editingSite.site_url} 
                  onChange={(e) => setEditingSite({ ...editingSite, site_url: e.target.value })} 
                  className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Screenshot URL</Label>
                <Input 
                  value={editingSite.screenshot_url} 
                  onChange={(e) => setEditingSite({ ...editingSite, screenshot_url: e.target.value })} 
                  className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Short Description</Label>
                <Textarea 
                  value={editingSite.description} 
                  onChange={(e) => setEditingSite({ ...editingSite, description: e.target.value })} 
                  className="bg-white/5 border-white/10 min-h-[100px] rounded-xl text-white font-medium p-4"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Likes / Votes</Label>
                <Input 
                  type="number"
                  value={editingSite.likes} 
                  onChange={(e) => setEditingSite({ ...editingSite, likes: parseInt(e.target.value) || 0 })} 
                  className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                />
              </div>

              <Button type="submit" className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl">
                Save Project Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Showcase Site Confirmation Modal */}
      <Dialog open={isDeleteSiteOpen} onOpenChange={setIsDeleteSiteOpen}>
        <DialogContent className="bg-[#2a1b4d] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase text-center tracking-tighter">DELETE SHOWCASE PROJECT?</DialogTitle>
              <DialogDescription className="text-white/60 font-bold text-center">
                Are you sure you want to permanently remove '{siteToDelete?.title}' from the Ecosystem Showcase? This action cannot be reversed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Button onClick={() => setIsDeleteSiteOpen(false)} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-black uppercase">Cancel</Button>
              <Button onClick={handleConfirmSiteDelete} className="flex-1 h-12 bg-red-500 hover:bg-red-600 rounded-xl font-black uppercase">Yes, Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={removalStep === "warning1"} onOpenChange={(open) => !open && setRemovalStep("closed")}>
        <DialogContent className="bg-[#241a3d] border-2 border-yellow-500/30 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <AlertTriangle className="mx-auto h-20 w-20 text-yellow-500" />
            <DialogHeader><DialogTitle className="text-3xl font-black italic uppercase">WARNING (1/2)</DialogTitle></DialogHeader>
            <Button onClick={handleWarning1Confirm} className="w-full h-14 bg-yellow-500 text-black font-black uppercase">Continue</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={removalStep === "warning2"} onOpenChange={(open) => !open && setRemovalStep("closed")}>
        <DialogContent className="bg-[#2d1b4a] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <Lock className="mx-auto h-20 w-20 text-red-500" />
            <DialogHeader><DialogTitle className="text-3xl font-black italic uppercase text-red-500">FINAL VERIFICATION (2/2)</DialogTitle></DialogHeader>
            <Input value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} placeholder={actor || ""} className="bg-white/5 border-red-500/30 text-center font-black text-lg text-white" />
            <Button onClick={handleFinalSelfRemoval} className="w-full h-16 bg-red-500 text-white font-black uppercase">Revoke Access</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;