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
    <div className="w-full bg-white/[0.03] rounded-[32px] overflow-hidden border border-white/10 relative group shadow-[inset_0_0_80px_rgba(168,85,247,0.05)] aspect-[2.4/1] md:aspect-[3/1] flex items-center justify-center">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="absolute top-4 left-6 z-10 hidden sm:block">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Global Network</span>
        </div>
      </div>

      <TooltipProvider>
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 130 
          }}
          className="w-full h-full max-h-full relative z-0"
        >
          <Sphere stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} fill="transparent" />
          <Graticule stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "rgba(255,255,255,0.08)", outline: "none" },
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
                      r={8} 
                      className="fill-orange-500/10 animate-ping opacity-75" 
                    />
                    <circle 
                      r={3} 
                      className="fill-orange-500 stroke-white stroke-[1px] group-hover/marker:scale-150 transition-transform duration-300" 
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#130b21] border-white/20 text-white p-3 rounded-2xl shadow-2xl border-t-purple-500/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${creator.color} flex items-center justify-center text-[10px] font-bold overflow-hidden`}>
                      {creator.avatarImage ? (
                        <img src={creator.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        creator.avatar
                      )}
                    </div>
                    <div>
                      <p className="font-black text-xs tracking-tight">{creator.name}</p>
                      <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">@{creator.handle}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </Marker>
          ))}
        </ComposableMap>
      </TooltipProvider>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0514]/20 via-transparent to-[#0a0514]/10" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[32px] pointer-events-none" />
    </div>
  );
};