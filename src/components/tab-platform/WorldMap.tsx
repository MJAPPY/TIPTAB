import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule
} from "react-simple-maps";
import { Creator } from "@/data/creators";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
}

export const WorldMap = ({ creators, onSelectCreator }: WorldMapProps) => {
  return (
    <div className="w-full h-full min-h-[350px] md:min-h-[480px] bg-white/[0.03] rounded-[48px] overflow-hidden border border-white/10 relative group shadow-[inset_0_0_80px_rgba(168,85,247,0.05)]">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="absolute top-8 left-10 z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-white/90">Global Creator Network</span>
        </div>
        <p className="text-white/50 text-xs font-medium">Click a pulse to support creators directly</p>
      </div>

      <TooltipProvider>
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 140
          }}
          className="w-full h-full relative z-0"
        >
          <Sphere stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} fill="transparent" />
          <Graticule stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.07)"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "all 300ms" },
                    hover: { fill: "rgba(255,255,255,0.12)", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {creators.map((creator) => (
            <Marker key={creator.id} coordinates={creator.coordinates}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <g 
                    className="cursor-pointer outline-none group/marker" 
                    onClick={() => onSelectCreator(creator)}
                  >
                    <circle 
                      r={12} 
                      className="fill-orange-500/10 animate-ping opacity-75" 
                    />
                    <circle 
                      r={6} 
                      className="fill-orange-500/30 animate-pulse" 
                    />
                    <circle 
                      r={4.5} 
                      className="fill-orange-500 stroke-white stroke-[1.5px] shadow-xl group-hover/marker:scale-150 transition-transform duration-300 ease-out" 
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#130b21] border-white/20 text-white p-4 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-purple-500/50">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl ${creator.color} flex items-center justify-center text-sm font-bold shadow-lg overflow-hidden`}>
                      {creator.avatarImage ? (
                        <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        creator.avatar
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-tight">{creator.name}</p>
                      <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider">@{creator.handle}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </Marker>
          ))}
        </ComposableMap>
      </TooltipProvider>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0514]/40 via-transparent to-[#0a0514]/20" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[48px] pointer-events-none" />
    </div>
  );
};