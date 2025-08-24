import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useContractService } from "@/hooks/useContractService";

export function DexLiquidityManager() {
  const { account } = useWallet();
  const { toast } = useToast();
  const { addLiquidity, isLoading, protocolStats } = useContractService();
  const [aptAmount, setAptAmount] = useState("");
  const [apexAmount, setApexAmount] = useState("");
  const [aptBalance] = useState(25.7); // TODO: Get real APT balance
  const [apexBalance] = useState(100); // TODO: Get real APEX balance

  const handleAddLiquidity = async () => {
    if (!account || !aptAmount || !apexAmount || parseFloat(aptAmount) <= 0 || parseFloat(apexAmount) <= 0) {
      toast({
        title: "Invalid Amounts",
        description: "Please enter valid amounts for both APT and APEX.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(aptAmount) > aptBalance) {
      toast({
        title: "Insufficient APT Balance",
        description: "You don't have enough APT tokens.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(apexAmount) > apexBalance) {
      toast({
        title: "Insufficient APEX Balance",
        description: "You don't have enough APEX tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Adding Liquidity",
        description: "Transaction submitted. Please wait for confirmation...",
        variant: "default",
      });
      
      const txHash = await addLiquidity(parseFloat(aptAmount), parseFloat(apexAmount));
      
      toast({
        title: "Liquidity Added Successfully!",
        description: `Added ${aptAmount} APT and ${apexAmount} APEX to DEX. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setAptAmount("");
      setApexAmount("");
      
    } catch (error) {
      console.error("Add liquidity error:", error);
      toast({
        title: "Transaction Failed",
        description: `Failed to add liquidity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const setMaxApt = () => {
    setAptAmount(aptBalance.toString());
  };

  const setMaxApex = () => {
    setApexAmount(apexBalance.toString());
  };

  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          DEX Liquidity Management
          <Badge variant="outline" className="text-xs">
            Trading Pool
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current DEX Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-secondary/30 border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">DEX APT Reserves</p>
                  <p className="text-xl font-semibold text-foreground">
                    1.0 APT
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  ≈ ${(1.0 * (protocolStats?.aptPrice || 4.70)).toFixed(2)} USD
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/30 border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">DEX APEX Reserves</p>
                  <p className="text-xl font-semibold text-foreground">
                    10.0 APEX
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  ≈ ${(10.0 * (protocolStats?.apexPrice || 0.47)).toFixed(2)} USD
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Add Liquidity Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Add Liquidity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* APT Input */}
            <div className="space-y-2">
              <Label htmlFor="apt-amount">APT Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="apt-amount"
                  type="number"
                  placeholder="0.0"
                  value={aptAmount}
                  onChange={(e) => setAptAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={setMaxApt} variant="outline" size="sm">
                  MAX
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {aptBalance.toFixed(2)} APT
              </p>
            </div>

            {/* APEX Input */}
            <div className="space-y-2">
              <Label htmlFor="apex-amount">APEX Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="apex-amount"
                  type="number"
                  placeholder="0.0"
                  value={apexAmount}
                  onChange={(e) => setApexAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={setMaxApex} variant="outline" size="sm">
                  MAX
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {apexBalance.toFixed(2)} APEX
              </p>
            </div>
          </div>

          {/* Add Liquidity Button */}
          <Button 
            onClick={handleAddLiquidity} 
            disabled={isLoading || !aptAmount || !apexAmount}
            className="w-full"
          >
            {isLoading ? "Adding Liquidity..." : "Add Liquidity"}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 How DEX Liquidity Works</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Add both APT and APEX to provide trading liquidity</li>
            <li>• Earn trading fees from swaps</li>
            <li>• Receive LP tokens representing your share</li>
            <li>• Different from lending collateral (separate system)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 