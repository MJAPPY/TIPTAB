import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Music, Settings } from "lucide-react";
import { MembershipTab } from "./MembershipTab";
import { TippingTab } from "./TippingTab";
import { ProfileTab } from "./ProfileTab";

export const TabbedInterface = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="membership" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="membership" className="flex-1">
            <User className="mr-2 h-4 w-4" />
            Membership
          </TabsTrigger>
          <TabsTrigger value="tipping" className="flex-1">
            <Music className="mr-2 h-4 w-4" />
            Tipping
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="membership" className="p-4">
          <MembershipTab />
        </TabsContent>
        
        <TabsContent value="tipping" className="p-4">
          <TippingTab />
        </TabsContent>
        
        <TabsContent value="profile" className="p-4">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};