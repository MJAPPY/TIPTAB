export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  coordinates: [number, number] | null; // Allow null for users who don't want a map pin
  categories: string[];
  avatar: string;
  avatarImage?: string;
  coverImage?: string;
  coverPosition?: number;
  color: string;
  twitter?: string;
  website?: string;
  videoUrl?: string;
  instagram?: string;
  spotify?: string;
  mediaEmbed?: string;
  twitch?: string;
  tiktok?: string;
  youtubeLive?: string;
  instagramLive?: string;
}

export const CREATORS: Creator[] = [];