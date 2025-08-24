import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContractService } from "@/hooks/useContractService";

export function PositionOverview() {
  const { account } = useWallet();
  const { userPosition, isLoading, protocolStats } = useContractService();
  
  // Calculate collateral ratio from real data
  const collateralRatio = userPosition && userPosition.collateralAmount > 0 
    ? (userPosition.collateralAmount * (protocolStats?.aptPrice || 4.70)) / (userPosition.borrowedAmount + userPosition.interestAccrued) * 100
    : 0;

  if (!account) {
    return null;
  }

  const getRatioColor = (ratio: number) => {
    if (ratio >= 150) return "text-success";
    if (ratio >= 130) return "text-warning";
    return "text-destructive";
  };

  const getRatioStatus = (ratio: number) => {
    if (ratio >= 150) return "Safe";
    if (ratio >= 130) return "Moderate";
    return "At Risk";
  };

  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          Your Position
          {userPosition && (
            <Badge 
              variant="outline" 
              className={`${getRatioColor(collateralRatio)} border-current`}
            >
              {getRatioStatus(collateralRatio)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : userPosition ? (
          <div className="space-y-6">
            {/* Position Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Collateral (APT)</p>
                <p className="text-2xl font-semibold text-foreground">
                  {userPosition.collateralAmount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ≈ ${(userPosition.collateralAmount * (protocolStats?.aptPrice || 4.70)).toFixed(2)} USD
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Borrowed (APEX)</p>
                <p className="text-2xl font-semibold text-foreground">
                  {userPosition.borrowedAmount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Interest: {userPosition.interestAccrued.toFixed(4)} APEX
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Collateral Ratio</p>
                <p className={`text-2xl font-semibold ${getRatioColor(collateralRatio)}`}>
                  {collateralRatio}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Min: 120%
                </p>
              </div>
            </div>

            {/* Health Factor Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Position Health</p>
                <p className="text-sm font-medium text-foreground">
                  {getRatioStatus(collateralRatio)}
                </p>
              </div>
              <Progress 
                value={Math.min((collateralRatio / 200) * 100, 100)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Liquidation (120%)</span>
                <span>Safe (200%+)</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Last updated: {new Date(userPosition.lastUpdated).toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                5% Annual Interest
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No active position</p>
            <p className="text-sm text-muted-foreground">
              Add collateral to start borrowing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}