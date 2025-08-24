import { NETWORK, APTOS_API_KEY } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

// Create config with optional API key
const config: any = { network: NETWORK };
if (APTOS_API_KEY) {
  config.clientConfig = { API_KEY: APTOS_API_KEY };
}

const aptos = new Aptos(new AptosConfig(config));

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}
