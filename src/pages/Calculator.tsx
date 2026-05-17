"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, RefreshCw, Zap, TrendingUp, DollarSign, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const Calculator = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [amount, setAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState("TAB");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const rates: Record<string, number> = {
    TAB: 1,
    XPR: 1,
    USD: 0.01,
    EUR: 0.0092,
    GBP: 0.0078,
  };

  const symbols: Record<string, string> = {
    TAB: "TAB",
    XPR: "XPR",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  useEffect(() => {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const numAmount = parseFloat(amount) || 0;
    const converted = (numAmount / fromRate) * toRate;
    setResult(converted);
  }, [amount, fromCurrency, toCurrency]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-orange-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-48 pb-24 relative">
        {/* Cinematic Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/5 blur-[180px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400 shadow-2xl">
              <Zap className="h-3.5 w-3.5 fill-cyan-400" />
              Real-Time Network Parity
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none">
              VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">ENGINE</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Precision conversion for the XPR Network. Calculate TAB value across global assets with zero latency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main Calculator Card */}
            <Card className="lg:col-span-8 bg-[#0d071a] border-white/10 rounded-[48px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative border-t-white/15">
              <div className="absolute top-0 right-0 p-8 z-20">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSync}
                  className={cn(
                    "h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all", 
                    isSyncing && "animate-spin"
                  )}
                >
                  <RefreshCw className={cn("h-5 w-5", isSyncing ? "text-orange-500" : "text-white/40")} />
                </Button>
              </div>
              
              <div className="p-12 space-y-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Payment Amount</Label>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">From Source</span>
                  </div>
                  <div className="group relative flex items-center gap-4 bg-white/[0.03] border-2 border-white/5 rounded-[32px] p-2 focus-within:border-orange-500/50 focus-within:bg-white/5 transition-all">
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-transparent h-24 rounded-2xl text-5xl font-black focus-visible:ring-0 placeholder:text-white/5 px-8"
                      placeholder="0.00"
                    />
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="w-[160px] bg-white/5 border-white/10 h-20 rounded-2xl font-black text-2xl mr-2 hover:bg-white/10 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-[24px] p-2">
                        {Object.keys(rates).map(curr => (
                          <SelectItem key={curr} value={curr} className="font-black py-3 rounded-xl focus:bg-orange-500 focus:text-white cursor-pointer">
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transfer Icon Divider */}
                <div className="flex justify-center -my-6 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] border-4 border-[#0d071a]">
                    <ArrowRightLeft className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Result Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Settlement Value</Label>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Network Estimated</span>
                  </div>
                  <div className="flex items-center gap-4 bg-orange-500/5 border-2 border-orange-500/20 rounded-[32px] p-2">
                    <div className="flex-1 h-24 rounded-2xl flex items-center px-10 text-5xl font-black text-white overflow-hidden">
                      <span className="text-orange-500 mr-4 opacity-50">{symbols[toCurrency]}</span>
                      {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="w-[160px] bg-white/5 border-white/10 h-20 rounded-2xl font-black text-2xl mr-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-[24px] p-2">
                        {Object.keys(rates).map(curr => (
                          <SelectItem key={curr} value={curr} className="font-black py-3 rounded-xl focus:bg-orange-500 focus:text-white cursor-pointer">
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-10 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/60">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      Rate: <span className="text-white font-black">1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(6)} {toCurrency}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                         Sync: Optimized
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sidebar Details */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="bg-[#130b21] border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-8 flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-purple-400" /> Global Metrics
                </h3>
                <div className="space-y-8">
                  {[
                    { pair: "TAB / XPR", rate: "1.0000", change: "+0.00%", icon: Zap },
                    { pair: "XPR / USD", rate: "0.0104", change: "+2.4%", icon: DollarSign },
                    { pair: "TAB / USD", rate: "0.0104", change: "+2.4%", icon: DollarSign },
                    { pair: "XPR / EUR", rate: "0.0096", change: "-0.2%", icon: TrendingUp }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-purple-500/50 transition-colors">
                          <item.icon className="h-4 w-4 text-white/40 group-hover/item:text-purple-400" />
                        </div>
                        <span className="font-black text-sm text-white/60 group-hover/item:text-white transition-colors tracking-tight">{item.pair}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-base">{item.rate}</p>
                        <p className={cn("text-[10px] font-black uppercase", item.change.startsWith('+') ? "text-green-500" : "text-red-500")}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-gradient-to-br from-orange-500/20 via-purple-600/20 to-transparent border border-white/10 rounded-[40px] p-10 relative overflow-hidden group">
                <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <h4 className="font-black text-2xl mb-4 tracking-tight leading-none italic">INSTANT <br /> SETTLEMENT</h4>
                <p className="text-white/40 text-sm leading-relaxed font-medium">
                  TAB tokens represent direct network value. Every conversion reflects actual on-chain liquidity available for immediate payout.
                </p>
                <Button className="w-full mt-8 bg-white text-black font-black h-14 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                  Connect WebAuth
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Calculator;