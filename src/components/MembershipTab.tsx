import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MembershipTier {
  name: string;
  price: string;
  description: string;
  features: string[];
}

const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    name: "Basic Member",
    price: "2,500 XPR",
    description: "Access to tip musicians, creators, and service providers",
    features: [
      "Browse all creators and service providers",
      "Send tips in XPR",
      "View tipping history",
      "Basic profile with bio",
    ],
  },
];

export const MembershipTab = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { toast } = useToast();

  const handleConnectWebAuth = async () => {
    setIsConnecting(true);
    try {
      // WebAuth integration - connect wallet
      if (typeof window !== "undefined" && (window as any).webauth) {
        const accounts = await (window as any).webauth.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          toast({
            title: "Wallet Connected",
            description: `Connected with address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinMembership = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }
    try {
      // XPR token transfer simulation
      if (typeof window !== "undefined" && (window as any).webauth) {
        const txHash = await (window as any).webauth.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: walletAddress,
              to: "0xYourXPRContractAddress",
              value: "0x0",
              data: "0x",
            },
          ],
        });
        setIsMember(true);
        toast({
          title: "Membership Activated!",
          description: "You are now a member. Start tipping creators!",
        });
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Could not complete membership payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Join the XPR Tipping Network</h2>
        <p className="text-muted-foreground text-lg">
          Pay 2,500 XPR to become a member and start tipping musicians, creators, and service providers.
        </p>
      </div>

      {!walletAddress ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Use WebAuth to connect your wallet and join the tipping network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="font-medium">WebAuth Protocol</p>
                <p className="text-sm text-muted-foreground">Secure wallet connection</p>
              </div>
            </div>
            <Button onClick={handleConnectWebAuth} disabled={isConnecting} className="w-full">
              {isConnecting ? "Connecting..." : "Connect Wallet via WebAuth"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Connected:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </code>
          </div>

          {MEMBERSHIP_TIERS.map((tier) => (
            <Card key={tier.name} className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center mb-4">{tier.price}</div>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handleJoinMembership} disabled={isMember} className="w-full">
                  {isMember ? "✓ Membership Active" : "Pay 2,500 XPR to Join"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};