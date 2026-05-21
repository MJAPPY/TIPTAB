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
  UserX,
  History,
  FileText,
  UserMinus,
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
  Users,
  TrendingUp,
  Coins,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useXpr } from "@/contexts/XprContext";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const MOCK_TRANSACTIONS: Record<string, any[]> = {
  "tiptab": [
    { date: "2024-05-19", amount: "1,200", asset: "TAB", type: "received", counterparty: "whaleshark" },
    { date: "2024-05-18", amount: "500", asset: "TAB", type: "received", counterparty: "early" },
    { date: "2024-05-17", amount: "250", asset: "XPR", type: "received", counterparty: "fanatic" },
  ],
  "carlos_delivery": [
    { date: "2024-05-19", amount: "50", asset: "TAB", type: "received", counterparty: "anonymous" },
    { date: "2024-05-18", amount: "100", asset: "TAB", type: "received", counterparty: "local_fan" },
    { date: "2024-05-15", amount: "10.5000", asset: "XPR", type: "received", counterparty: "cking" },
  ]
};

// Mock ranking data for Admin Rewards
const LEADERBOARD_WINNERS = [
  { account: "whaleshark", role: "Supporter", rank: 1, reward: "5000" },
  { account: "tiptab", role: "Creator", rank: 2, reward: "2500" },
  { account: "carlos_delivery", role: "Creator", rank: 3, reward: "2000" },
  { account: "early", role: "Supporter", rank: 4, reward: "1500" },
  { account: "mayafit", role: "Creator", rank: 5, reward: "1250" },
  { account: "fanatic", role: "Supporter", rank: 6, reward: "1000" },
  { account: "cking", role: "Supporter", rank: 7, reward: "750" },
  { account: "kofibuilds", role: "Creator", rank: 8, reward: "500" },
  { account: "sarah_serves", role: "Creator", rank: 9, reward: "250" },
  { account: "mwright", role: "Creator", rank: 10, reward: "100" },
];

