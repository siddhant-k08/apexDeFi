import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useContractService } from "@/hooks/useContractService";
import { 
  COLLATERAL_RATIO, 
  DEFAULT_APT_PRICE, 
  DEFAULT_APEX_PRICE,
  OCTAS_PER_TOKEN 
} from "@/constants";

export function BorrowManager() {
  const { toast } = useToast();
  const { borrowApex, repayApex, isLoading, protocolStats, userPosition, tokenBalances } = useContractService();
  const [amount, setAmount] = useState("");

  // Calculate borrowing capacity
  const collateralValue = userPosition?.collateralAmount ? (userPosition.collateralAmount / OCTAS_PER_TOKEN) * (protocolStats?.aptPrice || DEFAULT_APT_PRICE) : 0;
  const maxBorrowableValue = collateralValue / COLLATERAL_RATIO; // 120% collateral ratio
  const currentDebtValue = userPosition?.borrowedAmount ? (userPosition.borrowedAmount / OCTAS_PER_TOKEN) * (protocolStats?.apexPrice || DEFAULT_APEX_PRICE) : 0;
  const availableToBorrow = Math.max(0, maxBorrowableValue - currentDebtValue);
  const availableToBorrowApex = availableToBorrow / (protocolStats?.apexPrice || DEFAULT_APEX_PRICE);
  const utilizationPercentage = maxBorrowableValue > 0 ? (currentDebtValue / maxBorrowableValue) * 100 : 0;

  const handleBorrowApex = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > availableToBorrowApex) {
      toast({
        title: "Exceeds Borrowing Capacity",
        description: "Amount exceeds your available borrowing capacity.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Borrowing APEX",
        description: "Transaction submitted. Please wait for confirmation...",
        variant: "default",
      });
      
      const txHash = await borrowApex(parseFloat(amount));
      
      toast({
        title: "APEX Borrowed Successfully!",
        description: `Borrowed ${amount} APEX. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setAmount("");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to borrow APEX. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRepayApex = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > tokenBalances.apex) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough APEX tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      const txHash = await repayApex(parseFloat(amount));
      
      toast({
        title: "APEX Repaid Successfully!",
        description: `Repaid ${amount} APEX. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setAmount("");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to repay APEX. Please try again.",
        variant: "destructive",
      });
    }
  };

  const setMaxBorrow = () => {
    setAmount(availableToBorrowApex.toString());
  };

  const setMaxRepay = () => {
    setAmount(tokenBalances.apex.toString());
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Borrow & Repay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Borrowing Capacity */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 dark:from-green-950/20 dark:to-blue-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Borrowing Capacity</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {utilizationPercentage.toFixed(1)}% Used
                </span>
              </div>
              <Progress value={utilizationPercentage} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Available to Borrow</p>
                  <p className="text-xl font-bold text-green-600">
                    {availableToBorrowApex.toFixed(2)} APEX
                  </p>
                  <p className="text-sm text-slate-500">
                    ≈ ${availableToBorrow.toFixed(2)} USD
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Current Debt</p>
                  <p className="text-xl font-bold text-red-600">
                    {userPosition?.borrowedAmount ? (userPosition.borrowedAmount / OCTAS_PER_TOKEN).toFixed(2) : "0.00"} APEX
                  </p>
                  <p className="text-sm text-slate-500">
                    ≈ ${currentDebtValue.toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrow APEX */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Borrow APEX</h3>
          <div className="space-y-3">
            <Label htmlFor="borrow-amount" className="text-base font-medium">
              Amount (APEX)
            </Label>
            <div className="flex gap-2">
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <Button
                variant="outline"
                onClick={setMaxBorrow}
                className="px-4"
              >
                MAX
              </Button>
            </div>
            <Button 
              onClick={handleBorrowApex}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading || availableToBorrowApex <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
            >
              {isLoading ? "Borrowing..." : "Borrow APEX"}
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Repay APEX</h3>
          <div className="space-y-3">
            <Label htmlFor="repay-amount" className="text-base font-medium">
              Amount (APEX)
            </Label>
            <div className="flex gap-2">
              <Input
                id="repay-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <Button
                variant="outline"
                onClick={setMaxRepay}
                className="px-4"
              >
                MAX
              </Button>
            </div>
            <Button 
              onClick={handleRepayApex}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              variant="outline"
              className="w-full text-lg py-3 border-red-300 text-red-700 hover:bg-red-50"
            >
              {isLoading ? "Repaying..." : "Repay APEX"}
            </Button>
          </div>
        </div>

        {/* Warning */}
        {availableToBorrowApex <= 0 && (
          <Card className="bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardContent className="p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ You need to add more collateral to borrow APEX tokens.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}