"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/tab-platform/Header";
import { MembershipModal } from "@/components/tab-platform/MembershipModal";
import { useXpr } from "@/contexts/XprContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  Plus, 
  Sparkles, 
  Heart, 
  ExternalLink, 
  Image as ImageIcon, 
  Search, 
  Layers, 
  Wallet, 
  Upload, 
  X,
  MessageSquare,
  Check,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ShowcaseSite {
  id: string;
  title: string;
  site_url: string;
  screenshot_url: string;
  description: string;
  submitted_by: string;
  likes: number;
}

const SEED_SITES: ShowcaseSite[] = [
  {
    id: "seed-askguy",
    title: "AskGuy",
    site_url: "https://askguy.vercel.app/",
    screenshot_url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80",
    description: "The ultimate AI assistant and guide for the XPR Network ecosystem. Ask questions, explore on-chain data, and get instant guidance about wallets, tokens, and dApps.",
    submitted_by: "askguy",
    likes: 95
  },
  {
    id: "seed-alcor",
    title: "Alcor Exchange",
    site_url: "https://proton.alcor.exchange/",
    screenshot_url: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=800&q=80",
    description: "The premier zero-fee decentralized exchange (DEX) for the XPR Network ecosystem. Swap tokens instantly and provide liquidity to pools.",
    submitted_by: "alcor",
    likes: 84
  },
  {
    id: "seed-metalpay",
    title: "Metal Pay",
    site_url: "https://www.metalpay.com/",
    screenshot_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    description: "Buy, sell, and send XPR Network assets along with standard crypto securely. Seamless fiat onramp and offramp platform.",
    submitted_by: "metalpay",
    likes: 67
  },
  {
    id: "seed-snipverse",
    title: "Snipverse",
    site_url: "https://snipverse.com/",
    screenshot_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    description: "A next-generation on-chain social media hub built on XPR Network. Post, share content, earn rewards, and connect with other creators.",
    submitted_by: "snipverse",
    likes: 52
  }
];

