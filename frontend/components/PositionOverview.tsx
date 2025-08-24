import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContractService } from "@/hooks/useContractService";

export function PositionOverview() {
  const { userPosition, protocolStats } = useContractService();

  if (!userPosition) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            Your Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No position found. Add collateral to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate position metrics
  const collateralAmount = userPosition.collateralAmount / Math.pow(10, 8);
  const borrowedAmount = userPosition.borrowedAmount / Math.pow(10, 8);
  const interestAccrued = userPosition.interestAccrued / Math.pow(10, 8);
  
  const collateralValue = collateralAmount * (protocolStats?.aptPrice || 4.70);
  const debtValue = (borrowedAmount + interestAccrued) * (protocolStats?.apexPrice || 0.47);
  const collateralRatio = debtValue > 0 ? (collateralValue / debtValue) * 100 : 0;
  const utilizationPercentage = Math.min((debtValue / collateralValue) * 100, 100);

  // Determine status
  let status = "Safe";
  let statusColor = "text-green-600";
  let statusBg = "bg-green-100";
  
  if (collateralRatio < 150) {
    status = "Moderate";
    statusColor = "text-yellow-600";
    statusBg = "bg-yellow-100";
  }
  if (collateralRatio < 120) {
    status = "High Risk";
    statusColor = "text-red-600";
    statusBg = "bg-red-100";
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          Your Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Collateral</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {collateralAmount.toFixed(4)} APT
            </p>
            <p className="text-sm text-slate-500">
              ≈ ${collateralValue.toFixed(2)} USD
            </p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Debt</p>
            <p className="text-2xl font-bold text-red-600">
              {(borrowedAmount + interestAccrued).toFixed(4)} APEX
            </p>
            <p className="text-sm text-slate-500">
              ≈ ${debtValue.toFixed(2)} USD
            </p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Collateral Ratio</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {collateralRatio.toFixed(1)}%
            </p>
            <Badge className={`${statusBg} ${statusColor} border-0`}>
              {status}
            </Badge>
          </div>
        </div>

        {/* Utilization Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Position Utilization</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {utilizationPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={utilizationPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0% (Safe)</span>
            <span>83.3% (120% Ratio)</span>
            <span>100% (Max)</span>
          </div>
        </div>

        {/* Interest Info */}
        {interestAccrued > 0 && (
          <Card className="bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Accrued Interest: {interestAccrued.toFixed(4)} APEX
                </span>
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                  Pay Interest
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Warning */}
        {collateralRatio < 150 && (
          <Card className="bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800">
            <CardContent className="p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                ⚠️ Your collateral ratio is {collateralRatio.toFixed(1)}%. Consider adding more collateral or repaying debt to improve your position.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}