import { useState } from "react";
import { useContractService } from "@/hooks/useContractService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export function ApexMinter() {
  const { 
    isConnected,
    isLoading 
  } = useContractService();

  const [amount, setAmount] = useState<string>("1000");

  const handleMintApex = async () => {
    try {
      // This would need to be implemented in the transaction service
      toast({
        title: "APEX Minting Required",
        description: "You need to call the mint_to function on the APEX token contract. This requires the mint capability.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to mint APEX",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>APEX Token Minter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to mint APEX tokens.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🪙 Mint APEX Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Step 1:</strong> Mint APEX tokens to add liquidity to the DEX.
            You need APEX tokens to provide liquidity alongside APT.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">APEX Amount to Mint</label>
          <Input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleMintApex}
          disabled={isLoading || !amount}
          className="w-full"
          variant="outline"
        >
          Mint APEX Tokens
        </Button>

        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Note:</strong> This requires the mint capability for the APEX token.</p>
          <p>If you don't have the mint capability, you'll need to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the deployer account that has the mint capability</li>
            <li>Or modify the contract to allow public minting for testing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 