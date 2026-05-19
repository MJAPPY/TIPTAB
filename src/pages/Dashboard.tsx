"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User as UserIcon, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  RefreshCw,
  Zap,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  Send
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
  const { isConnected, actor, balances, refreshBalances, session, login, isMember, isLoading: isAuthLoading } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  
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
        <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter italic">AUTHENTICATION <span className="text-orange-500">REQUIRED</span></h1>
        <Button onClick={login} className="h-20 px-12 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95">
          Connect WebAuth
        </Button>
      </div>
    );
  }

  const navigationItems = [
    { id: "analytics", icon: TrendingUp, label: "Analytics" },
    { id: "card", icon: CreditCard, label: "Network Pass", memberOnly: true },
    { id: "payouts", icon: Wallet, label: "Payouts" },
    { id: "settings", icon: UserIcon, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#06030e] text-white selection:bg-purple-500/30 font-sans">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />
      
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[150px] rounded-full" />
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 py-8 pt-36 md:pt-44 relative z-10">
        {/* Profile Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[48px] p-6 md:p-10 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
            <div className={cn(
              "h-24 w-24 md:h-32 md:w-32 rounded-[32px] md:rounded-[40px] flex items-center justify-center text-3xl md:text-5xl font-black border-4 border-white/10 shadow-2xl overflow-hidden shrink-0",
              user.color
            )}>
              {user.avatarImage ? (
                <img src={user.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.avatar
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">@{actor}</h1>
                {isMember ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <Lock className="h-3.5 w-3.5" /> Basic User
                  </div>
                )}
              </div>
              <p className="text-white/40 font-bold text-sm md:text-lg max-w-md line-clamp-1">{user.bio}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap">
             {navigationItems.map((item) => (
               <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "h-12 md:h-14 px-5 md:px-7 rounded-2xl gap-2.5 font-black text-[11px] md:text-xs uppercase tracking-widest transition-all",
                  activeTab === item.id 
                    ? "bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] scale-105" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
               >
                 <item.icon className="h-4 w-4" />
                 <span className="hidden sm:inline">{item.label}</span>
               </Button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Analytics View */}
            <TabsContent value="analytics" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <Card className="bg-gradient-to-br from-orange-600/20 via-orange-600/5 to-transparent border-white/10 text-white rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:border-orange-500/40 transition-all ring-1 ring-inset ring-white/5">
                  <div className="absolute top-0 right-0 p-8">
                    <Zap className="h-8 w-8 text-orange-500/20" />
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Settled Appreciation</CardDescription>
                      <Button variant="ghost" size="icon" onClick={handleManualRefresh} className="h-10 w-10 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-end gap-3">
                      <span className="text-5xl md:text-7xl font-black tracking-tighter text-white">{Number(balances.tab).toLocaleString()}</span>
                      <span className="text-lg font-black text-orange-500 italic mb-2">TAB</span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-green-400/80 text-[10px] font-black uppercase tracking-widest">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live Network Sync
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600/20 via-purple-600/5 to-transparent border-white/10 text-white rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all ring-1 ring-inset ring-white/5">
                  <div className="absolute top-0 right-0 p-8">
                    <Wallet className="h-8 w-8 text-purple-500/20" />
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <CardDescription className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Liquid Proton</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-end gap-3">
                      <span className="text-5xl md:text-7xl font-black tracking-tighter text-white">{Number(balances.xpr).toLocaleString()}</span>
                      <span className="text-lg font-black text-purple-400 italic mb-2">XPR</span>
                    </div>
                    <div className="mt-8 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[70%] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-[#130b21]/60 border-white/10 text-white rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col justify-between ring-1 ring-inset ring-white/5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-2xl font-black tracking-tight italic uppercase">Boost Earnings</h3>
                    </div>
                    <p className="text-white/40 text-sm font-bold leading-relaxed">Active creators receive 240% more visibility on the global map through the verified creator pool.</p>
                  </div>
                  {!isMember ? (
                    <Button 
                      onClick={() => setIsMembershipOpen(true)}
                      className="w-full h-14 bg-white text-black hover:bg-cyan-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-8 shadow-xl"
                    >
                      Join Network
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full h-14 bg-white/5 border-white/10 text-white/40 rounded-2xl font-black text-xs uppercase tracking-widest cursor-default mt-8"
                    >
                      Maximized Reach
                    </Button>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Payouts View */}
            <TabsContent value="payouts" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="max-w-4xl mx-auto">
                <Card className="bg-[#0d071a] border-white/10 rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden ring-1 ring-inset ring-white/5">
                  <div className="absolute top-0 right-0 p-10 md:p-16 pointer-events-none">
                    <Send className="h-32 w-32 text-white/[0.02]" />
                  </div>
                  <div className="mb-12 space-y-2">
                    <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Execute <span className="text-orange-500">Transfer</span></h3>
                    <p className="text-white/30 font-bold">Instantly settle assets on the XPR Network</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Recipient Handle</Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                          <Input 
                            placeholder="username" 
                            value={transferRecipient} 
                            onChange={(e) => setTransferRecipient(e.target.value)} 
                            className="bg-white/5 border-white/10 h-16 md:h-20 rounded-[28px] font-bold text-lg md:text-xl text-white pl-16 focus:ring-purple-500/50 focus:bg-white/10 transition-all border-2" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Quantity & Symbol</Label>
                        <div className="flex gap-4">
                          <div className="relative flex-1">
                            <Input 
                              placeholder="0" 
                              value={transferAmount} 
                              onChange={(e) => setTransferAmount(e.target.value)} 
                              onBlur={(e) => setTransferAmount(formatPrecision(e.target.value))} 
                              className="bg-white/5 border-white/10 h-16 md:h-20 rounded-[28px] font-black text-2xl md:text-3xl text-white px-8 focus:ring-orange-500/50 focus:bg-white/10 transition-all border-2" 
                            />
                          </div>
                          <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                            <SelectTrigger className="w-[120px] md:w-[160px] bg-white/5 border-white/10 h-16 md:h-20 rounded-[28px] font-black text-xl text-white transition-all border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-2xl">
                              <SelectItem value="TAB" className="font-black py-3 cursor-pointer">TAB</SelectItem>
                              <SelectItem value="XPR" className="font-black py-3 cursor-pointer">XPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <Button 
                        onClick={handleTransfer} 
                        disabled={isSending} 
                        className="w-full h-24 md:h-32 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[32px] md:rounded-[40px] font-black text-2xl md:text-3xl shadow-[0_20px_60px_-10px_rgba(255,255,255,0.1)] transition-all active:scale-[0.97] flex flex-col items-center justify-center gap-1"
                      >
                        {isSending ? (
                          <RefreshCw className="h-10 w-10 animate-spin" />
                        ) : (
                          <>
                            <Zap className="h-8 w-8 mb-1 fill-black group-hover:fill-white" />
                            <span>SEND ASSET</span>
                          </>
                        )}
                      </Button>
                      <p className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">Secure On-Chain Settlement</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Network Pass (Member Only) View */}
            <TabsContent value="card" className="mt-0 animate-in zoom-in-95 duration-500">
              <div className="max-w-2xl mx-auto">
                {!isMember ? (
                  <div className="bg-[#130b21] border-2 border-dashed border-white/10 rounded-[48px] p-12 md:p-20 text-center space-y-8 backdrop-blur-xl">
                    <div className="mx-auto h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Lock className="h-10 w-10 text-white/20" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black italic tracking-tighter">PASS <span className="text-orange-500">LOCKED</span></h2>
                      <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                        Your custom TipTab card and global map placement require active network membership.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsMembershipOpen(true)}
                      className="h-16 px-10 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-orange-500/20"
                    >
                      Join & Unlock Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="text-center space-y-3">
                      <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter">NETWORK <span className="text-orange-500">PASS</span></h2>
                      <p className="text-white/40 font-bold text-lg">Share this card anywhere to receive zero-fee tips.</p>
                    </div>
                    <TipTabCard creator={user} />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Profile Settings View */}
            <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-4xl mx-auto">
                <ProfileEditor initialData={user} onSave={handleUpdateProfile} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Dashboard;