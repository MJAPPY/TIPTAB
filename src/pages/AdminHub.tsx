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
  Clock
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

const AdminHub = () => {
  const { isAdmin, isConnected, isMaintenanceMode, setMaintenanceMode, broadcastAlert, networkAlert, membershipFee, updateMembershipFee } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [localFee, setLocalFee] = useState(membershipFee);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [moderatedCreators] = useState<Creator[]>(CREATORS);
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

  const openAuditLogs = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsAuditModalOpen(true);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
          
          <div className="lg:col-span-4 space-y-6">
            
            <Card className="bg-[#120a21] border-white/5 rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-6 md:p-8 pb-4">
                <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <Activity className="h-5 w-5 text-purple-400" /> PLATFORM VITALS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 md:p-6 rounded-[20px] md:rounded-[24px] bg-[#1a112d] border border-white/5 space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">TOTAL MEMBERS</p>
                    <p className="text-3xl md:text-4xl font-black text-white">133</p>
                  </div>
                  <div className="p-5 md:p-6 rounded-[20px] md:rounded-[24px] bg-[#1a112d] border border-white/5 space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">WEEKLY GROWTH</p>
                    <p className="text-3xl md:text-4xl font-black text-green-500">+14%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] md:text-sm">
                    <span className="font-bold text-white/40">Total TAB Tipped</span>
                    <span className="font-black text-orange-500">4.2M TAB</span>
                  </div>
                  <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[60%] rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#120a21] border-white/5 rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-6 md:p-8 pb-2">
                <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <Settings className="h-5 w-5 text-orange-400" /> NETWORK CONFIG
                </CardTitle>
                <CardDescription className="text-white/40 font-medium text-xs md:text-sm">Global platform parameters</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">MEMBERSHIP FEE (XPR)</Label>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Input 
                      type="number" 
                      value={localFee} 
                      onChange={(e) => setLocalFee(e.target.value)}
                      className="bg-[#1a112d] border-white/10 rounded-2xl font-black text-lg md:text-xl h-14 md:h-16 px-6 focus:ring-orange-500/50 text-white"
                    />
                    <Button 
                      onClick={handleUpdateFee} 
                      className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-8 h-14 md:h-16 font-black text-base md:text-lg shadow-lg shadow-orange-500/20 text-white"
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <Button 
                    onClick={toggleMaintenance}
                    className={cn(
                      "w-full h-14 md:h-16 rounded-[20px] md:rounded-[24px] border font-black text-xs md:text-sm flex items-center justify-between px-6 md:px-8 transition-all",
                      isMaintenanceMode 
                        ? "bg-red-500 text-white border-red-600 hover:bg-red-600" 
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
                      <Button className="w-full h-14 md:h-16 rounded-[20px] md:rounded-[24px] bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-black text-xs md:text-sm flex items-center justify-start gap-4 px-6 md:px-8">
                        <Bell className="h-4 w-4" />
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
                      className="w-full h-14 md:h-16 rounded-[20px] md:rounded-[24px] bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black text-xs md:text-sm flex items-center justify-start gap-4 px-6 md:px-8"
                    >
                      <X className="h-4 w-4" />
                      Clear Current Alert
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="bg-[#120a21] border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl min-h-[600px] lg:min-h-[840px]">
              <CardHeader className="p-6 md:p-10 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tight uppercase italic text-white">MODERATION</CardTitle>
                    <CardDescription className="text-white/40 font-medium text-xs md:text-sm">Manage network access</CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input 
                      placeholder="Search handles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 bg-[#1a112d] border-white/10 rounded-2xl h-12 md:h-14 focus:ring-purple-500/50 text-white text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-white/[0.02]">
                      <tr>
                        <th className="px-6 md:px-10 py-5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30">Creator</th>
                        <th className="px-6 md:px-10 py-5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30">Category</th>
                        <th className="px-6 md:px-10 py-5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                        <th className="px-6 md:px-10 py-5 text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCreators.map((creator) => {
                        const isBanned = bannedHandles.includes(creator.handle);
                        return (
                          <tr key={creator.id} className="group hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 md:px-10 py-6 md:py-8">
                              <div className="flex items-center gap-4">
                                <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black border border-white/10 text-white shrink-0", creator.color)}>
                                  {creator.avatar}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-sm md:text-base text-white truncate">{creator.name}</p>
                                  <p className="text-[10px] md:text-xs text-purple-400 font-bold tracking-wider truncate">@{creator.handle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 md:px-10 py-6 md:py-8">
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                                {creator.category}
                              </span>
                            </td>
                            <td className="px-6 md:px-10 py-6 md:py-8">
                              <div className="flex items-center gap-2">
                                {isBanned ? (
                                  <div className="flex items-center gap-1.5 text-red-500 bg-red-500/5 px-2.5 py-1 rounded-lg border border-red-500/10 font-black text-[9px] uppercase">
                                    <Lock className="h-2.5 w-2.5" /> Banned
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-green-500 bg-green-500/5 px-2.5 py-1 rounded-lg border border-green-500/10 font-black text-[9px] uppercase">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> Active
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                              <div className="flex items-center justify-end gap-2 md:gap-3">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleBan(creator.handle)}
                                  className={cn(
                                    "h-10 w-10 md:h-11 md:w-11 rounded-xl transition-all border border-white/5",
                                    isBanned 
                                      ? "bg-green-500/5 text-green-500 hover:bg-green-500/10" 
                                      : "bg-red-500/5 text-red-500 hover:bg-red-500/10"
                                  )}
                                >
                                  {isBanned ? <Unlock className="h-4 w-4 md:h-5 md:w-5" /> : <Ban className="h-4 w-4 md:h-5 md:w-5" />}
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-white/5 text-white/30 border border-white/5 hover:text-white hover:bg-white/10">
                                      <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56 bg-[#1a102d]/95 backdrop-blur-xl border-white/10 text-white rounded-2xl p-2 mt-2 shadow-2xl">
                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 px-3 py-2">Account Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem className="focus:bg-purple-500/15 focus:text-purple-400 rounded-xl cursor-pointer px-3 py-2.5 gap-3">
                                      <History className="h-4 w-4" />
                                      <span className="font-bold text-sm">View History</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openAuditLogs(creator)}
                                      className="focus:bg-purple-500/15 focus:text-purple-400 rounded-xl cursor-pointer px-3 py-2.5 gap-3"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span className="font-bold text-sm">Audit Logs</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <DropdownMenuItem 
                                      onClick={() => handleResetProfile(creator.handle)}
                                      className="focus:bg-orange-500/15 focus:text-orange-400 rounded-xl cursor-pointer px-3 py-2.5 gap-3"
                                    >
                                      <UserX className="h-4 w-4" />
                                      <span className="font-bold text-sm">Reset Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => toggleBan(creator.handle)}
                                      className="focus:bg-red-500/15 focus:text-red-400 rounded-xl cursor-pointer px-3 py-2.5 gap-3"
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                      <span className="font-bold text-sm">{isBanned ? "Unban Account" : "Terminate Account"}</span>
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
        <DialogContent className="bg-[#1a102d] border-white/10 text-white rounded-3xl p-0 overflow-hidden max-w-2xl shadow-2xl">
          <div className="p-8 border-b border-white/5">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-xs font-black border border-white/10", selectedCreator?.color)}>
                  {selectedCreator?.avatar}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black italic tracking-tight uppercase">Network Audit Logs</DialogTitle>
                  <DialogDescription className="text-white/40 font-bold">
                    Historical record for @{selectedCreator?.handle}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="h-[450px] p-8">
            <div className="space-y-6">
              {(MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || [
                { date: "2024-05-19", time: "10:00", event: "Initial Registration", actor: "System", type: "system" }
              ]).map((log, i) => (
                <div key={i} className="flex gap-6 relative">
                  {i < (MOCK_AUDIT_LOGS[selectedCreator?.handle || ""] || []).length - 1 && (
                    <div className="absolute left-[23px] top-10 bottom-[-24px] w-px bg-white/5" />
                  )}
                  <div className={cn(
                    "h-12 w-12 rounded-full border-2 flex items-center justify-center shrink-0 shadow-lg",
                    log.type === "system" ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : 
                    log.type === "admin" ? "border-orange-500/30 bg-orange-500/10 text-orange-400" :
                    "border-white/10 bg-white/5 text-white/40"
                  )}>
                    {log.type === "system" ? <Zap className="h-5 w-5" /> : 
                     log.type === "admin" ? <ShieldAlert className="h-5 w-5" /> :
                     <FileText className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1 pt-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-lg text-white/90">{log.event}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {log.date}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {log.time}</div>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white/40 italic">Triggered by: <span className="text-purple-400">@{log.actor}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
            <Button onClick={() => setIsAuditModalOpen(false)} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs px-8">
              Close Audit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHub;