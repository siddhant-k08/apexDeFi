import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { contractService, UserPosition, ProtocolStats } from "@/lib/contractService";
import { transactionService } from "@/lib/transactionService";
import { balanceService, TokenBalance } from "@/lib/balanceService";

export function useContractService() {
  const { account, connected } = useWallet();
  const { client: walletClient } = useWalletClient();
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [protocolStats, setProtocolStats] = useState<ProtocolStats | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance>({ apt: 0, apex: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user position
  const fetchUserPosition = async () => {
    if (!account?.address) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching position for account:", account.address.toString());
      const position = await contractService.getUserPosition(account.address.toString());
      console.log("Fetched position:", position);
      setUserPosition(position);
    } catch (err) {
      console.error("Error fetching user position:", err);
      setError("Failed to fetch user position");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch protocol stats
  const fetchProtocolStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await contractService.getProtocolStats();
      setProtocolStats(stats);
    } catch (err) {
      console.error("Error fetching protocol stats:", err);
      setError("Failed to fetch protocol stats");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token balances
  const fetchTokenBalances = async () => {
    if (!account?.address) {
      console.log("⚠️ No account address available for balance fetching");
      return;
    }
    
    try {
      console.log("🚀 Starting balance fetch for address:", account.address.toString());
      
      // Test connection first
      const connectionTest = await balanceService.testConnection();
      if (!connectionTest) {
        console.error("❌ Aptos client connection failed");
        setError("Failed to connect to Aptos testnet");
        return;
      }
      
      console.log("✅ Aptos client connection successful");
      
      const balances = await balanceService.getTokenBalances(account.address.toString());
      console.log("✅ Balance fetch completed:", balances);
      setTokenBalances(balances);
    } catch (err) {
      console.error("❌ Error fetching token balances:", err);
      setError("Failed to fetch wallet balances");
    }
  };

  // Refresh all data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Clear balance cache to ensure fresh data
      if (account?.address) {
        balanceService.clearCache(account.address.toString());
      }
      
      // Add a small delay to ensure blockchain state is updated
      await new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([
        fetchUserPosition(),
        fetchProtocolStats(),
        fetchTokenBalances()
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction functions
  const addCollateral = async (amount: number) => {
    if (!account?.address || !walletClient) throw new Error("Wallet not connected");
    
    try {
      setIsLoading(true);
      setError(null);
      const txHash = await transactionService.addCollateral(walletClient, amount);
      await refreshData(); // Refresh data after transaction
      return txHash;
    } catch (err) {
      console.error("Error adding collateral:", err);
      setError("Failed to add collateral");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawCollateral = async (amount: number) => {
    if (!account?.address || !walletClient) throw new Error("Wallet not connected");
    
    try {
      setIsLoading(true);
      setError(null);
      const txHash = await transactionService.withdrawCollateral(walletClient, amount);
      await refreshData(); // Refresh data after transaction
      return txHash;
    } catch (err) {
      console.error("Error withdrawing collateral:", err);
      setError("Failed to withdraw collateral");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const borrowApex = async (amount: number) => {
    if (!account?.address || !walletClient) throw new Error("Wallet not connected");
    
    try {
      setIsLoading(true);
      setError(null);
      const txHash = await transactionService.borrowApex(walletClient, amount);
      await refreshData(); // Refresh data after transaction
      return txHash;
    } catch (err) {
      console.error("Error borrowing APEX:", err);
      setError("Failed to borrow APEX");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const repayApex = async (amount: number) => {
    if (!account?.address || !walletClient) throw new Error("Wallet not connected");
    
    try {
      setIsLoading(true);
      setError(null);
      const txHash = await transactionService.repayApex(walletClient, amount);
      await refreshData(); // Refresh data after transaction
      return txHash;
    } catch (err) {
      console.error("Error repaying APEX:", err);
      setError("Failed to repay APEX");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const repayInterest = async () => {
    if (!account?.address || !walletClient) throw new Error("Wallet not connected");
    
    try {
      setIsLoading(true);
      setError(null);
      const txHash = await transactionService.repayInterest(walletClient);
      await refreshData(); // Refresh data after transaction
      return txHash;
    } catch (err) {
      console.error("Error repaying interest:", err);
      setError("Failed to repay interest");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data when wallet connects/disconnects
  useEffect(() => {
    if (connected && account?.address) {
      refreshData();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    } else {
      setUserPosition(null);
      setProtocolStats(null);
    }
  }, [connected, account?.address]);

  return {
    // Data
    userPosition,
    protocolStats,
    tokenBalances,
    isLoading,
    error,
    
    // Actions
    refreshData,
    addCollateral,
    withdrawCollateral,
    borrowApex,
    repayApex,
    repayInterest,
    
    // DEX Actions
    swapAptToApex: async (amount: number) => {
      if (!account?.address || !walletClient) throw new Error("Wallet not connected");
      try {
        setIsLoading(true);
        setError(null);
        const txHash = await transactionService.swapAptToApex(walletClient, amount);
        await refreshData();
        return txHash;
      } catch (err) {
        console.error("Error swapping APT to APEX:", err);
        setError("Failed to swap APT to APEX");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    
    swapApexToApt: async (amount: number) => {
      if (!account?.address || !walletClient) throw new Error("Wallet not connected");
      try {
        setIsLoading(true);
        setError(null);
        const txHash = await transactionService.swapApexToApt(walletClient, amount);
        await refreshData();
        return txHash;
      } catch (err) {
        console.error("Error swapping APEX to APT:", err);
        setError("Failed to swap APEX to APT");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    
    // Liquidation
    liquidate: async (userAddress: string) => {
      if (!account?.address || !walletClient) throw new Error("Wallet not connected");
      try {
        setIsLoading(true);
        setError(null);
        const txHash = await transactionService.liquidate(walletClient, userAddress);
        await refreshData();
        return txHash;
      } catch (err) {
        console.error("Error liquidating position:", err);
        setError("Failed to liquidate position");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    
    // Liquidity Management
    addLiquidity: async (aptAmount: number, apexAmount: number) => {
      if (!account?.address || !walletClient) throw new Error("Wallet not connected");
      try {
        setIsLoading(true);
        setError(null);
        const txHash = await transactionService.addLiquidity(walletClient, aptAmount, apexAmount);
        await refreshData();
        return txHash;
      } catch (err) {
        console.error("Error adding liquidity:", err);
        setError("Failed to add liquidity");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    
    // Utility
    isConnected: connected,
    userAddress: account?.address
  };
} 