"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  Calendar,
  Clock,
  UserMinus,
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
  Users,
  BarChart3,
  TrendingUp,
  Cpu,
  Coins
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

const AdminHub = () => {
  const { isAdmin, isConnected, isMaintenanceMode, setMaintenanceMode, broadcastAlert, networkAlert, membershipFee, updateMembershipFee } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [localFee, setLocalFee] = useState(membershipFee);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);

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
    setLocalFee(membershipFee);
  }, [membershipFee]);

  const handleUpdateFee = () => {
    updateMembershipFee(localFee);
    toast({
      title: "Fee Updated",
      description: `Membership fee set to ${localFee} XPR globally.`,
    });
  };

  const handleBroadcast = () => {
    if (!alertMessage.trim()) return;
    broadcastAlert(alertMessage);
    setIsAlertModalOpen(false);
    setAlertMessage("");
    toast({
      title: "Alert Broadcasted",
      description: "The message is now live across the platform.",
    });
  };

  const clearAlert = () => {
    broadcastAlert(null);
    toast({
      title: "Alert Cleared",
      description: "Global message has been removed.",
    });
  };

  const toggleMaintenance = () => {
    const newState = !isMaintenanceMode;
    setMaintenanceMode(newState);
    toast({
      title: newState ? "Maintenance Activated" : "Network Online",
      description: newState ? "All non-admin traffic is now diverted." : "Public access restored.",
      variant: newState ? "destructive" : "default"
    });
  };

  const toggleBan = (handle: string) => {
    const isBanned = bannedHandles.includes(handle);
    if (isBanned) {
      setBannedHandles(prev => prev.filter(h => h !== handle));
      toast({ title: "User Restored", description: `@${handle} has been reinstated on the map.` });
    } else {
      setBannedHandles(prev => [...prev, handle]);
      toast({ title: "User Banned", description: `@${handle} has been restricted from the network.`, variant: "destructive" });
    }
  };

  const handleTerminate = (handle: string) => {
    setModeratedCreators(prev => prev.filter(c => c.handle !== handle));
    toast({
      title: "Account Terminated",
      description: `@${handle} has been permanently deleted from the directory.`,
      variant: "destructive"
    });
  };

  const openAuditLogs = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsAuditModalOpen(true);
  };

  const openTransactionHistory = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsHistoryModalOpen(true);
  };

  const handleResetProfile = (handle: string) => {
    toast({ title: "Profile Reset", description: `Meta data for @${handle} has been cleared.` });
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
          
          <div className="lg:col-span-4 space-y-8">
            
            <Card className="bg-[#0d071a] border-[4px] border-slate-300/40 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(255,255,255,0.05)] relative group ring-2 ring-white/10">
              {/* Silver Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
              
              {/* Animated Background Gradients */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 blur-[100px] rounded-full group-hover:bg-purple-600/25 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/15 blur-[80px] rounded-full group-hover:bg-orange-600/25 transition-all duration-700" />
              
              <CardHeader className="p-8 md:p-10 pb-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl md:text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white drop-shadow-lg">
                    <Activity className="h-7 w-7 text-purple-500 animate-pulse" /> TIPTAB VITALS
                  </CardTitle>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400">Live</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 md:p-10 pt-2 space-y-10 relative z-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3 group/stat">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-white" />
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Total Registered</p>
                    </div>
                    <div className="relative">
                      <p className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none group-hover/stat:text-purple-400 transition-colors">1,284</p>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-green-400 mt-2 bg-green-500/20 w-fit px-2.5 py-1 rounded-lg border border-green-500/20">
                        <ArrowUpRight className="h-3 w-3" /> +14%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 group/stat">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-white" />
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Active Live</p>
                    </div>
                    <div className="relative">
                      <p className="text-4xl md:text-5xl font-black text-purple-400 tracking-tighter leading-none group-hover/stat:text-white transition-colors">42</p>
                      <p className="text-[10px] font-black text-white/40 mt-2 uppercase tracking-widest italic">Global Nodes</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">24H Network Volume</p>
                      <p className="text-4xl font-black text-white tracking-tighter italic">124.5k <span className="text-orange-500 text-lg">TAB</span></p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/20 border-2 border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                      <TrendingUp className="h-7 w-7 text-orange-500" />
                    </div>
                  </div>
                  <div className="relative h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-white w-[65%] rounded-full shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-shimmer" />
                  </div>
                  <div className="flex justify-end text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Sync: 12:00 UTC</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-6 border-t border-white/10">
                  <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-5 rounded-3xl border border-white/10 group/mini hover:border-purple-500/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] block mb-1">Total TAB Sent</span>
                      <span className="text-2xl font-black text-white group-hover/mini:text-purple-400 transition-colors italic">8.4M</span>
                    </div>
                    <Zap className="h-6 w-6 text-orange-500 fill-orange-500" />
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-5 rounded-3xl border border-white/10 group/mini hover:border-cyan-500/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] block mb-1">Total XPR Sent</span>
                      <span className="text-2xl font-black text-white group-hover/mini:text-cyan-400 transition-colors italic">2.1M</span>
                    </div>
                    <Coins className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#120a21] border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 md:p-10 pb-2">
                <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight text-white uppercase italic">
                  <Settings className="h-5 w-5 text-orange-400" /> Network Config
                </CardTitle>
                <CardDescription className="text-white/40 font-medium text-xs md:text-sm">Manage global node parameters</CardDescription>
              </CardHeader>
              <CardContent className="p-8 md:p-10 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">MEMBERSHIP FEE (XPR)</Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input 
                      type="number" 
                      value={localFee} 
                      onChange={(e) => setLocalFee(e.target.value)}
                      className="bg-[#1a112d] border-white/10 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white"
                    />
                    <Button 
                      onClick={handleUpdateFee} 
                      className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-8 h-16 font-black text-lg shadow-lg shadow-orange-500/20 text-white"
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <Button 
                    onClick={toggleMaintenance}
                    className={cn(
                      "w-full h-16 rounded-[28px] border font-black text-sm flex items-center justify-between px-8 transition-all",
                      isMaintenanceMode 
                        ? "bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]" 
                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
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
                        <Bell className="h-5 w-5" />
                        Broadcast Network Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a102d] border-white/10 text-white rounded-3xl p-8 max-w-md">
                      <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-black italic tracking-tight">GLOBAL BROADCAST</DialogTitle>
                        <DialogDescription className="text-white/50 font-bold">
                          This message will appear at the top of the app for all users.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Alert Message</Label>
                          <Input 
                            value={alertMessage}
                            onChange={(e) => setAlertMessage(e.target.value)}
                            placeholder="e.g. Scheduled maintenance in 1 hour..."
                            className="bg-white/5 border-white/10 h-14 rounded-xl px-4 text-white font-medium"
                          />
                        </div>
                        <Button 
                          onClick={handleBroadcast}
                          className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xl shadow-purple-500/20"
                        >
                          Broadcast Live
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {networkAlert && (
                    <Button 
                      onClick={clearAlert}
                      variant="ghost"
                      className="w-full h-16 rounded-[28px] bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black text-sm flex items-center justify-start gap-4 px-8"
                    >
                      <X className="h-5 w-5" />
                      Clear Current Alert
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="bg-[#0d071a] border-white/10 rounded-[48px] overflow-hidden shadow-2xl min-h-[600px] lg:min-h-[840px]">
              <CardHeader className="p-8 md:p-12 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white">Network Moderation</CardTitle>
                    <CardDescription className="text-white/40 font-medium text-sm">Review and manage participant status</CardDescription>
                  </div>
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <Input 
                      placeholder="Search handles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-16 bg-[#1a112d] border-white/10 rounded-2xl h-14 focus:ring-purple-500/50 text-white text-base"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Creator Profile</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Category</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Node Status</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCreators.map((creator) => {
                        const isBanned = bannedHandles.includes(creator.handle);
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
                              <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-purple-300 group-hover:border-purple-500/30 transition-all">
                                {creator.category}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-2">
                                {isBanned ? (
                                  <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 font-black text-[10px] uppercase tracking-widest">
                                    <Lock className="h-3 w-3" /> Terminated
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 font-black text-[10px] uppercase tracking-widest">
                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleBan(creator.handle)}
                                  className={cn(
                                    "h-12 w-12 rounded-xl transition-all border border-white/10",
                                    isBanned 
                                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                  )}
                                >
                                  {isBanned ? <Unlock className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-white/30 border border-white/10 hover:text-white hover:bg-white/15">
                                      <MoreVertical className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-64 bg-[#1a102d]/98 backdrop-blur-xl border-white/20 text-white rounded-[24px] p-2.5 mt-3 shadow-2xl">
                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-4 py-3">Advanced Admin</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem 
                                      onClick={() => openTransactionHistory(creator)}
                                      className="focus:bg-purple-500/20 focus:text-purple-400 rounded-xl cursor-pointer px-4 py-3 gap-4"
                                    >
                                      <History className="h-5 w-5" />
                                      <span className="font-black text-sm uppercase tracking-tight">View History</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openAuditLogs(creator)}
                                      className="focus:bg-purple-500/20 focus:text-purple-400 rounded-xl cursor-pointer px-4 py-3 gap-4"
                                    >
                                      <FileText className="h-5 w-5" />
                                      <span className="font-black text-sm uppercase tracking-tight">Audit Logs</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem 
                                      onClick={() => handleResetProfile(creator.handle)}
                                      className="focus:bg-orange-500/20 focus:text-orange-400 rounded-xl cursor-pointer px-4 py-3 gap-4"
                                    >
                                      <UserX className="h-5 w-5" />
                                      <span className="font-black text-sm uppercase tracking-tight">Reset Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleTerminate(creator.handle)}
                                      className="focus:bg-red-500/20 focus:text-red-400 rounded-xl cursor-pointer px-4 py-3 gap-4"
                                    >
                                      <UserMinus className="h-5 w-5" />
                                      <span className="font-black text-sm uppercase tracking-tight">Erase Account</span>
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

      {/* Audit Log Dialog */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="bg-[#0d071a]/95 backdrop-blur-3xl border-white/20 text-white rounded-[40px] p-0 overflow-hidden max-w-2xl shadow-2xl">
          <div className="p-10 border-b border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-5 mb-4">
                <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center text-sm font-black border-2 border-white/10 shadow-2xl", selectedCreator?.color)}>
                  {selectedCreator?.avatar}
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Network Audit Logs</DialogTitle>
                  <DialogDescription className="text-white/40 font-bold text-base">
                    Administrative sequence for @{selectedCreator?.handle}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="h-[480px] p-10">
            <div className="space-y-8">
              {(MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || [
                { date: "2024-05-19", time: "10:00", event: "Initial Registration", actor: "System", type: "system" }
              ]).map((log, i) => (
                <div key={i} className="flex gap-8 relative">
                  {i < (MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || []).length - 1 && (
                    <div className="absolute left-[27px] top-14 bottom-[-32px] w-0.5 bg-white/5" />
                  )}
                  <div className={cn(
                    "h-14 w-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-2xl relative z-10",
                    log.type === "system" ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : 
                    log.type === "admin" ? "border-orange-500/30 bg-orange-500/10 text-orange-400" :
                    "border-white/10 bg-white/5 text-white/40"
                  )}>
                    {log.type === "system" ? <Zap className="h-6 w-6" /> : 
                     log.type === "admin" ? <ShieldAlert className="h-6 w-6" /> :
                     <FileText className="h-6 w-6" />}
                  </div>
                  <div className="space-y-2 pt-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xl text-white tracking-tight">{log.event}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {log.date}</div>
                        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {log.time}</div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white/30 italic">Executed by: <span className="text-purple-400">@{log.actor}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-10 bg-white/[0.03] border-t border-white/10 flex justify-end">
            <Button 
              onClick={() => setIsAuditModalOpen(false)} 
              className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs px-10 h-14 shadow-[0_15px_30px_rgba(168,85,247,0.3)]"
            >
              Close Audit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="bg-[#0d071a]/95 backdrop-blur-3xl border-white/20 text-white rounded-[40px] p-0 overflow-hidden max-w-2xl shadow-2xl">
          <div className="p-10 border-b border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-5 mb-4">
                <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center text-sm font-black border-2 border-white/10 shadow-2xl", selectedCreator?.color)}>
                  {selectedCreator?.avatar}
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Transaction History</DialogTitle>
                  <DialogDescription className="text-white/40 font-bold text-base">
                    Financial activity for @{selectedCreator?.handle}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="h-[480px] p-10">
            <div className="space-y-5">
              {(MOCK_TRANSACTIONS[selectedCreator?.handle || ""] || []).length > 0 ? (
                (MOCK_TRANSACTIONS[selectedCreator?.handle || ""] || []).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-white/[0.03] border border-white/10 group hover:bg-white/[0.06] hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center border-2 shadow-xl",
                        tx.type === "received" ? "border-green-500/20 bg-green-500/10 text-green-400" : "border-red-500/20 bg-red-500/10 text-red-400"
                      )}>
                        {tx.type === "received" ? <ArrowDownLeft className="h-7 w-7" /> : <ArrowUpRight className="h-7 w-7" />}
                      </div>
                      <div>
                        <p className="font-black text-lg text-white">
                          {tx.type === "received" ? "Received Support" : "Sent Appreciation"}
                        </p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">
                          {tx.type === "received" ? "From" : "To"}: <span className="text-purple-400">@{tx.counterparty}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-black text-2xl tracking-tighter", tx.type === "received" ? "text-green-400" : "text-red-400")}>
                        {tx.type === "received" ? "+" : "-"}{tx.amount} <span className="text-sm italic">{tx.asset}</span>
                      </p>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{tx.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-24 w-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                    <HandCoins className="h-12 w-12 text-white/10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black text-white/20 uppercase italic tracking-tighter">Zero Activity Found</p>
                    <p className="text-base text-white/10 font-bold max-w-[280px]">This node hasn't processed any TAB or XPR transfers yet.</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-10 bg-white/[0.03] border-t border-white/10 flex justify-end">
            <Button 
              onClick={() => setIsHistoryModalOpen(false)} 
              className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs px-10 h-14 shadow-[0_15px_30px_rgba(249,115,22,0.3)]"
            >
              Close Ledger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;