"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Zap, Search, Star, Heart, Flame, ArrowUpRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useXpr } from "@/contexts/XprContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "All",
  "Art",
  "Automotive",
  "Biblical",
  "Blockchain",
  "Business",
  "Content",
  "Critical Think",
  "Delivery",
  "DEVS",
  "Education",
  "Finance",
  "Fishing",
  "Fitness",
  "Flips & Thrifters",
  "Food",
  "Gaming",
  "Gardening & Farming",
  "Health",
  "Hospitality",
  "Local News",
  "Music",
  "Other",
  "Plane Spot",
  "Property Reno",
  "Realty",
  "Reviewing",
  "Service",
  "Sports",
  "Train Spot",
  "Weather"
];

const Voting = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voteAmount, setVoteAmount] = useState("5");
  const { actor, session, dbCreators, isConnected, login } = useXpr();
  const { toast } = useToast();

  const [leaderboard, setLeaderboard] = useState<{ handle: string; votes: number }[]>([]);

  const getQuarterIdentifier = () => {
    const year = new Date().getFullYear();
    const quarter = Math.floor(new Date().getMonth() / 3) + 1;
    return `Q${year}-${quarter}`;
  };

  const fetchVotes = async () => {
    const quarterId = getQuarterIdentifier();
    
    // First try fetching for current quarter
    let { data, error } = await supabase
      .from('votes')
      .select('candidate_handle, tab_amount')
      .eq('week_identifier', quarterId);

    // Fallback: if no votes in current quarter, show all votes to ensure live data is visible
    if ((!data || data.length === 0) && !error) {
      const { data: allData, error: allError } = await supabase
        .from('votes')
        .select('candidate_handle, tab_amount');
      
      if (allData && !allError) {
        data = allData;
      }
    }

    if (data && !error) {
      const totals: Record<string, number> = {};
      data.forEach(v => {
        const cleanHandle = v.candidate_handle?.toLowerCase().replace('@', '').trim();
        if (cleanHandle) {
          totals[cleanHandle] = (totals[cleanHandle] || 0) + Number(v.tab_amount);
        }
      });
      const sorted = Object.entries(totals)
        .map(([handle, votes]) => ({ handle, votes }))
        .sort((a, b) => b.votes - a.votes);
      setLeaderboard(sorted);
    }
  };

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredCandidates = useMemo(() => {
    return dbCreators.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.handle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || (c.categories && c.categories.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [dbCreators, searchQuery, selectedCategory]);

  const handleVote = async (candidateHandle: string) => {
    if (!isConnected) {
      await login();
      return;
    }

    const amount = parseInt(voteAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid positive vote amount.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Execute XPR Transaction
      const transferAction = {
        account: 'tokencreate',
        name: 'transfer',
        authorization: [{
          actor: session!.auth.actor,
          permission: session!.auth.permission,
        }],
        data: {
          from: actor,
          to: 'tiptab',
          quantity: `${amount} TAB`,
          memo: `Quarterly vote for @${candidateHandle}`,
        },
      };

      await session!.transact({ actions: [transferAction] }, { broadcast: true });

      // 2. Record in DB
      const quarterId = getQuarterIdentifier();
      await supabase.from('votes').insert({
        voter_handle: actor!,
        candidate_handle: candidateHandle,
        tab_amount: amount,
        week_identifier: quarterId
      });

      toast({
        title: "Vote Recorded!",
        description: `Successfully contributed ${amount} TAB to @${candidateHandle}`,
      });
      fetchVotes();
    } catch (e: any) {
      toast({
        title: "Voting Failed",
        description: e.message || "Transaction cancelled.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = ["5", "25", "50", "250"];

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-orange-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-4 md:px-6 pt-36 pb-24 max-w-6xl">
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-black uppercase tracking-widest text-orange-500">
              <Zap className="h-4 w-4 fill-orange-500" />
              Quarterly Selection
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic">
              FEATURED <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600">VOTING</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium">
              Spend TAB to vote for your favorite pros. The top 3 every quarter earn a guaranteed spotlight on the home page.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Candidates List */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4 bg-white/[0.03] p-6 rounded-[32px] border border-white/10">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-orange-500 transition-colors" />
                  <Input 
                    placeholder="Search creators by name or handle..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold focus:ring-orange-500/50"
                  />
                </div>

                {/* Categories Filter Selection */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {CATEGORIES.map(cat => (
                    <Button
                      key={cat}
                      variant="ghost"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "rounded-xl h-9 px-4 whitespace-nowrap font-black text-[10px] uppercase tracking-[0.15em] transition-all border-2",
                        selectedCategory === cat 
                        ? "bg-orange-500/20 border-orange-500/60 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                        : "bg-white/5 border-transparent text-white/60 hover:text-orange-400 hover:bg-orange-500/10"
                      )}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Vote Weight (TAB per click)</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2 flex-1">
                    {quickAmounts.map(amt => (
                      <Button 
                        key={amt}
                        onClick={() => setVoteAmount(amt)}
                        className={cn(
                          "h-12 flex-1 rounded-xl font-black text-xs transition-all",
                          voteAmount === amt ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {amt} TAB
                      </Button>
                    ))}
                  </div>
                  <div className="relative group w-full sm:w-44">
                    <Input 
                      type="number"
                      placeholder="Custom" 
                      value={quickAmounts.includes(voteAmount) ? "" : voteAmount}
                      onChange={(e) => setVoteAmount(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-center font-black pr-10 focus-visible:ring-1 focus-visible:ring-orange-500/50 text-white placeholder:text-white/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/30 uppercase tracking-widest">TAB</span>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="grid grid-cols-1 gap-4">
                  {filteredCandidates.map(candidate => (
                    <Card key={candidate.handle} className="bg-white/5 border-white/10 rounded-[32px] overflow-hidden group hover:border-orange-500/40 transition-all">
                      <CardContent className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl", candidate.color)}>
                            {candidate.avatarImage ? <img src={candidate.avatarImage} alt="" className="w-full h-full object-cover" /> : candidate.avatar}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white">{candidate.name}</h3>
                            <p className="text-sm font-bold text-orange-500">@{candidate.handle}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleVote(candidate.handle)}
                          disabled={isProcessing}
                          className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all"
                        >
                          {isProcessing ? "Wait..." : `Cast ${voteAmount} Votes`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Live Standings */}
            <div className="lg:col-span-5 space-y-8">
              <Card className="bg-[#130b21] border border-orange-500/30 rounded-[40px] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy className="h-24 w-24 text-orange-500" /></div>
                <CardHeader className="p-10 pb-4">
                  <CardTitle className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
                    <Flame className="h-6 w-6 text-red-500" /> QUARTERLY STANDINGS
                  </CardTitle>
                  <CardDescription className="text-white/40 font-bold text-xs uppercase tracking-widest">Active Quarter</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-4 space-y-6">
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 10).map((entry, i) => (
                      <div key={entry.handle} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                            i === 0 ? "bg-orange-500 text-white" : "bg-white/5 text-white/40"
                          )}>{i + 1}</span>
                          <span className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">@{entry.handle}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white">{entry.votes.toLocaleString()}</p>
                          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Votes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <RotateCcw className="h-10 w-10 text-white/10 mx-auto animate-spin-slow" />
                      <p className="text-white/20 font-black uppercase tracking-widest text-xs">Waiting for first votes...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 space-y-4">
                 <h4 className="font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                   <Heart className="h-4 w-4 text-red-500" /> REWARDS POOL
                 </h4>
                 <p className="text-sm text-white/50 font-bold leading-relaxed">
                   100% of TAB spent on voting is added to the quarterly Reward Pool and distributed back to the top Creators and Supporters.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Voting;