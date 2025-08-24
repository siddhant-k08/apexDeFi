import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractService } from "@/hooks/useContractService";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { 
  LENDING_ADDRESS,
  APEX_DEX_ADDRESS,
  APEX_TOKEN_ADDRESS
} from "@/constants";

export function DebugInfo() {
  const { account } = useWallet();
  const { userPosition, protocolStats } = useContractService();

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Connected Wallet</h4>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>Address: {account?.address?.toString() || "Not connected"}</div>
              <div>Expected: {account?.address?.toString().slice(0, 66)}...</div>
            </div>
          </div>
        </div>

        {/* User Position */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">User Position</h4>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <pre className="text-xs text-slate-600 dark:text-slate-400">
              {JSON.stringify(userPosition, null, 2)}
            </pre>
          </div>
        </div>

        {/* Protocol Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Protocol Stats</h4>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <pre className="text-xs text-slate-600 dark:text-slate-400">
              {JSON.stringify(protocolStats, null, 2)}
            </pre>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Contract Addresses</h4>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>Lending: {LENDING_ADDRESS}</div>
              <div>DEX: {APEX_DEX_ADDRESS}</div>
              <div>Token: {APEX_TOKEN_ADDRESS}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 