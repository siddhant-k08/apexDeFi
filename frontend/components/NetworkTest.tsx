import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aptosClient } from "@/utils/aptosClient";
import { NETWORK, APTOS_API_KEY } from "@/constants";

export function NetworkTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testContractCall = async () => {
    setIsLoading(true);
    setTestResult("Testing...");
    
    try {
      const client = aptosClient();
      console.log("Testing with client:", client);
      console.log("Network:", NETWORK);
      console.log("Client config:", client.config);
      
      // Test a simple contract call
      const payload = {
        function: "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::lending::get_total_collateral",
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      console.log("Test payload:", payload);
      
      // @ts-ignore - SDK type issues
      const response = await client.view({ payload });
      
      console.log("Test response:", response);
      setTestResult(`Success! Response: ${JSON.stringify(response)}`);
      
    } catch (error) {
      console.error("Test error:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        error: error
      });
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleCall = async () => {
    setIsLoading(true);
    setTestResult("Testing simple call...");
    
    try {
      const client = aptosClient();
      
      // Test a simple APEX token supply call (no arguments needed)
      const payload = {
        function: "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_token::get_supply",
        type_arguments: [],
        arguments: []
      };
      
      console.log("Simple test payload:", payload);
      
      // @ts-ignore - SDK type issues
      const response = await client.view({ payload });
      
      console.log("Simple test response:", response);
      setTestResult(`Simple Success! Response: ${JSON.stringify(response)}`);
      
    } catch (error) {
      console.error("Simple test error:", error);
      console.error("Simple error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        error: error
      });
      setTestResult(`Simple Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md border-0 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Network & Contract Test
          <Badge variant="outline" className="text-xs">
            Debug
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Network Configuration</h4>
          <div className="bg-muted/30 rounded p-2 text-xs font-mono">
            <div>Network: {NETWORK}</div>
            <div>API Key: {APTOS_API_KEY ? "Set" : "Not set"}</div>
            <div>Client: {aptosClient().constructor.name}</div>
            <div>Client Config: {JSON.stringify(aptosClient().config, null, 2)}</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testContractCall} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test Total Collateral"}
          </Button>
          
          <Button 
            onClick={testSimpleCall} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test APEX Supply"}
          </Button>
        </div>
        
        {testResult && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Test Result</h4>
            <div className="bg-muted/30 rounded p-2 text-xs font-mono">
              <div>{testResult}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 