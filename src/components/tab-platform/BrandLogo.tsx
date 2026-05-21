"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const BrandLogo = ({ className, showText = true, size = "md" }: BrandLogoProps) => {
  const containerSizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-5",
    xl: "gap-8",
  };

  const imageSizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-6xl",
    xl: "text-8xl",
  };

  return (
    <div className={cn("flex items-center group", containerSizeClasses[size], className)}>
      <div className={cn("relative shrink-0", imageSizeClasses[size])}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-700" />
        
        <img 
          src="/src/assets/logo.png" 
          alt="TAB Token" 
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-500" 
        />
      </div>

      {showText && (
        <div className={cn(
          "font-black italic tracking-tighter leading-none flex items-center",
          textSizeClasses[size]
        )}>
          <span className="text-white group-hover:text-purple-400 transition-colors duration-300">TIP</span>
          <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">TAB</span>
        </div>
      )}
    </div>
  );
};