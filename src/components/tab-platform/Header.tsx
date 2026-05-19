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
  ArrowLeft
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

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const isDashboardOrAdmin = location.pathname.includes('/admin') || location.pathname.includes('/dashboard');

  const NavItems = ({ isMobile = false }) => (
    <>
      <Link to="/" onClick={handleHomeClick} className={cn(isMobile ? "w-full" : "xl:w-auto")}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-200 hover:text-purple-400 hover:bg-purple-500/15 flex items-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl px-5 transition-all",
            isMobile ? "h-15 justify-start text-sm" : "lg:w-auto lg:justify-center h-12"
          )}
        >
          <Home className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
          Home
        </Button>
      </Link>
      {isConnected && (
        <Link to="/leaderboard" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "xl:w-auto")}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-200 hover:text-yellow-400 hover:bg-purple-500/15 flex items-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl px-5 transition-all",
              isMobile ? "h-15 justify-start text-sm" : "lg:w-auto lg:justify-center h-12"
            )}
          >
            <Trophy className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
            Leaderboard
          </Button>
        </Link>
      )}
      <Link to="/calculator" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "xl:w-auto")}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-200 hover:text-cyan-400 hover:bg-purple-500/15 flex items-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl px-5 transition-all",
            isMobile ? "h-15 justify-start text-sm" : "lg:w-auto lg:justify-center h-12"
          )}
        >
          <CalcIcon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
          Calculator
        </Button>
      </Link>
      {isConnected && (
        <Link to="/dashboard" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "xl:w-auto")}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-200 hover:text-purple-400 hover:bg-purple-500/15 flex items-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl px-5 transition-all",
              isMobile ? "h-15 justify-start text-sm" : "lg:w-auto lg:justify-center h-12"
            )}
          >
            <LayoutDashboard className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
            My Dashboard
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
            "w-full border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white flex items-center gap-3 font-black rounded-2xl px-5 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] animate-pulse",
            isMobile ? "h-15 justify-start text-sm" : "lg:w-auto lg:justify-center h-12"
          )}
        >
          <Sparkles className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
          Join as Creator
        </Button>
      )}
    </>
  );

  return (
    <header className="fixed top-[52px] left-0 right-0 z-50 px-2 sm:px-6">
      <div className="mx-auto w-full max-w-[98%] xl:max-w-[1600px]">
        <div className="border border-purple-500/50 bg-[#0a0514]/90 backdrop-blur-md rounded-[20px] sm:rounded-[28px] px-2 sm:px-4 md:px-6 py-2 md:py-3.5 flex items-center justify-between shadow-[0_0_50px_rgba(168,85,247,0.35),0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative ring-1 ring-inset ring-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/5 pointer-events-none" />
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0 relative z-10">
            {location.pathname === '/admin' ? (
              <div className="flex items-center gap-1.5 sm:gap-4">
                <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-2 text-white/40 hover:text-purple-400 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden xs:inline text-[8px] sm:text-xs font-black uppercase tracking-widest text-slate-300">Exit</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-1 sm:gap-2">
                  <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  <span className="text-xs sm:text-xl font-black italic tracking-tighter text-slate-100">
                    ADMIN<span className="text-orange-500">HUB</span>
                  </span>
                </div>
              </div>
            ) : location.pathname === '/dashboard' ? (
              <div className="flex items-center gap-1.5 sm:gap-4">
                <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-2 text-white/40 hover:text-purple-400 transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden xs:inline font-bold text-[10px] sm:text-base text-slate-300">Map</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-1 sm:gap-2">
                  <img src="/src/assets/logo.png" alt="TIPTAB" className="h-5 w-5 sm:h-8 sm:w-8 object-contain" />
                  <span className="text-xs sm:text-xl font-black italic tracking-tighter text-slate-100">
                    {isMember ? "CREATOR" : "SUPPORTER"}<span className="text-orange-500">HUB</span>
                  </span>
                </div>
              </div>
            ) : (
              <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1.5 md:gap-4 group shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full group-hover:scale-110 transition-transform" />
                  <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-6 w-6 xs:h-8 xs:w-8 sm:h-14 sm:w-14 object-contain relative z-10" />
                </div>
                <div className="flex flex-col -space-y-0.5 md:-space-y-1">
                  <span className="text-xs xs:text-sm sm:text-3xl font-black italic tracking-tighter text-slate-100 group-hover:text-[#a855f7] transition-colors duration-300 leading-none">
                    TIP<span className="text-orange-500">TAB</span>
                  </span>
                  <span className="hidden sm:block text-[6px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-60">
                    Appreciation Hub
                  </span>
                </div>
              </Link>
            )}
          </div>

          {!isDashboardOrAdmin && (
            <div className="hidden xl:flex items-center gap-3 mx-4 relative z-10">
              <NavItems />
            </div>
          )}

          <div className="flex items-center gap-1 md:gap-4 relative z-10">
            {isConnected && (
              <div className="flex items-center gap-1 sm:gap-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 px-1 sm:px-4 h-9 sm:h-16 shrink-0">
                <div className="flex flex-col items-end pr-1 sm:pr-4 border-r border-white/10 py-0.5 sm:py-1">
                  <span className="text-[7px] sm:text-sm font-black text-orange-500 flex items-center gap-0.5 sm:gap-1 leading-none mb-0.5 sm:mb-1">
                    <Zap className="h-2 w-2 sm:h-3 w-3 fill-orange-500" /> {Number(balances.tab).toLocaleString()} <span className="hidden sm:inline">TAB</span>
                  </span>
                  <span className="text-[6px] sm:text-xs font-bold text-slate-300 leading-none truncate max-w-[40px] sm:max-w-none">{Number(balances.xpr).toLocaleString()} <span className="hidden sm:inline">XPR</span></span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  className="h-4 w-4 sm:h-8 sm:w-8 text-white/30 hover:text-purple-400 hover:bg-purple-500/10"
                >
                  <RefreshCw className={cn("h-2 w-2 sm:h-4 sm:w-4", isRefreshing && "animate-spin")} />
                </Button>
              </div>
            )}

            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className={cn(
                      "flex items-center gap-1 md:gap-4 rounded-xl sm:rounded-2xl h-9 sm:h-16 px-1.5 sm:px-8 font-black text-[8px] sm:text-sm transition-all active:scale-95 group shrink-0 bg-white/5 border border-white/10 text-slate-200 hover:bg-purple-500/10 hover:text-purple-400 shadow-xl",
                      isAdmin && "border-orange-500/60 bg-orange-500/10"
                    )}
                  >
                    <div className={cn("hidden sm:flex h-10 w-10 rounded-full items-center justify-center text-[10px] font-black border border-white/10 overflow-hidden shrink-0", userProfile?.color)}>
                      {userProfile?.avatarImage ? (
                        <img src={userProfile.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        userProfile?.avatar
                      )}
                    </div>
                    <div className="flex flex-col items-start -space-y-0.5 sm:-space-y-1 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] sm:text-base font-black text-purple-400 truncate max-w-[40px] xs:max-w-[60px] sm:max-w-none">@{actor}</span>
                        {isAdmin && <ShieldCheck className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-orange-500" />}
                      </div>
                      <span className="hidden sm:block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isAdmin ? "Network Admin" : "User"}
                      </span>
                    </div>
                    <ChevronDown className="h-2 w-2 sm:h-4 sm:w-4 text-white/30 group-data-[state=open]:rotate-180 transition-transform" />
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
                      <span className="text-slate-400">TAB Balance:</span>
                      <span className="text-orange-500">{Number(balances.tab).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">XPR Balance:</span>
                      <span className="text-slate-200">{Number(balances.xpr).toLocaleString()}</span>
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
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-xl sm:rounded-2xl h-9 sm:h-16 px-2 sm:px-10 font-black text-[9px] sm:text-base transition-all active:scale-95 group shrink-0 bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-2xl shadow-purple-500/40 animate-shimmer"
                >
                  <Wallet className="h-3 w-3 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
                  <span className="whitespace-nowrap">{isLoading ? "Syncing..." : "Connect WebAuth"}</span>
                </Button>
              </div>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-white/5 border border-white/10 hover:bg-purple-500/15 h-9 w-9 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl shrink-0">
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