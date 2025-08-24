import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SystemExplanation() {
  return (
    <Card className="shadow-md border-0 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
          Understanding the Two Systems
          <Badge variant="outline" className="text-xs">
            Guide
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lending Protocol */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">Lending Protocol</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>Purpose:</strong> Borrow APEX tokens against APT collateral
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Add APT as collateral</li>
                <li>• Borrow APEX tokens</li>
                <li>• Pay interest on borrowed amount</li>
                <li>• Maintain 120% collateral ratio</li>
              </ul>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2 text-xs">
                <strong>Current Status:</strong> You have 1.31 APT as collateral
              </div>
            </div>
          </div>

          {/* DEX Liquidity Pool */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-green-700 dark:text-green-300">DEX Liquidity Pool</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>Purpose:</strong> Provide liquidity for APT/APEX trading
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Add both APT and APEX</li>
                <li>• Earn trading fees</li>
                <li>• Receive LP tokens</li>
                <li>• Enable swaps between tokens</li>
              </ul>
              <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-xs">
                <strong>Current Status:</strong> Pool has 1.0 APT + 10.0 APEX
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-muted/30 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">🎯 What You Should Do:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>1. Lending:</strong> Your collateral is working! You can now borrow APEX tokens.</p>
            <p><strong>2. DEX:</strong> If you want to provide trading liquidity, use the "DEX Liquidity" tab.</p>
            <p><strong>3. Both:</strong> These are separate systems - you can use both independently.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 