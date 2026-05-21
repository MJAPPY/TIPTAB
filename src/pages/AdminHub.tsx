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
  UserRoundCheck
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
    updateMembershipFee,
    boostPrice,
    updateBoostPrice,
    distributeXprRewards,
    promoCodes,
    createPromoCode,
    deletePromoCode,
    actor,
    logout
  } = useXpr();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("treasury");
  const [localFee, setLocalFee] = useState(membershipFee || "2500");
  const [localBoost, setLocalBoost] = useState(boostPrice || "500");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);

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
  const boostRevenueTotal = 12500; // Static mock baseline for performance boosts
  const activationRevenueTotal = 452500; // Static mock baseline for memberships
  
  const rewardsPool = useMemo(() => boostRevenueTotal * 0.5, []);
  const adminBoostShare = useMemo(() => boostRevenueTotal * 0.5, []);
  const totalAdminRevenue = useMemo(() => activationRevenueTotal + adminBoostShare, [activationRevenueTotal, adminBoostShare]);

  useEffect(() => {
    if (membershipFee) setLocalFee(membershipFee);
    if (boostPrice) setLocalBoost(boostPrice);
  }, [membershipFee, boostPrice]);

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

  // Adjust active tab if current admin permission is restricted
  useEffect(() => {
    if (adminRole === 'moderator' && activeTab !== 'moderation' && activeTab !== 'config') {
      setActiveTab("moderation");
    } else if (adminRole === 'treasurer' && activeTab !== 'treasury' && activeTab !== 'codes' && activeTab !== 'rewards') {
      setActiveTab("treasury");
    }
  }, [adminRole, activeTab]);

  const handleUpdateFee = () => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update fees.", variant: "destructive" });
      return;
    }
    updateMembershipFee(localFee);
    toast({ title: "Activation Fee Updated", description: `Global rate set to ${localFee} XPR.` });
  };

  const handleUpdateBoost = () => {
    if (adminRole !== 'super') {
      toast({ title: "Unauthorized", description: "Only Super Admins can update boost rates.", variant: "destructive" });
      return;
    }
    updateBoostPrice(localBoost);
    toast({ title: "Boost Price Updated", description: `Performance rate set to ${localBoost} XPR.` });
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
    toast({ title: "Alert Cleared" });
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

  // Admin Add Handler
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

  // Safe Removal Verification Flow
  const handleRemoveClick = (admin: AdminUser) => {
    if (!isPermanentAdmin) return;
    
    // Check if the administrator is trying to remove themselves
    const isSelf = admin.handle === actor;

    if (isSelf) {
      // Prevent self removal if they are the ONLY permanent admin left
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

  // Permanent purge of a moderated profile
  const confirmDeleteProfile = () => {
    if (!creatorToDelete) return;
    
    const handle = creatorToDelete.handle.replace('@', '').toLowerCase();
    
    // Update local state in AdminHub list
    setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
    
    // Purge local storage records so they are removed from interactive map on reload
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

  // Filter administration tabs based on individual permissions
  const adminNavItems = useMemo(() => {
    const items = [];
    
    if (adminRole === 'super' || adminRole === 'treasurer') {
      items.push({ id: "treasury", label: "Treasury", icon: Activity });
    }
    
    // Config / Maintenance toggles are super / mod tasks
    if (adminRole === 'super' || adminRole === 'moderator') {
      items.push({ id: "config", label: "Config", icon: Settings });
    }

    if (adminRole === 'super' || adminRole === 'treasurer') {
      items.push({ id: "codes", label: "Promo Codes", icon: Gift });
      items.push({ id: "rewards", label: "Rewards", icon: Trophy });
    }

    if (adminRole === 'super' || adminRole === 'moderator') {
      items.push({ id: "moderation", label: "Moderation", icon: Users });
    }

    // Only Super Admins can add or configure administrator slots
    if (adminRole === 'super') {
      items.push({ id: "admins", label: "Admins", icon: ShieldCheck });
    }

    return items;
  }, [adminRole]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden">
      <Header />

      {/* Background decoration */}
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
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">Hub</span>
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

        {/* State-controlled tabs rendering for 100% robust rendering */}
        <div className="w-full">
          {/* Treasury Tab */}
          {activeTab === "treasury" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <Card className="md:col-span-12 lg:col-span-6 bg-[#1a112d] border-[4px] border-slate-300/40 rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative group ring-2 ring-white/10 h-full">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
                  <CardHeader className="p-8 pb-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl md:text-2xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                        <Activity className="h-6 w-6 text-purple-500 animate-pulse" /> NETWORK TREASURY
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
                  <CardContent className="p-8 pt-0 space-y-8 relative z-10">
                    
                    {/* Rewards Sourced only from live boost 50% split */}
                    <div className="space-y-4 bg-white/5 p-6 rounded-[28px] border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em]">Rewards Pool (50% Boost Split)</p>
                          <p className="text-4xl font-black text-white tracking-tighter italic">{rewardsPool.toLocaleString()} <span className="text-orange-500 text-lg">XPR</span></p>
                        </div>
                        <Trophy className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Live Boost Sourced Only</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-0.5">Admin Revenue (100% Membership + 50% Boost)</span>
                          <span className="text-xl font-black text-purple-400 italic">{totalAdminRevenue.toLocaleString()} <span className="text-xs">XPR</span></span>
                        </div>
                        <HandCoins className="h-5 w-5 text-purple-400" />
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-0.5">Performance Boost Revenue</span>
                          <span className="text-xl font-black text-white italic">{boostRevenueTotal.toLocaleString()} <span className="text-xs text-orange-500">XPR</span></span>
                        </div>
                        <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
                      </div>
                    </div>

                    <Button 
                      onClick={() => setActiveTab("rewards")}
                      className="w-full h-16 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
                    >
                      Go To Rewards Panel
                    </Button>
                  </CardContent>
                </Card>

                {/* Network Growth Analytics Section */}
                <div className="md:col-span-12 lg:col-span-6 space-y-6">
                  <Card className="bg-[#1a112d] border border-white/10 rounded-[40px] p-8 space-y-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <TrendingUp className="h-48 w-48 text-white" />
                    </div>
                    <CardHeader className="p-0 relative z-10">
                      <CardTitle className="text-xl font-black flex items-center gap-3 text-white uppercase italic">
                        <LineChart className="h-5 w-5 text-cyan-400" /> Growth & Adoption
                      </CardTitle>
                      <CardDescription className="text-white/40">Member totals and network expansion velocity</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 group hover:border-orange-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <UserRoundCheck className="h-3.5 w-3.5 text-orange-400" /> Total Verified Members
                        </span>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">1,240</span>
                          <span className="text-[9px] font-black text-orange-400 mb-1 flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" /> 14%</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Growth (MoM)</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 group hover:border-purple-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-purple-400" /> Supporter Network
                        </span>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">4,812</span>
                          <span className="text-[9px] font-black text-purple-400 mb-1 flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" /> 8%</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Total unique wallets</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 group hover:border-green-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-green-400" /> Member Conversion
                        </span>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">25.7%</span>
                          <span className="text-[9px] font-black text-green-400 mb-1 uppercase tracking-tighter">Healthy</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Supporter to member ratio</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 group hover:border-cyan-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Retention Rate
                        </span>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">94%</span>
                          <span className="text-[9px] font-black text-cyan-400 mb-1 uppercase tracking-tighter">Elite</span>
                        </div>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Yearly renewal velocity</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Health Section */}
                  <Card className="bg-[#1a112d] border border-white/10 rounded-[40px] p-8 space-y-6 overflow-hidden">
                    <CardHeader className="p-0">
                      <CardTitle className="text-xl font-black flex items-center gap-3 text-white uppercase italic">
                        <Laptop className="h-5 w-5 text-orange-400" /> Performance Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">API Latency</p>
                        <p className="text-xl font-black text-green-400">142ms <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter ml-1">avg</span></p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Node Sync</p>
                        <p className="text-xl font-black text-white">100% <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter ml-1">Live</span></p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Config Tab */}
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
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Activation Fee (XPR)</Label>
                      <div className="flex gap-4">
                        <Input 
                          type="number" 
                          value={localFee} 
                          onChange={(e) => setLocalFee(e.target.value)}
                          disabled={adminRole !== 'super'}
                          className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white disabled:opacity-50"
                        />
                        <Button onClick={handleUpdateFee} disabled={adminRole !== 'super'} className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Performance Boost (XPR)</Label>
                      <div className="flex gap-4">
                        <Input 
                          type="number" 
                          value={localBoost} 
                          onChange={(e) => setLocalBoost(e.target.value)}
                          disabled={adminRole !== 'super'}
                          className="bg-[#2a1d4a] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white disabled:opacity-50"
                        />
                        <Button onClick={handleUpdateBoost} disabled={adminRole !== 'super'} className="bg-purple-600 hover:bg-purple-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
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
                      <Button onClick={clearAlert} variant="ghost" className="w-full h-16 rounded-[28px] bg-red-500/5 border border-red-500/20 text-red-500 font-black text-sm flex items-center justify-start gap-4 px-8">
                        <X className="h-5 w-5" /> Clear Current Alert
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Promo Codes Tab */}
          {activeTab === "codes" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Promo Generator Card */}
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
                        <Input 
                          value={newPromoCode} 
                          onChange={(e) => setNewPromoCode(e.target.value)}
                          placeholder="e.g. SUMMER100" 
                          className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Promo Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            type="button"
                            onClick={() => setNewPromoType("percent")}
                            className={cn(
                              "h-12 rounded-xl font-black text-[9px] xs:text-[10px] uppercase tracking-normal border transition-all px-1.5 xs:px-2.5",
                              newPromoType === "percent" 
                                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20" 
                                : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                            )}
                          >
                            Percent Discount
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => setNewPromoType("free")}
                            className={cn(
                              "h-12 rounded-xl font-black text-[9px] xs:text-[10px] uppercase tracking-normal border transition-all px-1.5 xs:px-2.5",
                              newPromoType === "free" 
                                ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                                : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                            )}
                          >
                            Free Access
                          </Button>
                        </div>
                      </div>

                      {newPromoType === "percent" && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Discount Percentage (%)</Label>
                          <Input 
                            type="number"
                            value={newPromoValue} 
                            onChange={(e) => setNewPromoValue(e.target.value)}
                            placeholder="e.g. 50" 
                            min="1"
                            max="100"
                            className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Max Usage Limit</Label>
                        <Input 
                          type="number"
                          value={newPromoUses} 
                          onChange={(e) => setNewPromoUses(e.target.value)}
                          placeholder="e.g. 100" 
                          min="1"
                          className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white"
                        />
                      </div>

                      <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-purple-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest gap-2 mt-4 transition-all">
                        <Plus className="h-4 w-4" /> Create Promo
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Active Promos List */}
                <Card className="lg:col-span-8 bg-[#1a112d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase">Active Promo Codes</CardTitle>
                    <CardDescription className="text-white/40 text-xs">Manage active discounts and distribution.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Code</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Type</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Discount</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Redemptions</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {promoCodes.length > 0 ? (
                            promoCodes.map((promo) => (
                              <tr key={promo.id} className="group hover:bg-white/[0.01] transition-colors">
                                <td className="px-8 py-6">
                                  <span className="font-black text-lg text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">{promo.code}</span>
                                </td>
                                <td className="px-8 py-6">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]",
                                    promo.type === 'free' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  )}>
                                    {promo.type === 'free' ? "Free Pass" : "Percent Off"}
                                  </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                  <span className="font-black text-base text-white">{promo.type === 'free' ? '100%' : `${promo.value}%`}</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                  <span className="font-black text-xs text-white/60">{promo.uses} / {promo.maxUses} used</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      deletePromoCode(promo.id);
                                      toast({ title: "Promo Deleted", description: `Promo code ${promo.code} has been deactivated.` });
                                    }}
                                    className="h-10 w-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-white/20 font-black italic text-lg">
                                NO ACTIVE PROMO CODES
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === "rewards" && (adminRole === 'super' || adminRole === 'treasurer') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <Card className="bg-[#1a112d] border-white/10 rounded-[48px] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Trophy className="h-64 w-64 text-white" />
                </div>
                <CardHeader className="p-12 border-b border-white/5 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white flex items-center gap-4">
                      <Sparkles className="h-8 w-8 text-yellow-400" /> Leaderboard Rewards
                    </CardTitle>
                    <CardDescription className="text-white/40 font-medium text-sm">
                      Enter custom reward payout amounts. Total cannot exceed rewards pool of {rewardsPool.toLocaleString()} XPR.
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleRewardWinners}
                    disabled={isDistributing}
                    className="bg-white text-black hover:bg-orange-500 hover:text-white font-black h-14 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all"
                  >
                    {isDistributing ? "Processing Payouts..." : "Batch Distribute Rewards"}
                  </Button>
                </CardHeader>
                <CardContent className="p-0 relative z-10">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-white/[0.03]">
                        <tr>
                          <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Rank</th>
                          <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Participant</th>
                          <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Role</th>
                          <th className="px-12 py-6 text-right text-[11px] font-black uppercase tracking-widest text-white/30">Edit Reward (XPR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {winners.map((winner, index) => (
                          <tr key={winner.account} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-12 py-8">
                              <span className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                                winner.rank === 1 ? "bg-yellow-400 text-black" : 
                                winner.rank === 2 ? "bg-slate-300 text-black" :
                                winner.rank === 3 ? "bg-orange-700 text-white" :
                                "bg-white/5 text-white/40"
                              )}>
                                #{winner.rank}
                              </span>
                            </td>
                            <td className="px-12 py-8">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-black text-purple-400 border border-purple-500/30">
                                  {winner.account.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-black text-lg text-white">@{winner.account}</span>
                              </div>
                            </td>
                            <td className="px-12 py-8">
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                                {winner.role}
                              </span>
                            </td>
                            <td className="px-12 py-8 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <Input 
                                  type="number" 
                                  value={winner.reward}
                                  onChange={(e) => handleRewardValueChange(index, e.target.value)}
                                  className="w-[120px] bg-white/5 border-white/10 text-right font-black rounded-xl h-10 px-4 text-white focus:ring-orange-500/50"
                                />
                                <span className="text-[10px] font-black text-orange-500 uppercase">XPR</span>
                              </div>
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

          {/* Moderation Tab */}
          {activeTab === "moderation" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <Card className="bg-[#1a112d] border-white/10 rounded-[48px] overflow-hidden shadow-2xl min-h-[600px]">
                <CardHeader className="p-12 border-b border-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white">Network Moderation</CardTitle>
                      <CardDescription className="text-white/40 font-medium text-sm">Review and manage participant status</CardDescription>
                    </div>
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                      <Input placeholder="Search handles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-16 bg-[#2a1d4a] border-white/10 rounded-2xl h-14 focus:ring-purple-500/50 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-white/[0.03]">
                        <tr>
                          <th className="px-10 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Creator Profile</th>
                          <th className="px-10 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Category</th>
                          <th className="px-10 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Node Status</th>
                          <th className="px-10 py-6 text-right text-[11px] font-black uppercase tracking-widest text-white/30">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCreators.map((creator) => {
                          const isBanned = bannedHandles.includes(creator.handle);
                          const membershipKey = `tiptab_membership_${creator.handle.replace('@', '')}`;
                          const isPaidMember = localStorage.getItem(membershipKey) === 'true' || creator.handle === 'tiptab';
                          
                          return (
                            <tr key={creator.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-5">
                                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-sm font-black border-2 border-white/10 text-white shrink-0 shadow-lg", creator.color)}>
                                    {creator.avatar}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-black text-lg text-white truncate">{creator.name}</p>
                                    <p className="text-xs text-purple-400 font-bold tracking-wider truncate">@{creator.handle}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/60">
                                  {creator.category}
                                </span>
                              </td>
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-2">
                                  {isBanned ? (
                                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 font-black text-[11px] uppercase tracking-widest">
                                      <Lock className="h-3 w-3" /> Terminated
                                    </div>
                                  ) : isPaidMember ? (
                                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 font-black text-[11px] uppercase tracking-widest">
                                      <CheckCircle2 className="h-3 w-3" /> Verified Member
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-white/20 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 font-black text-[11px] uppercase tracking-widest">
                                      <Users className="h-3 w-3" /> Guest
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <Button variant="ghost" size="icon" onClick={() => toggleBan(creator.handle)} className={cn("h-12 w-12 rounded-xl transition-all border border-white/10", isBanned ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                    {isBanned ? <Unlock className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-white/30 border border-white/10">
                                        <MoreVertical className="h-5 w-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 bg-[#2a1b4d]/98 backdrop-blur-xl border-white/20 text-white rounded-[24px] p-2.5 shadow-2xl">
                                      <DropdownMenuItem onClick={() => openTransactionHistory(creator)} className="rounded-xl cursor-pointer px-4 py-3 gap-4">
                                        <History className="h-5 w-5" />
                                        <span className="font-black text-sm uppercase">View History</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openAuditLogs(creator)} className="rounded-xl cursor-pointer px-4 py-3 gap-4">
                                        <FileText className="h-5 w-5" />
                                        <span className="font-black text-sm uppercase">Audit Logs</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setCreatorToDelete(creator);
                                          setIsDeleteModalOpen(true);
                                        }} 
                                        className="rounded-xl cursor-pointer px-4 py-3 gap-4 text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                      >
                                        <Trash2 className="h-5 w-5" />
                                        <span className="font-black text-sm uppercase">Delete Profile</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admins Management Tab (Super Only) */}
          {activeTab === "admins" && adminRole === 'super' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Alert lock panel if logged in super admin is NOT a Permanent Super Admin */}
              {!isPermanentAdmin && (
                <div className="p-6 rounded-[28px] bg-orange-500/10 border-2 border-orange-500/30 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Lock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-orange-400 uppercase tracking-wider text-sm">Permissions Restricted</h4>
                    <p className="text-slate-300 font-bold text-xs mt-0.5">
                      You are authenticated as a Super Admin. However, only **Permanent Super Admins** possess permissions to appoint, revoke, or modify administrator accounts.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Add New Admin Form */}
                <Card className="lg:col-span-4 bg-[#241a3d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 pb-2">
                    <CardTitle className="text-xl font-black flex items-center gap-2 text-white italic uppercase">
                      <UserPlus className="h-5 w-5 text-purple-400" /> Appoint Admin
                    </CardTitle>
                    <CardDescription className="text-white/40 text-xs">Authorize another WebAuth address with specific network permissions.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleAddAdmin} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">WebAuth Handle / Account Name</Label>
                        <Input 
                          value={newAdminHandle} 
                          onChange={(e) => setNewAdminHandle(e.target.value)}
                          disabled={!isPermanentAdmin}
                          placeholder={isPermanentAdmin ? "e.g. kofibuilds" : "Permanent Admin Only"} 
                          className="bg-[#2a1d4a] border-white/10 rounded-xl h-12 px-4 focus:ring-purple-500/50 font-black text-white disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Permission Role</Label>
                        <Select 
                          value={newAdminRole} 
                          onValueChange={(val: any) => setNewAdminRole(val)}
                          disabled={!isPermanentAdmin}
                        >
                          <SelectTrigger className="w-full bg-[#2a1d4a] border-white/10 h-12 rounded-xl font-bold text-xs text-white disabled:opacity-50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2a1b4d] border-white/20 text-white rounded-xl">
                            <SelectItem value="super" className="font-bold py-2 cursor-pointer">Super Admin</SelectItem>
                            <SelectItem value="moderator" className="font-bold py-2 cursor-pointer">Moderator</SelectItem>
                            <SelectItem value="treasurer" className="font-bold py-2 cursor-pointer">Treasurer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> Permissions Overview
                        </span>
                        <p className="text-[10px] text-white/50 font-bold leading-relaxed">
                          {newAdminRole === 'super' && "All privileges. Modify activation fees, grant/revoke other admin accesses, toggle emergency locks, and distribute batch rewards."}
                          {newAdminRole === 'moderator' && "Access to Moderation boards. Restored/ban network creators, audit logs, and toggle network overrides."}
                          {newAdminRole === 'treasurer' && "Access to Financial Treasury. Distribute leaderboard batch rewards, edit payout lists, and create/manage promotion codes."}
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={!isPermanentAdmin}
                        className="w-full h-12 bg-white text-black hover:bg-purple-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest gap-2 mt-4 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" /> Appoint Admin
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Admins Table List */}
                <Card className="lg:col-span-8 bg-[#1a112d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-xl font-black text-white italic uppercase">Authorized Administrators</CardTitle>
                    <CardDescription className="text-white/40 text-xs">Manage active team authorizations and modify security permissions.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-white/[0.03]">
                          <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Account</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Permission Scope</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-white/30">Type</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Management</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adminsList.map((admin) => (
                            <tr key={admin.id} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30 text-[10px] font-black text-purple-400">
                                    {admin.handle.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-black text-base text-white">@{admin.handle}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <Select 
                                  value={admin.role} 
                                  disabled={!isPermanentAdmin}
                                  onValueChange={(val: any) => {
                                    updateAdminRole(admin.id, val);
                                    toast({ title: "Role Modified", description: `@${admin.handle} changed to ${val}.` });
                                  }}
                                >
                                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 h-10 rounded-xl font-bold text-xs text-white disabled:opacity-50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2a1b4d] border-white/20 text-white rounded-xl">
                                    <SelectItem value="super" className="font-bold py-2 cursor-pointer">Super Admin</SelectItem>
                                    <SelectItem value="moderator" className="font-bold py-2 cursor-pointer">Moderator</SelectItem>
                                    <SelectItem value="treasurer" className="font-bold py-2 cursor-pointer">Treasurer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-8 py-6 text-center">
                                {admin.role === 'super' ? (
                                  <Button
                                    variant="ghost"
                                    disabled={!isPermanentAdmin}
                                    onClick={() => {
                                      const nextStatus = !admin.isPermanent;
                                      makeAdminPermanent(admin.id, nextStatus);
                                      toast({
                                        title: nextStatus ? "Owner Level Authorized" : "Owner Level Revoked",
                                        description: `@${admin.handle} updated status.`,
                                      });
                                    }}
                                    className={cn(
                                      "h-8 px-3.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all",
                                      admin.isPermanent 
                                        ? "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
                                        : "bg-white/5 text-white/30 border-transparent hover:text-white"
                                    )}
                                  >
                                    {admin.isPermanent ? "Permanent Super" : "Make Permanent"}
                                  </Button>
                                ) : (
                                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Standard</span>
                                )}
                              </td>
                              <td className="px-8 py-6 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  disabled={!isPermanentAdmin}
                                  onClick={() => handleRemoveClick(admin)}
                                  className="h-10 w-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
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
            </div>
          )}
        </div>
      </main>

      {/* Audit Logs Dialog */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="bg-[#2a1b4d]/95 backdrop-blur-3xl border-white/20 text-white rounded-[40px] p-0 max-w-2xl overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-5 mb-4">
                <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center text-sm font-black border-2 border-white/10 shadow-2xl", selectedCreator?.color)}>
                  {selectedCreator?.avatar}
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">Network Audit Logs</DialogTitle>
                  <DialogDescription className="text-white/40 font-bold text-base">Administrative sequence for @{selectedCreator?.handle}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <ScrollArea className="h-[400px] p-10">
            <div className="space-y-8">
               {(MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || [{ date: "2024-05-19", time: "10:00", event: "Initial Registration", actor: "System", type: "system" }]).map((log, i) => (
                <div key={i} className="flex gap-8 relative">
                  <div className={cn("h-14 w-14 rounded-2xl border-2 flex items-center justify-center shrink-0 relative z-10", log.type === "system" ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : "border-white/10 bg-white/5 text-white/40")}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 pt-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xl text-white tracking-tight">{log.event}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        <span>{log.date}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white/30 italic">Actor: <span className="text-purple-400">@{log.actor}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-[#2a1b4d]/95 backdrop-blur-3xl border-white/20 text-white rounded-[40px] p-0 max-w-2xl overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-5 mb-4">
                <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center text-sm font-black border-2 border-white/10 shadow-2xl", selectedCreator?.color)}>
                  {selectedCreator?.avatar}
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">Transaction History</DialogTitle>
                  <DialogDescription className="text-white/40 font-bold text-base">Financial activity for @{selectedCreator?.handle}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <ScrollArea className="h-[400px] p-10">
            <div className="space-y-5 text-center text-white/20 font-black italic text-2xl">
              NO ACTIVITY FOUND
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Profile Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#241a3d] border-2 border-red-500/30 text-white rounded-[40px] p-10 max-w-md shadow-[0_0_80px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/10">
              <Trash2 className="h-10 w-10 text-red-500 animate-pulse" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">DELETE PROFILE</DialogTitle>
              <DialogDescription className="text-slate-300 font-bold text-sm leading-relaxed">
                Are you absolutely sure you want to permanently delete @{creatorToDelete?.handle}'s profile? This action will remove all map pins, local membership references, and is completely irreversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={confirmDeleteProfile}
                className="h-14 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-black text-sm uppercase tracking-widest"
              >
                Yes, Purge Profile
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCreatorToDelete(null);
                }}
                className="h-12 text-white/40 hover:text-white"
              >
                Cancel Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Double Self Removal Verification Modal - Step 1 */}
      <Dialog open={removalStep === "warning1"} onOpenChange={(open) => !open && setRemovalStep("closed")}>
        <DialogContent className="bg-[#241a3d] border-2 border-yellow-500/30 text-white rounded-[40px] p-10 max-w-md shadow-[0_0_80px_rgba(234,179,8,0.15)] animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <AlertTriangle className="h-10 w-10 text-yellow-500 animate-bounce" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">WARNING (1/2)</DialogTitle>
              <DialogDescription className="text-slate-300 font-bold text-sm leading-relaxed">
                You are about to revoke your own administrative authorization. This means you will immediately lose access to this admin board.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleWarning1Confirm}
                className="h-14 rounded-2xl bg-yellow-500 text-black hover:bg-yellow-600 font-black text-sm uppercase tracking-widest"
              >
                Yes, Continue to Final Step
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setRemovalStep("closed")}
                className="h-12 text-white/40 hover:text-white"
              >
                Cancel action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Double Self Removal Verification Modal - Step 2 */}
      <Dialog open={removalStep === "warning2"} onOpenChange={(open) => !open && setRemovalStep("closed")}>
        <DialogContent className="bg-[#2d1b4a] border-2 border-red-500/50 text-white rounded-[40px] p-10 max-w-md shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Lock className="h-10 w-10 text-red-500 animate-pulse" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-red-500">CRITICAL ACTION (2/2)</DialogTitle>
              <DialogDescription className="text-red-200 font-bold text-sm leading-relaxed">
                This action is irreversible. To confirm you want to revoke your permanent Super Admin privileges, type your exact handle <span className="text-white font-black">@{actor}</span> below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-2 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-red-400/80">Type your handle to authorize</Label>
              <Input 
                value={confirmInput} 
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={actor || ""} 
                className="bg-white/5 border-red-500/30 focus:border-red-500 h-14 rounded-xl text-center font-black text-lg text-white"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                onClick={handleFinalSelfRemoval}
                className="h-16 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20"
              >
                Terminate Privileges
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setRemovalStep("closed")}
                className="h-12 text-white/40 hover:text-white"
              >
                Cancel action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;