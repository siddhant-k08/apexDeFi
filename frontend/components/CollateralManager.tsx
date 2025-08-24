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

export function CollateralManager() {
  const { account } = useWallet();
  const { toast } = useToast();
  const { addCollateral, withdrawCollateral, isLoading, protocolStats, userPosition, refreshData } = useContractService();
  const [amount, setAmount] = useState("");
  const [aptBalance] = useState(25.7); // TODO: Get real APT balance from wallet

  const handleAddCollateral = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add as collateral.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > aptBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough APT tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Adding Collateral",
        description: "Transaction submitted. Please wait for confirmation...",
        variant: "default",
      });
      
      const txHash = await addCollateral(parseFloat(amount));
      
      toast({
        title: "Collateral Added Successfully!",
        description: `Added ${amount} APT as collateral. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setAmount("");
      
      // Show refresh reminder
      setTimeout(() => {
        toast({
          title: "Data Refreshed",
          description: "Your position has been updated. Check the debug info below for details.",
          variant: "default",
        });
      }, 3000);
      
    } catch (error) {
      console.error("Add collateral error:", error);
      toast({
        title: "Transaction Failed",
        description: `Failed to add collateral: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleWithdrawCollateral = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    try {
      const txHash = await withdrawCollateral(parseFloat(amount));
      
      toast({
        title: "Collateral Withdrawn",
        description: `Successfully withdrew ${amount} APT from collateral. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setAmount("");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to withdraw collateral. Position may become unsafe.",
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    setAmount(aptBalance.toString());
  };

  return (
    <div className="space-y-6">
      {/* Balance Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-secondary/30 border-secondary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available APT Balance</p>
                <p className="text-xl font-semibold text-foreground">
                  {aptBalance.toFixed(2)} APT
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                ≈ ${(aptBalance * (protocolStats?.aptPrice || 4.70)).toFixed(2)} USD
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/30 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Collateral</p>
                <p className="text-xl font-semibold text-foreground">
                  {userPosition?.collateralAmount.toFixed(4) || "0.0000"} APT
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                ≈ ${((userPosition?.collateralAmount || 0) * (protocolStats?.aptPrice || 4.70)).toFixed(2)} USD
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          onClick={refreshData} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
        >
          {isLoading ? "Refreshing..." : "🔄 Refresh Data"}
        </Button>
      </div>

      {/* Add Collateral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            Add Collateral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-amount" className="text-sm font-medium">
              Amount (APT)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="add-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                  onClick={setMaxAmount}
                >
                  MAX
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Adding collateral increases your borrowing capacity
            </p>
          </div>

          <Button 
            onClick={handleAddCollateral}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            {isLoading ? "Adding Collateral..." : "Add Collateral"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Withdraw Collateral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            Withdraw Collateral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-sm font-medium">
              Amount (APT)
            </Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ Ensure your position remains above 120% collateral ratio
            </p>
          </div>

          <Button 
            onClick={handleWithdrawCollateral}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            variant="outline"
            className="w-full border-warning text-warning hover:bg-warning hover:text-warning-foreground"
          >
            {isLoading ? "Withdrawing..." : "Withdraw Collateral"}
          </Button>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-accent/20 border-accent/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              💡 Collateral Tips
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Minimum 120% collateral ratio required</li>
              <li>• Higher ratios provide better protection against liquidation</li>
              <li>• APT price changes affect your collateral value</li>
              <li>• You can add collateral anytime to improve your position</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}