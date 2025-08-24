import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { NETWORK, CUSTOM_TESTNET_RPC, DEFAULT_TESTNET_RPC } from "@/constants";

export const aptosClient = () => {
  // Try custom RPC first, fallback to default
  const fullnodeUrl = CUSTOM_TESTNET_RPC || DEFAULT_TESTNET_RPC;
  
  console.log("🔧 Creating Aptos client with config:", {
    network: NETWORK,
    fullnode: fullnodeUrl,
    faucet: "https://faucet.testnet.aptoslabs.com"
  });
  
  const config = new AptosConfig({
    network: NETWORK as Network,
    fullnode: fullnodeUrl,
    faucet: "https://faucet.testnet.aptoslabs.com",
  });

  return new Aptos(config);
};
