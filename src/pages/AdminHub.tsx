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
  Zap
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

const AdminHub = () => {
  const { isAdmin, isConnected } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [membershipFee, setMembershipFee] = useState("2500");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleUpdateFee = () => {
    toast({
      title: "Fee Updated",
      description: `Membership fee set to ${membershipFee} XPR.`,
    });
  };

  const toggleBan = (handle: string) => {
    const isBanned = bannedHandles.includes(handle);
    if (isBanned) {
      setBannedHandles(prev => prev.filter(h => h !== handle));
    } else {
      setBannedHandles(prev => [...prev, handle]);
    }
  };

  const filteredCreators = moderatedCreators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#06030e] text-white">
      <Header />

      <main className="container mx-auto px-6 py-12 pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Vitals & Config */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Platform Vitals */}
            <Card className="bg-[#120a21] border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <Activity className="h-5 w-5 text-purple-400" /> PLATFORM VITALS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[24px] bg-[#1a112d] border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">TOTAL MEMBERS</p>
                    <p className="text-4xl font-black text-white">133</p>
                  </div>
                  <div className="p-6 rounded-[24px] bg-[#1a112d] border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">WEEKLY GROWTH</p>
                    <p className="text-4xl font-black text-green-400">+14%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white/60">Total TAB Tipped</span>
                    <span className="text-sm font-black text-orange-400">4.2M TAB</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[60%] rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Config */}
            <Card className="bg-[#120a21] border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-2">
                <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <Settings className="h-5 w-5 text-orange-400" /> NETWORK CONFIG
                </CardTitle>
                <CardDescription className="text-white/60 font-medium">Global platform parameters</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">MEMBERSHIP FEE (XPR)</Label>
                  <div className="flex gap-4">
                    <Input 
                      type="number" 
                      value={membershipFee} 
                      onChange={(e) => setMembershipFee(e.target.value)}
                      className="bg-[#1a112d] border-white/20 rounded-2xl font-black text-xl h-16 px-6 focus:ring-orange-500/50 text-white"
                    />
                    <Button 
                      onClick={handleUpdateFee} 
                      className="bg-orange-500 hover:bg-orange-600 rounded-2xl px-8 h-16 font-black text-lg shadow-lg shadow-orange-500/20 text-white"
                    >
                      Update
                    </Button>
                  </div>
                  <p className="text-[10px] text-white/40 italic font-medium">Changes will reflect in Membership Modals immediately.</p>
                </div>
                
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <Button className="w-full h-16 rounded-[24px] bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 font-black text-sm flex items-center justify-between px-8">
                    Maintenance Mode <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  </Button>
                  <Button className="w-full h-16 rounded-[24px] bg-purple-500/10 border border-purple-500/40 text-purple-300 hover:bg-purple-500/20 font-black text-sm flex items-center justify-start gap-4 px-8">
                    <Bell className="h-4 w-4" />
                    Broadcast Network Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Moderation */}
          <div className="lg:col-span-8">
            <Card className="bg-[#120a21] border-white/10 rounded-[40px] overflow-hidden shadow-2xl min-h-[840px]">
              <CardHeader className="p-10 border-b border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight uppercase italic text-white">CREATOR MODERATION</CardTitle>
                    <CardDescription className="text-white/60 font-medium">Manage network access and profiles</CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input 
                      placeholder="Search handles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 bg-[#1a112d] border-white/20 rounded-2xl h-14 focus:ring-purple-500/50 text-white"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-white/40">Creator</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-white/40">Category</th>
                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredCreators.map((creator) => {
                        const isBanned = bannedHandles.includes(creator.handle);
                        return (
                          <tr key={creator.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-sm font-black border-2 border-white/10 text-white", creator.color)}>
                                  {creator.avatar}
                                </div>
                                <div>
                                  <p className="font-black text-base text-white">{creator.name}</p>
                                  <p className="text-xs text-purple-400 font-bold tracking-wider">@{creator.handle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/70">
                                {creator.category}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-2">
                                {isBanned ? (
                                  <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 font-black text-[10px] uppercase">
                                    <Lock className="h-3 w-3" /> Banned
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 font-black text-[10px] uppercase">
                                    <CheckCircle2 className="h-3 w-3" /> Active
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
                                    "h-12 w-12 rounded-2xl transition-all border border-white/10",
                                    isBanned 
                                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                                      : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  )}
                                >
                                  {isBanned ? <Unlock className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 text-white/40 border border-white/10">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
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
    </div>
  );
};

export default AdminHub;