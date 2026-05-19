import React, { useState, useEffect, useRef } from "react";
import { User, AtSign, MapPin, Globe, Twitter, Save, Image as ImageIcon, Upload, X, Video, Instagram, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Creator } from "@/data/creators";
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
    avatarImage: initialData.avatarImage || "",
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
      avatarImage: initialData.avatarImage || "",
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
      <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
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
            "rounded-xl gap-2 font-bold transition-all h-12 px-6",
            hasChanged 
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
              : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
          )}
        >
          {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-6 pb-8 border-b border-white/5">
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
            
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Profile Avatar</h4>
              <p className="text-sm text-white/40">Upload a custom photo or use your generated initials.</p>
              <div className="flex gap-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {/* Display Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between h-6 mb-1">
                <Label htmlFor="name" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Display Name</Label>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between h-6 mb-1">
                <Label htmlFor="location" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Location (Typed City Pin)</Label>
                {isCityRecognized && (
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-green-400 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </div>
                )}
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
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

            {/* Creator specific fields only show if NOT minimal */}
            {!minimal && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label htmlFor="handle" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Public Handle</Label>
                  </div>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                    <Input 
                      id="handle"
                      value={formData.handle}
                      onChange={handleChange}
                      placeholder="username"
                      className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Category</Label>
                  </div>
                  <Select 
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a102d] border-white/10 text-white rounded-xl">
                      {["Content", "Dev", "Art", "Education", "Gaming", "Music", "Sports", "Service", "Other"].map((cat) => (
                        <SelectItem key={cat} value={cat} className="focus:bg-purple-500 focus:text-white cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label htmlFor="bio" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Short Bio</Label>
                  </div>
                  <Textarea 
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell the world what you build..."
                    className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all resize-none p-4 text-white" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label htmlFor="twitter" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Twitter / X URL</Label>
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
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
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label htmlFor="instagram" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Instagram URL</Label>
                  </div>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
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
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label htmlFor="videoUrl" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Video Channel URL</Label>
                  </div>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                    <Input 
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      placeholder="YouTube or Twitch channel link"
                      className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between h-6 mb-1">
                    <Label htmlFor="website" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Website URL</Label>
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                    <Input 
                      id="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};