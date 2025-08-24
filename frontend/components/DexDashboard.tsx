import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContractService } from "@/hooks/useContractService";
import { DexLiquidityManager } from "./DexLiquidityManager";
import { 
  DEFAULT_APT_PRICE, 
  DEFAULT_APEX_PRICE,
  DEX_APT_RESERVES,
  DEX_APEX_RESERVES,
  DEX_EXCHANGE_RATE
} from "@/constants";

export function DexDashboard() {
  const { connected } = useWallet();
  const { protocolStats } = useContractService();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm max-w-md w-full">
          <CardHeader className="text-center space-y-6 p-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold text-slate-800">
                Connect Your Wallet
              </CardTitle>
              <p className="text-lg text-slate-600">
                Connect your Aptos wallet to start trading and providing liquidity
              </p>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100">
          APEX DEX Trading
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Trade APT for APEX and provide liquidity to earn fees
        </p>
      </div>

      {/* DEX Stats */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            DEX Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">APT Reserves</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {DEX_APT_RESERVES.toFixed(2)} APT
              </p>
              <p className="text-sm text-slate-500">
                ≈ ${(DEX_APT_RESERVES * (protocolStats?.aptPrice || DEFAULT_APT_PRICE)).toFixed(2)} USD
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">APEX Reserves</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {DEX_APEX_RESERVES.toFixed(2)} APEX
              </p>
              <p className="text-sm text-slate-500">
                ≈ ${(DEX_APEX_RESERVES * (protocolStats?.apexPrice || DEFAULT_APEX_PRICE)).toFixed(2)} USD
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Exchange Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                1 APT = {DEX_EXCHANGE_RATE} APEX
              </p>
              <Badge variant="outline" className="text-xs">
                Current Rate
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Management */}
      <DexLiquidityManager />

      <Separator className="my-8" />

      {/* Info Section */}
      <Card className="shadow-lg border-0 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About DEX Liquidity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">What is Liquidity?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Liquidity providers add both APT and APEX tokens to the trading pool, enabling others to swap between them. In return, you earn trading fees from every swap.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">How to Earn</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                When you provide liquidity, you receive LP tokens representing your share of the pool. You can withdraw your tokens plus earned fees at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 