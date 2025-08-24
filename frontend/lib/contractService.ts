import { aptosClient } from "@/utils/aptosClient";
import { priceService } from "./priceService";

// Contract addresses (deployed to testnet)
const APEX_TOKEN_ADDRESS = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_token";
const APEX_DEX_ADDRESS = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_dex";
const LENDING_ADDRESS = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::lending";

export interface UserPosition {
  collateralAmount: number;
  borrowedAmount: number;
  interestAccrued: number;
  lastUpdated: number;
}

export interface ProtocolStats {
  totalCollateral: number;
  totalBorrowed: number;
  protocolFees: number;
  aptPrice: number;
  apexPrice: number;
  utilizationRate: number;
}

export class ContractService {
  private client: ReturnType<typeof aptosClient>;

  constructor() {
    this.client = aptosClient();
  }



  // APEX Token Functions
  async getApexSupply(): Promise<number> {
    try {
      const payload = {
        function: `${APEX_TOKEN_ADDRESS}::get_supply`,
        type_arguments: [],
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Number(response[0]) / Math.pow(10, 8); // Convert from octas
    } catch (error) {
      console.error("Error fetching APEX supply:", error);
      return 0;
    }
  }

  async getApexMaxSupply(): Promise<number> {
    try {
      const payload = {
        function: `${APEX_TOKEN_ADDRESS}::get_max_supply`,
        type_arguments: [],
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Number(response[0]) / Math.pow(10, 8);
    } catch (error) {
      console.error("Error fetching APEX max supply:", error);
      return 0;
    }
  }

  // Lending Protocol Functions
  async getUserPosition(userAddress: string): Promise<UserPosition | null> {
    try {
      const payload = {
        function: `${LENDING_ADDRESS}::get_user_position`,
        type_arguments: [],
        arguments: [userAddress]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      if (response && response.length >= 4) {
        return {
          collateralAmount: Number(response[0]) / Math.pow(10, 8), // APT
          borrowedAmount: Number(response[1]) / Math.pow(10, 8), // APEX
          interestAccrued: Number(response[2]) / Math.pow(10, 8), // APEX
          lastUpdated: Number(response[3]) * 1000 // Convert to milliseconds
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user position:", error);
      return null;
    }
  }

  async getTotalCollateral(): Promise<number> {
    try {
      const payload = {
        function: `${LENDING_ADDRESS}::get_total_collateral`,
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Number(response[0]) / Math.pow(10, 8);
    } catch (error) {
      console.error("Error fetching total collateral:", error);
      return 0;
    }
  }

  async getTotalBorrowed(): Promise<number> {
    try {
      const payload = {
        function: `${LENDING_ADDRESS}::get_total_borrowed`,
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Number(response[0]) / Math.pow(10, 8);
    } catch (error) {
      console.error("Error fetching total borrowed:", error);
      return 0;
    }
  }

  async getProtocolFees(): Promise<number> {
    try {
      const payload = {
        function: `${LENDING_ADDRESS}::get_protocol_fees`,
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Number(response[0]) / Math.pow(10, 8);
    } catch (error) {
      console.error("Error fetching protocol fees:", error);
      return 0;
    }
  }

  async isLiquidatable(userAddress: string): Promise<boolean> {
    try {
      const payload = {
        function: `${LENDING_ADDRESS}::is_liquidatable`,
        type_arguments: [],
        arguments: [userAddress]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Boolean(response[0]);
    } catch (error) {
      console.error("Error checking liquidation status:", error);
      return false;
    }
  }

  // DEX Functions
  async getAptPrice(): Promise<number> {
    try {
      // Get DEX ratio first
      const payload = {
        function: `${APEX_DEX_ADDRESS}::get_apt_price`,
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      const apexPerApt = Number(response[0]) / Math.pow(10, 8);
      
      // Get live APT price from external API
      const livePrices = await priceService.getLivePrices(apexPerApt);
      return livePrices.apt;
    } catch (error) {
      console.error("Error fetching APT price:", error);
      return 4.70; // Fallback price
    }
  }

  async getApexPrice(): Promise<number> {
    try {
      // Get DEX ratio first
      const payload = {
        function: `${APEX_DEX_ADDRESS}::get_apt_price`,
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      const apexPerApt = Number(response[0]) / Math.pow(10, 8);
      
      // Get live prices from external API
      const livePrices = await priceService.getLivePrices(apexPerApt);
      return livePrices.apex;
    } catch (error) {
      console.error("Error fetching APEX price:", error);
      return 0.47; // Fallback price (4.70 / 10)
    }
  }

  async getReserves(): Promise<{ aptReserve: number; apexReserve: number }> {
    try {
      const payload = {
        function: `${APEX_DEX_ADDRESS}::get_reserves`,
        type_arguments: [],
        arguments: ["0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f"]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return {
        aptReserve: Number(response[0]) / Math.pow(10, 8),
        apexReserve: Number(response[1]) / Math.pow(10, 8)
      };
    } catch (error) {
      console.error("Error fetching reserves:", error);
      return { aptReserve: 0, apexReserve: 0 };
    }
  }

  // Utility Functions
  async getProtocolStats(): Promise<ProtocolStats> {
    const [totalCollateral, totalBorrowed, protocolFees, aptPrice, apexPrice] = await Promise.all([
      this.getTotalCollateral(),
      this.getTotalBorrowed(),
      this.getProtocolFees(),
      this.getAptPrice(),
      this.getApexPrice()
    ]);

    const utilizationRate = totalCollateral > 0 ? (totalBorrowed / totalCollateral) * 100 : 0;

    return {
      totalCollateral,
      totalBorrowed,
      protocolFees,
      aptPrice,
      apexPrice,
      utilizationRate
    };
  }

  async calculateCollateralRatio(userAddress: string): Promise<number> {
    try {
      const payload = {
        function: `${LENDING_ADDRESS}::calculate_position_ratio`,
        type_arguments: [],
        arguments: [userAddress]
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      return Number(response[0]) / 100; // Convert from basis points to percentage
    } catch (error) {
      console.error("Error calculating collateral ratio:", error);
      return 0;
    }
  }


}

// Create a singleton instance
export const contractService = new ContractService(); 