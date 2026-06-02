"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface Activity {
  id: number | string;
  icon: string;
  text: string;
  color: string;
}

export const useXprSocial = (activeActor: string | null) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [liveActivities, setLiveActivities] = useState<Activity[]>([]);

  // Toggle favorite logic
  useEffect(() => {
    if (activeActor) {
      const saved = localStorage.getItem(`tiptab_favorites_${activeActor}`);
      if (saved) setFavorites(JSON.parse(saved));
    } else { 
      setFavorites([]); 
    }
  }, [activeActor]);

  const toggleFavorite = (handle: string) => {
    if (!activeActor) return;
    const cleanHandle = handle.toLowerCase().replace('@', '');
    const newFavorites = favorites.includes(cleanHandle) 
      ? favorites.filter(h => h !== cleanHandle) 
      : [...favorites, cleanHandle];
    setFavorites(newFavorites);
    localStorage.setItem(`tiptab_favorites_${activeActor}`, JSON.stringify(newFavorites));
  };

  const isFavorite = (handle: string) => favorites.includes(handle.toLowerCase().replace('@', ''));

  // Fetch real database activities dynamically
  const fetchLiveActivities = useCallback(async () => {
    try {
      // 1. Fetch latest verified members from profiles
      const { data: latestProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('handle, location, created_at')
        .eq('is_member', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // 2. Fetch latest votes from votes
      const { data: latestVotes, error: votesError } = await supabase
        .from('votes')
        .select('voter_handle, candidate_handle, tab_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const items: Activity[] = [];

      // Format profile join events
      if (latestProfiles && !profileError) {
        latestProfiles.forEach((p, i) => {
          const locText = p.location ? ` in ${p.location}` : "";
          items.push({
            id: `profile-${p.handle}-${i}`,
            icon: "Sparkles",
            text: `New verified pro @${p.handle} joined the map${locText}!`,
            color: "text-cyan-400"
          });
        });
      }

      // Format voting events
      if (latestVotes && !votesError) {
        latestVotes.forEach((v, i) => {
          items.push({
            id: `vote-${v.voter_handle}-${v.candidate_handle}-${i}`,
            icon: "Zap",
            text: `@${v.voter_handle} cast ${v.tab_amount} TAB votes for @${v.candidate_handle}!`,
            color: "text-orange-500"
          });
        });
      }

      // Fallback/Placeholder items if database has very few records, keeping it always alive and populated
      const defaultItems: Activity[] = [
        { id: "def-1", icon: "TrendingUp", text: "TIP TAB network is live on XPR Network with zero platform fees!", color: "text-purple-400" },
        { id: "def-2", icon: "Heart", text: "Support everyday hustle: Scan QR code to send instant tip rewards!", color: "text-red-500" },
        { id: "def-3", icon: "Sparkles", text: "Go to Voting tab and vote for the next Quarterly Champions!", color: "text-yellow-400" }
      ];

      // Combine real data and defaults
      const combined = [...items, ...defaultItems];
      setLiveActivities(combined);
      localStorage.setItem("tiptab_live_activities", JSON.stringify(combined));
    } catch (e) {
      console.error("Error fetching live ticker activities:", e);
    }
  }, []);

  useEffect(() => {
    fetchLiveActivities();
    // Poll for updates every 15 seconds to keep the live ticker absolutely current
    const interval = setInterval(fetchLiveActivities, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveActivities]);

  const resetLiveTicker = () => {
    fetchLiveActivities();
  };

  return { favorites, liveActivities, toggleFavorite, isFavorite, resetLiveTicker };
};