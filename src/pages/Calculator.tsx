"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, RefreshCw, Zap, TrendingUp, DollarSign, ArrowRightLeft, Info } from "lucide-react";
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

      <main className="container mx-auto px-6 pt-32 pb-16 relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
              <Zap className="h-3 w-3 fill-cyan-400" />
              Real-Time Network Parity
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none text-white">
              VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">ENGINE</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
              Calculate TAB value across global assets with zero latency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Calculator Card */}
            <Card className="lg:col-span-7 bg-[#0d071a] border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative border-t-white/10">
              <div className="absolute top-0 right-0 p-6 z-20">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSync}
                  className={cn(
                    "h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10", 
                    isSyncing && "animate-spin"
                  )}
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing ? "text-orange-500" : "text-white/40")} />
                </Button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Input Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Input Amount</Label>
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">Source</span>
                  </div>
                  <div className="group relative flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-[24px] p-1.5 focus-within:border-orange-500/40 transition-all">
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-transparent h-16 rounded-xl text-3xl font-black focus-visible:ring-0 px-6 text-white"
                      placeholder="0.00"
                    />
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-14 rounded-xl font-black text-xl mr-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-[20px]">
                        {Object.keys(rates).map(curr => (
                          <SelectItem key={curr} value={curr} className="font-black py-2 cursor-pointer">{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex justify-center -my-6 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg border-4 border-[#0d071a]">
                    <ArrowRightLeft className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Result Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Network Output</Label>
                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">Estimated</span>
                  </div>
                  <div className="flex items-center gap-3 bg-orange-500/5 border border-orange-500/20 rounded-[24px] p-1.5">
                    <div className="flex-1 h-16 rounded-xl flex items-center px-6 text-3xl font-black text-white bg-black/20">
                      <span className="text-orange-500 mr-3 text-2xl">{symbols[toCurrency]}</span>
                      {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-14 rounded-xl font-black text-xl mr-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-[20px]">
                        {Object.keys(rates).map(curr => (
                          <SelectItem key={curr} value={curr} className="font-black py-2 cursor-pointer">{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(6)} {toCurrency}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500 uppercase tracking-widest">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                </div>
              </div>
            </Card>

            {/* Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-[#130b21] border-white/10 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-purple-400" /> Pairings
                </h3>
                <div className="space-y-5">
                  {[
                    { pair: "TAB / XPR", rate: "1.0000", change: "+0.00%", icon: Zap },
                    { pair: "TAB / USD", rate: "0.0104", change: "+2.4%", icon: DollarSign },
                    { pair: "XPR / EUR", rate: "0.0096", change: "-0.2%", icon: TrendingUp }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                          <item.icon className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <span className="font-black text-xs text-slate-300 tracking-tight">{item.pair}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-white">{item.rate}</p>
                        <p className={cn("text-[9px] font-black", item.change.startsWith('+') ? "text-emerald-500" : "text-red-500")}>{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-gradient-to-br from-orange-500/10 to-[#0d071a] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="h-4 w-4 text-orange-400" />
                  <h4 className="font-black text-lg tracking-tight italic text-white">NETWORK</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6">
                  TAB tokens represent direct network value for immediate payout.
                </p>
                <Button className="w-full bg-white text-black font-black h-12 rounded-xl hover:bg-orange-500 hover:text-white transition-all text-sm">
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