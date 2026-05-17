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
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  onBecomeCreator: () => void;
}

export const Header = ({ onBecomeCreator }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (walletAddress) return; // Already connected

    setIsConnecting(true);
    try {
      // Simulate WebAuth wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      setWalletAddress(mockAddress);
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to XPR Network via WebAuth.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not establish connection to WebAuth.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

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
      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full xl:w-auto">
        <Button 
          variant="ghost" 
          className="w-full lg:w-auto text-white hover:text-purple-400 flex items-center justify-start lg:justify-center gap-3 font-bold bg-white/5 border border-white/10 rounded-2xl h-12 px-5"
        >
          <LayoutDashboard className="h-4 w-4" />
          My Dashboard
        </Button>
      </Link>
      <Button 
        variant="outline" 
        onClick={() => {
          onBecomeCreator();
          setIsOpen(false);
        }}
        className="w-full lg:w-auto border-orange-500/50 bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-start lg:justify-center gap-3 font-black rounded-2xl h-12 px-5 transition-all"
      >
        <Sparkles className="h-4 w-4" />
        Become a Creator
      </Button>
    </>
  );

  return (
    <header className="fixed top-[52px] left-0 right-0 z-50 px-3 md:px-6">
      <div className="mx-auto w-full max-w-[98%] xl:max-w-[1600px]">
        <div className="border border-white/10 bg-[#0a0514]/85 backdrop-blur-md rounded-[28px] px-3 md:px-8 py-2 md:py-3.5 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          
          {/* Logo Section */}
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

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-3 mx-4">
            <NavItems />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className={`flex items-center gap-2 rounded-2xl h-10 md:h-14 px-4 md:px-10 font-black text-[10px] md:text-base shadow-2xl transition-all active:scale-95 group shrink-0 ${
                walletAddress 
                ? "bg-green-500/10 border border-green-500/50 text-green-400 hover:bg-green-500/20" 
                : "bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-purple-500/40"
              }`}
            >
              {isConnecting ? (
                <div className="h-4 w-4 md:h-6 md:w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : walletAddress ? (
                <Check className="h-4 w-4 md:h-6 md:w-6" />
              ) : (
                <Wallet className="h-4 w-4 md:h-6 md:w-6 group-hover:rotate-12 transition-transform" />
              )}
              
              <span className="hidden xs:inline whitespace-nowrap">
                {isConnecting ? "Connecting..." : walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect WebAuth"}
              </span>
              <span className="xs:hidden">
                {isConnecting ? "..." : walletAddress ? "Active" : "Connect"}
              </span>
            </Button>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden text-white hover:bg-white/10 h-10 w-10 md:h-14 md:w-14 rounded-2xl border border-white/10 shrink-0">
                  <Menu className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0514]/98 backdrop-blur-3xl border-white/10 p-8 pt-16 w-[320px]">
                <SheetHeader className="text-left mb-10">
                  <SheetTitle className="text-3xl font-black italic text-white tracking-tighter">
                    TIP<span className="text-orange-500">TAB</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-5">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full text-white hover:text-cyan-400 flex items-center justify-start gap-4 font-bold bg-white/5 border border-white/10 rounded-2xl h-16 px-6"
                    >
                      <MapIcon className="h-6 w-6" />
                      View Map
                    </Button>
                  </Link>
                  <NavItems />
                </div>
                <div className="absolute bottom-12 left-8 right-8 text-center">
                   <div className="h-px bg-white/10 w-full mb-6" />
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">
                    Network Status: Online
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};