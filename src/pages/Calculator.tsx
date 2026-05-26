"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, RefreshCw, Zap, TrendingUp, DollarSign, ArrowRightLeft, Info, ArrowUpRight, ShoppingCart, ExternalLink, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const Calculator = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState("XPR");
  const [toCurrency, setToCurrency] = useState("TAB");
  const [result, setResult] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Rates relative to XPR (XPR = 1.0)
  const [rates, setRates] = useState<Record<string, number>>({
    TAB: 0.36, 
    XPR: 1.0000,
    USD: 0.00273, // approx 1/366
    XMT: 111.0,
    METAL: 62.0,
    LOAN: 0.17,
    EUR: 0.0025,
    GBP: 0.0022,
    CAD: 0.0037,
  });

  const symbols: Record<string, string> = {
    TAB: "TAB",
    XPR: "XPR",
    XMT: "XMT",
    METAL: "METAL",
    LOAN: "LOAN",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
  };

  const fetchRates = async () => {
    setIsSyncing(true);
    try {
      const cgResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=usd,eur,gbp,cad");
      const cgData = await cgResponse.json();
      
      const alcorResponse = await fetch("https://proton.alcor.exchange/api/v2/tickers");
      const alcorData = await alcorResponse.json();
      
      const getAlcorPrice = (tickerId: string) => {
        const ticker = alcorData.find((m: any) => m.ticker_id === tickerId);
        return ticker ? parseFloat(ticker.last_price) : null;
      };

      const xprUsd = cgData.proton?.usd || 0.00273;
      const xprPerTab = getAlcorPrice("TAB_XPR") || 0.36;
      const xprPerXmt = getAlcorPrice("XMT_XPR") || 111.0;
      const xprPerLoan = getAlcorPrice("LOAN_XPR") || 0.17;
      const xprPerMetal = getAlcorPrice("METAL_XPR") || 62.0;

      if (cgData.proton) {
        setRates({
          TAB: xprPerTab, 
          XPR: 1.0000,
          XMT: xprPerXmt,
          LOAN: xprPerLoan,
          METAL: xprPerMetal,
          USD: xprUsd,
          EUR: cgData.proton.eur,
          GBP: cgData.proton.gbp,
          CAD: cgData.proton.cad,
        });
      }
    } catch (error) {
      console.error("Failed to fetch live rates:", error);
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
    const priority = ["TAB", "XPR", "USD", "XMT", "LOAN", "METAL"];
    const keys = Object.keys(rates);
    const others = keys
      .filter(k => !priority.includes(k))
      .sort((a, b) => a.localeCompare(b));
    return [...priority, ...others];
  }, [rates]);

  useEffect(() => {
    const fromPriceInXpr = rates[fromCurrency];
    const toPriceInXpr = rates[toCurrency];
    const numAmount = parseFloat(amount) || 0;
    
    // Formula: (Amount * FromPriceInXpr) / ToPriceInXpr
    const converted = (numAmount * fromPriceInXpr) / toPriceInXpr;
    setResult(converted);
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleSwap = () => {
    const oldFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(oldFrom);
  };

  const buyTabLink = "https://alcor.exchange/v/xpr/swap?input=xpr-eosio.token&output=tab-tokencreate";
  const metalPayLink = "https://onramp.metalpay.com/buy/xpr";
  const explorerLink = "https://explorer.xprnetwork.org/tokens/TAB-proton-tokencreate";

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-orange-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-16 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-4 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
              <div className={cn("h-1.5 w-1.5 rounded-full bg-cyan-400", !isSyncing && "animate-pulse")} />
              {isSyncing ? "Syncing Alcor..." : "Live Network Parity"}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter italic leading-tight text-white">
              VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">ENGINE</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-lg max-w-xl mx-auto font-medium leading-relaxed opacity-80">
              Precision asset valuation powered by <span className="text-orange-500">Alcor DEX</span> and <span className="text-purple-400">XPR Network</span> liquidity pairs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            <Card className="lg:col-span-7 bg-[#0d071a] border-white/10 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl relative border-t-white/10">
              <div className="p-5 sm:p-8 space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Input Amount</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchRates}
                      disabled={isSyncing}
                      className={cn(
                        "h-7 px-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest gap-2 transition-all", 
                        isSyncing ? "text-orange-500" : "text-white/60"
                      )}
                    >
                      <RefreshCw className={cn("h-2.5 w-2.5", isSyncing && "animate-spin")} />
                      {isSyncing ? "Syncing..." : "Live"}
                    </Button>
                  </div>
                  <div className="group relative flex items-center gap-2 bg-white/[0.03] border border-white/20 rounded-2xl md:rounded-[24px] p-1.5 focus-within:border-orange-500/60 transition-all">
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-transparent h-12 md:h-16 rounded-xl text-xl md:text-3xl font-black focus-visible:ring-0 px-4 md:px-6 text-white w-full"
                      placeholder="0.00"
                    />
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="w-[80px] md:w-[120px] bg-white/5 border-white/10 h-10 md:h-14 rounded-xl font-black text-sm md:text-xl mr-1 text-white shrink-0">
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

                <div className="flex justify-center -my-4 md:-my-6 relative z-10">
                  <Button
                    onClick={handleSwap}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg border-4 border-[#0d071a] p-0 transition-transform active:scale-90"
                  >
                    <ArrowRightLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </Button>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Network Output</Label>
                    <span className="text-[8px] md:text-[9px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Settled</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/20 rounded-2xl md:rounded-[24px] p-1.5">
                    <div className="flex-1 h-12 md:h-16 rounded-xl flex items-center px-4 md:px-6 text-xl md:text-3xl font-black text-white bg-black/40 overflow-hidden">
                      <span className="text-orange-500 mr-2 md:mr-3 text-lg md:text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] shrink-0">{symbols[toCurrency]}</span>
                      <span className="truncate">{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    </div>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="w-[80px] md:w-[120px] bg-white/5 border-white/10 h-10 md:h-14 rounded-xl font-black text-sm md:text-xl mr-1 text-white shrink-0">
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

                <div className="pt-5 md:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] md:text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    1 {fromCurrency} = {(rates[fromCurrency] / rates[toCurrency]).toFixed(6)} {toCurrency}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 uppercase tracking-widest font-black">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Data Sync: Alcor Terminal
                  </div>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-[#130b21] border-white/10 rounded-[32px] p-5 md:p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-purple-400" /> Live Pairings
                </h3>
                <div className="space-y-4 md:space-y-5">
                  {[
                    { pair: "TAB / XPR", rate: rates.TAB.toFixed(4), change: "Live", icon: Zap },
                    { pair: "XMT / USD", rate: (rates.XMT * rates.USD / (1)).toFixed(5), change: "Live", icon: DollarSign },
                    { pair: "XPR / USD", rate: rates.USD.toFixed(5), change: "Live", icon: TrendingUp }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                          <item.icon className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <span className="font-black text-[11px] md:text-xs text-white/80 tracking-tight">{item.pair}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xs md:text-sm text-white">{item.rate}</p>
                        <p className="text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Synced</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-gradient-to-br from-orange-500/10 to-[#0d071a] border border-white/10 rounded-[32px] p-6 md:p-8 relative overflow-hidden group shadow-xl space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Info className="h-4 w-4 text-orange-400" />
                    <h4 className="font-black text-base md:text-lg tracking-tight italic text-white uppercase">Explorer Data</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] md:text-xs leading-relaxed font-bold">
                    View on-chain supply, holders, and contract details for TAB on the XPR Network.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    asChild
                    className="w-full bg-white/5 border border-white/20 hover:bg-white/10 text-white font-black h-12 md:h-14 rounded-2xl shadow-lg text-xs md:text-sm group transition-all"
                  >
                    <a href={explorerLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Token Explorer
                    </a>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      asChild
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black h-10 md:h-12 rounded-xl transition-all text-[10px] md:text-sm"
                    >
                      <a href={buyTabLink} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                        Alcor DEX
                      </a>
                    </Button>
                    <Button 
                      asChild
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-black h-10 md:h-12 rounded-xl transition-all text-[10px] md:text-sm"
                    >
                      <a href={metalPayLink} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="mr-2 h-3.5 w-3.5" />
                        Card Buy
                      </a>
                    </Button>
                  </div>
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