import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useContractService } from "@/hooks/useContractService";
import { BorrowingCapacity } from "@/components/BorrowingCapacity";

export function BorrowManager() {
  const { account } = useWallet();
  const { toast } = useToast();
  const { borrowApex, repayApex, repayInterest, userPosition, isLoading, protocolStats } = useContractService();
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  
  // Calculate borrowing capacity correctly
  const aptPrice = protocolStats?.aptPrice || 4.70;
  const apexPrice = protocolStats?.apexPrice || 0.47;
  const collateralValue = userPosition ? userPosition.collateralAmount * aptPrice : 0;
  const maxBorrowableValue = collateralValue / 1.2; // 120% collateral ratio
  // const maxBorrowableApex = maxBorrowableValue / apexPrice; // Removed unused variable
  
  // Calculate available to borrow (subtract current debt)
  const currentDebtValue = userPosition ? (userPosition.borrowedAmount + userPosition.interestAccrued) * apexPrice : 0;
  const availableToBorrow = maxBorrowableValue - currentDebtValue;
  const availableToBorrowApex = availableToBorrow / apexPrice;
  const currentDebt = userPosition?.borrowedAmount || 0;
  const interestAccrued = userPosition?.interestAccrued || 0;
  const [apexBalance] = useState(15.8); // TODO: Get real APEX balance from wallet

  const handleBorrow = async () => {
    if (!account || !borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to borrow.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(borrowAmount) > availableToBorrowApex) {
      toast({
        title: "Exceeds Capacity",
        description: "Borrowing amount exceeds your available capacity.",
        variant: "destructive",
      });
      return;
    }

    try {
      const txHash = await borrowApex(parseFloat(borrowAmount));
      
      toast({
        title: "APEX Borrowed",
        description: `Successfully borrowed ${borrowAmount} APEX tokens. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setBorrowAmount("");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to borrow APEX. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRepay = async () => {
    if (!account || !repayAmount || parseFloat(repayAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to repay.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(repayAmount) > apexBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough APEX tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      const txHash = await repayApex(parseFloat(repayAmount));
      
      toast({
        title: "Debt Repaid",
        description: `Successfully repaid ${repayAmount} APEX tokens. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setRepayAmount("");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to repay debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRepayInterest = async () => {
    if (interestAccrued <= 0) {
      toast({
        title: "No Interest Due",
        description: "You have no accrued interest to repay.",
        variant: "default",
      });
      return;
    }

    try {
      const txHash = await repayInterest();
      
      toast({
        title: "Interest Repaid",
        description: `Successfully repaid ${interestAccrued.toFixed(4)} APEX interest. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to repay interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Borrowing Capacity Calculator */}
      <BorrowingCapacity />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available to Borrow</p>
              <p className="text-xl font-semibold text-foreground">
                {availableToBorrowApex.toFixed(2)} APEX
              </p>
              <Badge variant="outline" className="text-xs">
                ${availableToBorrow.toFixed(2)} USD
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-secondary">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">APEX Balance</p>
              <p className="text-xl font-semibold text-foreground">
                {apexBalance.toFixed(2)} APEX
              </p>
              <Badge variant="outline" className="text-xs">
                Available for repayment
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="borrow" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="borrow">Borrow APEX</TabsTrigger>
          <TabsTrigger value="repay">Repay Debt</TabsTrigger>
        </TabsList>

        <TabsContent value="borrow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Borrow APEX
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="borrow-amount" className="text-sm font-medium">
                  Amount (APEX)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="borrow-amount"
                      type="number"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="pr-16"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                      onClick={() => setBorrowAmount(availableToBorrowApex.toFixed(2))}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Interest Rate: 5% APR</span>
                  <span>Borrow Fee: 0.1%</span>
                </div>
              </div>

              <Button 
                onClick={handleBorrow}
                disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || isLoading || availableToBorrowApex <= 0}
                className="w-full"
              >
                {isLoading ? "Borrowing..." : availableToBorrowApex <= 0 ? "No Borrowing Capacity" : "Borrow APEX"}
              </Button>
              
              {availableToBorrowApex <= 0 && (
                <div className="text-center p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning">
                    {userPosition && userPosition.collateralAmount > 0 
                      ? "You've reached your maximum borrowing capacity. Add more collateral or repay some debt to borrow more."
                      : "Add APT as collateral first to start borrowing APEX."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repay" className="mt-6">
          <div className="space-y-4">
            {/* Current Debt Info */}
            <Card className="bg-accent/20 border-accent/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Debt</p>
                    <p className="text-lg font-semibold text-foreground">
                      {currentDebt.toFixed(2)} APEX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accrued Interest</p>
                    <p className="text-lg font-semibold text-warning">
                      {interestAccrued.toFixed(4)} APEX
                    </p>
                  </div>
                </div>
                
                {interestAccrued > 0 && (
                  <Button
                    onClick={handleRepayInterest}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                  >
                    {isLoading ? "Repaying..." : "Pay Interest Only"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Repay Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Repay Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repay-amount" className="text-sm font-medium">
                    Amount (APEX)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="repay-amount"
                        type="number"
                        placeholder="0.00"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        className="pr-16"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                        onClick={() => setRepayAmount(Math.min(currentDebt, apexBalance).toString())}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Repay Fee: 0.05% • Reduces your debt and improves collateral ratio
                  </p>
                </div>

                <Button 
                  onClick={handleRepay}
                  disabled={!repayAmount || parseFloat(repayAmount) <= 0 || isLoading}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isLoading ? "Repaying..." : "Repay Debt"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              📊 Borrowing Information
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Interest accrues at 5% annually on borrowed amount</li>
              <li>• Small fees apply: 0.1% on borrows, 0.05% on repayments</li>
              <li>• Maintain 120%+ collateral ratio to avoid liquidation</li>
              <li>• Pay interest regularly to keep your position healthy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}