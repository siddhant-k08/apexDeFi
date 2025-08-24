import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractService } from "@/hooks/useContractService";
import { DEFAULT_APT_PRICE, DEFAULT_APEX_PRICE } from "@/constants";

export function PositionOverview() {
  const { account } = useWallet();
  const { userPosition, isLoading } = useContractService();

  if (!account) {
    return null;
  }

  const collateralValue = (userPosition?.collateral || 0) * DEFAULT_APT_PRICE;
  const borrowedValue = (userPosition?.borrowed || 0) * DEFAULT_APEX_PRICE;
  const collateralizationRatio = userPosition?.collateral && userPosition?.borrowed 
    ? (userPosition.collateral * DEFAULT_APT_PRICE) / (userPosition.borrowed * DEFAULT_APEX_PRICE) * 100 
    : 0;

  return (
    <Card className="bg-card/50 dark:bg-slate-800/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Your Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading position...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {userPosition?.collateral?.toFixed(4) || "0.0000"} APT
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                ≈ ${collateralValue.toFixed(2)} USD
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Collateral</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {userPosition?.borrowed?.toFixed(4) || "0.0000"} APEX
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                ≈ ${borrowedValue.toFixed(2)} USD
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Borrowed</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {collateralizationRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Collateralization
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {collateralizationRatio >= 120 ? "✅ Safe" : "⚠️ At Risk"}
              </div>
            </div>
          </div>
        )}
        
        {userPosition && (
          <div className="mt-4 p-3 bg-muted/50 dark:bg-slate-700/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Interest Accrued:</span>
                <span className="font-medium text-foreground">
                  {userPosition.interestAccrued?.toFixed(4) || "0.0000"} APEX
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}