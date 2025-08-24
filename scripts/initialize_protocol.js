const { execSync } = require('child_process');

// Configuration
const NETWORK_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const INITIAL_APEX_SUPPLY = "100000000000000"; // 1,000,000 APEX tokens (with 8 decimals)
const INITIAL_APT_LIQUIDITY = "10000000000"; // 100 APT (with 8 decimals)
const INITIAL_APEX_LIQUIDITY = "100000000000"; // 1,000 APEX (with 8 decimals)

async function initializeProtocol() {
  console.log("🚀 Starting Protocol Initialization...\n");

  try {
    // Step 1: Initialize APEX token with initial supply
    console.log("📝 Step 1: Minting initial APEX tokens...");
    const mintCommand = `aptos move run --function-id apex_lending::apex_token::initialize_with_supply --args ${INITIAL_APEX_SUPPLY} --url ${NETWORK_URL}`;
    console.log(`Command: ${mintCommand}`);
    execSync(mintCommand, { stdio: 'inherit' });
    console.log("✅ APEX tokens minted successfully!\n");

    // Step 2: Initialize DEX with initial liquidity
    console.log("📝 Step 2: Adding initial liquidity to DEX...");
    const liquidityCommand = `aptos move run --function-id apex_lending::apex_dex::initialize_with_liquidity --args ${INITIAL_APT_LIQUIDITY} ${INITIAL_APEX_LIQUIDITY} --url ${NETWORK_URL}`;
    console.log(`Command: ${liquidityCommand}`);
    execSync(liquidityCommand, { stdio: 'inherit' });
    console.log("✅ Initial liquidity added successfully!\n");

    // Step 3: Verify the setup
    console.log("📝 Step 3: Verifying protocol setup...");
    
    // Check APEX supply
    const supplyCommand = `aptos move view --function-id apex_lending::apex_token::get_supply --url ${NETWORK_URL}`;
    console.log("Checking APEX supply...");
    execSync(supplyCommand, { stdio: 'inherit' });
    
    // Check DEX reserves
    const reservesCommand = `aptos move view --function-id apex_lending::apex_dex::get_reserves --args address:$(aptos config show-profiles --profile default | grep 'account' | awk '{print $2}') --url ${NETWORK_URL}`;
    console.log("Checking DEX reserves...");
    execSync(reservesCommand, { stdio: 'inherit' });
    
    // Check APT price
    const priceCommand = `aptos move view --function-id apex_lending::apex_dex::get_apt_price --args address:$(aptos config show-profiles --profile default | grep 'account' | awk '{print $2}') --url ${NETWORK_URL}`;
    console.log("Checking APT price...");
    execSync(priceCommand, { stdio: 'inherit' });

    console.log("\n🎉 Protocol Initialization Complete!");
    console.log("✅ APEX tokens minted");
    console.log("✅ DEX liquidity added");
    console.log("✅ Protocol ready for use");
    
    console.log("\n📊 Summary:");
    console.log(`- APEX Supply: ${parseInt(INITIAL_APEX_SUPPLY) / 100000000} APEX`);
    console.log(`- DEX Liquidity: ${parseInt(INITIAL_APT_LIQUIDITY) / 100000000} APT + ${parseInt(INITIAL_APEX_LIQUIDITY) / 100000000} APEX`);
    console.log(`- Price Ratio: ~${parseInt(INITIAL_APEX_LIQUIDITY) / parseInt(INITIAL_APT_LIQUIDITY)} APEX per APT`);

  } catch (error) {
    console.error("❌ Error during initialization:", error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeProtocol();