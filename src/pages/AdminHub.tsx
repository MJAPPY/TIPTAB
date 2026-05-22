"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  X,
  FileText,
  History,
  HandCoins,
  Users,
  Trophy,
  Sparkles,
  Laptop,
  Gift,
  Plus,
  Trash2,
  UserPlus,
  ShieldCheck,
  UserCheck,
  HelpCircle,
  ShieldAlert as AlertIcon,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Heart,
  Timer,
  Server,
  LineChart,
  UserRoundCheck,
  Globe,
  ArrowUpRight,
  Flame,
  LayoutGrid,
  BellOff,
  Coins,
  RefreshCw,
  Scale
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
    { date: "2024-04-10", time: "11:05", event: "Membership Activated", actor: "System", type: "system" },
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
    distributeXprRewards,
    promoCodes,
    createPromoCode,
    deletePromoCode,
    actor,
    logout
  } = useXpr();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [localFee, setLocalFee] = useState(membershipFee || "2500");
  const [localFeeXmd, setLocalFeeXmd] = useState(membershipFeeXmd || "2.50");
  const [localFeeXusdc, setLocalFeeXusdc] = useState(membershipFeeXusdc || "2.50");
  
  const [localBoost, setLocalBoost] = useState(boostPrice || "1000");
  const [localBoostTab, setLocalBoostTab] = useState(boostTabPrice || "5000");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailedReportOpen, setIsDetailedReportOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [xprPrice, setXprPrice] = useState<number | null>(null);

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

  // Financial Sourced Calculations
  const boostRevenueTotal = 12500; 
  const activationRevenueTotal = 452500; 
  
  const rewardsPool = useMemo(() => boostRevenueTotal * 0.5, []);
  const adminBoostShare = useMemo(() => boostRevenueTotal * 0.5, []);
  const totalAdminRevenue = useMemo(() => activationRevenueTotal + adminBoostShare, [activationRevenueTotal, adminBoostShare]);

  useEffect(() => {
    if (membershipFee) setLocalFee(membershipFee);
    if (membershipFeeXmd) setLocalFeeXmd(membershipFeeXmd);
    if (membershipFeeXusdc) setLocalFeeXusdc(membershipFeeXusdc);
    if (boostPrice) setLocalBoost(boostPrice);
    if (boostTabPrice) setLocalBoostTab(boostTabPrice);
  }, [membershipFee, membershipFeeXmd, membershipFeeXusdc, boostPrice, boostTabPrice]);

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
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=usd");
      const data = await response.json();
      if (data.proton && data.proton.usd) {
        setXprPrice(data.proton.usd);
        return data.proton.usd;
      }
    } catch (e) {
      console.error("Price fetch failed", e);
    }
    return null;
  };

  const handleSyncParity = async () => {
    setIsSyncingPrices(true);
    const price = await fetchRates();
    if (price) {
      const targetUsd = parseFloat(localFeeXusdc);
      if (!isNaN(targetUsd)) {
        const calculatedXpr = (targetUsd / price).toFixed(0);
        const calculatedXmd = targetUsd.toFixed(2);
        
        setLocalFee(calculatedXpr);
        setLocalFeeXmd(calculatedXmd);
        
        toast({
          title: "Parity Calculated",
          description: `Rates adjusted based on XPR price of $${price.toFixed(4)}. Review and update individual assets.`,
        });
      }
    } else {
      toast({
        title: "Sync Failed",
        description: "Could not fetch current market rates.",
        variant: "destructive"
      });
    }
    setIsSyncingPrices(false);
  };

  const handleUpdateFee = (asset: 'XPR' | 'XMD' | 'XUSDC') => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update fees.", variant: "destructive" });
      return;
    }
    const val = asset === 'XPR' ? localFee : asset === 'XMD' ? localFeeXmd : localFeeXusdc;
    updateMembershipFee(val, asset);
    toast({ title: `${asset} Fee Updated`, description: `Global rate set to ${val} ${asset}.` });
  };

  const handleUpdateBoost = () => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update boost rates.", variant: "destructive" });
      return;
    }
    updateBoostPrice(localBoost);
    toast({ title: "Boost Price Updated", description: `Performance rate set to ${localBoost} XPR.` });
  };

  const handleUpdateBoostTab = () => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update TAB boost rates.", variant: "destructive" });
      return;
    }
    updateBoostTabPrice(localBoostTab);
    toast({ title: "TAB Boost Updated", description: `Performance rate set to ${localBoostTab} TAB.` });
  };

  const handleRewardWinners = async () => {
    const payoutTotal = winners.reduce((sum, item) => sum + parseFloat(item.reward || "0"), 0);
    if (payoutTotal > rewardsPool) {
      toast({
        title: "Over Limit",
        description: `Sum of rewards (${payoutTotal.toLocaleString()} XPR) exceeds the Live Boost rewards pool (${rewardsPool.toLocaleString()} XPR).`,
        variant: "destructive"
      });
      return;
    }

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
          description: `Successfully paid out ${payoutTotal.toLocaleString()} XPR to the winners.`,
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
          description: "You cannot revoke your own access because you are the only Permanent Super Admin remaining. Appoint another Permanent Super Admin first.",
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

  const confirmDeleteProfile = () => {
    if (!creatorToDelete) return;
    const handle = creatorToDelete.handle.replace('@', '').toLowerCase();
    setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
    localStorage.removeItem(`tiptab_profile_${handle}`);
    localStorage.removeItem(`tiptab_membership_${handle}`);
    localStorage.removeItem(`tiptab_membership_date_${handle}`);
    const savedUser = localStorage.getItem("tiptab_user_profile");
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as Creator;
      if (parsed.handle.replace('@', '').toLowerCase() === handle) {
        localStorage.removeItem("tiptab_user_profile");
      }
    }
    toast({
      title: "Profile Purged Successfully",
      description: `@${handle}'s profile and map registrations have been completely removed.`,
      variant: "destructive"
    });
    setIsDeleteModalOpen(false);
    setCreatorToDelete(null);
  };

  const filteredCreators = moderatedCreators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                   { label: "Active Members", value: "1,240", change: "+14%", icon: UserRoundCheck, color: "text-orange-400", sub: "Growth (MoM)" },
                   { label: "Supporter Base", value: "4,812", change: "+8%", icon: Users, color: "text-purple-400", sub: "Unique Wallets" },
                   { label: "Tipping Velocity", value: "84/hr", change: "+22%", icon: Flame, color: "text-red-500", sub: "Platform Speed" },
                   { label: "Avg Tip Size", value: "145 TAB", change: "-2%", icon: Zap, color: "text-cyan-400", sub: "Network Value" }
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
                            <LineChart className="h-5 w-5 text-purple-400" /> Adoption Velocity
                          </CardTitle>
                          <CardDescription className="text-white/40">Member totals and network expansion trends</CardDescription>
                        </div>
                        <Button 
                          onClick={() => setIsDetailedReportOpen(true)}
                          variant="ghost" 
                          className="h-10 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 gap-2 hover:bg-white/10 hover:text-white transition-all"
                        >
                           Detailed Report <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6 relative z-10">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">New Profiles (24h)</span>
                            </div>
                            <p className="text-4xl font-black text-white">28</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-orange-500 w-[65%]" />
                            </div>
                         </div>
                         <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Performance Boosts (24h)</span>
                            </div>
                            <p className="text-4xl font-black text-white">42</p>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-purple-500 w-[82%]" />
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
                        <p className="text-xl font-black text-white">12.4%</p>
                     </div>
                     <MousePointerClick className="h-8 w-8 text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === "treasury" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto">
                <Card className="bg-[#1a112d] border-[4px] border-slate-300/40 rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative group ring-2 ring-white/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
                  <CardHeader className="p-10 pb-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl md:text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white uppercase">
                        <Activity className="h-8 w-8 text-purple-500 animate-pulse" /> NETWORK TREASURY
                      </CardTitle>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Synced</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-10 relative z-10">
                    <div className="space-y-6 bg-white/5 p-8 rounded-[36px] border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[12px] font-black text-orange-500 uppercase tracking-[0.4em]">Rewards Pool (50% Boost Split)</p>
                          <p className="text-5xl font-black text-white tracking-tighter italic">{rewardsPool.toLocaleString()} <span className="text-orange-500 text-xl">XPR</span></p>
                        </div>
                        <Trophy className="h-12 w-12 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                      </div>
                      <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Sourced from Performance Boost Revenue</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-7 rounded-[28px] border border-white/10 flex items-center justify-between group hover:border-purple-500/40 transition-all">
                        <div className="space-y-1">
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-0.5">Admin Revenue (Net)</span>
                          <span className="text-3xl font-black text-purple-400 italic tracking-tight">{totalAdminRevenue.toLocaleString()} <span className="text-sm">XPR</span></span>
                        </div>
                        <HandCoins className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-7 rounded-[28px] border border-white/10 flex items-center justify-between group hover:border-orange-500/40 transition-all">
                        <div className="space-y-1">
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-0.5">Performance Boost Volume (Gross)</span>
                          <span className="text-3xl font-black text-white italic tracking-tight">{boostRevenueTotal.toLocaleString()} <span className="text-sm text-orange-500">XPR</span></span>
                        </div>
                        <Zap className="h-8 w-8 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>

                    <Button 
                      onClick={() => setActiveTab("rewards")}
                      className="w-full h-20 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                    >
                      Process Network Rewards
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
                    <CardDescription className="text-white/40 font-medium text-sm">Manage global parameters (Super Only)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-cyan-400">Master Asset: XUSDC</Label>
                           <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleSyncParity} 
                            disabled={isSyncingPrices || adminRole !== 'super'}
                            className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-2 text-slate-300"
                           >
                             <Scale className={cn("h-3.5 w-3.5", isSyncingPrices && "animate-spin")} />
                             Calculate Parity
                           </Button>
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
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-3">Sets base valuation. Use 'Calculate Parity' to sync XPR/XMD.</p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">XPR Activation Fee</Label>
                        <div className="flex gap-4">
                          <Input 
                            type="number" 
                            value={localFee} 
                            onChange={(e) => setLocalFee(e.target.value)}
                            disabled={adminRole !== 'super'}
                            className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white disabled:opacity-50"
                          />
                          <Button onClick={() => handleUpdateFee('XPR')} disabled={adminRole !== 'super'} className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">XMD Activation Fee</Label>
                        <div className="flex gap-4">
                          <Input 
                            type="number" 
                            value={localFeeXmd} 
                            onChange={(e) => setLocalFeeXmd(e.target.value)}
                            disabled={adminRole !== 'super'}
                            className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-purple-500/50 text-white disabled:opacity-50"
                          />
                          <Button onClick={() => handleUpdateFee('XMD')} disabled={adminRole !== 'super'} className="bg-purple-600 hover:bg-purple-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 pt-4 border-t border-white/5">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">XPR Boost Price</Label>
                        <div className="flex gap-4">
                          <Input 
                            type="number" 
                            value={localBoost} 
                            onChange={(e) => setLocalBoost(e.target.value)}
                            disabled={adminRole !== 'super'}
                            className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white disabled:opacity-50"
                          />
                          <Button onClick={handleUpdateBoost} disabled={adminRole !== 'super'} className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">TAB Boost Price</Label>
                        <div className="flex gap-4">
                          <Input 
                            type="number" 
                            value={localBoostTab} 
                            onChange={(e) => setLocalBoostTab(e.target.value)}
                            disabled={adminRole !== 'super'}
                            className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-purple-500/50 text-white disabled:opacity-50"
                          />
                          <Button onClick={handleUpdateBoostTab} disabled={adminRole !== 'super'} className="bg-purple-600 hover:bg-purple-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
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
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "codes" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Card className="lg:col-span-4 bg-[#241a3d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
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
                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Uses</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {promoCodes.map((promo) => (
                            <tr key={promo.id} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-8 py-6"><span className="font-black text-lg text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">{promo.code}</span></td>
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
              <Card className="bg-[#1a112d] border-white/10 rounded-[48px] overflow-hidden shadow-2xl relative">
                <CardHeader className="p-12 border-b border-white/5 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white flex items-center gap-4">
                      <Sparkles className="h-8 w-8 text-yellow-400" /> Leaderboard Rewards
                    </CardTitle>
                  </div>
                  <Button onClick={handleRewardWinners} disabled={isDistributing} className="bg-white text-black hover:bg-orange-500 hover:text-white font-black h-14 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all">{isDistributing ? "Wait..." : "Distribute"}</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-white/[0.03]">
                        <tr>
                          <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Rank</th>
                          <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Participant</th>
                          <th className="px-12 py-6 text-right text-[11px] font-black uppercase tracking-widest text-white/30">Reward (XPR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {winners.map((winner, index) => (
                          <tr key={winner.account} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-12 py-8"><span className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm bg-white/5 text-white/40">#{winner.rank}</span></td>
                            <td className="px-12 py-8"><span className="font-black text-lg text-white">@{winner.account}</span></td>
                            <td className="px-12 py-8 text-right"><Input type="number" value={winner.reward} onChange={(e) => handleRewardValueChange(index, e.target.value)} className="w-[120px] bg-white/5 border-white/10 text-right font-black rounded-xl h-10 px-4 text-white" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "moderation" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <Card className="bg-[#1a112d] border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
                <CardHeader className="p-12 border-b border-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white">Moderation</CardTitle>
                    <Input placeholder="Search creators..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-96 bg-[#2a1d4a] border-white/10 rounded-2xl h-14 text-white font-bold" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-[800px]">
                      <tbody className="divide-y divide-white/5">
                        {filteredCreators.map((creator) => (
                          <tr key={creator.id} className={cn("group hover:bg-white/[0.02] transition-colors", bannedHandles.includes(creator.handle) && "opacity-50")}>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/10 overflow-hidden shrink-0 shadow-lg", creator.color)}>
                                  {creator.avatarImage ? <img src={creator.avatarImage} alt="" className="w-full h-full object-cover" /> : creator.avatar}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-xl text-white tracking-tight">@{creator.handle}</span>
                                  <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{creator.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8 text-right space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleBan(creator.handle)} 
                                className={cn("h-11 w-11 rounded-xl transition-all", bannedHandles.includes(creator.handle) ? "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white" : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white")}
                              >
                                {bannedHandles.includes(creator.handle) ? <Unlock className="h-5.5 w-5.5" /> : <Ban className="h-5.5 w-5.5" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openAuditLogs(creator)} className="h-11 rounded-xl bg-white/5 text-white/40 hover:text-purple-400 gap-2 border border-white/5 font-black uppercase text-[10px] tracking-widest"><Activity className="h-4 w-4" /> Logs</Button>
                              <Button variant="ghost" size="sm" onClick={() => openTransactionHistory(creator)} className="h-11 rounded-xl bg-white/5 text-white/40 hover:text-cyan-400 gap-2 border border-white/5 font-black uppercase text-[10px] tracking-widest"><History className="h-4 w-4" /> History</Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-11 w-11 text-white/20 hover:text-white"><MoreVertical className="h-5 w-5" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#1a102d] border-white/10 text-white rounded-xl shadow-2xl p-2 min-w-[160px]">
                                  <DropdownMenuItem onClick={() => { setCreatorToDelete(creator); setIsDeleteModalOpen(true); }} className="text-red-500 focus:text-red-500 font-bold rounded-lg cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete Profile</DropdownMenuItem>
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
          )}

          {activeTab === "admins" && adminRole === 'super' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Card className="lg:col-span-4 bg-[#241a3d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8">
                  <form onSubmit={handleAddAdmin} className="space-y-6">
                    <Label className="text-[10px] font-black uppercase text-white/50">Handle</Label>
                    <Input value={newAdminHandle} onChange={(e) => setNewAdminHandle(e.target.value)} placeholder="username" className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 text-white" />
                    <Button type="submit" className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-xs">Add Admin</Button>
                  </form>
                </Card>
                <Card className="lg:col-span-8 bg-[#1a112d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <tbody className="divide-y divide-white/5">
                      {adminsList.map((admin) => (
                        <tr key={admin.id} className="hover:bg-white/[0.01]">
                          <td className="px-8 py-6 text-white font-black">@{admin.handle}</td>
                          <td className="px-8 py-6 text-right"><Button variant="ghost" size="icon" onClick={() => handleRemoveClick(admin)} className="h-10 w-10 text-red-500"><Trash2 className="h-4.5 w-4.5" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              {(MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || []).map((log, i) => (
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
              {(!MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || MOCK_AUDIT_LOGS[selectedCreator?.handle || ""].length === 0) && (
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