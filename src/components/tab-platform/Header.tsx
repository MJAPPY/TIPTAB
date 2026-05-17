"use client";

import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  LayoutDashboard, 
  Sparkles, 
  Trophy, 
  Menu,
  Map as MapIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
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

  const NavItems = () => (
    <>
      <Link to="/leaderboard" onClick={() => setIsOpen(false)}>
        <Button 
          variant="ghost" 
          className="w-full lg:w-auto text-white hover:text-yellow-400 flex items-center justify-start lg:justify-center gap-3 font-bold bg-white/5 border border-white/10 rounded-xl h-14 px-5"
        >
          <Trophy className="h-5 w-5" />
          Tip Leaderboard
        </Button>
      </Link>
      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
        <Button 
          variant="ghost" 
          className="w-full lg:w-auto text-white hover:text-purple-400 flex items-center justify-start lg:justify-center gap-3 font-bold bg-white/5 border border-white/10 rounded-xl h-14 px-5"
        >
          <LayoutDashboard className="h-5 w-5" />
          My Dashboard
        </Button>
      </Link>
      <Button 
        variant="outline" 
        onClick={() => {
          onBecomeCreator();
          setIsOpen(false);
        }}
        className="w-full lg:w-auto border-orange-500/50 bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-start lg:justify-center gap-3 font-black rounded-xl h-14 px-5 transition-all"
      >
        <Sparkles className="h-5 w-5" />
        Become a Creator
      </Button>
    </>
  );

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="border border-white/10 bg-[#0a0514]/80 backdrop-blur-md rounded-2xl md:rounded-[32px] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full group-hover:scale-110 transition-transform" />
              <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-10 w-10 md:h-16 md:w-16 object-contain relative z-10" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl md:text-3xl font-black italic tracking-tighter text-white group-hover:text-red-500 transition-colors duration-300">
                TIP<span className="text-orange-500">TAB</span>
              </span>
              <span className="text-[8px] md:text-[10px] text-muted-foreground hidden xs:inline uppercase tracking-widest font-black">
                Appreciation Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-3">
            <NavItems />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center gap-2 rounded-xl md:rounded-2xl h-11 md:h-14 px-3 md:px-8 font-black text-[10px] md:text-base shadow-xl shadow-purple-500/30 transition-all active:scale-95 group">
              <Wallet className="h-3.5 w-3.5 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
              <span>Connect WebAuth</span>
            </Button>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden text-white hover:bg-white/10 h-11 w-11 rounded-xl border border-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0514]/95 backdrop-blur-2xl border-white/10 p-6 w-[300px]">
                <SheetHeader className="text-left mb-8">
                  <SheetTitle className="text-2xl font-black italic text-white">
                    TIP<span className="text-orange-500">TAB</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full text-white hover:text-cyan-400 flex items-center justify-start gap-3 font-bold bg-white/5 border border-white/10 rounded-xl h-14 px-5"
                    >
                      <MapIcon className="h-5 w-5" />
                      View Map
                    </Button>
                  </Link>
                  <NavItems />
                </div>
                <div className="absolute bottom-10 left-6 right-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">
                    Tipping is Appreciation
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