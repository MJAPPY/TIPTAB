import React, { useState, useEffect, useRef } from "react";
import { User, AtSign, MapPin, Globe, Twitter, Save, Image as ImageIcon, Upload, X, Video, Instagram, CheckCircle2, Music, Radio, Youtube, Twitch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Creator } from "@/data/creators";
import { EmbedPlayer } from "./EmbedPlayer";
import { cn } from "@/lib/utils";

// Expanded Mock Geocoder - The sole source for map placement
const CITY_COORDINATES: Record<string, [number, number]> = {
  "london": [-0.1276, 51.5074],
  "new york": [-74.0060, 40.7128],
  "madrid": [-3.7038, 40.4168],
  "vancouver": [-123.1207, 49.2827],
  "accra": [-0.1870, 5.6037],
  "melbourne": [144.9631, -37.8136],
  "milan": [9.1900, 45.4642],
  "seoul": [126.9780, 37.5665],
  "seattle": [-122.3321, 47.6062],
  "tokyo": [139.6503, 35.6762],
  "paris": [2.3522, 48.8566],
  "dubai": [55.2708, 25.2048],
  "berlin": [13.4050, 52.5200],
  "sydney": [151.2093, -33.8688],
  "singapore": [103.8198, 1.3521],
  "aruba": [-69.9683, 12.5211],
  "miami": [-80.1918, 25.7617],
  "lagos": [3.3792, 6.5244],
  "toronto": [-79.3832, 43.6532],
  "los angeles": [-118.2437, 34.0522],
  "perth": [115.8605, -31.9505],
  "hong kong": [114.1694, 22.3193],
  "amsterdam": [4.8952, 52.3702],
  "san francisco": [-122.4194, 37.7749],
  "brisbane": [153.0251, -27.4698],
  "adelaide": [138.6007, -34.9285],
};

interface ProfileEditorProps {
  initialData: Creator;
  onSave: (updatedData: Creator) => void;
  minimal?: boolean;
}

