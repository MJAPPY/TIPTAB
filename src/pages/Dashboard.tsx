"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User as UserIcon, 
  CreditCard, 
  TrendingUp, 
  Wallet,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/tabs";
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
    return num.toFixed(4);
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
    const amountNum = parseFloat(transferAmount);
    if (!transferAmount || isNaN(amountNum) || amountNum <= 0 || !transferRecipient) {
      toast({ title: "Invalid Input", description: "Please enter a valid amount and recipient.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const contract = transferSymbol === "TAB" ? "xtokens" : "eosio.token";
      const formattedQuantity = `${amountNum.toFixed(4)} ${transferSymbol}`;
      
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
        <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter italic">AUTHENTICATION REQUIRED</h1>
        <Button onClick={login} className="h-16 px-10 bg-[#a855f7] rounded-2xl font-black text-xl">Connect WebAuth</Button>
      </div>
    );
  }

  const navigationItems = [
    { id: "analytics", icon: TrendingUp, label: "Analytics" },
    { id: "card", icon: CreditCard, label: "My TipTab Card" },
    { id: "payouts", icon: Wallet, label: "Wallet & Payouts" },
    { id: "settings", icon: UserIcon, label: "Profile Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0514] text-white">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-8 pt-32 md:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-row lg:flex-col overflow-x-auto gap-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex-1 lg:w-full justify-start h-12 rounded-xl gap-3 px-4 font-bold",
                    activeTab === item.id ? "bg-purple-500/20 text-purple-400" : "text-white/80"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="analytics" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardDescription className="text-white/60 font-black">Settled TAB</CardDescription>
                      <Button variant="ghost" size="icon" onClick={handleManualRefresh} className="h-8 w-8 text-white/30 hover:text-white">
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl font-black">{Number(balances.tab).toLocaleString(undefined, { minimumFractionDigits: 4 })} TAB</CardTitle>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-8 mt-0">
                <Card className="bg-[#130b21] border-white/10 rounded-[32px] p-10">
                  <h3 className="text-2xl font-black italic uppercase mb-8">Transfer Funds</h3>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-white/40">Recipient Actor</Label>
                      <Input placeholder="username" value={transferRecipient} onChange={(e) => setTransferRecipient(e.target.value)} className="bg-white/5 h-14 rounded-2xl font-bold text-white" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-white/40">Amount</Label>
                      <div className="flex gap-2">
                        <Input placeholder="0.0000" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} onBlur={(e) => setTransferAmount(formatPrecision(e.target.value))} className="flex-1 bg-white/5 h-14 rounded-2xl font-black text-xl text-white" />
                        <Select value={transferSymbol} onValueChange={setTransferSymbol}>
                          <SelectTrigger className="w-[120px] bg-white/5 h-14 rounded-2xl font-black text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#1a102d] text-white">
                            <SelectItem value="TAB">TAB</SelectItem>
                            <SelectItem value="XPR">XPR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleTransfer} disabled={isSending} className="w-full h-20 bg-white text-black font-black text-xl rounded-3xl">
                      {isSending ? "Authorizing..." : "Execute Transfer"}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="card" className="mt-0">
                <TipTabCard creator={user} />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <ProfileEditor initialData={user} onSave={handleUpdateProfile} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;