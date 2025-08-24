import { aptosClient } from "@/utils/aptosClient";
import { priceService } from "./priceService";
import { 
  NETWORK, 
  APEX_TOKEN_ADDRESS, 
  APEX_DEX_ADDRESS, 
  LENDING_ADDRESS,
  OCTAS_PER_TOKEN,
  DEFAULT_APT_PRICE,
  DEFAULT_APEX_PRICE
} from "@/constants";

console.log("ContractService initialized with network:", NETWORK);
console.log("Contract addresses:", { LENDING_ADDRESS, APEX_DEX_ADDRESS, APEX_TOKEN_ADDRESS });

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
    console.log("ContractService client initialized:", this.client);
    console.log("Client config:", this.client.config);
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
      return Number(response[0]) / OCTAS_PER_TOKEN; // Convert from octas
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
      return Number(response[0]) / OCTAS_PER_TOKEN;
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
      
      console.log("Fetching user position for:", userAddress);
      console.log("Payload:", payload);
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      console.log("User position response:", response);
      
      if (response && response.length >= 4) {
        const position = {
          collateralAmount: Number(response[0]) / OCTAS_PER_TOKEN, // APT
          borrowedAmount: Number(response[1]) / OCTAS_PER_TOKEN, // APEX
          interestAccrued: Number(response[2]) / OCTAS_PER_TOKEN, // APEX
          lastUpdated: Number(response[3]) * 1000 // Convert to milliseconds
        };
        console.log("Parsed user position:", position);
        return position;
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
        arguments: []
      };
      
      console.log("Fetching total collateral");
      console.log("Payload:", payload);
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      console.log("Total collateral response:", response);
      
      if (response && response.length > 0) {
        const totalCollateral = Number(response[0]) / OCTAS_PER_TOKEN;
        console.log("Total collateral:", totalCollateral);
        return totalCollateral;
      }
      return 0;
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
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      if (response && response.length > 0) {
        return Number(response[0]) / OCTAS_PER_TOKEN;
      }
      return 0;
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
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      if (response && response.length > 0) {
        return Number(response[0]) / OCTAS_PER_TOKEN;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching protocol fees:", error);
      return 0;
    }
  }

  // DEX Functions
  async getDexReserves(): Promise<{ apt: number; apex: number }> {
    try {
      const payload = {
        function: `${APEX_DEX_ADDRESS}::get_reserves`,
        type_arguments: [],
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      if (response && response.length >= 2) {
        return {
          apt: Number(response[0]) / OCTAS_PER_TOKEN,
          apex: Number(response[1]) / OCTAS_PER_TOKEN
        };
      }
      return { apt: 0, apex: 0 };
    } catch (error) {
      console.error("Error fetching DEX reserves:", error);
      return { apt: 0, apex: 0 };
    }
  }

  async getAptPrice(): Promise<number> {
    try {
      // First try to get the price from DEX
      const payload = {
        function: `${APEX_DEX_ADDRESS}::get_apt_price`,
        type_arguments: [],
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      if (response && response.length > 0) {
        const apexPerApt = Number(response[0]);
        // Use the price service to get live USD price
        const livePrices = await priceService.getLivePrices(apexPerApt);
        return livePrices.apt;
      }
      
      // Fallback to default price
      return DEFAULT_APT_PRICE;
    } catch (error) {
      console.error("Error fetching APT price:", error);
      return DEFAULT_APT_PRICE;
    }
  }

  async getApexPrice(): Promise<number> {
    try {
      // Get APT price first
      const aptPrice = await this.getAptPrice();
      
      // Get DEX ratio
      const payload = {
        function: `${APEX_DEX_ADDRESS}::get_apt_price`,
        type_arguments: [],
        arguments: []
      };
      
      // @ts-ignore - SDK type issues
      const response = await this.client.view({ payload });
      
      if (response && response.length > 0) {
        const apexPerApt = Number(response[0]);
        // Calculate APEX price based on APT price and DEX ratio
        return aptPrice / apexPerApt;
      }
      
      // Fallback to default price
      return DEFAULT_APEX_PRICE;
    } catch (error) {
      console.error("Error fetching APEX price:", error);
      return DEFAULT_APEX_PRICE;
    }
  }

  // Protocol Stats
  async getProtocolStats(): Promise<ProtocolStats> {
    try {
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
    } catch (error) {
      console.error("Error fetching protocol stats:", error);
      return {
        totalCollateral: 0,
        totalBorrowed: 0,
        protocolFees: 0,
        aptPrice: DEFAULT_APT_PRICE,
        apexPrice: DEFAULT_APEX_PRICE,
        utilizationRate: 0
      };
    }
  }
}

export const contractService = new ContractService(); 