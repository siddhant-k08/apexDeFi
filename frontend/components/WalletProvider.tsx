import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { NETWORK, APTOS_API_KEY } from "@/constants";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK as any, aptosApiKeys: {[NETWORK]: APTOS_API_KEY} }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
