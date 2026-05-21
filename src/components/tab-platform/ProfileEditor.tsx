import React, { useState, useEffect, useRef } from "react";
import { User, AtSign, MapPin, Globe, Twitter, Save, Image as ImageIcon, Upload, X, Video, Instagram, CheckCircle2, Music, Radio, Youtube, Twitch, ShieldCheck, Move, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Creator } from "@/data/creators";
import { EmbedPlayer } from "./EmbedPlayer";
import { cn } from "@/lib/utils";

const CATEGORIES_LIST = [
  "Art", "Automotive", "Biblical", "Blockchain", "Business", "Content", "Delivery", "Dev", 
  "Education", "Finance", "Fishing", "Fitness", "Food", "Gaming", "Gardening & Farming", 
  "Health", "Hospitality", "Local News", "Music", "Other", "Property Reno", "Realty", 
  "Reviewing", "Service", "Sports"
];

const CITY_COORDINATES: Record<string, [number, number]> = {
  "london": [-0.1276, 51.5074], "new york": [-74.0060, 40.7128], "madrid": [-3.7038, 40.4168],
  "vancouver": [-123.1207, 49.2827], "accra": [-0.1870, 5.6037], "melbourne": [144.9631, -37.8136],
  "milan": [9.1900, 45.4642], "seoul": [126.9780, 37.5665], "seattle": [-122.3321, 47.6062],
  "tokyo": [139.6503, 35.6762], "dubai": [55.2708, 25.2048]
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
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialData.name,
    handle: initialData.handle,
    bio: initialData.bio,
    location: initialData.location,
    coordinates: initialData.coordinates,
    categories: initialData.categories || [],
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
    setFormData({
      ...initialData,
      categories: initialData.categories || [],
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
    setHasChanged(false);
  }, [initialData]);

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
      if (CITY_COORDINATES[typedLocation]) finalCoordinates = CITY_COORDINATES[typedLocation];
      
      onSave({ ...initialData, ...formData, coordinates: finalCoordinates });
      setHasChanged(false);
      toast({ title: "Profile Updated" });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => {
      const exists = prev.categories.includes(cat);
      if (exists) return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      if (prev.categories.length >= 3) {
        toast({ title: "Limit Reached", description: "Max 3 categories per profile." });
        return prev;
      }
      return { ...prev, categories: [...prev.categories, cat] };
    });
    setHasChanged(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarImage' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string, coverPosition: field === 'coverImage' ? 50 : prev.coverPosition }));
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
          <CardDescription className="text-white/40">Multi-category support enabled.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanged} className={cn("h-12 px-6 rounded-xl font-bold transition-all", hasChanged ? "bg-purple-600 text-white" : "bg-white/5 text-white/20")}>
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </CardHeader>
      <CardContent className="p-8 space-y-12">
        
        {/* Banner Section */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cover Banner</Label>
          <div 
            onClick={() => coverInputRef.current?.click()}
            className="relative h-40 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all"
          >
            {formData.coverImage ? (
              <img src={formData.coverImage} className="w-full h-full object-cover" style={{ objectPosition: `50% ${formData.coverPosition}%` }} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="h-8 w-8 text-white/20" />
                <span className="text-xs font-bold text-white/30">Upload Banner</span>
              </div>
            )}
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
          </div>
        </div>

        {/* Categories Section */}
        {!minimal && (
          <div className="space-y-4 pt-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Categories (Up to 3)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES_LIST.map(cat => {
                const isActive = formData.categories.includes(cat);
                return (
                  <Button
                    key={cat}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "h-9 px-4 rounded-xl font-bold text-xs transition-all border",
                      isActive ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                    )}
                  >
                    {cat}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Name</Label>
            <Input value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setHasChanged(true); }} className="bg-white/5 border-white/10 h-14 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Location</Label>
            <Input value={formData.location} onChange={e => { setFormData({ ...formData, location: e.target.value }); setHasChanged(true); }} className="bg-white/5 border-white/10 h-14 rounded-2xl" />
          </div>
        </div>

        {!minimal && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Bio</Label>
            <Textarea value={formData.bio} onChange={e => { setFormData({ ...formData, bio: e.target.value }); setHasChanged(true); }} className="bg-white/5 border-white/10 h-32 rounded-2xl" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};