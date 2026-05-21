"use client";

import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  Trophy, 
  Menu,
  Home,
  Map as MapIcon,
  Calculator as CalcIcon,
  LogOut,
  User,
  ChevronDown,
  RefreshCw,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Radio,
  Coins
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const { login, logout, actor, balances, isConnected, isLoading, refreshBalances, isAdmin, isMember, userProfile } = useXpr();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const session = await login();
      if (session) {
        toast({
          title: "Wallet Connected",
          description: `Successfully connected as @${session.auth.actor}`,
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

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const isSubPage = location.pathname !== '/';

  const NavItems = ({ isMobile = false }) => (
    <>
      <Link to="/" onClick={handleHomeClick} className={cn(isMobile ? "w-full" : "lg:w-auto")}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-200 hover:text-purple-400 hover:bg-purple-500/15 flex items-center justify-start lg:justify-center font-bold bg-white/5 border border-white/10 rounded-2xl px-4 transition-all",
            isMobile ? "h-15 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
          )}
        >
          <Home className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
          Home
        </Button>
      </Link>
      <Link to="/live" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "lg:w-auto")}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-200 hover:text-red-400 hover:bg-red-500/15 flex items-center justify-start lg:justify-center font-bold bg-white/5 border border-white/10 rounded-2xl px-4 transition-all",
            isMobile ? "h-15 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm",
            location.pathname === "/live" && "border-red-500/40 bg-red-500/10 text-red-400"
          )}
        >
          <Radio className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4", "animate-pulse")} />
          Live
        </Button>
      </Link>
      {isConnected && (
        <Link to="/leaderboard" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "lg:w-auto")}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-200 hover:text-yellow-400 hover:bg-purple-500/15 flex items-center justify-start lg:justify-center font-bold bg-white/5 border border-white/10 rounded-2xl px-4 transition-all",
              isMobile ? "h-15 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
            )}
          >
            <Trophy className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
            Leaderboard
          </Button>
        </Link>
      )}
      <Link to="/calculator" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "lg:w-auto")}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-200 hover:text-cyan-400 hover:bg-purple-500/15 flex items-center justify-start lg:justify-center font-bold bg-white/5 border border-white/10 rounded-2xl px-4 transition-all",
            isMobile ? "h-15 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
          )}
        >
          <CalcIcon className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
          Calculator
        </Button>
      </Link>
      {isConnected && (
        <Link to="/dashboard" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "lg:w-auto")}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-200 hover:text-purple-400 hover:bg-purple-500/15 flex items-center justify-start lg:justify-center font-bold bg-white/5 border border-white/10 rounded-2xl px-4 transition-all",
              isMobile ? "h-15 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
            )}
          >
            <LayoutDashboard className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
            Dashboard
          </Button>
        </Link>
      )}
      {onBecomeCreator && !isMember && (
        <Button 
          variant="outline" 
          onClick={() => {
            onBecomeCreator();
            setIsOpen(false);
          }}
          className={cn(
            "w-full border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white flex items-center justify-start lg:justify-center font-black rounded-2xl px-4 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] animate-pulse",
            isMobile ? "h-15 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
          )}
        >
          <Sparkles className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
          {isMobile ? "Join as Creator" : "Join"}
        </Button>
      )}
    </>
  );

  return (
    <header className="fixed top-[52px] left-0 right-0 z-50 px-2 sm:px-6">
      <div className="mx-auto w-full max-w-[99%] xl:max-w-[1600px]">
        <div className="border border-purple-500/50 bg-[#0a0514]/90 backdrop-blur-md rounded-[20px] sm:rounded-[28px] px-2 sm:px-3 md:px-4 lg:px-4 py-2 md:py-3 flex items-center justify-between shadow-[0_0_50px_rgba(168,85,247,0.35),0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative ring-1 ring-inset ring-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/5 pointer-events-none" />
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0 relative z-10">
            {isSubPage ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="flex items-center gap-1 sm:gap-1.5 text-white/40 hover:text-purple-400 transition-colors p-1.5 h-9 sm:h-10 rounded-xl hover:bg-white/5 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden xs:inline font-bold text-[9px] sm:text-base text-slate-300">Back</span>
                </Button>
                <div className="h-5 w-px bg-white/10" />
                <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-2">
                  <img src="/src/assets/logo.png" alt="TIPTAB" className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain" />
                  <span className="text-[10px] sm:text-2xl font-black italic tracking-tighter text-slate-100">
                    TIP<span className="text-orange-500">TAB</span>
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1 md:gap-2 group shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full group-hover:scale-110 transition-transform" />
                  <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-10 w-10 xs:h-12 xs:w-12 sm:h-18 md:h-20 lg:h-22 object-contain relative z-10" />
                </div>
                <div className="flex flex-col -space-y-0.5 md:-space-y-1">
                  <span className="text-[10px] xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-black italic tracking-tighter text-slate-100 group-hover:text-[#a855f7] transition-colors duration-300 leading-none">
                    TIP<span className="text-orange-500">TAB</span>
                  </span>
                  <span className="hidden 2xl:block text-[9px] text-slate-400 uppercase tracking-widest font-black opacity-60">
                    Appreciation Hub
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-1 2xl:gap-2 mx-1 relative z-10">
            <NavItems />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-10">
            {isConnected && (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 px-1 sm:px-2.5 h-8 sm:h-10 lg:h-11 2xl:h-12 shrink-0">
                <div className="flex flex-col items-end pr-1 sm:pr-1.5 md:pr-3 border-r border-white/10 py-0.5 sm:py-1">
                  <span className="text-[7px] sm:text-[9px] md:text-xs xl:text-sm font-black text-orange-500 flex items-center gap-0.5 sm:gap-1 leading-none mb-0.5 sm:mb-1">
                    <Zap className="h-2 w-2 sm:h-2.5 sm:w-2.5 fill-orange-500" /> {Number(balances.tab).toLocaleString()} <span className="hidden md:inline">TAB</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[6px] sm:text-[7px] md:text-[9px] xl:text-xs font-bold text-slate-300 leading-none truncate max-w-[30px] xs:max-w-[40px] sm:max-w-none">{Number(balances.xpr).toLocaleString()} XPR</span>
                    <div className="h-1 w-1 rounded-full bg-white/10" />
                    <span className="text-[6px] sm:text-[7px] md:text-[9px] xl:text-xs font-bold text-green-400 leading-none">{Number(balances.xusdc).toLocaleString()} $</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  className="h-3.5 w-3.5 sm:h-5 sm:w-5 md:h-7 md:w-7 text-white/30 hover:text-purple-400 hover:bg-purple-500/10"
                >
                  <RefreshCw className={cn("h-2 w-2 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5", isRefreshing && "animate-spin")} />
                </Button>
              </div>
            )}

            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl h-9 sm:h-11 lg:h-12 2xl:h-13 px-2 sm:px-3 md:px-4 lg:px-4 2xl:px-6 font-black transition-all active:scale-95 group shrink-0 bg-white/5 border border-white/10 text-slate-200 hover:bg-purple-500/10 hover:text-purple-400 shadow-xl",
                      isAdmin && "border-orange-500/40 bg-orange-500/10"
                    )}
                  >
                    <div className={cn("flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full items-center justify-center text-[10px] sm:text-xs font-black border-2 border-white/10 overflow-hidden shrink-0 shadow-lg", userProfile?.color)}>
                      {userProfile?.avatarImage ? (
                        <img src={userProfile.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        userProfile?.avatar
                      )}
                    </div>
                    <div className="flex flex-col items-start justify-center gap-0.5 text-left">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-[10px] sm:text-xs md:text-sm font-black text-purple-400 truncate max-w-[60px] sm:max-w-none">@{actor}</span>
                        {isAdmin && <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />}
                      </div>
                      <span className="hidden sm:block text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] leading-none">
                        {isAdmin ? "Admin Access" : "Network User"}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-white/20 group-data-[state=open]:rotate-180 transition-transform ml-1" />
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
                  <div className="px-3 py-3 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">TAB:</span>
                      <span className="text-orange-500">{Number(balances.tab).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">XPR:</span>
                      <span className="text-slate-200">{Number(balances.xpr).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold border-t border-white/5 pt-2">
                      <span className="text-slate-400 text-[10px]">XUSDC:</span>
                      <span className="text-green-400">{Number(balances.xusdc).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 text-[10px]">METAL:</span>
                      <span className="text-slate-200">{Number(balances.metal).toLocaleString()}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-orange-500/10 focus:text-orange-500 rounded-xl cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5">
                        <ShieldAlert className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-slate-200">Admin Hub</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="focus:bg-purple-500/15 focus:text-purple-400 rounded-xl cursor-pointer">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5">
                      <LayoutDashboard className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-slate-200">{isMember ? "Creator Hub" : "Supporter Hub"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-500/10 focus:text-red-500 rounded-xl cursor-pointer text-red-400 flex items-center gap-3 px-3 py-2.5">
                    <LogOut className="h-4 w-4" />
                    <span className="font-bold">Logout Wallet</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl h-8 sm:h-10 lg:h-11 2xl:h-12 px-2 sm:px-4 2xl:px-8 font-black text-[8px] sm:text-[10px] md:text-xs xl:text-sm transition-all active:scale-95 group shrink-0 bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-2xl shadow-purple-500/40 animate-shimmer"
                >
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
                  <span className="whitespace-nowrap">{isLoading ? "Syncing..." : "Connect"}</span>
                </Button>
              </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-white/5 border border-white/10 hover:bg-purple-500/15 h-9 w-9 sm:h-11 sm:w-11 lg:h-12 2xl:h-14 rounded-xl sm:rounded-2xl shrink-0 lg:hidden">
                  <Menu className="h-4 w-4 sm:h-6 sm:w-6 text-slate-200" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0514]/98 backdrop-blur-3xl border-white/10 p-8 pt-16 w-[320px]">
                <SheetHeader className="text-left mb-10">
                  <SheetTitle className="text-3xl font-black italic text-slate-100 tracking-tighter">
                    TIP<span className="text-orange-500">TAB</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  {isConnected && (
                    <div className={cn(
                      "bg-white/5 border border-white/10 rounded-2xl p-5 mb-2 space-y-3",
                      isAdmin && "border-orange-500/30 bg-orange-500/5"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10 overflow-hidden shrink-0", userProfile?.color || "bg-purple-500/20")}>
                          {userProfile?.avatarImage ? (
                            <img src={userProfile.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            userProfile?.avatar || <User className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-purple-400 truncate">@{actor}</p>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-orange-500">{Number(balances.tab).toLocaleString()} TAB</span>
                            <span className="text-[9px] font-bold text-slate-400">{Number(balances.xpr).toLocaleString()} XPR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="w-full">
                      <Button 
                        variant="ghost" 
                        className="w-full text-orange-500 hover:bg-orange-500/10 flex items-center justify-start gap-4 font-bold bg-orange-500/5 border border-orange-500/20 rounded-2xl h-15 px-6"
                      >
                        <ShieldAlert className="h-5 w-5" />
                        Admin Hub
                      </Button>
                    </Link>
                  )}

                  <NavItems isMobile={true} />
                  
                  {isConnected && (
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-start gap-4 font-bold border border-red-500/20 rounded-2xl h-15 px-6 mt-4 transition-all"
                    >
                      <LogOut className="h-5 w-5" />
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