import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const TippingTab = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleSendTip = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please provide both recipient address and tip amount.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Simulate XPR tip transaction via WebAuth
      if (typeof window !== "undefined" && (window as any).webauth) {
        await (window as any).webauth.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: (window as any).webauth.selectedAddress,
              to: recipient,
              value: amount,
            },
          ],
        });
        toast({
          title: "Tip Sent",
          description: `Successfully sent ${amount} XPR to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
        });
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Could not send tip. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Send a Tip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input id="recipient" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (XPR)</Label>
          <Input id="amount" placeholder="e.g., 100" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <Button onClick={handleSendTip} className="w-full">
          Send Tip
        </Button>
      </CardContent>
    </Card>
  );
};