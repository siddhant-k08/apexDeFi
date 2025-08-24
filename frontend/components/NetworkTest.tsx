import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aptosClient } from "@/utils/aptosClient";
import { CUSTOM_TESTNET_RPC, DEFAULT_TESTNET_RPC } from "@/constants";

interface TestResult {
  test: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

interface TestResults {
  [key: string]: TestResult;
}

export function NetworkTest() {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test: string, success: boolean, data?: any, error?: string) => {
    setTestResults(prev => ({
      ...prev,
      [test]: {
        test,
        success,
        data,
        error,
        timestamp: new Date()
      }
    }));
  };

  const testUsdtToken = async () => {
    setIsLoading(true);
    try {
      console.log("🧪 Testing USDT token fetch from Aptos testnet...");
      
      const client = aptosClient();
      
      // USDT token address on Aptos testnet
      const usdtAddress = "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T";
      
      // Try to fetch USDT token info
      const usdtInfo = await client.getAccountResource({
        accountAddress: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea",
        resourceType: "0x1::coin::CoinInfo<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>"
      });

      console.log("✅ USDT token info fetched successfully:", usdtInfo);
      
      addTestResult("USDT Token Info", true, {
        address: usdtAddress,
        name: usdtInfo.data?.name || "Unknown",
        symbol: usdtInfo.data?.symbol || "Unknown",
        decimals: usdtInfo.data?.decimals || "Unknown",
        supply: usdtInfo.data?.supply?.vec?.[0]?.integer?.vec?.[0]?.value || "Unknown"
      });
      
    } catch (error) {
      console.error("❌ USDT token test failed:", error);
      addTestResult("USDT Token Info", false, undefined, error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const testLedgerInfo = async () => {
    setIsLoading(true);
    try {
      console.log("🧪 Testing ledger info fetch...");
      
      const client = aptosClient();
      const ledgerInfo = await client.getLedgerInfo();
      
      console.log("✅ Ledger info fetched successfully:", ledgerInfo);
      
      addTestResult("Ledger Info", true, {
        chainId: ledgerInfo.chain_id,
        epoch: ledgerInfo.epoch,
        ledgerVersion: ledgerInfo.ledger_version,
        ledgerTimestamp: ledgerInfo.ledger_timestamp,
        nodeRole: ledgerInfo.node_role
      });
      
    } catch (error) {
      console.error("❌ Ledger info test failed:", error);
      addTestResult("Ledger Info", false, undefined, error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const testRpcEndpoints = async () => {
    setIsLoading(true);
    try {
      console.log("🧪 Testing RPC endpoints...");
      
      const results = {
        custom: false,
        default: false
      };

      // Test custom RPC
      try {
        const customResponse = await fetch(CUSTOM_TESTNET_RPC, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        results.custom = customResponse.ok;
        console.log("✅ Custom RPC test:", results.custom);
      } catch (error) {
        console.error("❌ Custom RPC test failed:", error);
      }

      // Test default RPC
      try {
        const defaultResponse = await fetch(DEFAULT_TESTNET_RPC, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        results.default = defaultResponse.ok;
        console.log("✅ Default RPC test:", results.default);
      } catch (error) {
        console.error("❌ Default RPC test failed:", error);
      }

      addTestResult("RPC Endpoints", results.custom || results.default, {
        customRpc: results.custom ? "✅ Working" : "❌ Failed",
        defaultRpc: results.default ? "✅ Working" : "❌ Failed"
      });
      
    } catch (error) {
      console.error("❌ RPC endpoints test failed:", error);
      addTestResult("RPC Endpoints", false, undefined, error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🌐</span>
          Network Connectivity Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test Aptos testnet connectivity and fetch USDT token details
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Info */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Current Configuration</h4>
          <div className="text-sm space-y-1">
            <div>Custom RPC: {CUSTOM_TESTNET_RPC}</div>
            <div>Default RPC: {DEFAULT_TESTNET_RPC}</div>
            <div>Network: testnet</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testRpcEndpoints} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            🌐 Test RPC Endpoints
          </Button>
          <Button 
            onClick={testLedgerInfo} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            📊 Test Ledger Info
          </Button>
          <Button 
            onClick={testUsdtToken} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            💰 Test USDT Token
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
            size="sm"
          >
            🗑️ Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results</h4>
            {Object.values(testResults).map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.test}</span>
                  <span className={`text-sm ${
                    result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {result.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>
                {result.success && result.data && (
                  <div className="text-sm space-y-1">
                    {Object.entries(result.data).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
                {!result.success && result.error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Error: {result.error}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 