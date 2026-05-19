"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User as UserIcon, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  RefreshCw,
  Zap,
  ShieldCheck,
  Heart,
  Settings as SettingsIcon,
  ChevronRight,
  HandCoins,
  ShoppingCart,
  ExternalLink,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TipTabCard } from "@/components/tab-platform/TipTabCard";
import { ProfileEditor } from "@/components/tab-platform/ProfileEditor";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { CREATORS, Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isConnected, actor, balances, refreshBalances, recordTip, session, login, isLoading: isAuthLoading, isMember, membershipDate, userProfile, updateUserProfile } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferSymbol, setTransferSymbol] = useState("TAB");
  const [isSending, setIsSending] = useState(false);

  const alcorUrl = "https://alcor.exchange/v/xpr/swap?input=xpr-eosio.token&output=tab-tokencreate";

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 800);
    toast({ title: "Balances Updated", description: "Synced with XPR Network." });
  };

  const handleTransfer = async () => {
    if (!session || !actor) return;
    const amountNum = parseFloat(transferAmount);
    if (!transferAmount || isNaN(amountNum) || amountNum <= 0 || !transferRecipient) {
      toast({ title: "Invalid Input", description: "Please enter a valid amount and recipient.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const contract = transferSymbol === "TAB" ? "tokencreate" : "eosio.token";
      const formattedQuantity = transferSymbol === "TAB" ? `${Math.floor(amountNum)} TAB` : `${amountNum.toFixed(4)} XPR`;
      
      const actions = [{
        account: contract,
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: session.auth.permission,
        }],
        data: {
          from: actor,
          to: transferRecipient.toLowerCase().trim(),
          quantity: formattedQuantity,
          memo: 'Sent from TIP TAB Dashboard',
        },
      }];

      await session.transact({ actions }, { broadcast: true });
      
      if (transferSymbol === "TAB") {
        recordTip(Math.floor(amountNum));
      }

      toast({
        title: "Transfer Complete",
        description: `Successfully sent ${formattedQuantity} to @${transferRecipient}`,
      });
      
      setTransferAmount("");
      setTransferRecipient("");
      refreshBalances();
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Please check your balance and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isConnected && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />
        <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter italic">AUTH <span className="text-orange-500">REQUIRED</span></h1>
        <Button onClick={login} className="h-20 px-12 bg-white text-black hover:bg-purple-500 hover:text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95">
          Connect WebAuth
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header />
      
      {/* Cinematic backgrounds */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-900/10 to-transparent -z-10" />
      <div className="absolute top-48 left-1/4 w-[600px] h-[600px] bg-magenta-500/5 blur-[180px] rounded-full -z-10 animate-pulse" />
      
      <main className="container mx-auto px-6 py-12 pt-44 relative z-10 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
              {isMember ? "Creator Portal" : "Supporter Portal"}
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
              Welcome, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">@{actor}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-2xl">
             {[
               { id: "analytics", icon: TrendingUp, label: "Analytics" },
               { id: "payouts", icon: Wallet, label: "Payouts" },
               { id: "settings", icon: UserIcon, label: "Profile" }
             ].map((item) => (
               <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "h-14 px-8 rounded-2xl gap-3 font-black text-xs uppercase tracking-widest transition-all",
                  activeTab === item.id 
                    ? "bg-purple-600 text-white shadow-2xl" 
                    : "text-slate-400 hover:text-white"
                )}
               >
                 <item.icon className="h-4 w-4" />
                 <span>{item.label}</span>
               </Button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="analytics" className="space-y-12 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Liquid TAB Card */}
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all flex flex-col h-[380px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
                    <CardHeader className="p-0">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Liquid TAB</CardDescription>
                        <Button variant="ghost" size="icon" onClick={handleManualRefresh} className="h-10 w-10 rounded-xl bg-white/5 text-white/30 hover:text-purple-400">
                          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mt-8 flex flex-col flex-1">
                      <div className="flex flex-col items-start gap-1 flex-1">
                        <span className="text-7xl font-black tracking-tighter text-white truncate w-full leading-none">
                          {Number(balances.tab).toLocaleString()}
                        </span>
                        <span className="text-xl font-black text-orange-500 italic uppercase">TAB</span>
                      </div>
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest">
                          <ShieldCheck className="h-3 w-3" />
                          Network Live
                        </div>
                        <Button asChild variant="ghost" className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest gap-2">
                          <a href={alcorUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /> Exchange</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liquid XPR Card */}
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all flex flex-col h-[380px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
                    <CardHeader className="p-0">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Liquid XPR</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-8 flex flex-col flex-1">
                      <div className="flex flex-col items-start gap-1 flex-1">
                        <span className="text-5xl font-black tracking-tighter text-white truncate w-full leading-none">
                          {Number(balances.xpr).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </span>
                        <span className="text-xl font-black text-purple-400 italic uppercase">XPR</span>
                      </div>
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                          <Zap className="h-3 w-3 fill-cyan-400" />
                          Gasless Node
                        </div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Proton Web SDK</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Membership Card */}
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col h-[380px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                    <CardHeader className="p-0">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Network Status</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-8 flex flex-col flex-1">
                      <div className="flex flex-col items-start gap-1 flex-1">
                        <span className={cn(
                          "text-3xl font-black italic tracking-tighter leading-none",
                          isMember ? "text-blue-400" : "text-white/20"
                        )}>
                          {isMember ? "VERIFIED PRO" : "GUEST PASS"}
                        </span>
                        {isMember && (
                          <div className="flex items-center gap-2 text-white/40 mt-3 text-xs font-bold">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(membershipDate || "").toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-6">
                        {!isMember && (
                          <Button 
                            onClick={() => setIsMembershipModalOpen(true)}
                            className="w-full h-14 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl"
                          >
                            Activate Creator Status
                          </Button>
                        )}
                        {isMember && (
                          <Button 
                            onClick={() => setActiveTab("settings")}
                            className="w-full h-14 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                          >
                            Update Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="max-w-3xl mx-auto">
                  <Card className="bg-[#130b21] border-white/10 rounded-[56px] p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12">
                      <HandCoins className="h-16 w-16 text-white/10" />
                    </div>
                    <h3 className="text-4xl font-black italic uppercase mb-12 tracking-tighter">Execute <span className="text-orange-500">Transfer</span></h3>
                    
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Recipient Handle</Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                          <Input 
                            placeholder="actorname" 
                            value={transferRecipient} 
                            onChange={(e) => setTransferRecipient(e.target.value)} 
                            className="bg-white/5 border-white/10 h-20 rounded-[32px] font-bold text-xl text-white pl-16 focus:ring-purple-500/50 focus:bg-white/10 transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Amount & Asset</Label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <Input 
                              placeholder="0" 
                              value={transferAmount} 
                              onChange={(e) => setTransferAmount(e.target.value)} 
                              className="bg-white/5 border-white/10 h-20 rounded-[32px] font-black text-3xl text-white px-8 focus:ring-orange-500/50 focus:bg-white/10 transition-all" 
                            />
                          </div>
                          <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 h-20 rounded-[32px] font-black text-2xl text-white transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-2xl">
                              <SelectItem value="TAB" className="font-black py-4 cursor-pointer">TAB</SelectItem>
                              <SelectItem value="XPR" className="font-black py-4 cursor-pointer">XPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        onClick={handleTransfer} 
                        disabled={isSending} 
                        className="w-full h-24 bg-white text-black hover:bg-purple-500 hover:text-white font-black text-2xl rounded-[32px] shadow-2xl shadow-white/5 transition-all active:scale-95"
                      >
                        {isSending ? "Authorizing..." : "Execute Transfer"}
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-12 space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter">Public Identity</h2>
                    <p className="text-slate-400 font-medium">Manage how you appear on the global discovery map.</p>
                  </div>
                  {userProfile && <ProfileEditor initialData={userProfile} onSave={updateUserProfile} />}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <MembershipModal 
        isOpen={isMembershipModalOpen} 
        onOpenChange={setIsMembershipModalOpen} 
      />
    </div>
  );
};

export default Dashboard;