"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Settings, 
  Ban, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Activity,
  Search,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useXpr } from "@/contexts/XprContext";
import { Header } from "@/components/tab-platform/Header";
import { CREATORS, Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AdminHub = () => {
  const { isAdmin, isConnected, actor } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [membershipFee, setMembershipFee] = useState("2500");
  const [searchQuery, setSearchQuery] = useState("");
  const [moderatedCreators, setModeratedCreators] = useState<Creator[]>(CREATORS);
  const [bannedHandles, setBannedHandles] = useState<string[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (!isConnected || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "This area is restricted to @tabxpr network administrators.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAdmin, isConnected, navigate, toast]);

  const handleUpdateFee = () => {
    toast({
      title: "Fee Updated",
      description: `Membership fee has been set to ${membershipFee} TAB globally.`,
    });
  };

  const toggleBan = (handle: string) => {
    const isBanned = bannedHandles.includes(handle);
    if (isBanned) {
      setBannedHandles(prev => prev.filter(h => h !== handle));
      toast({ title: "User Restored", description: `@${handle} is no longer restricted.` });
    } else {
      setBannedHandles(prev => [...prev, handle]);
      toast({ title: "User Banned", description: `@${handle} access has been revoked.`, variant: "destructive" });
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

      <main className="container mx-auto px-6 py-12 pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stats & Settings */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" /> Platform Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Members</p>
                    <p className="text-2xl font-black">{CREATORS.length + 124}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Weekly Growth</p>
                    <p className="text-2xl font-black text-green-500">+14%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-white/40">Total TAB Tipped</span>
                    <span className="text-orange-500">4.2M TAB</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[65%]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] overflow-hidden border-t-orange-500/20">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-400" /> Network Config
                </CardTitle>
                <CardDescription className="text-white/40">Global platform parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Membership Fee (TAB)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={membershipFee} 
                      onChange={(e) => setMembershipFee(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl font-black text-lg h-12"
                    />
                    <Button onClick={handleUpdateFee} className="bg-orange-500 hover:bg-orange-600 rounded-xl px-6 h-12 font-bold">Update</Button>
                  </div>
                  <p className="text-[10px] text-white/30 italic">Changes will reflect in Membership Modals immediately.</p>
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                    Maintenance Mode <div className="h-2 w-2 rounded-full bg-red-500/20" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                    Broadcast Network Alert <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Moderation */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="bg-[#0d071a] border-white/10 text-white rounded-[32px] min-h-[600px] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight">Creator Moderation</CardTitle>
                    <CardDescription className="text-white/40 text-lg">Manage profiles and network access</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      placeholder="Search handles..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-orange-500/50"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <tr>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Creator</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Category</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Location</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCreators.map((creator) => {
                        const isBanned = bannedHandles.includes(creator.handle);
                        return (
                          <tr key={creator.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-xs font-black shrink-0", creator.color)}>
                                  {creator.avatar}
                                </div>
                                <div>
                                  <p className="font-black text-sm">{creator.name}</p>
                                  <p className="text-xs text-purple-400 font-bold">@{creator.handle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                                {creator.category}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-sm text-white/40 font-bold">{creator.location}</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                {isBanned ? (
                                  <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                                    <Ban className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Banned</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleBan(creator.handle)}
                                  className={cn(
                                    "h-10 w-10 rounded-xl transition-all",
                                    isBanned 
                                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
                                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                  )}
                                >
                                  {isBanned ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 text-white/40 hover:text-white">
                                  <MoreVertical className="h-4 w-4" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] p-8 border-l-4 border-l-yellow-500">
                <h4 className="flex items-center gap-2 font-black uppercase tracking-widest text-xs text-yellow-500 mb-4">
                  <AlertTriangle className="h-4 w-4" /> Pending Reports
                </h4>
                <p className="text-white/40 text-sm mb-6">There are 2 profiles flagged for manual review by the community.</p>
                <Button variant="outline" className="w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Review Reports</Button>
              </Card>
              <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] p-8 border-l-4 border-l-purple-500">
                <h4 className="flex items-center gap-2 font-black uppercase tracking-widest text-xs text-purple-500 mb-4">
                  <Activity className="h-4 w-4" /> Admin Log
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-white/30">System Update</span>
                    <span>2h ago</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-white/30">Fee Adjusted</span>
                    <span>5h ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHub;