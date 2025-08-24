import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { transactionService } from "@/lib/transactionService";
import { balanceService, TokenBalance } from "@/lib/balanceService";
import { useContractService as useContractServiceBase } from "@/lib/contractService";
import { useToast } from "@/components/ui/use-toast";

export const useContractService = () => {
  const { account } = useWallet();
  const walletClient = useWalletClient();
  const { toast } = useToast();
  const contractService = useContractServiceBase();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [protocolStats, setProtocolStats] = useState<any>(null);
  const [dexReserves, setDexReserves] = useState<any>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance>({ apt: 0, apex: 0 });

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

  // Fetch user position
  const fetchUserPosition = async () => {
    if (!account?.address) return;
    
    try {
      const position = await contractService.getUserPosition(account.address.toString());
      setUserPosition(position);
    } catch (err) {
      console.error("❌ Error fetching user position:", err);
    }
  };

  // Fetch protocol stats
  const fetchProtocolStats = async () => {
    try {
      const stats = await contractService.getProtocolStats();
      setProtocolStats(stats);
    } catch (err) {
      console.error("❌ Error fetching protocol stats:", err);
    }
  };

  // Fetch DEX reserves
  const fetchDexReserves = async () => {
    try {
      const reserves = await contractService.getDexReserves();
      setDexReserves(reserves);
    } catch (err) {
      console.error("❌ Error fetching DEX reserves:", err);
    }
  };

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!account?.address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear balance cache before fetching
      balanceService.clearCache(account.address.toString());
      
      // Fetch all data in parallel
      await Promise.all([
        fetchTokenBalances(),
        fetchUserPosition(),
        fetchProtocolStats(),
        fetchDexReserves()
      ]);
    } catch (err) {
      console.error("❌ Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, [account?.address]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!account?.address) return;
    
    refreshData();
    
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [account?.address, refreshData]);

  // Transaction functions
  const addCollateral = async (amount: number) => {
    if (!walletClient || !account?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const hash = await transactionService.addCollateral(walletClient, amount);
      toast({
        title: "Success",
        description: `Added ${amount} APT as collateral. Transaction: ${hash.slice(0, 8)}...`,
        variant: "default",
      });
      await refreshData();
    } catch (error) {
      console.error("❌ Error adding collateral:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add collateral",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawCollateral = async (amount: number) => {
    if (!walletClient || !account?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const hash = await transactionService.withdrawCollateral(walletClient, amount);
      toast({
        title: "Success",
        description: `Withdrew ${amount} APT collateral. Transaction: ${hash.slice(0, 8)}...`,
        variant: "default",
      });
      await refreshData();
    } catch (error) {
      console.error("❌ Error withdrawing collateral:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to withdraw collateral",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const borrowApex = async (amount: number) => {
    if (!walletClient || !account?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const hash = await transactionService.borrowApex(walletClient, amount);
      toast({
        title: "Success",
        description: `Borrowed ${amount} APEX. Transaction: ${hash.slice(0, 8)}...`,
        variant: "default",
      });
      await refreshData();
    } catch (error) {
      console.error("❌ Error borrowing APEX:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to borrow APEX",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const repayApex = async (amount: number) => {
    if (!walletClient || !account?.address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const hash = await transactionService.repayApex(walletClient, amount);
      toast({
        title: "Success",
        description: `Repaid ${amount} APEX. Transaction: ${hash.slice(0, 8)}...`,
        variant: "default",
      });
      await refreshData();
    } catch (error) {
      console.error("❌ Error repaying APEX:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to repay APEX",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    error,
    userPosition,
    protocolStats,
    dexReserves,
    tokenBalances,
    
    // Functions
    refreshData,
    addCollateral,
    withdrawCollateral,
    borrowApex,
    repayApex,
  };
}; 