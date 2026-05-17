import React, { useState, useEffect } from "react";
import { User, AtSign, MapPin, Globe, Twitter, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Creator } from "@/data/creators";

interface ProfileEditorProps {
  initialData: Creator;
  onSave: (updatedData: Creator) => void;
}

export const ProfileEditor = ({ initialData, onSave }: ProfileEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    handle: initialData.handle,
    bio: initialData.bio,
    location: initialData.location,
    category: initialData.category,
    twitter: initialData.twitter || "",
    website: initialData.website || "",
  });

  const { toast } = useToast();

  // Reset form when initialData changes (e.g. from a different tab)
  useEffect(() => {
    setFormData({
      name: initialData.name,
      handle: initialData.handle,
      bio: initialData.bio,
      location: initialData.location,
      category: initialData.category,
      twitter: initialData.twitter || "",
      website: initialData.website || "",
    });
    setHasChanged(false);
  }, [initialData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const updatedCreator: Creator = {
        ...initialData,
        ...formData,
      };
      
      onSave(updatedCreator);
      setHasChanged(false);
      
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved to your profile.",
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

  return (
    <Card className="bg-[#130b21] border-white/10 text-white rounded-[32px] overflow-hidden">
      <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-black">Public Profile</CardTitle>
          <CardDescription className="text-white/40">Update how you appear to others on the global map</CardDescription>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving || !hasChanged}
          className={`rounded-xl gap-2 font-bold transition-all h-12 px-6 ${
            hasChanged 
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
              : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-6 pb-8 border-b border-white/5">
            <div className={`h-24 w-24 rounded-3xl ${initialData.color} flex items-center justify-center text-3xl font-black border-4 border-white/10 shadow-xl`}>
              {initialData.avatar}
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Profile Avatar</h4>
              <p className="text-sm text-white/40">Your avatar is currently generated from your name.</p>
              <Button variant="outline" size="sm" className="rounded-lg border-white/10 text-white/60 hover:text-white h-9 bg-white/5">
                <ImageIcon className="h-4 w-4 mr-2" /> Change Color
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Display Name</Label>
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

            <div className="space-y-2">
              <Label htmlFor="handle" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Public Handle</Label>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Short Bio</Label>
              <Textarea 
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell the world what you build..."
                className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all resize-none p-4 text-white" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
                <Input 
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-purple-500 focus:bg-white/10 transition-all text-white" 
                />
              </div>
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
                  {["Content", "Dev", "Art", "Education", "Gaming", "Music", "Sports", "Service", "Other"].map((cat) => (
                    <SelectItem key={cat} value={cat} className="focus:bg-purple-500 focus:text-white cursor-pointer">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Twitter / X URL</Label>
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
              <Label htmlFor="website" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Website URL</Label>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};