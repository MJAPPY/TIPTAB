export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  category: string;
  avatar: string;
  avatarImage?: string; // Base64 or URL
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
    category: "Content",
    avatar: "TAB",
    avatarImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
    color: "bg-red-600",
    twitter: "https://twitter.com/tabxpr",
    mediaEmbed: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: "2",
    name: "Carlos Mendez",
    handle: "carlos_delivery",
    bio: "Express courier and delivery pro. Tipping fuels my route! Support your local gig workers.",
    location: "Madrid, Spain",
    coordinates: [-3.7038, 40.4168],
    category: "Service",
    avatar: "CM",
    avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    color: "bg-yellow-500"
  },
  {
    id: "3",
    name: "Maya Chen",
    handle: "mayafit",
    bio: "Personal trainer and wellness coach. Help me keep the community moving!",
    location: "Vancouver, Canada",
    coordinates: [-123.1207, 49.2827],
    category: "Service",
    avatar: "MC",
    avatarImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    color: "bg-emerald-500",
    instagram: "https://instagram.com",
    spotify: "https://spotify.com",
    mediaEmbed: "https://open.spotify.com/track/4cOdK2wGvWyR9p79hnIvov"
  },
  {
    id: "4",
    name: "Kofi Mensah",
    handle: "kofibuilds",
    bio: "Fullstack developer and open source contributor.",
    location: "Accra, Ghana",
    coordinates: [-0.1870, 5.6037],
    category: "Dev",
    avatar: "KM",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    color: "bg-blue-600"
  },
  {
    id: "5",
    name: "Sarah Jenkins",
    handle: "sarah_serves",
    bio: "Hospitality professional and latte art enthusiast. Your tips make a world of difference.",
    location: "Melbourne, Australia",
    coordinates: [144.9631, -37.8136],
    category: "Service",
    avatar: "SJ",
    avatarImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    color: "bg-orange-400"
  },
  {
    id: "6",
    name: "Marcus Wright",
    handle: "mwright",
    bio: "Professional athlete sharing training tips and behind-the-scenes content.",
    location: "New York, USA",
    coordinates: [-74.0060, 40.7128],
    category: "Sports",
    avatar: "MW",
    avatarImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    color: "bg-sky-600",
    mediaEmbed: "https://music.apple.com/us/album/the-box/1490466042?i=1490466047"
  },
  {
    id: "7",
    name: "Elena Rossi",
    handle: "elenadesign",
    bio: "UI/UX designer focusing on crypto-native experiences.",
    location: "Milan, Italy",
    coordinates: [9.1900, 45.4642],
    category: "Art",
    avatar: "ER",
    avatarImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    color: "bg-pink-600"
  },
  {
    id: "8",
    name: "David Park",
    handle: "dp_gaming",
    bio: "Web3 gaming enthusiast and streamer on the XPR Network.",
    location: "Seoul, South Korea",
    coordinates: [126.9780, 37.5665],
    category: "Gaming",
    avatar: "DP",
    avatarImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    color: "bg-indigo-600",
    mediaEmbed: "https://www.youtube.com/watch?v=fKopy74weus"
  },
  {
    id: "9",
    name: "Leo 'The Barista'",
    handle: "leobrews",
    bio: "Crafting the perfect cup one bean at a time. Support your local freelance barista.",
    location: "Seattle, USA",
    coordinates: [-122.3321, 47.6062],
    category: "Service",
    avatar: "LB",
    avatarImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    color: "bg-amber-700"
  }
];