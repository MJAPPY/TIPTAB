"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const BrandLogo = ({ className, showText = true, size = "md" }: BrandLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-20",
    xl: "h-32",
  };

  const iconSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl",
    xl: "text-7xl",
  };

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className={cn("relative shrink-0", iconSizeClasses[size])}>
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-purple-600/30 blur-xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-700" />
        
        {/* SVG Icon */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Main Shape */}
          <path
            d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z"
            fill="url(#logo-gradient)"
            fillOpacity="0.15"
            stroke="url(#logo-gradient)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          
          {/* Inner "T" Symbol */}
          <path
            d="M35 35H65M50 35V70M42 70H58"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
          
          {/* Decorative Zap */}
          <path
            d="M75 15L65 35L85 35L75 55"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />
        </svg>
      </div>

      {showText && (
        <div className={cn(
          "font-black italic tracking-tighter leading-none flex items-center",
          textSizeClasses[size]
        )}>
          <span className="text-white group-hover:text-purple-400 transition-colors duration-300">TIP</span>
          <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">TAB</span>
        </div>
      )}
    </div>
  );
};