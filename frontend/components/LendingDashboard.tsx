import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollateralManager } from "./CollateralManager";
import { BorrowManager } from "./BorrowManager";
import { PositionOverview } from "./PositionOverview";
import { ProtocolStats } from "./ProtocolStats";
import { BorrowingInfo } from "./BorrowingInfo";
import { DebugInfo } from "./DebugInfo";
import { NetworkTest } from "./NetworkTest";

export function LendingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Protocol Statistics */}
      <ProtocolStats />
      
      {/* Borrowing Guide */}
      <BorrowingInfo />
      
      {/* Network Test */}
      <NetworkTest />
      
      {/* Debug Information */}
      <DebugInfo />
      
      {/* Position Overview */}
      <PositionOverview />
      
      {/* Main Interface */}
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Lending Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger 
                value="collateral" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Manage Collateral
              </TabsTrigger>
              <TabsTrigger 
                value="borrow" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Borrow & Repay
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="collateral" className="mt-6">
              <CollateralManager />
            </TabsContent>
            
            <TabsContent value="borrow" className="mt-6">
              <BorrowManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}