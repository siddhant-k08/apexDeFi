import { aptosClient } from "@/utils/aptosClient";
import { LENDING_ABI } from "@/utils/lending_abi";
import { DEX_ABI } from "@/utils/dex_abi";



export class TransactionService {
  private client: ReturnType<typeof aptosClient>;

  constructor() {
    this.client = aptosClient();
  }

  // Helper method to convert human amount to octas (8 decimal places)
  private toOctas(amount: number): bigint {
    return BigInt(Math.floor(amount * Math.pow(10, 8)));
  }

  // Add APT collateral to lending protocol
  async addCollateral(walletClient: any, amount: number): Promise<string> {
    try {
      const amountOctas = this.toOctas(amount);
      const lendingOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(LENDING_ABI).add_collateral({
        type_arguments: [],
        arguments: [lendingOwner, dexOwner, amountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error adding collateral:", error);
      throw error;
    }
  }

  // Withdraw APT collateral from lending protocol
  async withdrawCollateral(walletClient: any, amount: number): Promise<string> {
    try {
      const amountOctas = this.toOctas(amount);
      const lendingOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(LENDING_ABI).withdraw_collateral({
        type_arguments: [],
        arguments: [lendingOwner, dexOwner, amountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error withdrawing collateral:", error);
      throw error;
    }
  }

  // Borrow APEX tokens
  async borrowApex(walletClient: any, amount: number): Promise<string> {
    try {
      const amountOctas = this.toOctas(amount);
      const lendingOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(LENDING_ABI).borrow_apex({
        type_arguments: [],
        arguments: [lendingOwner, dexOwner, amountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error borrowing APEX:", error);
      throw error;
    }
  }

  // Repay APEX tokens
  async repayApex(walletClient: any, amount: number): Promise<string> {
    try {
      const amountOctas = this.toOctas(amount);
      const lendingOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(LENDING_ABI).repay_apex({
        type_arguments: [],
        arguments: [lendingOwner, dexOwner, amountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error repaying APEX:", error);
      throw error;
    }
  }

  // Repay accrued interest
  async repayInterest(walletClient: any): Promise<string> {
    try {
      const lendingOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(LENDING_ABI).repay_interest({
        type_arguments: [],
        arguments: [lendingOwner, dexOwner]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error repaying interest:", error);
      throw error;
    }
  }

  // Liquidate a user's position
  async liquidate(walletClient: any, userAddress: string): Promise<string> {
    try {
      const lendingOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(LENDING_ABI).liquidate({
        type_arguments: [],
        arguments: [lendingOwner, dexOwner, userAddress]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error liquidating position:", error);
      throw error;
    }
  }

  // Swap APT for APEX
  async swapAptToApex(walletClient: any, aptAmount: number): Promise<string> {
    try {
      const aptAmountOctas = this.toOctas(aptAmount);
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(DEX_ABI).swap_apt_to_apex({
        type_arguments: [],
        arguments: [dexOwner, aptAmountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error swapping APT to APEX:", error);
      throw error;
    }
  }

  // Swap APEX for APT
  async swapApexToApt(walletClient: any, apexAmount: number): Promise<string> {
    try {
      const apexAmountOctas = this.toOctas(apexAmount);
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(DEX_ABI).swap_apex_to_apt({
        type_arguments: [],
        arguments: [dexOwner, apexAmountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error swapping APEX to APT:", error);
      throw error;
    }
  }

  // Add liquidity to DEX
  async addLiquidity(walletClient: any, aptAmount: number, apexAmount: number): Promise<string> {
    try {
      const aptAmountOctas = this.toOctas(aptAmount);
      const apexAmountOctas = this.toOctas(apexAmount);
      const dexOwner = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f";
      
      const committedTransaction = await walletClient.useABI(DEX_ABI).add_liquidity({
        type_arguments: [],
        arguments: [dexOwner, aptAmountOctas.toString(), apexAmountOctas.toString()]
      });

      const executedTransaction = await this.client.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error("Error adding liquidity:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const transactionService = new TransactionService(); 