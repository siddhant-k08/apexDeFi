import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContractService } from "@/hooks/useContractService";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export function DebugInfo() {
  const { userPosition, protocolStats, isLoading } = useContractService();
  const { account } = useWallet();

  return (
    <Card className="shadow-md border-0 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          Debug Information
          <Badge variant="outline" className="text-xs">
            Development
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">User Position Data</h4>
            <div className="bg-muted/30 rounded p-2 text-xs font-mono">
              <div>Collateral: {userPosition?.collateralAmount.toFixed(8) || "0"} APT</div>
              <div>Borrowed: {userPosition?.borrowedAmount.toFixed(8) || "0"} APEX</div>
              <div>Interest: {userPosition?.interestAccrued.toFixed(8) || "0"} APEX</div>
              <div>Last Updated: {userPosition?.lastUpdated ? new Date(userPosition.lastUpdated).toLocaleString() : "Never"}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Protocol Stats</h4>
            <div className="bg-muted/30 rounded p-2 text-xs font-mono">
              <div>Total Collateral: {protocolStats?.totalCollateral.toFixed(8) || "0"} APT</div>
              <div>Total Borrowed: {protocolStats?.totalBorrowed.toFixed(8) || "0"} APEX</div>
              <div>APT Price: ${protocolStats?.aptPrice.toFixed(4) || "0"}</div>
              <div>APEX Price: ${protocolStats?.apexPrice.toFixed(4) || "0"}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Wallet Information</h4>
          <div className="bg-muted/30 rounded p-2 text-xs font-mono">
            <div>Connected: {account?.address ? "Yes" : "No"}</div>
            <div>Address: {account?.address?.toString() || "Not connected"}</div>
            <div>Expected: 0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Contract Addresses</h4>
          <div className="bg-muted/30 rounded p-2 text-xs font-mono">
            <div>Lending: 0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::lending</div>
            <div>DEX: 0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_dex</div>
            <div>Token: 0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_token</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Status: {isLoading ? "Loading..." : "Ready"}</p>
          <p>Last Check: {new Date().toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  );
} 