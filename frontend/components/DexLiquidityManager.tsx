import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useContractService } from "@/hooks/useContractService";
import { 
  DEFAULT_APT_PRICE, 
  DEFAULT_APEX_PRICE,
  DEX_APT_RESERVES,
  DEX_APEX_RESERVES,
  DEX_EXCHANGE_RATE
} from "@/constants";

export function DexLiquidityManager() {
  const { toast } = useToast();
  const { addLiquidity, isLoading, protocolStats, tokenBalances } = useContractService();
  const [aptAmount, setAptAmount] = useState("");
  const [apexAmount, setApexAmount] = useState("");

  const handleAddLiquidity = async () => {
    if (!aptAmount || !apexAmount || parseFloat(aptAmount) <= 0 || parseFloat(apexAmount) <= 0) {
      toast({
        title: "Invalid Amounts",
        description: "Please enter valid amounts for both APT and APEX.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(aptAmount) > tokenBalances.apt) {
      toast({
        title: "Insufficient APT Balance",
        description: "You don't have enough APT tokens.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(apexAmount) > tokenBalances.apex) {
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
        description: `Added ${aptAmount} APT and ${apexAmount} APEX to the pool. Transaction: ${txHash.slice(0, 8)}...`,
        variant: "default",
      });
      
      setAptAmount("");
      setApexAmount("");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const setMaxApt = () => {
    setAptAmount(tokenBalances.apt.toString());
  };

  const setMaxApex = () => {
    setApexAmount(tokenBalances.apex.toString());
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Add Liquidity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Reserves */}
        <Card className="bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Current APT Reserves</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {DEX_APT_RESERVES.toFixed(2)} APT
                </p>
                <p className="text-sm text-slate-500">
                  ≈ ${(DEX_APT_RESERVES * (protocolStats?.aptPrice || DEFAULT_APT_PRICE)).toFixed(2)} USD
                </p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Current APEX Reserves</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {DEX_APEX_RESERVES.toFixed(2)} APEX
                </p>
                <p className="text-sm text-slate-500">
                  ≈ ${(DEX_APEX_RESERVES * (protocolStats?.apexPrice || DEFAULT_APEX_PRICE)).toFixed(2)} USD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Balances */}
        <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your APT Balance</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {tokenBalances.apt.toFixed(4)} APT
                </p>
                <p className="text-sm text-slate-500">
                  ≈ ${(tokenBalances.apt * (protocolStats?.aptPrice || DEFAULT_APT_PRICE)).toFixed(2)} USD
                </p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your APEX Balance</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {tokenBalances.apex.toFixed(4)} APEX
                </p>
                <p className="text-sm text-slate-500">
                  ≈ ${(tokenBalances.apex * (protocolStats?.apexPrice || DEFAULT_APEX_PRICE)).toFixed(2)} USD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Liquidity Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Add Liquidity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="apt-amount" className="text-base font-medium">
                APT Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apt-amount"
                  type="number"
                  placeholder="0.00"
                  value={aptAmount}
                  onChange={(e) => setAptAmount(e.target.value)}
                  className="text-lg"
                />
                <Button
                  variant="outline"
                  onClick={setMaxApt}
                  className="px-4"
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="apex-amount" className="text-base font-medium">
                APEX Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apex-amount"
                  type="number"
                  placeholder="0.00"
                  value={apexAmount}
                  onChange={(e) => setApexAmount(e.target.value)}
                  className="text-lg"
                />
                <Button
                  variant="outline"
                  onClick={setMaxApex}
                  className="px-4"
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleAddLiquidity}
            disabled={!aptAmount || !apexAmount || parseFloat(aptAmount) <= 0 || parseFloat(apexAmount) <= 0 || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
          >
            {isLoading ? "Adding..." : "Add Liquidity"}
          </Button>
        </div>

        {/* Info */}
        <Card className="bg-slate-50/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                💡 How DEX Liquidity Works
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Add both APT and APEX tokens to the trading pool</li>
                <li>• Earn trading fees from every swap in the pool</li>
                <li>• Receive LP tokens representing your share</li>
                <li>• Current exchange rate: 1 APT = {DEX_EXCHANGE_RATE} APEX</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
} 