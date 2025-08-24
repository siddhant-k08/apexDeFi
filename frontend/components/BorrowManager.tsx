import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractService } from "@/hooks/useContractService";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_APT_PRICE, DEFAULT_APEX_PRICE } from "@/constants";

export function BorrowManager() {
  const { borrowApex, repayApex, isLoading, userPosition, tokenBalances } = useContractService();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  // Calculate borrowing capacity based on collateral
  const collateralValue = (userPosition?.collateral || 0) * DEFAULT_APT_PRICE;
  const borrowedValue = (userPosition?.borrowed || 0) * DEFAULT_APEX_PRICE;
  const availableToBorrowValue = Math.max(0, collateralValue / 1.2 - borrowedValue); // 120% collateralization ratio
  const availableToBorrowApex = availableToBorrowValue / DEFAULT_APEX_PRICE;

  const handleBorrow = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (numAmount > availableToBorrowApex) {
      toast({
        title: "Insufficient Collateral",
        description: `You can only borrow up to ${availableToBorrowApex.toFixed(4)} APEX with your current collateral.`,
        variant: "destructive",
      });
      return;
    }
    await borrowApex(numAmount);
    setAmount("");
  };

  const handleRepay = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (numAmount > tokenBalances.apex) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${tokenBalances.apex.toFixed(4)} APEX available.`,
        variant: "destructive",
      });
      return;
    }
    await repayApex(numAmount);
    setAmount("");
  };

  const setMaxBorrow = () => {
    setAmount(availableToBorrowApex.toFixed(4));
  };

  const setMaxRepay = () => {
    const maxRepay = Math.min(tokenBalances.apex, userPosition?.borrowed || 0);
    setAmount(maxRepay.toFixed(4));
  };

  return (
    <Card className="bg-card/50 dark:bg-slate-800/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Borrow & Repay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Borrowing Capacity */}
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="text-sm text-green-600 dark:text-green-400">Available to Borrow</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {availableToBorrowApex.toFixed(4)} APEX
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ ${availableToBorrowValue.toFixed(2)} USD
            </div>
          </div>
        </div>

        {/* Current Debt */}
        {userPosition && userPosition.borrowed > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-sm text-red-600 dark:text-red-400">Current Debt</div>
              <div className="text-lg font-bold text-red-700 dark:text-red-300">
                {userPosition.borrowed.toFixed(4)} APEX
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ≈ ${borrowedValue.toFixed(2)} USD
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="borrow-amount" className="text-foreground">APEX Amount</Label>
            <div className="flex gap-2">
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleBorrow}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading || availableToBorrowApex <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
            >
              {isLoading ? "Borrowing..." : "Borrow APEX"}
            </Button>
            <Button
              onClick={handleRepay}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              variant="outline"
              className="w-full text-lg py-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              {isLoading ? "Repaying..." : "Repay APEX"}
            </Button>
          </div>

          {/* Max Buttons */}
          <div className="flex gap-2">
            <Button onClick={setMaxBorrow} variant="outline" size="sm" className="flex-1">
              Max Borrow
            </Button>
            <Button onClick={setMaxRepay} variant="outline" size="sm" className="flex-1">
              Max Repay
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 bg-muted/50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Borrow APEX tokens against your collateral. You must maintain a 120% collateralization ratio to avoid liquidation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}