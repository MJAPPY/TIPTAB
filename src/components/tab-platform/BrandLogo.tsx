"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { APP_LOGO } from "@/utils/assets";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  isStatic?: boolean;
}

export const BrandLogo = ({ className, showText = true, size = "md", isStatic = false }: BrandLogoProps) => {
  const containerSizeClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
    xl: "gap-3",
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
    <div className={cn("flex items-center", containerSizeClasses[size], !isStatic && "group", className)}>
      <div className={cn("relative shrink-0", imageSizeClasses[size])}>
        {/* Glow effect - only show if NOT static */}
        {!isStatic && (
          <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-700" />
        )}
        
        <img 
          src={APP_LOGO} 
          alt="TAB Token" 
          className={cn(
            "w-full h-full object-contain relative z-10",
            !isStatic ? "drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-500" : ""
          )} 
        />
      </div>

      {showText && (
        <div className={cn(
          "font-black italic tracking-tighter leading-none flex items-center",
          textSizeClasses[size]
        )}>
          <span className={cn(
            "text-white transition-colors duration-300", 
            !isStatic && "group-hover:text-purple-400",
            isStatic && "[text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]"
          )}>
            TIP
          </span>
          <span className={cn("text-orange-500", !isStatic && "drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]")}>TAB</span>
        </div>
      )}
    </div>
  );
};