import { Button } from "@/components/ui/button";
import { UserPlus, Wallet } from "lucide-react";

interface HeaderProps {
  onBecomeCreator: () => void;
}

export const Header = ({ onBecomeCreator }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0514]/80 backdrop-blur-md px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-16 w-16 object-contain" />
        <div className="flex flex-col -space-y-1">
          <span className="text-3xl font-black italic tracking-tighter text-white">
            TIP<span className="text-orange-500">TAB</span>
          </span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline uppercase tracking-widest font-bold">
            Tipping is appreciation
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={onBecomeCreator}
          className="text-white hover:text-orange-500 hidden md:flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Become a Creator
        </Button>
        <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-purple-500/20">
          <Wallet className="h-4 w-4" />
          Connect WebAuth
        </Button>
      </div>
    </header>
  );
};