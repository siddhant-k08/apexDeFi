// Network and API Configuration
export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "testnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS;
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

// Protocol Configuration
export const COLLATERAL_RATIO = 1.2; // 120% collateral ratio
export const LIQUIDATION_RATIO = 1.2; // 120% liquidation threshold
export const INTEREST_RATE = 0.05; // 5% annual interest rate
export const BORROW_FEE = 0.001; // 0.1% borrow fee
export const REPAY_FEE = 0.0005; // 0.05% repay fee
export const LIQUIDATOR_REWARD = 0.1; // 10% liquidator reward

// Token Configuration
export const APT_DECIMALS = 8; // APT has 8 decimal places (octas)
export const APEX_DECIMALS = 8; // APEX has 8 decimal places (octas)
export const OCTAS_PER_TOKEN = Math.pow(10, 8); // 100,000,000 octas = 1 token

// Default Prices (fallbacks when live prices are unavailable)
export const DEFAULT_APT_PRICE = 4.70; // USD
export const DEFAULT_APEX_PRICE = 0.47; // USD

// DEX Configuration
export const DEX_APT_RESERVES = 1.0; // Initial APT reserves in DEX
export const DEX_APEX_RESERVES = 10.0; // Initial APEX reserves in DEX
export const DEX_EXCHANGE_RATE = 10; // 1 APT = 10 APEX

// UI Configuration
export const PRICE_CACHE_DURATION = 30000; // 30 seconds
export const DATA_REFRESH_INTERVAL = 30000; // 30 seconds
export const TRANSACTION_TIMEOUT = 60000; // 60 seconds

// Contract Addresses (deployed to testnet)
export const APEX_TOKEN_ADDRESS = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_token";
export const APEX_DEX_ADDRESS = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::apex_dex";
export const LENDING_ADDRESS = "0x4512963ba7f24126be6608b9c8081f013e193dc9ac8ccd6679d92c3eda2f4a5f::lending";

// Utility Functions
export const formatTokenAmount = (amount: number, decimals: number = 8): number => {
  return amount / Math.pow(10, decimals);
};

export const parseTokenAmount = (amount: number, decimals: number = 8): number => {
  return amount * Math.pow(10, decimals);
};

export const calculateCollateralRatio = (collateralValue: number, debtValue: number): number => {
  return debtValue > 0 ? (collateralValue / debtValue) * 100 : 0;
};

export const calculateBorrowingCapacity = (collateralValue: number): number => {
  return collateralValue / COLLATERAL_RATIO;
};
