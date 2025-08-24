import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractService } from "@/hooks/useContractService";
import { useToast } from "@/components/ui/use-toast";
import { 
  DEFAULT_APT_PRICE, 
  DEFAULT_APEX_PRICE,
  DEX_APT_RESERVES,
  DEX_APEX_RESERVES,
  DEX_EXCHANGE_RATE
} from "@/constants";

export function DexLiquidityManager() {
  const { isLoading, tokenBalances } = useContractService();
  const { toast } = useToast();
  const [aptAmount, setAptAmount] = useState("");
  const [apexAmount, setApexAmount] = useState("");

  const handleAddLiquidity = async () => {
    const numApt = parseFloat(aptAmount);
    const numApex = parseFloat(apexAmount);
    
    if (!aptAmount || !apexAmount || numApt <= 0 || numApex <= 0) {
      toast({
        title: "Invalid Amounts",
        description: "Please enter valid amounts for both APT and APEX.",
        variant: "destructive",
      });
      return;
    }

    if (numApt > tokenBalances.apt) {
      toast({
        title: "Insufficient APT Balance",
        description: `You have ${tokenBalances.apt.toFixed(4)} APT but trying to add ${numApt} APT.`,
        variant: "destructive",
      });
      return;
    }

    if (numApex > tokenBalances.apex) {
      toast({
        title: "Insufficient APEX Balance",
        description: `You have ${tokenBalances.apex.toFixed(4)} APEX but trying to add ${numApex} APEX.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feature Not Available",
      description: "Adding liquidity to DEX is not yet implemented in this version.",
      variant: "default",
    });
  };

  const setMaxApt = () => {
    setAptAmount(tokenBalances.apt.toFixed(4));
  };

  const setMaxApex = () => {
    setApexAmount(tokenBalances.apex.toFixed(4));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add DEX Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current DEX Reserves */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current DEX Reserves</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">APT Reserves:</span>
              <div className="font-medium">{DEX_APT_RESERVES.toFixed(2)} APT</div>
              <div className="text-xs text-muted-foreground">
                ≈ ${(DEX_APT_RESERVES * DEFAULT_APT_PRICE).toFixed(2)} USD
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">APEX Reserves:</span>
              <div className="font-medium">{DEX_APEX_RESERVES.toFixed(2)} APEX</div>
              <div className="text-xs text-muted-foreground">
                ≈ ${(DEX_APEX_RESERVES * DEFAULT_APEX_PRICE).toFixed(2)} USD
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Exchange Rate:</span>
            <div className="font-medium">1 APT = {DEX_EXCHANGE_RATE.toFixed(2)} APEX</div>
          </div>
        </div>

        {/* User Balances */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Your Balances</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">APT Balance:</span>
              <div className="font-medium">{tokenBalances.apt.toFixed(4)} APT</div>
            </div>
            <div>
              <span className="text-muted-foreground">APEX Balance:</span>
              <div className="font-medium">{tokenBalances.apex.toFixed(4)} APEX</div>
            </div>
          </div>
        </div>

        {/* Add Liquidity Form */}
        <div className="space-y-4">
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
                Max
              </Button>
            </div>
          </div>

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
                Max
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleAddLiquidity}
            disabled={!aptAmount || !apexAmount || parseFloat(aptAmount) <= 0 || parseFloat(apexAmount) <= 0 || isLoading}
            className="w-full"
          >
            {isLoading ? "Adding Liquidity..." : "Add Liquidity"}
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-muted-foreground">
          <p>💡 Adding liquidity provides trading pairs for the DEX. You'll receive LP tokens representing your share of the pool.</p>
        </div>
      </CardContent>
    </Card>
  );
} 