import { Button } from "@/components/ui/button";
import { UserPlus, Wallet, LayoutDashboard, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onBecomeCreator: () => void;
}

export const Header = ({ onBecomeCreator }: HeaderProps) => {
  return (
    <header className="fixed top-10 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0514]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-4">
          <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-24 w-24 object-contain" />
          <div className="flex flex-col -space-y-1">
            <span className="text-4xl font-black italic tracking-tighter text-white">
              TIP<span className="text-orange-500">TAB</span>
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline uppercase tracking-widest font-black">
              Tipping is appreciation
            </span>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/leaderboard">
          <Button 
            variant="ghost" 
            className="text-white hover:text-yellow-400 flex items-center gap-2 font-bold bg-white/5 border border-white/10 rounded-xl h-14"
          >
            <Trophy className="h-5 w-5" />
            Hall of Fame
          </Button>
        </Link>
        <Link to="/dashboard" className="hidden md:block">
          <Button 
            variant="ghost" 
            className="text-white hover:text-purple-400 flex items-center gap-2 font-bold bg-white/5 border border-white/10 rounded-xl h-14"
          >
            <LayoutDashboard className="h-5 w-5" />
            My Dashboard
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={onBecomeCreator}
          className="border-orange-500/50 bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white hidden lg:flex items-center gap-2 font-black rounded-xl h-14 px-6 transition-all"
        >
          <Sparkles className="h-5 w-5" />
          Become a Creator
        </Button>
        <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center gap-2 rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-purple-500/30">
          <Wallet className="h-5 w-5" />
          Connect WebAuth
        </Button>
      </div>
    </header>
  );
};