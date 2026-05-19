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
  HandCoins
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
import { CREATORS, Creator } from "@/data/creators";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isConnected, actor, balances, refreshBalances, session, login, isLoading: isAuthLoading, isMember } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferSymbol, setTransferSymbol] = useState("TAB");
  const [isSending, setIsSending] = useState(false);

  const [user, setUser] = useState<Creator>(() => {
    const saved = localStorage.getItem("tiptab_user_profile");
    return saved ? JSON.parse(saved) : CREATORS[0];
  });

  useEffect(() => {
    if (isConnected && actor) {
      const savedProfile = localStorage.getItem(`tiptab_profile_${actor}`);
      if (savedProfile) {
        setUser(JSON.parse(savedProfile));
      } else {
        const newProfile: Creator = {
          id: `user_${actor}`,
          name: actor,
          handle: actor,
          bio: "Just joined the TIP TAB network!",
          location: "Global",
          coordinates: [0, 0],
          category: "Other",
          avatar: actor.slice(0, 2).toUpperCase(),
          color: "bg-purple-600"
        };
        setUser(newProfile);
      }
    }
  }, [isConnected, actor]);

  const formatPrecision = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    return transferSymbol === "TAB" ? Math.floor(num).toString() : num.toFixed(4);
  };

  const handleUpdateProfile = (updatedData: Creator) => {
    setUser(updatedData);
    if (actor) {
      localStorage.setItem(`tiptab_profile_${actor}`, JSON.stringify(updatedData));
      localStorage.setItem("tiptab_user_profile", JSON.stringify(updatedData));
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 800);
    toast({ title: "Balances Updated", description: "Synced with XPR Network." });
  };

  const handleTransfer = async () => {
    if (!session || !actor) return;
    const amountNum = transferSymbol === "TAB" ? Math.floor(parseFloat(transferAmount)) : parseFloat(transferAmount);
    if (!transferAmount || isNaN(amountNum) || amountNum <= 0 || !transferRecipient) {
      toast({ title: "Invalid Input", description: "Please enter a valid amount and recipient.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const contract = transferSymbol === "TAB" ? "tokencreate" : "eosio.token";
      const formattedQuantity = transferSymbol === "TAB" ? `${amountNum} TAB` : `${amountNum.toFixed(4)} ${transferSymbol}`;
      
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />
        <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter italic text-slate-100">AUTHENTICATION <span className="text-orange-500">REQUIRED</span></h1>
        <Button onClick={login} className="h-20 px-12 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95">
          Connect WebAuth
        </Button>
      </div>
    );
  }

  const navigationItems = useMemo(() => {
    const items = [
      { id: "analytics", icon: TrendingUp, label: "Analytics" },
      { id: "payouts", icon: Wallet, label: "Payouts" },
    ];
    
    if (isMember) {
      items.splice(1, 0, { id: "card", icon: CreditCard, label: "Card" });
      items.push({ id: "settings", icon: UserIcon, label: "Profile" });
    }
    
    return items;
  }, [isMember]);

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header />
      
      {/* Cinematic Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-900/10 to-transparent -z-10" />
      <div className="absolute top-48 left-1/4 w-[600px] h-[600px] bg-magenta-500/5 blur-[180px] rounded-full -z-10 animate-pulse" />
      
      <main className="container mx-auto px-4 md:px-6 py-8 pt-32 sm:pt-44 relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="space-y-3 sm:space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
              {isMember ? "Creator Portal" : "Supporter Portal"}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none text-slate-100">
              Welcome, <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">@{actor}</span>
            </h1>
          </div>
          
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-4 bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl">
             {navigationItems.map((item) => (
               <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "h-12 sm:h-14 px-4 sm:px-6 rounded-2xl gap-2 sm:gap-3 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all",
                  activeTab === item.id 
                    ? "bg-white text-black shadow-xl" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                )}
               >
                 <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                 <span>{item.label}</span>
               </Button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          <div className="lg:col-span-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="analytics" className="space-y-6 sm:space-y-10 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                  <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-all" />
                    <CardHeader className="p-0 mb-4 sm:mb-6">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Settled TAB</CardDescription>
                        <Button variant="ghost" size="icon" onClick={handleManualRefresh} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/5 text-white/30 hover:text-white transition-all">
                          <RefreshCw className={cn("h-3 w-3 sm:h-4 sm:w-4", isRefreshing && "animate-spin")} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-end gap-2 sm:gap-3">
                        <span className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-100">{Number(balances.tab).toLocaleString()}</span>
                        <span className="text-sm sm:text-lg font-black text-orange-500 italic mb-1.5 sm:mb-2">TAB</span>
                      </div>
                      <div className="mt-4 sm:mt-6 flex items-center gap-2 text-green-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" />
                        Network Live
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all" />
                    <CardHeader className="p-0 mb-4 sm:mb-6">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Liquid XPR</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-end gap-2 sm:gap-3">
                        <span className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-100">{Number(balances.xpr).toLocaleString()}</span>
                        <span className="text-sm sm:text-lg font-black text-purple-400 italic mb-1.5 sm:mb-2">XPR</span>
                      </div>
                      <div className="mt-4 sm:mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[65%] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#130b21]/60 border-white/10 text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all sm:col-span-2 md:col-span-1">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full group-hover:bg-pink-500/20 transition-all" />
                    <CardHeader className="p-0 mb-4 sm:mb-6">
                      <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">Tips Sent</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-end gap-2 sm:gap-3">
                        <span className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-100">0</span>
                        <span className="text-sm sm:text-lg font-black text-pink-500 italic mb-1.5 sm:mb-2">TAB</span>
                      </div>
                      <div className="mt-4 sm:mt-6 flex items-center gap-2 text-pink-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                        <Heart className="h-3 w-3" />
                        Community Impact
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="max-w-3xl mx-auto">
                  <Card className="bg-[#130b21] border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 sm:p-10">
                      <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-white/5" />
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-black italic uppercase mb-6 sm:mb-10 tracking-tighter text-slate-100">Execute <span className="text-orange-500">Transfer</span></h3>
                    
                    <div className="space-y-6 sm:space-y-10">
                      <div className="space-y-3 sm:space-y-4">
                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Recipient Actor</Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                          <Input 
                            placeholder="username" 
                            value={transferRecipient} 
                            onChange={(e) => setTransferRecipient(e.target.value)} 
                            className="bg-white/5 border-white/10 h-14 sm:h-20 rounded-2xl sm:rounded-[28px] font-bold text-base sm:text-xl text-slate-100 pl-12 sm:pl-16 focus:ring-purple-500/50 focus:bg-white/10 transition-all" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Amount & Asset</Label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="relative flex-1">
                            <Input 
                              placeholder="0" 
                              value={transferAmount} 
                              onChange={(e) => setTransferAmount(e.target.value)} 
                              onBlur={(e) => setTransferAmount(formatPrecision(e.target.value))} 
                              className="bg-white/5 border-white/10 h-14 sm:h-20 rounded-2xl sm:rounded-[28px] font-black text-xl sm:text-3xl text-slate-100 px-6 sm:px-8 focus:ring-orange-500/50 focus:bg-white/10 transition-all" 
                            />
                          </div>
                          <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                            <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] bg-white/5 border-white/10 h-14 sm:h-20 rounded-2xl sm:rounded-[28px] font-black text-lg sm:text-xl text-slate-100 transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-2xl">
                              <SelectItem value="TAB" className="font-black py-3 cursor-pointer">TAB</SelectItem>
                              <SelectItem value="XPR" className="font-black py-3 cursor-pointer">XPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        onClick={handleTransfer} 
                        disabled={isSending} 
                        className="w-full h-16 sm:h-24 bg-white text-black hover:bg-orange-500 hover:text-white font-black text-lg sm:text-2xl rounded-2xl sm:rounded-[32px] shadow-2xl shadow-white/5 transition-all active:scale-[0.98]"
                      >
                        {isSending ? (
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 sm:h-8 sm:w-8 border-2 sm:border-4 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>SENDING...</span>
                          </div>
                        ) : (
                          "Execute Transfer"
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {isMember && (
                <>
                  <TabsContent value="card" className="mt-0 animate-in zoom-in-95 duration-500">
                    <div className="max-w-xl mx-auto px-2">
                      <div className="text-center mb-8 sm:mb-10 space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-100">Your Network Pass</h2>
                        <p className="text-slate-400 font-medium text-xs sm:text-base">Share this card anywhere to receive zero-fee tips.</p>
                      </div>
                      <TipTabCard creator={user} />
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-4xl mx-auto px-2">
                      <ProfileEditor initialData={user} onSave={handleUpdateProfile} />
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;