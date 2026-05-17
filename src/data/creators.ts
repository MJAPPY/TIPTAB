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
}

export const CREATORS: Creator[] = [
  {
    id: "1",
    name: "TAB Project",
    handle: "tabxpr",
    bio: "The official TAB project account. Supporting the TAB ecosystem on XPR Network.",
    location: "London, UK",
    coordinates: [-0.1276, 51.5074],
    category: "Content",
    avatar: "TAB",
    color: "bg-red-600",
    twitter: "https://twitter.com/tabxpr"
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
    color: "bg-emerald-500",
    instagram: "https://instagram.com"
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
    color: "bg-sky-600"
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
    color: "bg-indigo-600"
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
    color: "bg-amber-700"
  }
];