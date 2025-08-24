import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BorrowingInfo() {
  return (
    <Card className="shadow-md border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          How Borrowing Works
          <Badge variant="outline" className="text-xs">
            Guide
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                1
              </div>
              <span className="font-medium">Add Collateral</span>
            </div>
            <p className="text-muted-foreground text-xs">
              Deposit APT tokens as collateral to secure your loan
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                2
              </div>
              <span className="font-medium">Calculate Capacity</span>
            </div>
            <p className="text-muted-foreground text-xs">
              You can borrow up to 83.33% of your collateral value (120% ratio)
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                3
              </div>
              <span className="font-medium">Borrow APEX</span>
            </div>
            <p className="text-muted-foreground text-xs">
              Borrow APEX tokens against your collateral at 5% APR
            </p>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Collateral Ratio Required:</span>
            <span className="text-xs font-medium">120%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Interest Rate:</span>
            <span className="text-xs font-medium">5.00% APR</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Borrow Fee:</span>
            <span className="text-xs font-medium">0.10%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Repay Fee:</span>
            <span className="text-xs font-medium">0.05%</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">⚠️ Important:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Keep your collateral ratio above 120% to avoid liquidation</li>
            <li>Interest accrues continuously on borrowed amounts</li>
            <li>You can repay debt anytime to improve your position</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 