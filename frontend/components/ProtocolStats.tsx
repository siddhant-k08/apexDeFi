import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContractService } from "@/hooks/useContractService";
import { PriceStatus } from "@/components/PriceStatus";

export function ProtocolStats() {
  const { protocolStats, isLoading } = useContractService();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!protocolStats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Collateral */}
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Collateral
            </p>
            <p className="text-lg font-bold text-foreground">
              {protocolStats.totalCollateral.toLocaleString()} APT
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ ${(protocolStats.totalCollateral * protocolStats.aptPrice).toLocaleString()} USD
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Borrowed */}
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Borrowed
            </p>
            <p className="text-lg font-bold text-foreground">
              {protocolStats.totalBorrowed.toLocaleString()} APEX
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ ${(protocolStats.totalBorrowed * protocolStats.apexPrice).toLocaleString()} USD
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Utilization Rate */}
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Utilization Rate
            </p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground">
                {protocolStats.utilizationRate.toFixed(1)}%
              </p>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  protocolStats.utilizationRate > 80 
                    ? 'border-warning text-warning' 
                    : protocolStats.utilizationRate > 60 
                    ? 'border-primary text-primary'
                    : 'border-success text-success'
                }`}
              >
                {protocolStats.utilizationRate > 80 ? 'High' : protocolStats.utilizationRate > 60 ? 'Moderate' : 'Low'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Fees */}
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Protocol Fees
            </p>
            <p className="text-lg font-bold text-foreground">
              {protocolStats.protocolFees.toFixed(1)} APEX
            </p>
            <p className="text-xs text-muted-foreground">
              Treasury Balance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Price Information */}
      <Card className="md:col-span-2 shadow-md border-0 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Live Asset Prices
                </p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">APT</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ${protocolStats.aptPrice.toFixed(4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Market Price
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium">APEX</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ${protocolStats.apexPrice.toFixed(4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    DEX Calculated
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PriceStatus />
              <p className="text-xs text-muted-foreground text-right">
                Auto-refresh<br/>every 30s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interest Rate */}
      <Card className="md:col-span-2 shadow-md border-0 bg-gradient-to-r from-accent/5 to-muted/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Current Rates
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Borrow APR</span>
                  <span className="text-sm font-bold text-primary">5.00%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Borrow Fee</span>
                  <span className="text-sm font-bold text-muted-foreground">0.10%</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Fixed Rate
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}