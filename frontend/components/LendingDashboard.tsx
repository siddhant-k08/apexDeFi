import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionOverview } from "./PositionOverview";
import { CollateralManager } from "./CollateralManager";
import { BorrowManager } from "./BorrowManager";
import { NetworkTest } from "./NetworkTest";

export function LendingDashboard() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🔗</div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Please connect your wallet to access the lending protocol
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Test Section */}
      <NetworkTest />
      
      {/* Protocol Overview */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Protocol Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$0.00</div>
              <div className="text-sm text-muted-foreground">Total Collateral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">$0.00</div>
              <div className="text-sm text-muted-foreground">Total Borrowed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$4.70</div>
              <div className="text-sm text-muted-foreground">APT Price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Position */}
      <PositionOverview />

      {/* Collateral Management */}
      <CollateralManager />

      {/* Borrowing Management */}
      <BorrowManager />

      {/* How It Works */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h4 className="font-medium">Add Collateral</h4>
                <p className="text-sm text-muted-foreground">Deposit APT tokens as collateral to secure your borrowing position</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h4 className="font-medium">Borrow APEX</h4>
                <p className="text-sm text-muted-foreground">Borrow APEX tokens against your collateral at a 120% ratio</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h4 className="font-medium">Repay & Withdraw</h4>
                <p className="text-sm text-muted-foreground">Repay your borrowed APEX to withdraw your collateral</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}