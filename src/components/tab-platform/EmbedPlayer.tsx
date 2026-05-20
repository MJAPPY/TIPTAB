"use client";

import React from "react";
import { Play, Music, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmbedPlayerProps {
  url: string;
  className?: string;
}

export const EmbedPlayer = ({ url, className }: EmbedPlayerProps) => {
  if (!url) return null;

  // Detect YouTube
  const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)/);
  if (youtubeMatch) {
    return (
      <div className={cn("relative aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black", className)}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Detect Spotify
  const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    return (
      <div className={cn("rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-[#121212]", className)}>
        <iframe
          src={`https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      </div>
    );
  }

  // Detect Apple Music
  const appleMatch = url.match(/music\.apple\.com\/([a-z]{2})\/(album|playlist|artist)\/([^/]+)\/([0-9]+)/);
  if (appleMatch) {
    return (
      <div className={cn("rounded-[32px] overflow-hidden shadow-2xl border border-white/10", className)}>
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          height="175"
          className="w-full max-w-full overflow-hidden bg-transparent"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={`https://embed.music.apple.com/${appleMatch[1]}/${appleMatch[2]}/${appleMatch[3]}/${appleMatch[4]}`}
        />
      </div>
    );
  }

  // Fallback for general links
  return (
    <div className={cn("p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all", className)}>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Music className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <p className="font-black text-sm uppercase tracking-widest text-white/40">External Media</p>
          <p className="font-bold text-white truncate max-w-[200px]">{url}</p>
        </div>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-purple-500 hover:text-white">
          <Play className="h-4 w-4 fill-current" />
        </Button>
      </a>
    </div>
  );
};