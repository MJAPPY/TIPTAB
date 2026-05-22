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
  },
  {
    id: "2",
    name: "Carlos Mendez",
    handle: "carlos_delivery",
    bio: "Express courier and delivery pro. Tipping fuels my route! Support your local gig workers.",
    location: "Madrid, Spain",
    coordinates: [-3.7038, 40.4168],
    categories: ["Service", "Delivery"],
    avatar: "CM",
    avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    color: "bg-yellow-500",
    twitter: "https://twitter.com/elonmusk",
    website: "https://uber.com"
  },
  {
    id: "3",
    name: "Maya Chen",
    handle: "mayafit",
    bio: "Personal trainer and wellness coach. Help me keep the community moving!",
    location: "Vancouver, Canada",
    coordinates: [-123.1207, 49.2827],
    categories: ["Service", "Health"],
    avatar: "MC",
    avatarImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    color: "bg-emerald-500",
    instagram: "https://instagram.com/nikefitness",
    spotify: "https://open.spotify.com/playlist/37i9dQZF1DX76W92vslFCZ",
    instagramLive: "https://www.instagram.com/therock/live/",
    mediaEmbed: "https://open.spotify.com/track/4cOdK2wGvWyR9p79hnIvov"
  },
  {
    id: "4",
    name: "Kofi Mensah",
    handle: "kofibuilds",
    bio: "Fullstack developer and open source contributor.",
    location: "Accra, Ghana",
    coordinates: [-0.1870, 5.6037],
    categories: ["Dev", "Blockchain"],
    avatar: "KM",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    color: "bg-blue-600",
    twitter: "https://twitter.com/github",
    website: "https://github.com/protonchain"
  },
  {
    id: "5",
    name: "Sarah Jenkins",
    handle: "sarah_serves",
    bio: "Hospitality professional and latte art enthusiast. Your tips make a world of difference.",
    location: "Melbourne, Australia",
    coordinates: [144.9631, -37.8136],
    categories: ["Service", "Hospitality"],
    avatar: "SJ",
    avatarImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    color: "bg-orange-400",
    instagram: "https://instagram.com/starbucks"
  },
  {
    id: "6",
    name: "Marcus Wright",
    handle: "mwright",
    bio: "Professional athlete sharing training tips and behind-the-scenes content.",
    location: "New York, USA",
    coordinates: [-74.0060, 40.7128],
    categories: ["Sports", "Health"],
    avatar: "MW",
    avatarImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    color: "bg-sky-600",
    twitter: "https://twitter.com/nba",
    spotify: "https://open.spotify.com/artist/5K4W6rqBvSssUf7ZqWvO4S",
    mediaEmbed: "https://music.apple.com/us/album/the-box/1490466042?i=1490466047"
  },
  {
    id: "7",
    name: "Elena Rossi",
    handle: "elenadesign",
    bio: "UI/UX designer focusing on crypto-native experiences.",
    location: "Milan, Italy",
    coordinates: [9.1900, 45.4642],
    categories: ["Art", "Dev"],
    avatar: "ER",
    avatarImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    color: "bg-pink-600",
    instagram: "https://instagram.com/adobe",
    website: "https://behance.net"
  },
  {
    id: "8",
    name: "David Park",
    handle: "dp_gaming",
    bio: "Web3 gaming enthusiast and streamer on the XPR Network.",
    location: "Seoul, South Korea",
    coordinates: [126.9780, 37.5665],
    categories: ["Gaming", "Content"],
    avatar: "DP",
    avatarImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    color: "bg-indigo-600",
    twitch: "https://twitch.tv/ninja",
    youtubeLive: "https://www.youtube.com/watch?v=5qap5aO4i9A", // Lofi Girl
    twitter: "https://twitter.com/Twitch",
    mediaEmbed: "https://www.youtube.com/watch?v=fKopy74weus"
  },
  {
    id: "9",
    name: "Leo 'The Barista'",
    handle: "leobrews",
    bio: "Crafting the perfect cup one bean at a time. Support your local freelance barista.",
    location: "Seattle, USA",
    coordinates: [-122.3321, 47.6062],
    categories: ["Service", "Hospitality"],
    avatar: "LB",
    avatarImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    color: "bg-amber-700",
    tiktok: "https://www.tiktok.com/@barista_jack"
  }
];