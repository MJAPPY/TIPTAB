import { Button } from "@/components/ui/button";
import { UserPlus, Wallet } from "lucide-react";

interface HeaderProps {
  onBecomeCreator: () => void;
}

export const Header = ({ onBecomeCreator }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0514]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-24 w-24 object-contain" />
        <div className="flex flex-col -space-y-1">
          <span className="text-4xl font-black italic tracking-tighter text-white">
            TIP<span className="text-orange-500">TAB</span>
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline uppercase tracking-widest font-black">
            Tipping is appreciation
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBecomeCreator}
          className="text-white hover:text-orange-500 hidden md:flex items-center gap-2 font-bold"
        >
          <UserPlus className="h-5 w-5" />
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