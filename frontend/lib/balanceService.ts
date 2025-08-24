import { aptosClient } from "@/utils/aptosClient";

export interface TokenBalance {
  apt: number;
  apex: number;
}

export class BalanceService {
  private client: ReturnType<typeof aptosClient>;

  constructor() {
    this.client = aptosClient();
  }

  async getAptBalance(userAddress: string): Promise<number> {
    try {
      console.log("Fetching APT balance for address:", userAddress);
      
      const resource = await this.client.getAccountResource({
        accountAddress: userAddress,
        resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      });

      console.log("APT balance resource:", resource);

      if (resource && resource.data) {
        const balance = (resource.data as any).coin?.value || "0";
        const balanceInApt = Number(balance) / Math.pow(10, 8); // Convert from octas
        console.log("APT balance in octas:", balance, "APT:", balanceInApt);
        return balanceInApt;
      }
      console.log("No APT balance resource found, returning 0");
      return 0;
    } catch (error) {
      console.error("Error fetching APT balance:", error);
      // If resource doesn't exist, it means 0 balance
      if (error instanceof Error && error.message.includes("Resource not found")) {
        console.log("APT coin store resource not found - user has 0 APT");
        return 0;
      }
      return 0;
    }
  }

  async getApexBalance(userAddress: string): Promise<number> {
    try {
      console.log("Fetching APEX balance for address:", userAddress);
      
      const resource = await this.client.getAccountResource({
        accountAddress: userAddress,
        resourceType: "0x1::coin::CoinStore<0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_token::APEX>"
      });

      console.log("APEX balance resource:", resource);

      if (resource && resource.data) {
        const balance = (resource.data as any).coin?.value || "0";
        const balanceInApex = Number(balance) / Math.pow(10, 8); // Convert from octas
        console.log("APEX balance in octas:", balance, "APEX:", balanceInApex);
        return balanceInApex;
      }
      console.log("No APEX balance resource found, returning 0");
      return 0;
    } catch (error) {
      console.error("Error fetching APEX balance:", error);
      // If resource doesn't exist, it means 0 balance
      if (error instanceof Error && error.message.includes("Resource not found")) {
        console.log("APEX coin store resource not found - user has 0 APEX");
        return 0;
      }
      return 0;
    }
  }

  async getTokenBalances(userAddress: string): Promise<TokenBalance> {
    try {
      console.log("Fetching token balances for address:", userAddress);
      
      const [aptBalance, apexBalance] = await Promise.all([
        this.getAptBalance(userAddress),
        this.getApexBalance(userAddress)
      ]);

      const result = {
        apt: aptBalance,
        apex: apexBalance
      };

      console.log("Final token balances:", result);
      return result;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return {
        apt: 0,
        apex: 0
      };
    }
  }
}

export const balanceService = new BalanceService(); 