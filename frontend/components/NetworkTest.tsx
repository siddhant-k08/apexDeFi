import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aptosClient } from "@/utils/aptosClient";
import { 
  NETWORK, 
  APTOS_API_KEY,
  LENDING_ADDRESS,
  APEX_TOKEN_ADDRESS
} from "@/constants";

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

interface TestResults {
  [key: string]: TestResult;
}

export function NetworkTest() {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const testTotalCollateral = async () => {
    setIsLoading(true);
    try {
      const client = aptosClient();
      const payload = {
        function: `${LENDING_ADDRESS}::get_total_collateral`,
        type_arguments: [],
        arguments: []
      };
      
      console.log("Testing total collateral with payload:", payload);
      
      // @ts-ignore - SDK type issues
      const response = await client.view({ payload });
      
      console.log("Total collateral response:", response);
      
      setTestResults((prev: TestResults) => ({
        ...prev,
        totalCollateral: {
          success: true,
          data: response,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error("Total collateral test error:", error);
      setTestResults((prev: TestResults) => ({
        ...prev,
        totalCollateral: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testApexSupply = async () => {
    setIsLoading(true);
    try {
      const client = aptosClient();
      const payload = {
        function: `${APEX_TOKEN_ADDRESS}::get_supply`,
        type_arguments: [],
        arguments: []
      };
      
      console.log("Testing APEX supply with payload:", payload);
      
      // @ts-ignore - SDK type issues
      const response = await client.view({ payload });
      
      console.log("APEX supply response:", response);
      
      setTestResults((prev: TestResults) => ({
        ...prev,
        apexSupply: {
          success: true,
          data: response,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error("APEX supply test error:", error);
      setTestResults((prev: TestResults) => ({
        ...prev,
        apexSupply: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Network & Contract Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Network</p>
            <Badge variant="outline">{NETWORK}</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">API Key</p>
            <Badge variant="outline">
              {APTOS_API_KEY ? "Configured" : "Not Set"}
            </Badge>
          </div>
        </div>

        {/* Client Config */}
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">Client Configuration</p>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <pre className="text-xs text-slate-600 dark:text-slate-400">
              {JSON.stringify(aptosClient().config, null, 2)}
            </pre>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={testTotalCollateral}
            disabled={isLoading}
            variant="outline"
          >
            Test Total Collateral
          </Button>
          <Button 
            onClick={testApexSupply}
            disabled={isLoading}
            variant="outline"
          >
            Test APEX Supply
          </Button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Test Results</h4>
            {Object.entries(testResults).map(([testName, result]: [string, TestResult]) => (
              <div key={testName} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✅ Success" : "❌ Failed"}
                  </Badge>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {testName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <pre className="text-xs text-slate-600 dark:text-slate-400">
                    {result.success 
                      ? JSON.stringify(result.data, null, 2)
                      : result.error
                    }
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 