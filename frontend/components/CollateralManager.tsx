import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useContractService } from "@/hooks/useContractService";

export function CollateralManager() {
  const { toast } = useToast();
  const { addCollateral, withdrawCollateral, isLoading, protocolStats, userPosition, refreshData, tokenBalances } = useContractService();
  const [amount, setAmount] = useState("");

  const handleAddCollateral = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > tokenBalances.apt) {
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
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to add collateral. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawCollateral = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
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
    setAmount(tokenBalances.apt.toString());
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          Manage Collateral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Available APT</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {tokenBalances.apt.toFixed(4)} APT
                </p>
                <p className="text-sm text-slate-500">
                  ≈ ${(tokenBalances.apt * (protocolStats?.aptPrice || 4.70)).toFixed(2)} USD
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Current Collateral</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {userPosition?.collateralAmount ? (userPosition.collateralAmount / Math.pow(10, 8)).toFixed(4) : "0.0000"} APT
                </p>
                <p className="text-sm text-slate-500">
                  ≈ ${userPosition?.collateralAmount ? ((userPosition.collateralAmount / Math.pow(10, 8)) * (protocolStats?.aptPrice || 4.70)).toFixed(2) : "0.00"} USD
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Collateral */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Add Collateral</h3>
          <div className="space-y-3">
            <Label htmlFor="add-amount" className="text-base font-medium">
              Amount (APT)
            </Label>
            <div className="flex gap-2">
              <Input
                id="add-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <Button
                variant="outline"
                onClick={setMaxAmount}
                className="px-4"
              >
                MAX
              </Button>
            </div>
            <Button 
              onClick={handleAddCollateral}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
            >
              {isLoading ? "Adding..." : "Add Collateral"}
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Withdraw Collateral</h3>
          <div className="space-y-3">
            <Label htmlFor="withdraw-amount" className="text-base font-medium">
              Amount (APT)
            </Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
            <Button 
              onClick={handleWithdrawCollateral}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              variant="outline"
              className="w-full text-lg py-3 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {isLoading ? "Withdrawing..." : "Withdraw Collateral"}
            </Button>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button 
            onClick={refreshData} 
            disabled={isLoading}
            variant="outline" 
            size="sm"
          >
            {isLoading ? "Refreshing..." : "🔄 Refresh"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}