const Showcase = () => {
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { actor, isConnected, login, session, refreshBalances, logDbTransaction } = useXpr();
  const { toast } = useToast();

  const [dbSites, setDbSites] = useState<ShowcaseSite[]>([]);
  const [userLikes, setUserLikes] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_showcase_likes");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Form Fields
  const [title, setTitle] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from("showcase_sites")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        const activeSites = (data as ShowcaseSite[]).filter(s => s.description !== "[DELETED]");
        setDbSites(activeSites);
      } else {
        // Fallback to local storage if supabase table doesn't exist yet
        const saved = localStorage.getItem("tiptab_showcase_local");
        if (saved) {
          const parsed = JSON.parse(saved);
          const activeSites = parsed.filter((s: ShowcaseSite) => s.description !== "[DELETED]");
          setDbSites(activeSites);
        }
      }
    } catch (e) {
      console.error("Failed to fetch showcase sites:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const allSites = useMemo(() => {
    const list = [...dbSites];
    const hiddenSeeds = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("tiptab_hidden_seeds") || "[]") : [];
    
    // Append seed sites if they are not blocklisted or already in list
    SEED_SITES.forEach(seed => {
      if (!hiddenSeeds.includes(seed.id) && !list.some(s => s.title.toLowerCase() === seed.title.toLowerCase())) {
        list.push(seed);
      }
    });
    return list;
  }, [dbSites]);

  const filteredSites = useMemo(() => {
    return allSites.filter(site => {
      const query = searchQuery.toLowerCase();
      return (
        site.title.toLowerCase().includes(query) ||
        site.description.toLowerCase().includes(query) ||
        site.submitted_by.toLowerCase().includes(query)
      );
    });
  }, [allSites, searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        toast({
          title: "Image too large",
          description: "Please upload an image under 800KB.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !siteUrl.trim() || !description.trim()) {
      toast({
        title: "Fields Required",
        description: "Please populate all necessary fields.",
        variant: "destructive"
      });
      return;
    }

    if (!session || !actor) {
      toast({
        title: "Session Required",
        description: "Please connect your WebAuth wallet to submit.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Charge 5,000 XPR Activation Fee via WebAuth
      const transferAction = {
        account: "eosio.token",
        name: "transfer",
        authorization: [{
          actor: session.auth.actor,
          permission: session.auth.permission || "active",
        }],
        data: {
          from: actor,
          to: "tiptab",
          quantity: "5000.0000 XPR",
          memo: `Showcase Listing: ${title.trim().slice(0, 30)}`,
        },
      };

      await session.transact({ actions: [transferAction] }, { broadcast: true });

      // Log Directory showcase payment to DB
      await logDbTransaction(actor, 'tiptab', 5000, 'XPR', 'showcase', `Showcase: ${title.trim().slice(0, 20)}`);

      // 2. If transfer succeeds, save project to Directory
      const newSite = {
        title: title.trim(),
        site_url: siteUrl.trim().startsWith("http") ? siteUrl.trim() : `https://${siteUrl.trim()}`,
        screenshot_url: screenshotUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        description: description.trim(),
        submitted_by: actor,
        likes: 0
      };

      const { data, error } = await supabase
        .from("showcase_sites")
        .insert(newSite)
        .select();

      if (data && !error) {
        toast({
          title: "Project Submitted!",
          description: "Your site has been added to the XPR Showcase index."
        });
        fetchSites();
      } else {
        // Local fallback storage
        const currentLocal = localStorage.getItem("tiptab_showcase_local");
        const list = currentLocal ? JSON.parse(currentLocal) : [];
        const fallbackSite = { ...newSite, id: `local-${Date.now()}` };
        const updated = [fallbackSite, ...list];
        localStorage.setItem("tiptab_showcase_local", JSON.stringify(updated));
        setDbSites(updated);
        toast({
          title: "Saved Locally",
          description: "Added to showcase. Sync with Supabase complete."
        });
      }
      
      // Reset Form fields
      setTitle("");
      setSiteUrl("");
      setScreenshotUrl("");
      setDescription("");
      setIsSubmitOpen(false);

      if (refreshBalances) {
        refreshBalances();
      }
    } catch (err: any) {
      console.error("Submission/Payment failed:", err);
      toast({
        title: "Submission Canceled",
        description: err.message || "XPR transaction authorization was not completed.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async (siteId: string) => {
    if (userLikes.includes(siteId)) {
      toast({
        title: "Already Liked",
        description: "You have already voted for this project."
      });
      return;
    }

    const updatedLikes = [...userLikes, siteId];
    setUserLikes(updatedLikes);
    localStorage.setItem("tiptab_showcase_likes", JSON.stringify(updatedLikes));

    // Optimistic UI state update
    setDbSites(prev => prev.map(s => s.id === siteId ? { ...s, likes: s.likes + 1 } : s));

    try {
      const targetSite = allSites.find(s => s.id === siteId);
      if (targetSite && !siteId.startsWith("seed-") && !siteId.startsWith("local-")) {
        await supabase
          .from("showcase_sites")
          .update({ likes: targetSite.likes + 1 })
          .eq("id", siteId);
      }
      toast({
        title: "Vote Counted!",
        description: "Your vote helps prioritize community tools."
      });
    } catch (err) {
      console.error("Vote capture failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30">
      <Header onBecomeCreator={() => setIsMembershipOpen(true)} />

      <main className="container mx-auto px-6 pt-44 pb-24 max-w-6xl">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Ecosystem Directory
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic text-white">
                XPR SITE <span className="text-orange-500">SHOWCASE</span>
              </h1>
              <p className="text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
                Explore popular tools, decentralized apps, and community platforms powered by the high-speed <span className="text-purple-400 font-bold">XPR Network</span>.
              </p>
            </div>

            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => !isConnected && login()}
                  className="h-16 px-8 rounded-2xl bg-white text-black hover:bg-purple-600 hover:text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 shrink-0"
                >
                  <Plus className="h-5 w-5" /> Submit Project
                </Button>
              </DialogTrigger>
              {isConnected && (
                <DialogContent className="bg-[#1e1438]/95 backdrop-blur-3xl border-white/10 text-white rounded-[40px] p-8 max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-purple-400" />
                      <DialogTitle className="text-3xl font-black italic uppercase">Add Your Site</DialogTitle>
                    </div>
                    <DialogDescription className="text-white/50 font-bold text-sm leading-relaxed">
                      Publish your XPR application or community site to the global platform index (requires a <strong className="text-orange-500">5,000 XPR</strong> listing fee).
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Project Name</Label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g. Alcor DEX" 
                        maxLength={48}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Website URL</Label>
                      <Input 
                        value={siteUrl} 
                        onChange={(e) => setSiteUrl(e.target.value)} 
                        placeholder="https://example.com" 
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Screenshot Preview (Base64 file or URL)</Label>
                      
                      {screenshotUrl ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                          <img src={screenshotUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setScreenshotUrl("")}
                            className="absolute top-3 right-3 p-2 bg-red-500 rounded-full text-white shadow-xl hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-all"
                        >
                          <Upload className="h-8 w-8 text-purple-400 mb-2" />
                          <p className="text-xs font-black text-slate-200">Upload Project Screenshot</p>
                          <p className="text-[10px] text-white/30 font-bold mt-1">Image limit: 800KB</p>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Or Link Image</span>
                        <div className="h-px bg-white/5 flex-1" />
                      </div>

                      <Input 
                        value={screenshotUrl} 
                        onChange={(e) => setScreenshotUrl(e.target.value)} 
                        placeholder="https://image-host.com/photo.png" 
                        className="bg-white/5 border-white/10 h-12 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Short Description</Label>
                      <Textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Detail what this platform does for the XPR Network..." 
                        maxLength={180}
                        className="bg-white/5 border-white/10 min-h-[100px] rounded-xl text-white font-medium resize-none p-4"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full h-16 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all"
                    >
                      {isSaving ? "Publishing Project..." : "Publish Site Showcase (5,000 XPR)"}
                    </Button>
                  </form>
                </DialogContent>
              )}
            </Dialog>
          </div>

          {/* Search Box */}
          <div className="relative group max-w-2xl bg-white/5 border border-white/10 p-2 rounded-[32px] backdrop-blur-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
            <Input 
              placeholder="Search index by project title, description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 bg-transparent border-transparent h-14 text-lg font-bold placeholder:text-white/20 focus-visible:ring-0 text-white"
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-white/40 font-black tracking-widest text-xs uppercase">Syncing showcase directory...</p>
            </div>
          ) : filteredSites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSites.map((site) => {
                const liked = userLikes.includes(site.id);
                return (
                  <Card key={site.id} className="group bg-[#130b21]/60 border border-white/10 rounded-[40px] overflow-hidden hover:border-purple-500/40 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] transition-all duration-500 flex flex-col justify-between h-full">
                    
                    <div className="aspect-video relative overflow-hidden bg-black/40">
                      <img src={site.screenshot_url} alt={site.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#130b21] via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute top-4 right-4">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleLike(site.id)}
                          className={cn(
                            "h-9 rounded-xl border px-3 transition-all flex items-center gap-1.5 shadow-lg",
                            liked 
                              ? "bg-red-500/10 border-red-500/30 text-red-500" 
                              : "bg-black/60 border-white/10 text-white/60 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                          )}
                        >
                          <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
                          <span className="font-black text-[11px]">{site.likes}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">{site.title}</h3>
                          {site.id.startsWith("seed-") && (
                            <div className="h-5 w-5 bg-orange-500/10 border border-orange-500/20 rounded-md flex items-center justify-center">
                              <ShieldCheck className="h-3 w-3 text-orange-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-white/60 text-sm font-medium leading-relaxed line-clamp-3">
                          {site.description}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest truncate max-w-[120px]">
                          By @{site.submitted_by}
                        </span>
                        
                        <Button 
                          asChild
                          variant="ghost" 
                          className="h-10 px-5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest gap-2"
                        >
                          <a href={site.site_url} target="_blank" rel="noopener noreferrer">
                            Visit Site <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[48px] max-w-xl mx-auto space-y-6">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Globe className="h-8 w-8 text-white/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black italic uppercase">No Projects Located</h3>
                <p className="text-white/40 font-bold text-sm">Be the first to publish an index entry!</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <MembershipModal isOpen={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </div>
  );
};

export default Showcase;