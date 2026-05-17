"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, RefreshCw, Zap, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const Calculator = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [amount, setAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState("TAB");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock rates (In a real app, these would be fetched from an oracle)
  // 1 TAB = 1 XPR (Platform parity)
  // 1 XPR = 0.01 USD (Estimated)
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
    
    // Convert fromCurrency to base (TAB/XPR) then to toCurrency
    const converted = (numAmount / fromRate) * toRate;
    setResult(converted);
  }, [amount, fromCurrency, toCurrency]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-48 pb-24 relative">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              <CalcIcon className="h-3 w-3 text-cyan-400" />
              Live Network Rates
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
              VALUE <span className="text-orange-500">CALCULATOR</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto font-medium">
              Convert your TAB earnings to XPR or global fiat currencies instantly with real-time network precision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Calculator Card */}
            <Card className="lg:col-span-8 bg-[#130b21] border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSync}
                  className={cn("h-10 w-10 rounded-xl bg-white/5 border border-white/10", isSyncing && "animate-spin")}
                >
                  <RefreshCw className="h-4 w-4 text-white/40" />
                </Button>
              </div>
              
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-2xl font-black tracking-tight">Conversion Engine</CardTitle>
                <CardDescription className="text-white/40">Enter amount and select pairs</CardDescription>
              </CardHeader>
              
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">From</Label>
                    <div className="flex gap-3">
                      <Input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-white/5 border-white/10 h-16 rounded-2xl text-xl font-black focus:ring-purple-500"
                      />
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-16 rounded-2xl font-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-xl">
                          {Object.keys(rates).map(curr => (
                            <SelectItem key={curr} value={curr} className="font-bold">{curr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">To</Label>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-white/[0.03] border border-white/5 h-16 rounded-2xl flex items-center px-6 text-2xl font-black text-orange-500">
                        {symbols[toCurrency]} {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-16 rounded-2xl font-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-xl">
                          {Object.keys(rates).map(curr => (
                            <SelectItem key={curr} value={curr} className="font-bold">{curr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/40 font-bold">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Rate: 1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(6)} {toCurrency}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">
                      Sync Status: Optimized
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Rates Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white/[0.03] border-white/10 rounded-[32px] p-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-purple-400" /> Live Pairings
                </h3>
                <div className="space-y-6">
                  {[
                    { pair: "TAB / XPR", rate: "1.00", change: "+0.00%" },
                    { pair: "XPR / USD", rate: "0.0104", change: "+2.4%" },
                    { pair: "TAB / USD", rate: "0.0104", change: "+2.4%" },
                    { pair: "XPR / EUR", rate: "0.0096", change: "-0.2%" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <span className="font-black text-sm text-white/60 group-hover:text-white transition-colors">{item.pair}</span>
                      <div className="text-right">
                        <p className="font-black text-sm">{item.rate}</p>
                        <p className={cn("text-[9px] font-black", item.change.startsWith('+') ? "text-green-500" : "text-red-500")}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-purple-600/10 border-white/5 rounded-[32px] p-8">
                <DollarSign className="h-8 w-8 text-orange-500 mb-4" />
                <h4 className="font-black text-lg mb-2">Network Payouts</h4>
                <p className="text-white/40 text-sm leading-relaxed font-medium">
                  TAB tokens are settled instantly on the XPR Network and can be wrapped or traded globally.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Calculator;