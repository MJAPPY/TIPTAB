export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  categories: string[]; // Supports up to 2 categories
  avatar: string;
  avatarImage?: string; // Base64 or URL
  coverImage?: string; // Base64 or URL
  coverPosition?: number; // Vertical offset percentage (0 to 100)
  color: string;
  twitter?: string;
  website?: string;
  videoUrl?: string;
  instagram?: string;
  spotify?: string;
  snipverse?: string;
  facebook?: string;
  mediaEmbed?: string; // Specific field for the player
  // Live Stream Links
  twitch?: string;
  tiktok?: string;
  youtubeLive?: string;
  instagramLive?: string;
}

// Hardcoded dummy profiles have been removed. 
// The platform now relies exclusively on live network data and local storage overrides.
export const CREATORS: Creator[] = [];