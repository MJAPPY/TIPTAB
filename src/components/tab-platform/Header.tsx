"use client";

import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  Trophy, 
  Menu,
  Map as MapIcon,
  Calculator as CalcIcon,
  LogOut,
  User,
  ChevronDown,
  RefreshCw,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useXpr } from "@/contexts/XprContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onBecomeCreator?: () => void;
}

export const Header = ({ onBecomeCreator }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { login, logout, actor, balances, isConnected, isLoading, refreshBalances, isAdmin } = useXpr();
  const { toast } = useToast();
  const location = useLocation();

  const handleConnect = async () => {
    try {
      const session = await login();
      if (session) {
        toast({
          title: "Wallet Connected",
          description: `Successfully connected as @${session.auth.actor} via @tabxpr`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to WebAuth wallet.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    toast({
      title: "Disconnected",
      description: "Wallet session cleared.",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 800);
    toast({
      title: "Balances Updated",
      description: "Successfully synced with the XPR Network.",
    });
  };

  const isDashboardOrAdmin = location.pathname.includes('/dashboard') || location.pathname.includes('/admin');

  const NavItems = () => (
    <>
      <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="w-full xl:w-auto">
        <Button 
          variant="ghost" 
          className="w-full lg:w-auto text-white hover:text-yellow-400 flex items-center justify-start lg:justify-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl h-12 px-5"
        >
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Button>
      </Link>
      <Link to="/calculator" onClick={() => setIsOpen(false)} className="w-full xl:w-auto">
        <Button 
          variant="ghost" 
          className="w-full lg:w-auto text-white hover:text-cyan-400 flex items-center justify-start lg:justify-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl h-12 px-5"
        >
          <CalcIcon className="h-4 w-4" />
          Calculator
        </Button>
      </Link>
      {isConnected && (
        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full xl:w-auto">
          <Button 
            variant="ghost" 
            className="w-full lg:w-auto text-white hover:text-purple-400 flex items-center justify-start lg:justify-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl h-12 px-5"
          >
            <LayoutDashboard className="h-4 w-4" />
            My Dashboard
          </Button>
        </Link>
      )}
      {onBecomeCreator && (
        <Button 
          variant="outline" 
          onClick={() => {
            onBecomeCreator();
            setIsOpen(false);
          }}
          className="w-full lg:w-auto border-orange-500/50 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-start lg:justify-center gap-3 font-black rounded-2xl h-12 px-5 transition-all shadow-[0_0_20px_rgba(249,115,22,0.15)]"
        >
          <Sparkles className="h-4 w-4" />
          Become a Creator
        </Button>
      )}
    </>
  );

  return (
    <header className="fixed top-[52px] left-0 right-0 z-50 px-3 md:px-6">
      <div className="mx-auto w-full max-w-[98%] xl:max-w-[1600px]">
        <div className="border border-white/10 bg-[#0a0514]/85 backdrop-blur-md rounded-[28px] px-3 md:px-8 py-2 md:py-3.5 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          
          <div className="flex items-center gap-4">
            {location.pathname === '/admin' ? (
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Exit Admin</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  <span className="text-xl font-black italic tracking-tighter text-white">
                    ADMIN<span className="text-orange-500">HUB</span>
                  </span>
                </div>
              </div>
            ) : location.pathname === '/dashboard' ? (
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline font-bold">Map</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <img src="/src/assets/logo.png" alt="TIPTAB" className="h-8 w-8 object-contain" />
                  <span className="text-xl font-black italic tracking-tighter text-white">
                    CREATOR<span className="text-orange-500">HUB</span>
                  </span>
                </div>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full group-hover:scale-110 transition-transform" />
                  <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-10 w-10 md:h-14 md:w-14 object-contain relative z-10" />
                </div>
                <div className="flex flex-col -space-y-0.5 md:-space-y-1">
                  <span className="text-lg md:text-3xl font-black italic tracking-tighter text-white group-hover:text-[#a855f7] transition-colors duration-300">
                    TIP<span className="text-orange-500">TAB</span>
                  </span>
                  <span className="text-[7px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                    Appreciation Hub
                  </span>
                </div>
              </Link>
            )}
          </div>

          {!isDashboardOrAdmin && (
            <div className="hidden xl:flex items-center gap-3 mx-4">
              <NavItems />
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4">
            {isConnected && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 px-4 h-14 md:h-16">
                <div className="flex flex-col items-end pr-4 border-r border-white/10 py-1">
                  <span className="text-xs md:text-sm font-black text-orange-500 flex items-center gap-1.5 leading-none mb-1">
                    <Zap className="h-3 w-3 fill-orange-500" /> {Number(balances.tab).toLocaleString()} TAB
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-white/60 leading-none">{Number(balances.xpr).toLocaleString()} XPR</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  className="h-8 w-8 text-white/30 hover:text-white"
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
              </div>
            )}

            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className={cn(
                      "flex items-center gap-4 rounded-2xl h-14 md:h-16 px-6 md:px-8 font-black text-sm transition-all active:scale-95 group shrink-0 bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-xl",
                      isAdmin && "border-orange-500/60 bg-orange-500/10"
                    )}
                  >
                    <div className="flex flex-col items-start -space-y-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm md:text-base font-black text-purple-400">@{actor}</span>
                        {isAdmin && <ShieldCheck className="h-4 w-4 text-orange-500" />}
                      </div>
                      <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase tracking-widest">
                        {isAdmin ? "Network Admin" : "Connected User"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/30 group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#1a102d]/95 backdrop-blur-xl border-white/10 text-white rounded-2xl p-2 mt-2 shadow-2xl">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Account</span>
                      <span className="text-sm font-black text-purple-400">@{actor}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <div className="px-3 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white/60">TAB Balance:</span>
                      <span className="text-orange-500">{Number(balances.tab).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white/60">XPR Balance:</span>
                      <span>{Number(balances.xpr).toLocaleString()}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-orange-500/10 focus:text-orange-500 rounded-xl cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5">
                        <ShieldAlert className="h-4 w-4 text-orange-500" />
                        <span className="font-bold">Admin Hub</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white rounded-xl cursor-pointer">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5">
                      <LayoutDashboard className="h-4 w-4 text-purple-400" />
                      <span className="font-bold">Creator Hub</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-500/10 focus:text-red-500 rounded-xl cursor-pointer text-red-400 flex items-center gap-3 px-3 py-2.5">
                    <LogOut className="h-4 w-4" />
                    <span className="font-bold">Logout Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-2xl h-14 md:h-16 px-6 md:px-10 font-black text-sm md:text-base transition-all active:scale-95 group shrink-0 bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-2xl shadow-purple-500/40"
              >
                <Wallet className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                <span className="hidden xs:inline whitespace-nowrap">{isLoading ? "Restoring..." : "Connect WebAuth"}</span>
                <span className="xs:hidden">Connect</span>
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-white/5 border border-white/10 hover:bg-white/10 h-14 w-14 md:h-16 md:w-16 rounded-2xl shrink-0">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0514]/98 backdrop-blur-3xl border-white/10 p-8 pt-16 w-[320px]">
                <SheetHeader className="text-left mb-10">
                  <SheetTitle className="text-3xl font-black italic text-white tracking-tighter">
                    TIP<span className="text-orange-500">TAB</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-5">
                  {isConnected && (
                    <div className={cn(
                      "bg-white/5 border border-white/10 rounded-2xl p-5 mb-2 space-y-3",
                      isAdmin && "border-orange-500/30 bg-orange-500/5"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-purple-400">@{actor}</p>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-orange-500">{Number(balances.tab).toLocaleString()} TAB</span>
                            <span className="text-[9px] font-bold text-white/40">{Number(balances.xpr).toLocaleString()} XPR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className="w-full text-orange-500 hover:bg-orange-500/10 flex items-center justify-start gap-4 font-bold bg-orange-500/5 border border-orange-500/20 rounded-2xl h-16 px-6"
                      >
                        <ShieldAlert className="h-6 w-6" />
                        Admin Hub
                      </Button>
                    </Link>
                  )}
                  <NavItems />
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full text-white hover:text-cyan-400 flex items-center justify-start gap-4 font-bold bg-white/5 border border-white/10 rounded-2xl h-16 px-6"
                    >
                      <MapIcon className="h-6 w-6" />
                      View Map
                    </Button>
                  </Link>
                  
                  {isConnected && (
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-start gap-4 font-bold border border-red-500/20 rounded-2xl h-16 px-6 mt-4 transition-all"
                    >
                      <LogOut className="h-6 w-6" />
                      Logout Wallet
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};