import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  ArrowLeft, 
  Bell, 
  Wallet,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TipTabCard } from "@/components/tab-platform/TipTabCard";
import { ProfileEditor } from "@/components/tab-platform/ProfileEditor";
import { CREATORS } from "@/data/creators";

const Dashboard = () => {
  // Mock logged in user
  const user = CREATORS[0];
  const [activeTab, setActiveTab] = useState("overview");

  const navigationItems = [
    { id: "overview", icon: TrendingUp, label: "Analytics" },
    { id: "card", icon: CreditCard, label: "My TipTab Card" },
    { id: "settings", icon: User, label: "Profile Settings" },
    { id: "payouts", icon: Wallet, label: "Payouts & Wallet" },
    { id: "account", icon: Settings, label: "Account Prefs" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0514] text-white">
      <header className="border-b border-white/10 bg-[#0a0514]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-bold">Back to Map</span>
            </Link>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2">
              <img src="/src/assets/logo.png" alt="TIPTAB" className="h-8 w-8 object-contain" />
              <span className="text-xl font-black italic tracking-tighter">
                CREATOR<span className="text-orange-500">HUB</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white relative">
              <Bell className="h-5 w-5" />
              <div className="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full border-2 border-[#0a0514]" />
            </Button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold">
                {user.avatar}
              </div>
              <span className="text-sm font-bold text-white/80">0x71...4F2a</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => (item.id === "overview" || item.id === "card" || item.id === "settings") && setActiveTab(item.id)}
                className={`w-full justify-start h-12 rounded-xl gap-3 px-4 font-bold transition-all ${
                  activeTab === item.id ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-white/60 hover:bg-white/5"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
            
            <div className="pt-8">
              <div className="bg-gradient-to-br from-orange-500/10 to-purple-600/10 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <Zap className="absolute -bottom-4 -right-4 h-24 w-24 text-orange-500/10 rotate-12" />
                <h4 className="font-bold text-sm mb-2">Creator Status</h4>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  You are a verified Pro Creator. 0% platform fees active.
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 rounded-xl text-xs">
                  View Public Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 mb-8">
                <TabsTrigger value="overview" className="rounded-xl px-8 font-bold data-[state=active]:bg-purple-500 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="card" className="rounded-xl px-8 font-bold data-[state=active]:bg-purple-500 data-[state=active]:text-white">TipTab Card</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-xl px-8 font-bold data-[state=active]:bg-purple-500 data-[state=active]:text-white">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px]">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-black">Total Tips</CardDescription>
                      <CardTitle className="text-3xl font-black">128,450 <span className="text-orange-500 text-sm">XPR</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                        +12% from last month
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px]">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-black">Unique Tippers</CardDescription>
                      <CardTitle className="text-3xl font-black">42</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-purple-500 font-bold flex items-center gap-1">
                        5 new this week
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#130b21] border-white/10 text-white rounded-[24px]">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-black">Profile Views</CardDescription>
                      <CardTitle className="text-3xl font-black">1.2k</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-orange-500 font-bold flex items-center gap-1">
                        Trending in Content
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-[#130b21] border border-white/10 rounded-[32px] p-8">
                  <h3 className="text-xl font-bold mb-6">Recent Tips</h3>
                  <div className="space-y-4">
                    {[
                      { from: "0x32...A1b2", amount: "500", time: "2 hours ago", note: "Love the project!" },
                      { from: "0x9a...C4d5", amount: "2500", time: "5 hours ago", note: "Membership support" },
                      { from: "0x12...E7f8", amount: "100", time: "1 day ago", note: "Keep it up" }
                    ].map((tip, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-bold text-white/90">{tip.from}</p>
                            <p className="text-xs text-white/40 italic">"{tip.note}"</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-orange-500">{tip.amount} XPR</p>
                          <p className="text-[10px] text-white/30 uppercase font-bold">{tip.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="card" className="space-y-8">
                <div className="flex flex-col md:flex-row gap-12 items-center justify-center py-12">
                   <TipTabCard creator={user} />
                   
                   <div className="max-w-xs space-y-6">
                      <h3 className="text-2xl font-black leading-tight">Your Digital TipTab Card</h3>
                      <p className="text-white/60">
                        This is your unique creator card. Print it out, put it on your social profiles, or show it on your stream to receive instant tips.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-green-500 font-bold">
                          <Zap className="h-4 w-4" /> Zero Network Fees
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-500 font-bold">
                          <Zap className="h-4 w-4" /> Instant Settlement
                        </div>
                      </div>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                <ProfileEditor initialData={user} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;