import React, { useState, useEffect, useRef } from "react";
import { User, AtSign, MapPin, Globe, Twitter, Save, Image as ImageIcon, Upload, X, Video, Instagram, CheckCircle2, Music, Radio, Youtube, Twitch, ShieldCheck, Move, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Creator } from "@/data/creators";
import { cn } from "@/lib/utils";

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

const CATEGORIES = [
  "Art", "Automotive", "Biblical", "Blockchain", "Business", "Content", "Critical Think", "Delivery", "DEVS", "Education", "Finance", "Fishing", "Fitness", "Flips & Thrifters", "Food", "Gaming", "Gardening & Farming", "Health", "Hospitality", "Local News", "Music", "Other", "Plane Spot", "Property Reno", "Realty", "Reviewing", "Service", "Sports", "Train Spot", "Weather"
];

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
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialData.name,
    handle: initialData.handle,
    bio: initialData.bio,
    location: initialData.location || "",
    coordinates: initialData.coordinates,
    categories: initialData.categories || [initialData.categories[0] || "Other"],
    twitter: initialData.twitter || "",
    website: initialData.website || "",
    videoUrl: initialData.videoUrl || "",
    instagram: initialData.instagram || "",
    spotify: initialData.spotify || "",
    avatarImage: initialData.avatarImage || "",
    coverImage: initialData.coverImage || "",
    coverPosition: initialData.coverPosition ?? 50,
    twitch: initialData.twitch || "",
    tiktok: initialData.tiktok || "",
    youtubeLive: initialData.youtubeLive || "",
    instagramLive: initialData.instagramLive || "",
  });

  const { toast } = useToast();

  useEffect(() => {
    const typedLocation = formData.location.trim().toLowerCase();
    setIsCityRecognized(typedLocation !== "" && !!CITY_COORDINATES[typedLocation]);
  }, [formData.location]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let finalCoordinates = null;
      const typedLocation = formData.location.trim().toLowerCase();
      
      if (typedLocation !== "" && CITY_COORDINATES[typedLocation]) {
        finalCoordinates = CITY_COORDINATES[typedLocation];
      }
      
      const updatedCreator: Creator = {
        ...initialData,
        ...formData,
        location: formData.location.trim(),
        coordinates: finalCoordinates as any
      };
      
      onSave(updatedCreator);
      setHasChanged(false);
      
      toast({
        title: "Profile Updated",
        description: formData.location.trim() === "" 
          ? "Location cleared. Map pin removed." 
          : `Location updated to ${formData.location}.`,
      });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setHasChanged(true);
  };

  const handleCategoryChange = (index: number, val: string) => {
    const newCategories = [...formData.categories];
    if (val === "None" && index === 1) {
      newCategories.splice(1, 1);
    } else {
      newCategories[index] = val;
    }
    setFormData((prev) => ({ ...prev, categories: newCategories }));
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string, coverPosition: 50 }));
        setHasChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] overflow-hidden">
      <CardHeader className="p-8 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-black">Public Profile</CardTitle>
          <CardDescription className="text-white/40">Update how you appear to others on the network</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanged} className={cn("w-full sm:w-auto rounded-xl gap-2 font-bold h-12 px-6", hasChanged ? "bg-purple-600 hover:bg-purple-500 shadow-lg" : "bg-white/5 text-white/20 cursor-not-allowed")}>
          {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-12">
          {/* Graphics Section */}
          <div className="space-y-6 pb-8 border-b border-white/5">
            <h4 className="font-bold text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5 text-purple-400" /> Profile Graphics</h4>
            <div className="space-y-3">
              <Label className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Cover Banner</Label>
              <div 
                className={cn(
                  "relative rounded-[32px] overflow-hidden border-2 aspect-[3.2/1] flex flex-col items-center justify-center transition-all",
                  formData.coverImage ? "border-white/10" : "border-dashed border-white/20 bg-white/[0.01]"
                )}
              >
                {formData.coverImage ? (
                  <>
                    <img src={formData.coverImage} className="w-full h-full object-cover" style={{ objectPosition: `50% ${formData.coverPosition}%` }} />
                    <button onClick={() => setFormData(prev => ({...prev, coverImage: ""}))} className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-purple-400/40" />
                    <p className="text-xs text-white/30 font-bold">Recommended: 1200x400 PNG/JPG</p>
                    <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                    <Button variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} className="rounded-xl border-white/10 h-8 bg-white/5">Browse Cover</Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center text-3xl font-black border-4 border-white/10 overflow-hidden shrink-0", initialData.color)}>
                {formData.avatarImage ? <img src={formData.avatarImage} className="w-full h-full object-cover" /> : initialData.avatar}
              </div>
              <div className="space-y-2">
                <h5 className="font-bold text-base">Avatar Photo</h5>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg border-white/10 h-9 bg-white/5">Change Avatar</Button>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Display Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Location (Optional)</Label>
                {isCityRecognized && <span className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Map Ready</span>}
              </div>
              <Input id="location" value={formData.location} onChange={handleChange} placeholder="e.g. London" className="bg-white/5 border-white/10 h-14 rounded-2xl text-white" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bio" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Short Bio</Label>
              <Textarea id="bio" value={formData.bio} onChange={handleChange} className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-4 text-white" />
            </div>
          </div>

          {/* Social & Media (Only for Members) */}
          {!minimal && (
            <>
              <div className="space-y-8 pt-8 border-t border-white/5">
                <h4 className="font-bold text-lg flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-orange-500" /> Network Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Primary Category</Label>
                    <Select value={formData.categories[0]} onValueChange={(val) => handleCategoryChange(0, val)}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white">
                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Secondary Category</Label>
                    <Select value={formData.categories[1] || "None"} onValueChange={(val) => handleCategoryChange(1, val)}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a102d] border-white/20 text-white">
                        <SelectItem value="None">None</SelectItem>
                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-white/5">
                <h4 className="font-bold text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-cyan-400" /> Social & Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Twitter URL</Label>
                    <div className="relative">
                      <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="twitter" value={formData.twitter} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://twitter.com/..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Instagram URL</Label>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="instagram" value={formData.instagram} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://instagram.com/..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="website" value={formData.website} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spotify" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Spotify URL</Label>
                    <div className="relative">
                      <Music className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="spotify" value={formData.spotify} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://open.spotify.com/..." />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="videoUrl" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Video URL (YouTube/Vimeo)</Label>
                    <div className="relative">
                      <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="videoUrl" value={formData.videoUrl} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-white/5">
                <h4 className="font-bold text-lg flex items-center gap-2"><Radio className="h-5 w-5 text-red-500" /> Live Broadcast Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitch" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Twitch Channel</Label>
                    <div className="relative">
                      <Twitch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="twitch" value={formData.twitch} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://twitch.tv/..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtubeLive" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">YouTube Live</Label>
                    <div className="relative">
                      <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="youtubeLive" value={formData.youtubeLive} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://youtube.com/live/..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">TikTok Profile</Label>
                    <div className="relative">
                      <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="tiktok" value={formData.tiktok} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="https://tiktok.com/@..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagramLive" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Instagram Live</Label>
                    <div className="relative">
                      <Radio className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <Input id="instagramLive" value={formData.instagramLive} onChange={handleChange} className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl" placeholder="Instagram Username" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};