export const ProfileEditor = ({ initialData, onSave, minimal = false }: ProfileEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [isCityRecognized, setIsCityRecognized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialData.name,
    handle: initialData.handle,
    bio: initialData.bio,
    location: initialData.location,
    coordinates: initialData.coordinates,
    category: initialData.category,
    twitter: initialData.twitter || "",
    website: initialData.website || "",
    videoUrl: initialData.videoUrl || "",
    instagram: initialData.instagram || "",
    spotify: initialData.spotify || "",
    avatarImage: initialData.avatarImage || "",
    // Live Stream Links
    twitch: initialData.twitch || "",
    tiktok: initialData.tiktok || "",
    youtubeLive: initialData.youtubeLive || "",
    instagramLive: initialData.instagramLive || "",
  });

  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: initialData.name,
      handle: initialData.handle,
      bio: initialData.bio,
      location: initialData.location,
      coordinates: initialData.coordinates,
      category: initialData.category,
      twitter: initialData.twitter || "",
      website: initialData.website || "",
      videoUrl: initialData.videoUrl || "",
      instagram: initialData.instagram || "",
      spotify: initialData.spotify || "",
      avatarImage: initialData.avatarImage || "",
      twitch: initialData.twitch || "",
      tiktok: initialData.tiktok || "",
      youtubeLive: initialData.youtubeLive || "",
      instagramLive: initialData.instagramLive || "",
    });
    setHasChanged(false);
  }, [initialData]);

  // Check if typed city is in our geocoding list for instant feedback (Case-Insensitive)
  useEffect(() => {
    const typedLocation = formData.location.split(',')[0].trim().toLowerCase();
    setIsCityRecognized(!!CITY_COORDINATES[typedLocation]);
  }, [formData.location]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let finalCoordinates = formData.coordinates;
      const typedLocation = formData.location.split(',')[0].trim().toLowerCase();
      
      // Update coordinates based on recognized typed city
      if (CITY_COORDINATES[typedLocation]) {
        finalCoordinates = CITY_COORDINATES[typedLocation];
      }
      
      const updatedCreator: Creator = {
        ...initialData,
        ...formData,
        coordinates: finalCoordinates
      };
      
      onSave(updatedCreator);
      setHasChanged(false);
      
      toast({
        title: "Profile Updated",
        description: minimal 
          ? `Location saved as ${formData.location} for Leaderboard rankings.` 
          : `Location saved as ${formData.location}. Map pin updated.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error saving your changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setHasChanged(true);
  };

  const handleCategoryChange = (val: string) => {
    setFormData((prev) => ({ ...prev, category: val }));
    setHasChanged(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarImage: reader.result as string }));
        setHasChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, avatarImage: "" }));
    setHasChanged(true);
  };

  return (
    <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] overflow-hidden">
      <CardHeader className="p-8 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-black">Public Profile</CardTitle>
          <CardDescription className="text-white/40">
            {minimal ? "Update your identity on the network" : "Update how you appear to others on the global map"}
          </CardDescription>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving || !hasChanged}
          className={cn(
            "w-full sm:w-auto rounded-xl gap-2 font-bold transition-all h-12 px-6",
            hasChanged 
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
              : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
          )}
        >
          {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-12">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
            <div className="relative group">
              <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center text-3xl font-black border-4 border-white/10 shadow-xl overflow-hidden", initialData.color)}>
                {formData.avatarImage ? (
                  <img src={formData.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initialData.avatar
                )}
              </div>
              {formData.avatarImage && (
                <button 
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-bold text-lg">Profile Avatar</h4>
              <p className="text-sm text-white/40">Upload a custom photo or use your generated initials.</p>
              <div className="flex justify-center sm:justify-start gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border-white/10 text-white/60 hover:text-white h-9 bg-white/5"
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-purple-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Identity & Location</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/50" />
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Location (Typed City Pin)</Label>
                  {isCityRecognized && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-green-400 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                      <CheckCircle2 className="h-3 w-3" /> Recognized
                    </div>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/50" />
                  <Input 
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. London or Tokyo"
                    className={cn(
                      "pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white",
                      isCityRecognized && "border-green-500/30"
                    )} 
                  />
                </div>
              </div>

              {!minimal && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="handle" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">XPR Receiving Address</Label>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" /> Locked to Wallet
                      </div>
                    </div>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500/50" />
                      <Input 
                        id="handle"
                        value={formData.handle}
                        readOnly
                        disabled
                        className="pl-12 bg-white/[0.02] border-white/5 h-14 rounded-2xl text-white/40 cursor-not-allowed font-black italic" 
                      />
                    </div>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest px-1">TIPS ARE SENT DIRECTLY TO THIS XPR ACCOUNT NAME.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Category</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-xl">
                        {["Delivery", "Hospitality", "Fitness", "Food", "Reviewing", "Content", "Dev", "Art", "Education", "Gaming", "Music", "Sports", "Fishing", "Gardening & Farming", "Property Reno", "Automotive", "Realty", "Service", "Other"].map((cat) => (
                          <SelectItem key={cat} value={cat} className="focus:bg-purple-500 focus:text-white cursor-pointer font-bold">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {!minimal && (
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Short Bio</Label>
                <Textarea 
                  id="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell the world what you build..."
                  className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all resize-none p-4 text-white font-medium" 
                />
              </div>
            )}
          </div>

          {/* Media & Integration Section */}
          {!minimal && (
            <div className="space-y-12 pt-4">
              {/* Featured Media */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Video className="h-4 w-4 text-purple-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Featured Media Player</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Featured Media Link (YouTube, Spotify, Apple Music)</Label>
                    <div className="relative">
                      <Music className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/50" />
                      <Input 
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://youtube.com/watch?v=... or Spotify link"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>
                  
                  {formData.videoUrl && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400/60 ml-2">Player Preview</Label>
                      <EmbedPlayer url={formData.videoUrl} className="bg-black/20" />
                    </div>
                  )}
                </div>
              </div>

              {/* Live Stream Integration */}
              <div className="pt-8 border-t border-white/5 space-y-8">
                <div className="flex items-center gap-3">
                  <Radio className="h-4 w-4 text-orange-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live Broadcast Channels</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <Label htmlFor="twitch" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Twitch Channel</Label>
                    <div className="relative">
                      <Twitch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9146FF]" />
                      <Input 
                        id="twitch"
                        value={formData.twitch}
                        onChange={handleChange}
                        placeholder="https://twitch.tv/username"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtubeLive" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">YouTube Live</Label>
                    <div className="relative">
                      <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF0000]" />
                      <Input 
                        id="youtubeLive"
                        value={formData.youtubeLive}
                        onChange={handleChange}
                        placeholder="https://youtube.com/c/username/live"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">TikTok Live</Label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 fill-white" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-2.26.74-4.63 2.58-5.91 1.64-1.15 3.7-1.49 5.66-1.02v4.53c-.31-.19-.71-.24-1.07-.23-.39.03-.77.17-1.02.47-.5.62-.14 1.53.55 1.81.47.24 1.13.14 1.51-.25.23-.27.35-.63.35-.98.01-3.55-.01-7.1.02-10.65z"/></svg>
                      <Input 
                        id="tiktok"
                        value={formData.tiktok}
                        onChange={handleChange}
                        placeholder="https://tiktok.com/@username"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramLive" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Instagram Live</Label>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E4405F]" />
                      <Input 
                        id="instagramLive"
                        value={formData.instagramLive}
                        onChange={handleChange}
                        placeholder="https://instagram.com/username/live"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Profiles */}
              <div className="pt-8 border-t border-white/5 space-y-8">
                <div className="flex items-center gap-3">
                  <AtSign className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Social Network Profiles</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Twitter / X URL</Label>
                    <div className="relative">
                      <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1DA1F2]" />
                      <Input 
                        id="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/username"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Instagram URL</Label>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E4405F]" />
                      <Input 
                        id="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="https://instagram.com/username"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spotify" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Spotify Profile</Label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 fill-[#1DB954]" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.216.354-.675.467-1.028.249-2.857-1.745-6.452-2.14-10.686-1.172-.406.092-.817-.16-.908-.566-.092-.406.16-.817.566-.908 4.642-1.062 8.624-.606 11.806 1.34.354.216.467.675.25 1.028zm1.474-3.26c-.272.441-.848.583-1.288.311-3.266-2.008-8.246-2.593-12.108-1.42-.497.151-1.025-.129-1.176-.626-.151-.497.129-1.025.626-1.176 4.417-1.341 9.904-.691 13.636 1.601.44.272.583.847.31 1.288zm.126-3.411c-3.917-2.326-10.372-2.541-14.131-1.399-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.307-1.307 11.436-1.05 15.961 1.637.54.321.716 1.018.395 1.558-.321.54-1.017.717-1.558.396z"/></svg>
                      <Input 
                        id="spotify"
                        value={formData.spotify}
                        onChange={handleChange}
                        placeholder="https://open.spotify.com/user/..."
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500/50" />
                      <Input 
                        id="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};