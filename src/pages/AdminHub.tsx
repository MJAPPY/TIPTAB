"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  Settings, 
  Search,
  Bell,
  Zap,
  Power,
  Users,
  ShieldCheck,
  Trash2
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

const AdminHub = () => {
  const { 
    isAdmin, 
    isConnected, 
    isLoading,
    isMaintenanceMode, 
    setMaintenanceMode, 
    broadcastAlert, 
    membershipFee, 
    updateMembershipFee,
    boostPrice,
    updateBoostPrice,
    actor
  } = useXpr();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("config");
  const [localFee, setLocalFee] = useState(membershipFee || "2500");
  const [localBoost, setLocalBoost] = useState(boostPrice || "1000");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [creatorToDelete, setCreatorToDelete] = useState<Creator | null>(null);

  useEffect(() => {
    if (!isLoading && (!isConnected || !isAdmin)) {
      toast({ title: "Access Restricted", variant: "destructive" });
      navigate("/");
    }
  }, [isAdmin, isConnected, isLoading, navigate, toast]);

  const handleUpdateFee = () => {
    updateMembershipFee(localFee);
    toast({ title: "Fee Updated", description: `Activation set to ${localFee} XPR.` });
  };

  const handleUpdateBoost = () => {
    updateBoostPrice(localBoost);
    toast({ title: "Boost Updated", description: `Boost set to ${localBoost} XPR.` });
  };

  const handleBroadcast = () => {
    if (!alertMessage.trim()) return;
    broadcastAlert(alertMessage);
    setIsAlertModalOpen(false);
    setAlertMessage("");
    toast({ title: "Broadcast Sent" });
  };

  const confirmDeleteProfile = () => {
    if (!creatorToDelete) return;
    setModeratedCreators(prev => prev.filter(c => c.id !== creatorToDelete.id));
    setIsDeleteModalOpen(false);
    toast({ title: "Profile Purged" });
  };

  const filteredCreators = useMemo(() => {
    return moderatedCreators.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [moderatedCreators, searchQuery]);

  if (isLoading || !isAdmin || !isConnected) {
    return (
      <div className="min-h-screen bg-[#06030e] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06030e] text-white">
      <Header />

      <main className="container mx-auto px-6 py-12 pt-44 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Secure Administration
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none text-slate-100">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-500 to-cyan-400">Hub</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl">
             <Button
                variant="ghost"
                onClick={() => setActiveTab("config")}
                className={cn(
                  "h-12 px-6 rounded-xl gap-2 font-black text-xs uppercase tracking-widest transition-all",
                  activeTab === "config" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400"
                )}
             >
               <Settings className="h-4 w-4" /> Config
             </Button>
             <Button
                variant="ghost"
                onClick={() => setActiveTab("moderation")}
                className={cn(
                  "h-12 px-6 rounded-xl gap-2 font-black text-xs uppercase tracking-widest transition-all",
                  activeTab === "moderation" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400"
                )}
             >
               <Users className="h-4 w-4" /> Moderation
             </Button>
          </div>
        </div>

        {activeTab === "config" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-[#130b21] border-white/10 rounded-[32px] p-8 space-y-6">
                <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Power className="h-5 w-5 text-red-500" /> Overrides</h3>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setMaintenanceMode(!isMaintenanceMode)}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black text-sm flex items-center justify-between px-6 transition-all",
                      isMaintenanceMode ? "bg-red-500 text-white" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}
                  >
                    Maintenance Mode {isMaintenanceMode ? "ON" : "OFF"}
                  </Button>
                  <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-sm gap-3">
                        <Bell className="h-5 w-5" /> Broadcast Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a102d] border-white/10 text-white rounded-3xl">
                      <DialogHeader><DialogTitle className="font-black italic uppercase">System Alert</DialogTitle></DialogHeader>
                      <div className="space-y-6 pt-4">
                        <Input value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="Enter message..." className="bg-white/5 border-white/10 h-14 rounded-xl text-white" />
                        <Button onClick={handleBroadcast} className="w-full h-14 bg-purple-600 text-white font-black rounded-xl">Send Now</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>

              <Card className="bg-[#130b21] border-white/10 rounded-[32px] p-8 space-y-8">
                <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-2"><Zap className="h-5 w-5 text-orange-500" /> Activation Fees</h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Yearly Activation (XPR)</Label>
                    <div className="flex gap-2">
                      <Input value={localFee} onChange={(e) => setLocalFee(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-black" />
                      <Button onClick={handleUpdateFee} variant="outline" className="h-12 px-6 rounded-xl border-white/10 text-white/60 hover:text-white">Update</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Stream Boost (XPR)</Label>
                    <div className="flex gap-2">
                      <Input value={localBoost} onChange={(e) => setLocalBoost(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-black" />
                      <Button onClick={handleUpdateBoost} variant="outline" className="h-12 px-6 rounded-xl border-white/10 text-white/60 hover:text-white">Update</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "moderation" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <Card className="bg-[#130b21] border-white/10 rounded-[32px] overflow-hidden">
              <div className="p-8 border-b border-white/10">
                <div className="relative group max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
                  <Input 
                    placeholder="Search creators..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {filteredCreators.map((creator) => (
                  <div key={creator.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black border border-white/10 shadow-lg", creator.color)}>
                        {creator.avatarImage ? <img src={creator.avatarImage} alt="" className="w-full h-full object-cover" /> : creator.avatar}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-100">{creator.name}</h4>
                        <p className="text-xs font-bold text-white/40 tracking-tight">@{creator.handle}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setCreatorToDelete(creator);
                        setIsDeleteModalOpen(true);
                      }}
                      className="h-10 px-4 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest gap-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Purge Profile
                    </Button>
                  </div>
                ))}
                {filteredCreators.length === 0 && (
                  <div className="p-20 text-center space-y-3">
                    <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-6 w-6 text-white/20" />
                    </div>
                    <p className="text-white/40 font-bold">No matching creators found.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1a102d] border-2 border-red-500/30 text-white rounded-[40px] p-10 max-w-md">
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border-2 border-red-500/20">
              <Trash2 className="h-10 w-10 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic uppercase text-center tracking-tighter">PERMANENT PURGE?</DialogTitle>
              <DialogDescription className="text-white/60 font-bold text-center">
                This will remove the creator's presence from the global map and performance hub immediately.
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