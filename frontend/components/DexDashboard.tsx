import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DexLiquidityManager } from "./DexLiquidityManager";

export function DexDashboard() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🏦</div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Please connect your wallet to access the DEX trading
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">APEX DEX Trading</h1>
        <p className="text-lg text-muted-foreground">
          Trade APT and APEX tokens with automated market making
        </p>
      </div>

      {/* DEX Overview */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>DEX Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1.0 APT</div>
              <div className="text-sm text-muted-foreground">APT Reserves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">10.0 APEX</div>
              <div className="text-sm text-muted-foreground">APEX Reserves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10.0</div>
              <div className="text-sm text-muted-foreground">Exchange Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Management */}
      <DexLiquidityManager />

      {/* About DEX Liquidity */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>About DEX Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">💧</div>
              <div>
                <h4 className="font-medium">Provide Liquidity</h4>
                <p className="text-sm text-muted-foreground">Add both APT and APEX tokens to the trading pool to enable swaps</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-semibold">💰</div>
              <div>
                <h4 className="font-medium">Earn Fees</h4>
                <p className="text-sm text-muted-foreground">Receive trading fees from every swap that happens in the pool</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-semibold">🎯</div>
              <div>
                <h4 className="font-medium">LP Tokens</h4>
                <p className="text-sm text-muted-foreground">Receive LP tokens representing your share of the liquidity pool</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 