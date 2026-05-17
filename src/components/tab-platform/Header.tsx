import { Button } from "@/components/ui/button";
import { UserPlus, Wallet } from "lucide-react";

interface HeaderProps {
  onBecomeCreator: () => void;
}

export const Header = ({ onBecomeCreator }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0514]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/src/assets/logo.png" alt="TIPTAB Logo" className="h-8 w-8 object-contain" />
        <span className="text-2xl font-black italic tracking-tighter text-white">
          TIP<span className="text-orange-500">TAB</span>
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline ml-2 border-l border-white/20 pl-4">
          Tipping is the value of appreciation
        </span>
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
        <Button className="bg-[#a855f7] hover:bg-[#9333ea] text-white flex items-center gap-2 rounded-xl">
          <Wallet className="h-4 w-4" />
          Connect WebAuth
        </Button>
      </div>
    </header>
  );
};