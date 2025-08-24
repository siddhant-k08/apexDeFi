import { useState } from "react";
import { useContractService } from "@/hooks/useContractService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export function DexInitializer() {
  const { 
    swapAptToApex,
    isConnected,
    isLoading 
  } = useContractService();

  const [aptAmount, setAptAmount] = useState<string>("10");

  const handleInitializeDex = async () => {
    try {
      // This is a placeholder - in a real scenario, you'd need to add liquidity
      // For now, we'll just try a small swap to see if the DEX works
      const amount = parseFloat(aptAmount);
      if (amount <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid amount",
        });
        return;
      }

      const txHash = await swapAptToApex(amount);
      toast({
        title: "Success!",
        description: `DEX initialization test completed. Transaction hash: ${txHash}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "DEX Initialization Failed",
        description: error.message || "Failed to initialize DEX. The DEX may need initial liquidity.",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DEX Initialization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to initialize the DEX.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚠️ DEX Initialization Required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> The DEX currently has no liquidity (0 reserves). 
            This will cause all swap operations to fail with "INSUFFICIENT_LIQUIDITY" errors.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Test APT Amount</label>
          <Input
            type="number"
            placeholder="Enter APT amount"
            value={aptAmount}
            onChange={(e) => setAptAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleInitializeDex}
          disabled={isLoading || !aptAmount}
          className="w-full"
          variant="destructive"
        >
          Test DEX Functionality
        </Button>

        <div className="text-xs text-muted-foreground">
          <p><strong>Note:</strong> This will test if the DEX can handle transactions.</p>
          <p>If it fails, the DEX needs initial liquidity to be added.</p>
        </div>
      </CardContent>
    </Card>
  );
} 