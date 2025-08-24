import { useState } from "react";
import { useContractService } from "@/hooks/useContractService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export function LiquidityManager() {
  const { 
    addLiquidity,
    isConnected,
    isLoading 
  } = useContractService();

  const [aptAmount, setAptAmount] = useState<string>("100");
  const [apexAmount, setApexAmount] = useState<string>("1000");

  const handleAddLiquidity = async () => {
    try {
      const apt = parseFloat(aptAmount);
      const apex = parseFloat(apexAmount);
      
      if (apt <= 0 || apex <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter valid amounts for both APT and APEX",
        });
        return;
      }

      const txHash = await addLiquidity(apt, apex);
      toast({
        title: "Success!",
        description: `Liquidity added successfully. Transaction hash: ${txHash}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add liquidity",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to manage liquidity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌊 Add Initial DEX Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Solution:</strong> Add initial liquidity to make the DEX functional.
            This will allow users to swap APT for APEX and vice versa.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">APT Amount</label>
            <Input
              type="number"
              placeholder="100"
              value={aptAmount}
              onChange={(e) => setAptAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">APEX Amount</label>
            <Input
              type="number"
              placeholder="1000"
              value={apexAmount}
              onChange={(e) => setApexAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          onClick={handleAddLiquidity}
          disabled={isLoading || !aptAmount || !apexAmount}
          className="w-full"
        >
          Add Liquidity
        </Button>

        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Recommended Initial Liquidity:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>APT: 100-1000 tokens</li>
            <li>APEX: 1000-10000 tokens</li>
            <li>This will set an initial APT/APEX price ratio</li>
          </ul>
          <p><strong>Note:</strong> You need to have both APT and APEX tokens to add liquidity.</p>
        </div>
      </CardContent>
    </Card>
  );
} 