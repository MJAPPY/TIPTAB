"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User as UserIcon, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  ArrowLeft, 
  Bell, 
  Wallet,
  Zap,
  Share2,
  Check,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
  const { isConnected, actor, balances, refreshBalances, session, login, isLoading: isAuthLoading } = useXpr();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("analytics");
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Wallet Transfer State
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferSymbol, setTransferSymbol] = useState("TAB");
  const [isSending, setIsSending] = useState(false);

  // Profile State
  const [user, setUser] = useState<Creator>(() => {
    const saved = localStorage.getItem("tiptab_user_profile");
    return saved ? JSON.parse(saved) : CREATORS[0];
  });

  // Effect to sync user profile with logged in actor
  useEffect(() => {
    if (isConnected && actor) {
      const savedProfile = localStorage.getItem(`tiptab_profile_${actor}`);
      if (savedProfile) {
        setUser(JSON.parse(savedProfile));
      } else {
        // Create a default profile for the new actor
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
    if (!transferAmount || !transferRecipient) {
      toast({ title: "Missing Fields", description: "Please enter amount and recipient.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const contract = transferSymbol === "TAB" ? "tokencreate" : "eosio.token";
      const precision = transferSymbol === "TAB" ? 6 : 4;
      
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
          quantity: `${parseFloat(transferAmount).toFixed(precision)} ${transferSymbol}`,
          memo: 'Sent from TIP TAB Dashboard',
        },
      }];

      await session.transact({ actions }, { broadcast: true });
      
      toast({
        title: "Transfer Complete",
        description: `Successfully sent ${transferAmount} ${transferSymbol} to @${transferRecipient}`,
      });
      
      setTransferAmount("");
      setTransferRecipient("");
      refreshBalances();
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Transaction cancelled.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tip/${user.handle}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Support ${user.name}`, url: shareUrl });
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast({ title: "Link Copied!", description: "Tipping link copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Auth Guard
  if (!isConnected && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent -z-10" />
        <img src="/src/assets/logo.png" alt="TIPTAB" className="h-24 w-24 mb-8 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" />
        <h1 className="text-4xl font-black mb-4 tracking-tighter italic">AUTHENTICATION REQUIRED</h1>
        <p className="text-white/60 max-w-sm mb-10 font-medium">Please connect your WebAuth wallet to access your creator dashboard and manage your earnings.</p>
        <Button 
          onClick={login}
          className="h-16 px-10 bg-[#a855f7] hover:bg-[#9333ea] rounded-2xl font-black text-xl shadow-2xl shadow-purple-500/20 gap-3"
        >
          <Zap className="h-6 w-6 fill-white" />
          Connect WebAuth
        </Button>
        <Link to="/" className="mt-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Map
        </Link>
      </div>
    );
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0a0514] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navigationItems = [
    { id: "analytics", icon: TrendingUp, label: "Analytics" },
    { id: "card", icon: CreditCard, label: "My TipTab Card" },
    { id: "payouts", icon: Wallet, label: "Wallet & Payouts" },
    { id: "settings", icon: UserIcon, label: "Profile Settings" },
    { id: "account", icon: Settings, label: "Account Prefs" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0514] text-white">
      <Header />

      <main className="container mx-auto px-6 py-12 pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={`w-full justify-start h-12 rounded-xl gap-3 px-4 font-bold transition-all ${
                  activeTab === item.id 
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                    : "text-white/80 hover:bg-white/10 border border-transparent"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
            
            <div className="pt-8">
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-600/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-orange-500/10 rotate-12 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-sm mb-2 uppercase tracking-widest">Live Link</h4>
                <p className="text-xs text-white/70 mb-4 leading-relaxed font-medium">
                  Supporters tip you directly on the XPR Network.
                </p>
                <div className="flex flex-col gap-2">
                  <Link to={`/tip/${user.handle}`} className="w-full">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-10 rounded-xl text-xs shadow-lg shadow-orange-500/20 transition-all">
                      View Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={handleShare}
                    className="w-full bg-white/10 border-white/20 text-white font-bold h-10 rounded-xl text-xs hover:bg-white/10 gap-2"
                  >
                    {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Share2 className="h-3 w-3" />}
                    {isCopied ? "Copied" : "Share URL"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              {/* Analytics Section */}
              <TabsContent value="analytics" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px] overflow-hidden group">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/70 uppercase tracking-widest text-[10px] font-black">Settled TAB</CardDescription>
                      <CardTitle className="text-3xl font-black group-hover:text-orange-500 transition-colors">
                        {Number(balances.tab).toLocaleString()} <span className="text-orange-500 text-sm">TAB</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                        +12% activity increase
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px] overflow-hidden group">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/70 uppercase tracking-widest text-[10px] font-black">XPR Balance</CardDescription>
                      <CardTitle className="text-3xl font-black group-hover:text-purple-500 transition-colors">
                        {Number(balances.xpr).toLocaleString()} <span className="text-purple-500 text-sm">XPR</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-purple-500 font-bold flex items-center gap-1">
                        Available for gas/resources
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px] overflow-hidden group">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/70 uppercase tracking-widest text-[10px] font-black">Network ID</CardDescription>
                      <CardTitle className="text-3xl font-black group-hover:text-orange-500 transition-colors italic">@{actor}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-white/60 font-bold flex items-center gap-1">
                        Verified via WebAuth
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-[#130b21] border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase">Recent Appreciation</h3>
                    <Button variant="ghost" onClick={handleManualRefresh} className="text-white/70 hover:text-white gap-2">
                      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /> Refresh
                    </Button>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
                      <p className="text-white/40 font-bold italic">No recent tipping activity detected on-chain.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Wallet & Payouts Section */}
              <TabsContent value="payouts" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-gradient-to-br from-purple-900/40 to-[#0a0514] border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group border-t-purple-500/30">
                       <div className="absolute top-0 right-0 p-6">
                         <ShieldCheck className="h-6 w-6 text-purple-400" />
                       </div>
                       <div className="space-y-1 mb-10">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Connected Wallet</p>
                         <h3 className="text-3xl font-black italic tracking-tighter text-white">@{actor}</h3>
                       </div>
                       
                       <div className="space-y-6">
                         <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">TAB Network Token</p>
                            <div className="flex items-end gap-2">
                              <span className="text-4xl font-black text-orange-500">{Number(balances.tab).toLocaleString()}</span>
                              <span className="text-sm font-bold text-white/80 mb-1.5">TAB</span>
                            </div>
                         </div>
                         <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">Proton Native</p>
                            <div className="flex items-end gap-2">
                              <span className="text-4xl font-black text-purple-400">{Number(balances.xpr).toLocaleString()}</span>
                              <span className="text-sm font-bold text-white/80 mb-1.5">XPR</span>
                            </div>
                         </div>
                       </div>

                       <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/20 text-[10px] font-black uppercase tracking-widest text-white/60">
                          <span>Verified Non-Custodial</span>
                          <span className="text-green-500">Online</span>
                       </div>
                    </Card>
                    
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-[32px] p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <ArrowUpRight className="h-5 w-5 text-orange-500" />
                        <h4 className="font-black text-lg italic uppercase tracking-tighter text-white">Settlement Note</h4>
                      </div>
                      <p className="text-xs text-white/90 font-medium leading-relaxed">
                        TIPTAB is non-custodial. Tips are sent directly to your <span className="text-orange-500">@{actor}</span> account. You do not need to "withdraw"—your funds are always in your wallet.
                      </p>
                    </div>
                  </div>

                  <Card className="lg:col-span-7 bg-[#130b21] border-white/10 rounded-[40px] p-8 shadow-2xl">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3 text-white">
                      <Send className="h-5 w-5 text-orange-500" /> Transfer Funds
                    </h3>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/80">Recipient Actor</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 font-bold">@</span>
                          <Input 
                            placeholder="username" 
                            value={transferRecipient}
                            onChange={(e) => setTransferRecipient(e.target.value)}
                            className="bg-white/10 border-white/20 h-14 rounded-2xl pl-10 font-bold text-lg focus:ring-purple-500 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/80">Amount & Currency</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number"
                            placeholder="0.00" 
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            className="flex-1 bg-white/10 border-white/20 h-14 rounded-2xl font-black text-xl focus:ring-orange-500 text-white"
                          />
                          <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                            <SelectTrigger className="w-[100px] bg-white/10 border-white/20 h-14 rounded-2xl font-black text-lg text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-xl">
                              <SelectItem value="TAB" className="font-black">TAB</SelectItem>
                              <SelectItem value="XPR" className="font-black">XPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        onClick={handleTransfer}
                        disabled={isSending}
                        className="w-full h-20 bg-white text-black hover:bg-orange-500 hover:text-white font-black text-xl rounded-3xl transition-all shadow-xl shadow-white/10 active:scale-95 group"
                      >
                        {isSending ? (
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>Authorizing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span>Execute Transfer</span>
                            <ArrowUpRight className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </div>
                        )}
                      </Button>

                      <p className="text-[10px] text-center text-white/60 uppercase tracking-[0.2em] font-black">
                        Immediate settlement on XPR Network
                      </p>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* TipTab Card Section */}
              <TabsContent value="card" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col md:flex-row gap-12 items-center justify-center py-12">
                   <TipTabCard creator={user} />
                   
                   <div className="max-w-xs space-y-6">
                      <h3 className="text-3xl font-black leading-tight tracking-tight italic text-white">YOUR DIGITAL <br /> <span className="text-orange-500">TIP TAB</span> CARD</h3>
                      <p className="text-white/80 text-lg font-medium">
                        This is your unique creator credential. Download it to share on socials, print it for physical tipping, or display it on your stream.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-green-500 font-black bg-green-500/10 p-4 rounded-2xl border border-green-500/20 uppercase tracking-widest">
                          <ShieldCheck className="h-5 w-5" /> Zero Fees
                        </div>
                        <div className="flex items-center gap-3 text-sm text-purple-500 font-black bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 uppercase tracking-widest">
                          <Zap className="h-5 w-5" /> Instant Send
                        </div>
                      </div>
                   </div>
                </div>
              </TabsContent>

              {/* Profile Settings Section */}
              <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <ProfileEditor initialData={user} onSave={handleUpdateProfile} />
              </TabsContent>

              {/* Account Prefs Placeholder */}
              <TabsContent value="account" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[#130b21] border border-white/10 rounded-[32px] p-20 text-center">
                  <div className="h-20 w-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                    <Settings className="h-10 w-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic text-white">Account Preferences</h3>
                  <p className="text-white/80 font-bold">Advanced security and notification parameters coming soon.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;