const AdminHub = () => {
  const { 
    isAdmin, 
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
    balances
  } = useXpr();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const handleUpdateFee = () => {
    updateMembershipFee(localFee);
    toast({ title: "Activation Fee Updated", description: `Global rate set to ${localFee} XPR.` });
  };

  const handleUpdateBoost = () => {
    updateBoostPrice(localBoost);
    toast({ title: "Boost Price Updated", description: `Performance rate set to ${localBoost} XPR.` });
  };

  const handleRewardWinners = async () => {
    setIsDistributing(true);
    try {
      const winners = LEADERBOARD_WINNERS.map(w => ({ account: w.account, amount: w.reward }));
      const success = await distributeXprRewards(winners);
      if (success) {
        toast({
          title: "Rewards Distributed!",
          description: `Successfully rewarded the Top 10 participants with XPR.`,
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
    toast({ title: "Alert Cleared" });
  };

  const toggleMaintenance = () => {
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

  const openAuditLogs = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsAuditModalOpen(true);
  };

  const openTransactionHistory = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsHistoryModalOpen(true);
  };

  const filteredCreators = moderatedCreators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#06030e] text-white overflow-x-hidden">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-12 pt-36 md:pt-44">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          <div className="lg:col-span-4 space-y-6">
            
            {/* Vitals Card */}
            <Card className="bg-[#0d071a] border-[4px] border-slate-300/40 rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative group ring-2 ring-white/10">
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
                <div className="space-y-4 bg-white/5 p-6 rounded-[28px] border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em]">Available Rewards</p>
                      <p className="text-4xl font-black text-white tracking-tighter italic">{Number(balances.xpr).toLocaleString()} <span className="text-orange-500 text-lg">XPR</span></p>
                    </div>
                    <HandCoins className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Source: 100% Membership & Boost Fees</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                   <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-5 rounded-2xl border border-white/10 flex items-center justify-between group/mini hover:border-purple-500/40 transition-all">
                    <div>
                      <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-0.5">Activation Revenue</span>
                      <span className="text-xl font-black text-white italic">452,500 <span className="text-xs text-purple-400">XPR</span></span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-5 rounded-2xl border border-white/10 flex items-center justify-between group/mini hover:border-orange-500/40 transition-all">
                    <div>
                      <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] block mb-0.5">Performance Boosts</span>
                      <span className="text-xl font-black text-white italic">12,500 <span className="text-xs text-orange-500">XPR</span></span>
                    </div>
                    <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
                  </div>
                </div>

                <Button 
                  onClick={handleRewardWinners}
                  disabled={isDistributing}
                  className="w-full h-16 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]"
                >
                  {isDistributing ? "Processing Batch..." : "Distribute Weekly Rewards"}
                </Button>
              </CardContent>
            </Card>

            {/* Config Card */}
            <Card className="bg-[#120a21] border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-2">
                <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight text-white uppercase italic">
                  <Settings className="h-5 w-5 text-orange-400" /> Network Config
                </CardTitle>
                <CardDescription className="text-white/40 font-medium text-sm">Manage global node parameters</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Activation Fee (XPR)</Label>
                  <div className="flex gap-4">
                    <Input 
                      type="number" 
                      value={localFee} 
                      onChange={(e) => setLocalFee(e.target.value)}
                      className="bg-[#1a112d] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white"
                    />
                    <Button onClick={handleUpdateFee} className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Performance Boost (XPR)</Label>
                  <div className="flex gap-4">
                    <Input 
                      type="number" 
                      value={localBoost} 
                      onChange={(e) => setLocalBoost(e.target.value)}
                      className="bg-[#1a112d] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white"
                    />
                    <Button onClick={handleUpdateBoost} className="bg-purple-600 hover:bg-purple-700 rounded-2xl px-6 h-16 font-black text-white">Update</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <Button 
                    onClick={toggleMaintenance}
                    className={cn(
                      "w-full h-16 rounded-[28px] border font-black text-sm flex items-center justify-between px-8 transition-all",
                      isMaintenanceMode ? "bg-red-500 text-white border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Power className={cn("h-4 w-4", isMaintenanceMode && "animate-pulse")} />
                      {isMaintenanceMode ? "MAINTENANCE ACTIVE" : "MAINTENANCE MODE"}
                    </div>
                  </Button>

                  <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-16 rounded-[28px] bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-black text-sm flex items-center justify-start gap-4 px-8">
                        <Bell className="h-5 w-5" /> Broadcast Network Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a102d] border-white/10 text-white rounded-3xl p-8 max-w-md">
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {/* Rewards Table Card */}
            <Card className="bg-[#0d071a] border-white/10 rounded-[48px] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Trophy className="h-64 w-64 text-white" />
              </div>
              <CardHeader className="p-12 border-b border-white/5 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white flex items-center gap-4">
                      <Sparkles className="h-8 w-8 text-yellow-400" /> Leaderboard Rewards
                    </CardTitle>
                    <CardDescription className="text-white/40 font-medium text-sm">Top 10 participants pending verification for weekly rewards</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Rank</th>
                        <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Participant</th>
                        <th className="px-12 py-6 text-left text-[11px] font-black uppercase tracking-widest text-white/30">Role</th>
                        <th className="px-12 py-6 text-right text-[11px] font-black uppercase tracking-widest text-white/30">Reward Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {LEADERBOARD_WINNERS.map((winner) => (
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
                            <span className="text-xl font-black text-white italic">{winner.reward} <span className="text-[10px] text-orange-500 ml-1">XPR</span></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Moderation Card */}
            <Card className="bg-[#0d071a] border-white/10 rounded-[48px] overflow-hidden shadow-2xl min-h-[600px]">
              <CardHeader className="p-12 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white">Network Moderation</CardTitle>
                    <CardDescription className="text-white/40 font-medium text-sm">Review and manage participant status</CardDescription>
                  </div>
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <Input placeholder="Search handles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-16 bg-[#1a112d] border-white/10 rounded-2xl h-14 focus:ring-purple-500/50 text-white" />
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
                        // Check if creator is verified based on stored membership
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
                                  <DropdownMenuContent align="end" className="w-64 bg-[#1a102d]/98 backdrop-blur-xl border-white/20 text-white rounded-[24px] p-2.5 shadow-2xl">
                                    <DropdownMenuItem onClick={() => openTransactionHistory(creator)} className="rounded-xl cursor-pointer px-4 py-3 gap-4">
                                      <History className="h-5 w-5" />
                                      <span className="font-black text-sm uppercase">View History</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openAuditLogs(creator)} className="rounded-xl cursor-pointer px-4 py-3 gap-4">
                                      <FileText className="h-5 w-5" />
                                      <span className="font-black text-sm uppercase">Audit Logs</span>
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
        </div>
      </main>

      {/* Audit & History Dialogs remain similar */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="bg-[#0d071a]/95 backdrop-blur-3xl border-white/20 text-white rounded-[40px] p-0 max-w-2xl overflow-hidden">
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

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-[#0d071a]/95 backdrop-blur-3xl border-white/20 text-white rounded-[40px] p-0 max-w-2xl overflow-hidden">
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
    </div>
  );
};

export default AdminHub;