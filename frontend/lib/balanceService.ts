import { aptosClient } from "@/utils/aptosClient";
import { 
  OCTAS_PER_TOKEN,
  APEX_TOKEN_ADDRESS,
  CUSTOM_TESTNET_RPC,
  DEFAULT_TESTNET_RPC
} from "@/constants";

export interface TokenBalance {
  apt: number;
  apex: number;
}

export class BalanceService {
  private client: ReturnType<typeof aptosClient>;
  private cache: Map<string, { balance: TokenBalance; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10000; // 10 seconds cache

  constructor() {
    this.client = aptosClient();
  }

  private isCacheValid(address: string): boolean {
    const cached = this.cache.get(address);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(address: string, balance: TokenBalance): void {
    this.cache.set(address, { balance, timestamp: Date.now() });
  }

  private getCache(address: string): TokenBalance | null {
    const cached = this.cache.get(address);
    return cached ? cached.balance : null;
  }

  // Fetch APT balance using the official Aptos pattern
  async getAptBalance(userAddress: string): Promise<number> {
    try {
      console.log("🔍 Fetching APT balance for address:", userAddress);
      
      // Use the official Aptos pattern: getAccountResource
      const aptCoinStore = await this.client.getAccountResource({
        accountAddress: userAddress,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      });

      console.log("📊 APT CoinStore resource:", aptCoinStore);

      if (aptCoinStore && aptCoinStore.data) {
        const balance = (aptCoinStore.data as any).coin?.value || "0";
        const balanceInApt = Number(balance) / OCTAS_PER_TOKEN;
        console.log("✅ APT balance fetched successfully:", balanceInApt, "APT");
        return balanceInApt;
      }

      console.log("⚠️ No APT balance found, returning 0");
      return 0;
    } catch (error) {
      console.error("❌ Error fetching APT balance:", error);
      
      // If resource doesn't exist, it means 0 balance (following Aptos pattern)
      if (error instanceof Error && error.message.includes("Resource not found")) {
        console.log("ℹ️ APT coin store resource not found - user has 0 APT");
        return 0;
      }
      
      return 0;
    }
  }

  // Fetch APEX balance using the official Aptos pattern
  async getApexBalance(userAddress: string): Promise<number> {
    try {
      console.log("🔍 Fetching APEX balance for address:", userAddress);
      
      // Use the official Aptos pattern: getAccountResource
      const apexCoinStore = await this.client.getAccountResource({
        accountAddress: userAddress,
        resourceType: `0x1::coin::CoinStore<${APEX_TOKEN_ADDRESS}>`
      });

      console.log("📊 APEX CoinStore resource:", apexCoinStore);

      if (apexCoinStore && apexCoinStore.data) {
        const balance = (apexCoinStore.data as any).coin?.value || "0";
        const balanceInApex = Number(balance) / OCTAS_PER_TOKEN;
        console.log("✅ APEX balance fetched successfully:", balanceInApex, "APEX");
        return balanceInApex;
      }

      console.log("⚠️ No APEX balance found, returning 0");
      return 0;
    } catch (error) {
      console.error("❌ Error fetching APEX balance:", error);
      
      // If resource doesn't exist, it means 0 balance (following Aptos pattern)
      if (error instanceof Error && error.message.includes("Resource not found")) {
        console.log("ℹ️ APEX coin store resource not found - user has 0 APEX");
        return 0;
      }
      
      return 0;
    }
  }

  // Fetch both token balances using the official Aptos pattern
  async getTokenBalances(userAddress: string): Promise<TokenBalance> {
    try {
      console.log("🚀 Fetching token balances for address:", userAddress);
      
      // Check cache first
      if (this.isCacheValid(userAddress)) {
        const cached = this.getCache(userAddress);
        console.log("💾 Using cached balance:", cached);
        return cached!;
      }
      
      console.log("🔄 Cache expired, fetching fresh balances...");
      
      // Fetch both balances in parallel using the official pattern
      const [aptBalance, apexBalance] = await Promise.all([
        this.getAptBalance(userAddress),
        this.getApexBalance(userAddress)
      ]);

      const result = {
        apt: aptBalance,
        apex: apexBalance
      };

      // Cache the result
      this.setCache(userAddress, result);

      console.log("✅ Final token balances:", result);
      return result;
    } catch (error) {
      console.error("❌ Error fetching token balances:", error);
      return {
        apt: 0,
        apex: 0
      };
    }
  }

  // Clear cache for a specific address (useful after transactions)
  clearCache(userAddress: string): void {
    this.cache.delete(userAddress);
    console.log("🗑️ Cache cleared for address:", userAddress);
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
    console.log("🗑️ All cache cleared");
  }

  // Test connection to verify the client is working
  async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Testing Aptos client connection...");
      console.log("🔧 Client config:", {
        network: "testnet",
        fullnode: CUSTOM_TESTNET_RPC || DEFAULT_TESTNET_RPC
      });
      
      // Try to get ledger info to test connection (following Aptos pattern)
      const ledgerInfo = await this.client.getLedgerInfo();
      console.log("✅ Aptos client connection successful:", ledgerInfo);
      return true;
    } catch (error) {
      console.error("❌ Aptos client connection failed:", error);
      console.error("🔧 Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  // Test direct connection to RPC endpoints
  async testRpcConnection(): Promise<{ custom: boolean; default: boolean }> {
    const results = { custom: false, default: false };
    
    try {
      console.log("🧪 Testing custom RPC connection...");
      const customResponse = await fetch(CUSTOM_TESTNET_RPC, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      results.custom = customResponse.ok;
      console.log("✅ Custom RPC connection:", results.custom);
    } catch (error) {
      console.error("❌ Custom RPC connection failed:", error);
    }

    try {
      console.log("🧪 Testing default RPC connection...");
      const defaultResponse = await fetch(DEFAULT_TESTNET_RPC, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      results.default = defaultResponse.ok;
      console.log("✅ Default RPC connection:", results.default);
    } catch (error) {
      console.error("❌ Default RPC connection failed:", error);
    }

    return results;
  }
}

export const balanceService = new BalanceService(); 