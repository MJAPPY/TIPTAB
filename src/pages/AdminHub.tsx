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
  Scale,
  Clock,
  Info,
  DatabaseZap
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
  ]
};

const INITIAL_LEADERBOARD_WINNERS = [
  { account: "tiptab", role: "Creator", rank: 1, reward: "0" },
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
    boostPriceXusdc,
    updateBoostPriceXusdc,
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
  const [localBoostXusdc, setLocalBoostXusdc] = useState(boostPriceXusdc || "1.00");
  
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
  const [lastAutoSync, setLastAutoSync] = useState<number>(() => {
    return parseInt(localStorage.getItem("tiptab_last_parity_sync") || "0");
  });

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

  const treasuryData = useMemo(() => {
    const rawData = [
      { symbol: "XPR", totalActivation: 0, boostVolume: 0, color: "text-orange-500", bg: "from-orange-500/10", icon: Zap },
      { symbol: "TAB", totalActivation: 0, boostVolume: 0, color: "text-purple-400", bg: "from-purple-500/10", icon: Sparkles },
      { symbol: "XMD", totalActivation: 0, boostVolume: 0, color: "text-cyan-400", bg: "from-cyan-500/10", icon: Globe },
      { symbol: "XUSDC", totalActivation: 0, boostVolume: 0, color: "text-green-400", bg: "from-green-500/10", icon: HandCoins }
    ];

    return rawData.map(item => {
      const rewards = item.boostVolume * 0.5;
      const adminBoostShare = item.boostVolume * 0.5;
      const netRevenue = item.totalActivation + adminBoostShare;

      return {
        ...item,
        revenue: netRevenue,
        rewards,
        boostVolume: item.boostVolume,
        splitPolicy: "50/50 Rewards Split"
      };
    });
  }, []);

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
        return { xprUsd: cgData.proton.usd, xprPerTab };
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
        updateMembershipFee(calculatedXpr, 'XPR');
        updateMembershipFee(targetFeeUsd.toFixed(2), 'XMD');
        setLocalFee(calculatedXpr);
        setLocalFeeXmd(targetFeeUsd.toFixed(2));
      }

      if (!isNaN(targetBoostUsd)) {
        const boostXprVal = (targetBoostUsd / xprUsd).toFixed(0);
        const boostTabVal = (parseFloat(boostXprVal) / xprPerTab).toFixed(0);
        updateBoostPrice(boostXprVal);
        updateBoostTabPrice(boostTabVal);
        setLocalBoost(boostXprVal);
        setLocalBoostTab(boostTabVal);
      }
      
      const now = Date.now();
      setLastAutoSync(now);
      localStorage.setItem("tiptab_last_parity_sync", now.toString());

      toast({ title: isAuto ? "Passive Parity Sync Complete" : "Network Parity Synced" });
    }
    setIsSyncingPrices(false);
  }, [membershipFeeXusdc, boostPriceXusdc, localFeeXusdc, localBoostXusdc, updateMembershipFee, updateBoostPrice, updateBoostTabPrice, toast]);

  useEffect(() => {
    if (adminRole === 'super' && isConnected) {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - lastAutoSync > oneDayInMs) handleSyncParity(true);
    }
  }, [adminRole, isConnected, lastAutoSync, handleSyncParity]);

  const handleResetPlatformState = () => {
    if (adminRole !== 'super') return;
    
    // Clear all tiptab local data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('tiptab_')) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Platform Cache Cleared",
      description: "Simulation stats and local membership records have been reset. Reload to see first-time state.",
      variant: "destructive"
    });
  };

  const handleUpdateFee = (asset: 'XPR' | 'XMD' | 'XUSDC') => {
    if (adminRole !== 'super') return;
    const val = asset === 'XPR' ? localFee : asset === 'XMD' ? localFeeXmd : localFeeXusdc;
    updateMembershipFee(val, asset);
    toast({ title: `${asset} Fee Updated` });
  };

  const handleUpdateBoost = (asset: 'XPR' | 'TAB' | 'XUSDC') => {
    if (adminRole !== 'super') return;
    if (asset === 'XPR') updateBoostPrice(localBoost);
    else if (asset === 'TAB') updateBoostTabPrice(localBoostTab);
    else if (asset === 'XUSDC') updateBoostPriceXusdc(localBoostXusdc);
    toast({ title: `${asset} Boost Updated` });
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
    setMaintenanceMode(!isMaintenanceMode);
  };

  const toggleBan = (handle: string) => {
    const isBanned = bannedHandles.includes(handle);
    setBannedHandles(isBanned ? prev => prev.filter(h => h !== handle) : prev => [...prev, handle]);
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    createPromoCode(newPromoCode, newPromoType, parseInt(newPromoValue), parseInt(newPromoUses));
    setNewPromoCode("");
    toast({ title: "Promo Code Created" });
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPermanentAdmin) return;
    addAdmin(newAdminHandle.trim().replace('@', ''), newAdminRole);
    setNewAdminHandle("");
    toast({ title: "Admin Added" });
  };

  const handleRemoveClick = (admin: AdminUser) => {
    if (!isPermanentAdmin) return;
    removeAdmin(admin.id);
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

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-12 pt-36 md:pt-44 max-w-6xl">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none text-slate-100">
              Admin <span className="text-orange-400">Hub</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl">
             {adminNavItems.map((item) => (
               <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "h-12 px-6 rounded-2xl gap-3 font-black text-xs transition-all",
                  activeTab === item.id ? "bg-purple-600 text-white" : "text-slate-400 hover:text-purple-400"
                )}
               >
                 <item.icon className="h-4 w-4" />
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
                   { label: "Active Members", value: "0", icon: UserRoundCheck, color: "text-orange-400" },
                   { label: "Supporters", value: "0", icon: Users, color: "text-purple-400" },
                   { label: "Velocity", value: "0/hr", icon: Flame, color: "text-red-500" },
                   { label: "Avg Tip", value: "0 TAB", icon: Zap, color: "text-cyan-400" }
                 ].map((stat, i) => (
                   <Card key={i} className="bg-[#130b21] border border-white/10 p-6 rounded-[32px]">
                     <div className="flex items-center justify-between mb-4">
                       <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}><stat.icon className="h-5 w-5" /></div>
                     </div>
                     <div className="space-y-1">
                       <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
                     </div>
                   </Card>
                 ))}
               </div>
               <div className="py-20 text-center opacity-40 italic">Deployment Ready: Awaiting production activity data.</div>
            </div>
          )}

          {activeTab === "config" && (adminRole === 'super' || adminRole === 'moderator') && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#241a3d] border-white/5 rounded-[40px] p-10 space-y-8">
                    <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Settings className="h-5 w-5 text-orange-400" /> Fees & Pricing</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase text-white/40">XUSDC Master Target</Label>
                        <div className="flex gap-4">
                          <Input type="number" value={localFeeXusdc} onChange={(e) => setLocalFeeXusdc(e.target.value)} className="bg-[#2a1d4a] border-white/10 rounded-2xl h-16 px-6 font-black text-white" />
                          <Button onClick={() => handleUpdateFee('XUSDC')} className="bg-cyan-600 rounded-2xl px-6 h-16 font-black">Set</Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase text-white/40">XUSDC Boost Target</Label>
                        <div className="flex gap-4">
                          <Input type="number" value={localBoostXusdc} onChange={(e) => setLocalBoostXusdc(e.target.value)} className="bg-[#2a1d4a] border-white/10 rounded-2xl h-16 px-6 font-black text-white" />
                          <Button onClick={() => handleUpdateBoost('XUSDC')} className="bg-cyan-600 rounded-2xl px-6 h-16 font-black">Set</Button>
                        </div>
                      </div>
                      <Button onClick={() => handleSyncParity()} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs">Force Parity Sync</Button>
                    </div>
                </Card>

                <Card className="bg-[#241a3d] border-white/5 rounded-[40px] p-10 space-y-6">
                  <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Power className="h-5 w-5 text-red-500" /> System State</h3>
                  <div className="space-y-4">
                    <Button onClick={toggleMaintenance} className={cn("w-full h-16 rounded-[28px] border font-black", isMaintenanceMode ? "bg-red-500 text-white" : "bg-red-500/10 border-red-500/20 text-red-500")}>
                      {isMaintenanceMode ? "MAINTENANCE ACTIVE" : "MAINTENANCE MODE"}
                    </Button>
                    
                    {adminRole === 'super' && (
                      <div className="pt-10 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                           <DatabaseZap className="h-5 w-5 text-yellow-400" />
                           <h4 className="font-black text-sm uppercase tracking-widest text-yellow-400">Deployment Tools</h4>
                        </div>
                        <p className="text-[10px] text-white/30 font-bold uppercase leading-relaxed">
                          Reset the platform cache to clear simulated data and verify a clean deployment experience.
                        </p>
                        <Button 
                          onClick={handleResetPlatformState}
                          variant="ghost"
                          className="w-full h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black font-black uppercase text-xs transition-all"
                        >
                          Reset Platform Cache
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminHub;