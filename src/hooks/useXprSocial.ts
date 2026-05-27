"use client";

import { useState, useEffect } from 'react';
import { DEFAULT_ACTIVITIES } from '@/constants/xpr';

export const useXprSocial = (activeActor: string | null) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [liveActivities, setLiveActivities] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_live_activities");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Auto-sanitize legacy dummy ticker messages from localStorage
          const filtered = parsed.filter((act: any) => 
            act && 
            act.text && 
            !act.text.includes("carlos_delivery") && 
            !act.text.includes("early") && 
            !act.text.includes("whaleshark") &&
            !act.text.includes("mayafit")
          );
          return filtered;
        } catch (e) {
          return [...DEFAULT_ACTIVITIES];
        }
      }
    }
    return [...DEFAULT_ACTIVITIES];
  });

  useEffect(() => {
    if (activeActor) {
      const saved = localStorage.getItem(`tiptab_favorites_${activeActor}`);
      if (saved) setFavorites(JSON.parse(saved));
    } else { setFavorites([]); }
  }, [activeActor]);

  const toggleFavorite = (handle: string) => {
    if (!activeActor) return;
    const cleanHandle = handle.toLowerCase().replace('@', '');
    const newFavorites = favorites.includes(cleanHandle) ? favorites.filter(h => h !== cleanHandle) : [...favorites, cleanHandle];
    setFavorites(newFavorites);
    localStorage.setItem(`tiptab_favorites_${activeActor}`, JSON.stringify(newFavorites));
  };

  const isFavorite = (handle: string) => favorites.includes(handle.toLowerCase().replace('@', ''));

  const resetLiveTicker = () => {
    const freshDefaults = [...DEFAULT_ACTIVITIES];
    setLiveActivities(freshDefaults);
    localStorage.setItem("tiptab_live_activities", JSON.stringify(freshDefaults));
  };

  return { favorites, liveActivities, toggleFavorite, isFavorite, resetLiveTicker };
};