import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContractService } from "@/hooks/useContractService";
import { CollateralManager } from "./CollateralManager";
import { BorrowManager } from "./BorrowManager";
import { PositionOverview } from "./PositionOverview";
import { 
  DEFAULT_APT_PRICE, 
  DEFAULT_APEX_PRICE, 
  OCTAS_PER_TOKEN 
} from "@/constants";

export function LendingDashboard() {
  const { connected } = useWallet();
  const { protocolStats } = useContractService();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm max-w-md w-full">
          <CardHeader className="text-center space-y-6 p-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold text-slate-800">
                Connect Your Wallet
              </CardTitle>
              <p className="text-lg text-slate-600">
                Connect your Aptos wallet to start lending and borrowing
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
          APEX Lending Protocol
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Borrow APEX tokens against your APT collateral
        </p>
      </div>

      {/* Protocol Stats */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Protocol Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Collateral</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {protocolStats?.totalCollateral ? (protocolStats.totalCollateral / OCTAS_PER_TOKEN).toFixed(2) : "0.00"} APT
              </p>
              <p className="text-sm text-slate-500">
                ≈ ${protocolStats?.totalCollateral ? ((protocolStats.totalCollateral / OCTAS_PER_TOKEN) * (protocolStats.aptPrice || DEFAULT_APT_PRICE)).toFixed(2) : "0.00"} USD
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Borrowed</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {protocolStats?.totalBorrowed ? (protocolStats.totalBorrowed / OCTAS_PER_TOKEN).toFixed(2) : "0.00"} APEX
              </p>
              <p className="text-sm text-slate-500">
                ≈ ${protocolStats?.totalBorrowed ? ((protocolStats.totalBorrowed / OCTAS_PER_TOKEN) * (protocolStats.apexPrice || DEFAULT_APEX_PRICE)).toFixed(2) : "0.00"} USD
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">APT Price</p>
              <p className="text-3xl font-bold text-green-600">
                ${protocolStats?.aptPrice?.toFixed(2) || DEFAULT_APT_PRICE.toFixed(2)}
              </p>
              <Badge variant="outline" className="text-xs">
                Live Price
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Position */}
      <PositionOverview />

      <Separator className="my-8" />

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CollateralManager />
        <BorrowManager />
      </div>

      {/* Info Section */}
      <Card className="shadow-lg border-0 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Add Collateral</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Deposit APT tokens as collateral to secure your borrowing
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Borrow APEX</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Borrow APEX tokens up to your borrowing capacity
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Repay & Withdraw</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Repay your debt and withdraw your collateral
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}