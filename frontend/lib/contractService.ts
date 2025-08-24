import { aptosClient } from "@/utils/aptosClient";
import { priceService } from "@/lib/priceService";
import {
  LENDING_ADDRESS,
  APEX_DEX_ADDRESS,
  OCTAS_PER_TOKEN,
  DEFAULT_APT_PRICE,
  DEFAULT_APEX_PRICE
} from "@/constants";

export interface ProtocolStats {
  totalCollateral: number;
  totalBorrowed: number;
  protocolFees: number;
  aptPrice: number;
  apexPrice: number;
}

export interface UserPosition {
  collateral: number;
  borrowed: number;
  interestAccrued: number;
  collateralValue: number;
  debtValue: number;
  collateralRatio: number;
  utilizationPercentage: number;
}

export interface DexReserves {
  aptReserves: number;
  apexReserves: number;
  exchangeRate: number;
}

export const useContractService = () => {
  const client = aptosClient();

  // Fetch protocol statistics
  const getProtocolStats = async (): Promise<ProtocolStats> => {
    try {
      console.log("📊 Fetching protocol stats...");
      
      // Get live prices
      const livePrices = await priceService.getLivePrices(10.0); // Default exchange rate
      const aptPrice = livePrices.apt || DEFAULT_APT_PRICE;
      const apexPrice = livePrices.apex || DEFAULT_APEX_PRICE;

      // Fetch protocol data
      const [totalCollateralRes, totalBorrowedRes, protocolFeesRes] = await Promise.all([
        client.getAccountResource({
          accountAddress: LENDING_ADDRESS.split("::")[0],
          resourceType: `${LENDING_ADDRESS}::Lending`
        }).catch(() => ({ data: { total_collateral: "0" } })),
        
        client.getAccountResource({
          accountAddress: LENDING_ADDRESS.split("::")[0],
          resourceType: `${LENDING_ADDRESS}::Lending`
        }).catch(() => ({ data: { total_borrowed: "0" } })),
        
        client.getAccountResource({
          accountAddress: LENDING_ADDRESS.split("::")[0],
          resourceType: `${LENDING_ADDRESS}::Lending`
        }).catch(() => ({ data: { protocol_fees: "0" } }))
      ]);

      const totalCollateral = Number(totalCollateralRes.data?.total_collateral || "0") / OCTAS_PER_TOKEN;
      const totalBorrowed = Number(totalBorrowedRes.data?.total_borrowed || "0") / OCTAS_PER_TOKEN;
      const protocolFees = Number(protocolFeesRes.data?.protocol_fees || "0") / OCTAS_PER_TOKEN;

      return {
        totalCollateral,
        totalBorrowed,
        protocolFees,
        aptPrice,
        apexPrice
      };
    } catch (error) {
      console.error("❌ Error fetching protocol stats:", error);
      return {
        totalCollateral: 0,
        totalBorrowed: 0,
        protocolFees: 0,
        aptPrice: DEFAULT_APT_PRICE,
        apexPrice: DEFAULT_APEX_PRICE
      };
    }
  };

  // Fetch user position
  const getUserPosition = async (userAddress: string): Promise<UserPosition | null> => {
    try {
      console.log("👤 Fetching user position for:", userAddress);
      
      const positionRes = await client.getAccountResource({
        accountAddress: userAddress,
        resourceType: `${LENDING_ADDRESS}::UserPosition`
      });

      if (!positionRes.data) {
        console.log("⚠️ No user position found");
        return null;
      }

      const position = positionRes.data as any;
      const collateral = Number(position.collateral || "0") / OCTAS_PER_TOKEN;
      const borrowed = Number(position.borrowed || "0") / OCTAS_PER_TOKEN;
      const interestAccrued = Number(position.interest_accrued || "0") / OCTAS_PER_TOKEN;

      // Get live prices
      const livePrices = await priceService.getLivePrices(10.0); // Default exchange rate
      const aptPrice = livePrices.apt || DEFAULT_APT_PRICE;
      const apexPrice = livePrices.apex || DEFAULT_APEX_PRICE;

      const collateralValue = collateral * aptPrice;
      const debtValue = (borrowed + interestAccrued) * apexPrice;
      const collateralRatio = debtValue > 0 ? (collateralValue / debtValue) * 100 : 0;
      const utilizationPercentage = collateralValue > 0 ? (debtValue / collateralValue) * 100 : 0;

      return {
        collateral,
        borrowed,
        interestAccrued,
        collateralValue,
        debtValue,
        collateralRatio,
        utilizationPercentage
      };
    } catch (error) {
      console.error("❌ Error fetching user position:", error);
      return null;
    }
  };

  // Fetch DEX reserves
  const getDexReserves = async (): Promise<DexReserves> => {
    try {
      console.log("🏦 Fetching DEX reserves...");
      
      const dexRes = await client.getAccountResource({
        accountAddress: APEX_DEX_ADDRESS.split("::")[0],
        resourceType: `${APEX_DEX_ADDRESS}::ApexDEX`
      });

      if (!dexRes.data) {
        console.log("⚠️ No DEX data found, using defaults");
        return {
          aptReserves: 1.0,
          apexReserves: 10.0,
          exchangeRate: 10.0
        };
      }

      const dex = dexRes.data as any;
      const aptReserves = Number(dex.apt_reserves || "0") / OCTAS_PER_TOKEN;
      const apexReserves = Number(dex.apex_reserves || "0") / OCTAS_PER_TOKEN;
      const exchangeRate = apexReserves > 0 ? aptReserves / apexReserves : 10.0;

      return {
        aptReserves,
        apexReserves,
        exchangeRate
      };
    } catch (error) {
      console.error("❌ Error fetching DEX reserves:", error);
      return {
        aptReserves: 1.0,
        apexReserves: 10.0,
        exchangeRate: 10.0
      };
    }
  };

  // Get APT price from DEX
  const getAptPrice = async (): Promise<number> => {
    try {
      const dexReserves = await getDexReserves();
      const apexPerApt = dexReserves.exchangeRate;
      const livePrices = await priceService.getLivePrices(apexPerApt);
      return livePrices.apt || DEFAULT_APT_PRICE;
    } catch (error) {
      console.error("❌ Error getting APT price:", error);
      return DEFAULT_APT_PRICE;
    }
  };

  // Get APEX price from DEX
  const getApexPrice = async (): Promise<number> => {
    try {
      const aptPrice = await getAptPrice();
      const dexReserves = await getDexReserves();
      const apexPerApt = dexReserves.exchangeRate;
      return aptPrice / apexPerApt;
    } catch (error) {
      console.error("❌ Error getting APEX price:", error);
      return DEFAULT_APEX_PRICE;
    }
  };

  return {
    getProtocolStats,
    getUserPosition,
    getDexReserves,
    getAptPrice,
    getApexPrice
  };
}; 