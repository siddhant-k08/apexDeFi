import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContractService } from "@/hooks/useContractService";

export function BorrowingCapacity() {
  const { userPosition, protocolStats } = useContractService();

  if (!userPosition || userPosition.collateralAmount === 0) {
    return (
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            Borrowing Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No collateral added yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add APT as collateral to start borrowing APEX
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate borrowing capacity correctly
  const aptPrice = protocolStats?.aptPrice || 4.70;
  const collateralValue = userPosition.collateralAmount * aptPrice;
  const maxBorrowableValue = collateralValue / 1.2; // 120% collateral ratio
  const maxBorrowableApex = maxBorrowableValue / (protocolStats?.apexPrice || 0.47);
  
  // Calculate current utilization
  const currentDebtValue = (userPosition.borrowedAmount + userPosition.interestAccrued) * (protocolStats?.apexPrice || 0.47);
  const availableToBorrow = maxBorrowableValue - currentDebtValue;
  const availableToBorrowApex = availableToBorrow / (protocolStats?.apexPrice || 0.47);
  const utilizationPercentage = (currentDebtValue / maxBorrowableValue) * 100;

  // Determine status and colors
  const getStatusColor = (utilization: number) => {
    if (utilization >= 90) return "text-destructive";
    if (utilization >= 75) return "text-warning";
    return "text-success";
  };

  const getStatusText = (utilization: number) => {
    if (utilization >= 90) return "High Risk";
    if (utilization >= 75) return "Moderate";
    return "Safe";
  };

  return (
    <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Borrowing Capacity
          <Badge variant="outline" className={`text-xs ${getStatusColor(utilizationPercentage)}`}>
            {getStatusText(utilizationPercentage)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collateral Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Collateral Value</p>
            <p className="text-lg font-bold text-foreground">
              ${collateralValue.toFixed(2)} USD
            </p>
            <p className="text-xs text-muted-foreground">
              {userPosition.collateralAmount.toFixed(4)} APT
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Max Borrowable</p>
            <p className="text-lg font-bold text-foreground">
              ${maxBorrowableValue.toFixed(2)} USD
            </p>
            <p className="text-xs text-muted-foreground">
              {maxBorrowableApex.toFixed(2)} APEX
            </p>
          </div>
        </div>

        {/* Current Debt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Current Debt</p>
            <p className="text-sm font-bold text-foreground">
              ${currentDebtValue.toFixed(2)} USD
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Principal + Interest</p>
            <p className="text-xs text-muted-foreground">
              {(userPosition.borrowedAmount + userPosition.interestAccrued).toFixed(4)} APEX
            </p>
          </div>
        </div>

        {/* Available to Borrow */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Available to Borrow</p>
            <p className={`text-sm font-bold ${availableToBorrow > 0 ? 'text-success' : 'text-destructive'}`}>
              ${availableToBorrow.toFixed(2)} USD
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">In APEX</p>
            <p className={`text-xs ${availableToBorrow > 0 ? 'text-success' : 'text-destructive'}`}>
              {availableToBorrow > 0 ? `${availableToBorrowApex.toFixed(2)} APEX` : 'No capacity'}
            </p>
          </div>
        </div>

        {/* Utilization Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className="text-xs font-medium">
              {utilizationPercentage.toFixed(1)}%
            </p>
          </div>
          <Progress 
            value={utilizationPercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>120% (Liquidation)</span>
          </div>
        </div>

        {/* Key Information */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Collateral Ratio Required:</span>
            <span className="text-xs font-medium">120%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Current Ratio:</span>
            <span className={`text-xs font-medium ${utilizationPercentage > 90 ? 'text-destructive' : 'text-foreground'}`}>
              {utilizationPercentage > 0 ? (120 / utilizationPercentage * 100).toFixed(1) : '∞'}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Interest Rate:</span>
            <span className="text-xs font-medium">5.00% APR</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 