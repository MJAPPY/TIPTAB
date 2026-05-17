"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, RefreshCw, Zap, TrendingUp, DollarSign, ArrowRightLeft, Info, ArrowUpRight, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const Calculator = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [amount, setAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState("TAB");
  const [toCurrency, setToCurrency] = useState("XPR");
  const [result, setResult] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial rates - will be updated by live fetches
  const [rates, setRates] = useState<Record<string, number>>({
    TAB: 1.0000,
    XPR: 1.0000,
    USD: 0.00092,
    EUR: 0.00085,
    GBP: 0.00072,
    AUD: 0.0014,
    HKD: 0.0072,
    CNY: 0.0066,
    JPY: 0.14,
    CAD: 0.0012,
    SGD: 0.0012,
    CHF: 0.00081,
    NZD: 0.0015,
  });

  const symbols: Record<string, string> = {
    TAB: "TAB",
    XPR: "XPR",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    HKD: "HK$",
    CNY: "¥",
    JPY: "¥",
    CAD: "C$",
    SGD: "S$",
    CHF: "Fr",
    NZD: "NZ$",
  };

  const fetchRates = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch Fiat rates for XPR from CoinGecko
      const cgResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=usd,eur,gbp,aud,hkd,cny,jpy,cad,sgd,chf,nzd"
      );
      const cgData = await cgResponse.json();
      
      // 2. Fetch TAB/XPR rate from Alcor Exchange
      // We use the Proton-specific Alcor API
      const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
      const alcorData = await alcorResponse.json();
      
      // Find the TAB_XPR market
      // TAB: tokencreate@TAB, XPR: eosio.token@XPR
      const tabMarket = alcorData.find((m: any) => m.ticker_id === "TAB_XPR");
      
      // Calculate TAB/XPR ratio (How many TAB for 1 XPR)
      // If 1 TAB = 0.8 XPR, then 1 XPR = 1.25 TAB
      let tabRatio = 1.0; 
      if (tabMarket && tabMarket.last_price) {
        const priceOfTabInXpr = parseFloat(tabMarket.last_price);
        if (priceOfTabInXpr > 0) {
          tabRatio = 1 / priceOfTabInXpr;
        }
      }

      if (cgData.proton) {
        const p = cgData.proton;
        setRates({
          TAB: tabRatio, 
          XPR: 1.0000,
          USD: p.usd,
          EUR: p.eur,
          GBP: p.gbp,
          AUD: p.aud,
          HKD: p.hkd,
          CNY: p.cny,
          JPY: p.jpy,
          CAD: p.cad,
          SGD: p.sgd,
          CHF: p.chf,
          NZD: p.nzd,
        });
      }
    } catch (error) {
      console.error("Failed to fetch live rates from Alcor/CoinGecko:", error);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); 
    return () => clearInterval(interval);
  }, []);

  const sortedCurrencies = useMemo(() => {
    const priority = ["TAB", "XPR", "USD"];
    const keys = Object.keys(rates);
    const others = keys
      .filter(k => !priority.includes(k))
      .sort((a, b) => a.localeCompare(b));
    return [...priority, ...others];
  }, [rates]);

  useEffect(() => {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const numAmount = parseFloat(amount) || 0;
    const converted = (numAmount / fromRate) * toRate;
    setResult(converted);
  }, [amount, fromCurrency, toCurrency, rates]);

  const buyTabLink = "https://alcor.exchange/v/xpr/swap?input=xpr-eosio.token&output=tab-tokencreate";

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-orange-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-32 pb-16 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
              <div className={cn("h-1.5 w-1.5 rounded-full bg-cyan-400", !isSyncing && "animate-pulse")} />
              {isSyncing ? "Syncing Alcor/CG..." : "Live Network Parity"}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none text-white">
              VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">ENGINE</span>
            </h1>
            <p className="text-slate-200 text-lg max-w-xl mx-auto font-medium leading-relaxed">
              Real-time TAB valuation powered by <span className="text-orange-500">Alcor Exchange</span> and <span className="text-purple-400">XPR Network</span> data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <Card className="lg:col-span-7 bg-[#0d071a] border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative border-t-white/10">
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">Input Amount</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchRates}
                      disabled={isSyncing}
                      className={cn(
                        "h-8 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-2 transition-all", 
                        isSyncing ? "text-orange-500" : "text-white/80"
                      )}
                    >
                      <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
                      {isSyncing ? "Syncing..." : "Live Rates"}
                    </Button>
                  </div>
                  <div className="group relative flex items-center gap-3 bg-white/[0.03] border border-white/20 rounded-[24px] p-1.5 focus-within:border-orange-500/60 transition-all">
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-transparent h-16 rounded-xl text-3xl font-black focus-visible:ring-0 px-6 text-white"
                      placeholder="0.00"
                    />
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-14 rounded-xl font-black text-xl mr-1 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-[20px]">
                        {sortedCurrencies.map(curr => (
                          <SelectItem key={curr} value={curr} className="font-black py-2 cursor-pointer">{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center -my-6 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg border-4 border-[#0d071a]">
                    <ArrowRightLeft className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">Network Output</Label>
                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/20 px-2 py-0.5 rounded">Settled Value</span>
                  </div>
                  <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-[24px] p-1.5">
                    <div className="flex-1 h-16 rounded-xl flex items-center px-6 text-3xl font-black text-white bg-black/20">
                      <span className="text-orange-500 mr-3 text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">{symbols[toCurrency]}</span>
                      {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-14 rounded-xl font-black text-xl mr-1 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white rounded-[20px]">
                        {sortedCurrencies.map(curr => (
                          <SelectItem key={curr} value={curr} className="font-black py-2 cursor-pointer">{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(8)} {toCurrency}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 uppercase tracking-widest font-black">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Data Source: Alcor API
                  </div>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-[#130b21] border-white/10 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-purple-400" /> Live Pairings
                </h3>
                <div className="space-y-5">
                  {[
                    { pair: "TAB / XPR", rate: (1/rates.TAB).toFixed(4), change: "+0.00%", icon: Zap },
                    { pair: "TAB / USD", rate: (rates.USD / rates.TAB).toFixed(5), change: "Live", icon: DollarSign },
                    { pair: "XPR / EUR", rate: rates.EUR.toFixed(5), change: "Live", icon: TrendingUp }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                          <item.icon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <span className="font-black text-xs text-white tracking-tight">{item.pair}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-white">{item.rate}</p>
                        <p className={cn("text-[9px] font-black", "text-emerald-400")}>{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-gradient-to-br from-orange-500/10 to-[#0d071a] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group shadow-xl space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Info className="h-4 w-4 text-orange-400" />
                    <h4 className="font-black text-lg tracking-tight italic text-white uppercase">Market Direct</h4>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-bold">
                    View full order books and depth for TAB directly on the exchange terminal.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    asChild
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-purple-500/20 text-lg group transition-all"
                  >
                    <a href="https://alcor.exchange/v/xpr/terminal/tab-tokencreate" target="_blank" rel="noopener noreferrer">
                      View Alcor Terminal
                      <ArrowUpRight className="ml-1 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full bg-white/5 border-white/10 text-white font-black h-12 rounded-xl hover:bg-white/10 transition-all text-sm"
                  >
                    <a href={buyTabLink} target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Swap XPR for TAB
                    </a>
                  </Button>
                </div>
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