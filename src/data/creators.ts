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
    name: "Priya Sharma",
    handle: "priyatech",
    bio: "Blockchain developer building DeFi tools on XPR Network.",
    location: "Mumbai, India",
    coordinates: [72.8777, 19.0760],
    category: "Dev",
    avatar: "PS",
    color: "bg-purple-600",
    twitter: "https://twitter.com"
  },
  {
    id: "3",
    name: "Alex Rivera",
    handle: "alexarts",
    bio: "Digital artist specializing in 3D animations and NFT collectibles.",
    location: "Barcelona, Spain",
    coordinates: [2.1734, 41.3851],
    category: "Art",
    avatar: "AR",
    color: "bg-orange-500"
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
    name: "Sarah Chen",
    handle: "sarahcodes",
    bio: "Frontend specialist and tech educator. Helping people learn React and Web3.",
    location: "Singapore",
    coordinates: [103.8198, 1.3521],
    category: "Education",
    avatar: "SC",
    color: "bg-emerald-600"
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
  }
];