import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContractService } from "@/hooks/useContractService";
import { useToast } from "@/components/ui/use-toast";
import { balanceService } from "@/lib/balanceService";

export function CollateralManager() {
  const { account } = useWallet();
  const { addCollateral, withdrawCollateral, isLoading, tokenBalances, refreshData } = useContractService();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const handleAddCollateral = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (numAmount > tokenBalances.apt) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${tokenBalances.apt.toFixed(4)} APT available.`,
        variant: "destructive",
      });
      return;
    }
    await addCollateral(numAmount);
    setAmount("");
  };

  const handleWithdrawCollateral = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    await withdrawCollateral(numAmount);
    setAmount("");
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshData();
      toast({
        title: "Balance Refreshed",
        description: "Your wallet balances have been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh balances. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnectionAndRefresh = async () => {
    try {
      // Test RPC connection
      const rpcTest = await balanceService.testRpcConnection();
      console.log("RPC Test Result:", rpcTest);
      
      // Test general connection
      const connectionTest = await balanceService.testConnection();
      console.log("Connection Test Result:", connectionTest);
      
      // Refresh balances
      await refreshData();
      
      const hasWorkingRpc = rpcTest.custom || rpcTest.default;
      toast({
        title: "Connection Test Complete",
        description: hasWorkingRpc 
          ? "RPC connection successful and balances refreshed." 
          : "RPC connection failed but balances refreshed.",
        variant: hasWorkingRpc ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test connection or refresh balances.",
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    setAmount(tokenBalances.apt.toFixed(4));
  };

  return (
    <Card className="bg-card/50 dark:bg-slate-800/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Manage Collateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Balances */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="text-sm text-blue-600 dark:text-blue-400">APT Balance</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {tokenBalances.apt.toFixed(4)} APT
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-green-600 dark:text-green-400">APEX Balance</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {tokenBalances.apex.toFixed(4)} APEX
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collateral-amount" className="text-foreground">APT Amount</Label>
            <div className="flex gap-2">
              <Input
                id="collateral-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button onClick={setMaxAmount} variant="outline" size="sm">
                Max
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleAddCollateral}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
            >
              {isLoading ? "Adding..." : "Add Collateral"}
            </Button>
            <Button
              onClick={handleWithdrawCollateral}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              variant="outline"
              className="w-full text-lg py-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              {isLoading ? "Withdrawing..." : "Withdraw Collateral"}
            </Button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Debug Information</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>User Address: {account?.address?.toString() || "Not connected"}</div>
            <div>APT Balance: {tokenBalances.apt.toFixed(4)} APT</div>
            <div>APEX Balance: {tokenBalances.apex.toFixed(4)} APEX</div>
            <div>Network: {import.meta.env.VITE_APP_NETWORK || "testnet"}</div>
            <div>Custom RPC: {import.meta.env.VITE_APP_NETWORK === "testnet" ? "Enabled" : "Disabled"}</div>
          </div>
          <div className="flex gap-2 justify-center mt-2">
            <Button onClick={handleTestConnectionAndRefresh} variant="outline" size="sm">
              🧪 Test Connection
            </Button>
            <Button onClick={handleRefreshBalance} variant="outline" size="sm">
              🔄 Refresh All Data
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 bg-muted/50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Add APT as collateral to borrow APEX tokens. You can withdraw your collateral anytime after repaying your borrowed amount.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}