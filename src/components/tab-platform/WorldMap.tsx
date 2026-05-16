import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Sphere,
  Graticule
} from "react-simple-maps";
import { CREATORS, Creator } from "@/data/creators";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  onSelectCreator: (creator: Creator) => void;
}

export const WorldMap = ({ onSelectCreator }: WorldMapProps) => {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] bg-white/2 rounded-[40px] overflow-hidden border border-white/10 relative group">
      <div className="absolute top-6 left-8 z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest text-white/80">Live Network</span>
        </div>
        <p className="text-white/40 text-xs">Creators active across the globe</p>
      </div>

      <TooltipProvider>
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 147
          }}
          className="w-full h-full"
        >
          <Sphere stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} fill="transparent" />
          <Graticule stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.1)"
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

          {CREATORS.map((creator) => (
            <Marker key={creator.id} coordinates={creator.coordinates}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <g 
                    className="cursor-pointer" 
                    onClick={() => onSelectCreator(creator)}
                  >
                    <circle 
                      r={8} 
                      className="fill-orange-500/20 animate-ping" 
                    />
                    <circle 
                      r={4} 
                      className="fill-orange-500 stroke-white stroke-[1px] hover:scale-150 transition-transform" 
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent className="bg-[#130b21] border-white/10 text-white p-3 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${creator.color} flex items-center justify-center text-xs font-bold`}>
                      {creator.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-xs">{creator.name}</p>
                      <p className="text-[10px] text-purple-400">@{creator.handle}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </Marker>
          ))}
        </ComposableMap>
      </TooltipProvider>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0514] via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[40px] pointer-events-none" />
    </div>
  );
};