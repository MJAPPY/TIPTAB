"use client";

import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  Trophy, 
  Menu,
  Home,
  LogOut,
  User,
  ChevronDown,
  RefreshCw,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Radio
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
            isMobile ? "h-12 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
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
            isMobile ? "h-12 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm",
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
              isMobile ? "h-12 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
            )}
          >
            <Trophy className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
            Leaderboard
          </Button>
        </Link>
      )}
      {isConnected && (
        <Link to="/dashboard" onClick={() => setIsOpen(false)} className={cn(isMobile ? "w-full" : "lg:w-auto")}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-200 hover:text-purple-400 hover:bg-purple-500/15 flex items-center justify-start lg:justify-center font-bold bg-white/5 border border-white/10 rounded-2xl px-4 transition-all",
              isMobile ? "h-12 text-sm" : "h-10 xl:h-11 2xl:h-12 lg:px-2 2xl:px-5 lg:gap-1.5 2xl:gap-3 lg:text-[11px] 2xl:text-sm"
            )}
          >
            <LayoutDashboard className={cn(isMobile ? "h-5 w-5" : "h-3.5 w-3.5 2xl:h-4 2xl:w-4")} />
            Dashboard
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="fixed top-[40px] md:top-[52px] left-0 right-0 z-50 px-2 sm:px-4 md:px-6">
      <div className="mx-auto w-full max-w-[99%] xl:max-w-[1600px]">
        <div className="border border-purple-500/50 bg-[#0a0514]/90 backdrop-blur-md rounded-[20px] sm:rounded-[28px] px-2 sm:px-4 py-1.5 md:py-3 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/5 pointer-events-none" />
          
          {/* Left: Navigation / Logo */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0 relative z-10">
            {isSubPage ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="flex items-center justify-center text-white/40 hover:text-purple-400 transition-colors p-1.5 h-8 w-8 sm:h-10 sm:w-auto rounded-xl hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline font-bold ml-1.5 text-slate-300">Back</span>
                </Button>
                <div className="h-4 sm:h-5 w-px bg-white/10 mx-0.5" />
                <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1.5">
                  <img src="/src/assets/logo.png" alt="" className="h-7 w-7 sm:h-12 md:h-16 object-contain" />
                  <span className="hidden xs:inline text-[11px] sm:text-2xl font-black italic tracking-tighter text-slate-100">
                    TIP<span className="text-orange-500">TAB</span>
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/" onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-2 group shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
                  <img src="/src/assets/logo.png" alt="" className="h-8 w-8 sm:h-14 md:h-20 lg:h-22 object-contain relative z-10" />
                </div>
                <span className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-black italic tracking-tighter text-slate-100 group-hover:text-[#a855f7] transition-colors leading-none">
                  TIP<span className="text-orange-500">TAB</span>
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1.5 2xl:gap-2 mx-2 relative z-10">
            <NavItems />
          </div>

          {/* Right: Actions / Wallet */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-10">
            {isConnected && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-0.5 px-1 sm:px-2 h-8 sm:h-10 lg:h-12 shrink-0">
                <div className="flex flex-col items-end pr-1.5 sm:pr-3 border-r border-white/10 py-0.5">
                  <span className="text-[8px] sm:text-xs xl:text-sm font-black text-orange-500 flex items-center gap-0.5 leading-none mb-0.5 sm:mb-1">
                    <Zap className="h-2 w-2 sm:h-3 sm:w-3 fill-orange-500" /> {Number(balances.tab).toLocaleString()}
                  </span>
                  <span className="hidden xs:block text-[6px] sm:text-[9px] font-bold text-slate-400 leading-none">XPR: {Number(balances.xpr).toLocaleString()}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  className="h-6 w-6 sm:h-8 sm:w-8 text-white/30 hover:text-purple-400"
                >
                  <RefreshCw className={cn("h-3 w-3 sm:h-4 sm:w-4", isRefreshing && "animate-spin")} />
                </Button>
              </div>
            )}

            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-3 rounded-xl sm:rounded-2xl h-8 sm:h-10 lg:h-12 px-1.5 sm:px-3 font-black transition-all bg-white/5 border border-white/10 text-slate-200",
                      isAdmin && "border-orange-500/40"
                    )}
                  >
                    <div className={cn("flex h-6 w-6 sm:h-8 rounded-full items-center justify-center text-[10px] sm:text-xs font-black border-2 border-white/10 overflow-hidden shrink-0", userProfile?.color)}>
                      {userProfile?.avatarImage ? <img src={userProfile.avatarImage} alt="" className="w-full h-full object-cover" /> : userProfile?.avatar}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                      <span className="text-xs font-black text-purple-400">@{actor}</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isAdmin ? "Admin" : "User"}</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-white/20" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1a102d]/95 backdrop-blur-xl border-white/10 text-white rounded-2xl p-2 mt-2">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-white/40">@{actor}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-orange-500/10 focus:text-orange-500 rounded-xl cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5">
                        <ShieldAlert className="h-4 w-4" /> <span className="font-bold">Admin Hub</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="focus:bg-purple-500/15 focus:text-purple-400 rounded-xl cursor-pointer">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5">
                      <LayoutDashboard className="h-4 w-4" /> <span className="font-bold">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-500/10 focus:text-red-500 rounded-xl cursor-pointer text-red-400 flex items-center gap-3 px-3 py-2.5">
                    <LogOut className="h-4 w-4" /> <span className="font-bold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                className="rounded-xl sm:rounded-2xl h-8 sm:h-10 lg:h-12 px-3 sm:px-6 font-black text-[10px] sm:text-xs transition-all bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-lg animate-shimmer"
              >
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span>{isLoading ? "..." : "Connect"}</span>
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white bg-white/5 border border-white/10 hover:bg-purple-500/15 h-8 w-8 sm:h-10 sm:w-10 lg:h-12 rounded-xl shrink-0 lg:hidden">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0514]/98 backdrop-blur-3xl border-white/10 p-8 pt-16 w-[280px] xs:w-[320px]">
                <SheetHeader className="text-left mb-10">
                  <SheetTitle className="text-3xl font-black italic text-slate-100 tracking-tighter">
                    TIP<span className="text-orange-500">TAB</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  {isConnected && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-2 flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-[10px] font-black", userProfile?.color)}>
                        {userProfile?.avatarImage ? <img src={userProfile.avatarImage} alt="" className="w-full h-full object-cover" /> : userProfile?.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-black text-purple-400">@{actor}</p>
                        <p className="text-[9px] font-bold text-orange-500">{Number(balances.tab).toLocaleString()} TAB</p>
                      </div>
                    </div>
                  )}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full text-orange-500 hover:bg-orange-500/10 justify-start gap-4 font-bold bg-orange-500/5 border border-orange-500/20 rounded-2xl h-14 px-6">
                        <ShieldAlert className="h-5 w-5" /> Admin Hub
                      </Button>
                    </Link>
                  )}
                  <NavItems isMobile={true} />
                  {isConnected && (
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-red-400 border border-red-500/20 rounded-2xl h-14 px-6 mt-4">
                      <LogOut className="h-5 w-5 mr-4" /> Logout
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