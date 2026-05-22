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
  mediaEmbed?: string; // Specific field for the player
  // Live Stream Links
  twitch?: string;
  tiktok?: string;
  youtubeLive?: string;
  instagramLive?: string;
}

export const CREATORS: Creator[] = [
  {
    id: "1",
    name: "TAB Project",
    handle: "tiptab",
    bio: "The official TAB project account. Supporting the TAB ecosystem on XPR Network.",
    location: "London, UK",
    coordinates: [-0.1276, 51.5074],
    categories: ["Content", "Blockchain"],
    avatar: "TAB",
    avatarImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
    coverPosition: 50,
    color: "bg-red-600",
    twitter: "https://twitter.com/tabtokenxpr",
    instagram: "https://instagram.com/tabtokenxpr",
    website: "https://snipverse.com/tabxpr",
    mediaEmbed: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeLive: "https://www.youtube.com/watch?v=jfKfPfyJRdk", // Lofi Girl Live
    tiktok: "https://www.tiktok.com/@xprnetwork"
  }
];