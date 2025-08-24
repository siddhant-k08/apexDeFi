import { useState } from "react";
import { useContractService } from "@/hooks/useContractService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export function TransactionTest() {
  const { 
    addCollateral, 
    withdrawCollateral, 
    borrowApex, 
    repayApex, 
    repayInterest,
    swapAptToApex,
    swapApexToApt,
    isConnected,
    isLoading 
  } = useContractService();

  const [amount, setAmount] = useState<string>("");
  const [swapAmount, setSwapAmount] = useState<string>("");

  const handleTransaction = async (transactionFn: (amount: number) => Promise<string>, amount: number, operation: string) => {
    try {
      const txHash = await transactionFn(amount);
      toast({
        title: "Success!",
        description: `${operation} completed. Transaction hash: ${txHash}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${operation.toLowerCase()}`,
      });
    }
  };

  const handleRepayInterest = async () => {
    try {
      const txHash = await repayInterest();
      toast({
        title: "Success!",
        description: `Interest repayment completed. Transaction hash: ${txHash}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to repay interest",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to test transactions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (APT/APEX)</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleTransaction(addCollateral, parseFloat(amount), "Add Collateral")}
            disabled={isLoading || !amount}
            className="w-full"
          >
            Add Collateral
          </Button>
          <Button
            onClick={() => handleTransaction(withdrawCollateral, parseFloat(amount), "Withdraw Collateral")}
            disabled={isLoading || !amount}
            className="w-full"
          >
            Withdraw Collateral
          </Button>
          <Button
            onClick={() => handleTransaction(borrowApex, parseFloat(amount), "Borrow APEX")}
            disabled={isLoading || !amount}
            className="w-full"
          >
            Borrow APEX
          </Button>
          <Button
            onClick={() => handleTransaction(repayApex, parseFloat(amount), "Repay APEX")}
            disabled={isLoading || !amount}
            className="w-full"
          >
            Repay APEX
          </Button>
        </div>

        <Button
          onClick={handleRepayInterest}
          disabled={isLoading}
          className="w-full"
        >
          Repay Interest
        </Button>

        <div className="space-y-2">
          <label className="text-sm font-medium">Swap Amount</label>
          <Input
            type="number"
            placeholder="Enter swap amount"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleTransaction(swapAptToApex, parseFloat(swapAmount), "Swap APT to APEX")}
            disabled={isLoading || !swapAmount}
            className="w-full"
          >
            APT → APEX
          </Button>
          <Button
            onClick={() => handleTransaction(swapApexToApt, parseFloat(swapAmount), "Swap APEX to APT")}
            disabled={isLoading || !swapAmount}
            className="w-full"
          >
            APEX → APT
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 