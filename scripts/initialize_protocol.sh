#!/bin/bash

# Apex DeFi Protocol Initialization Script
# This script initializes the protocol with tokens and liquidity

set -e

# Configuration
NETWORK_URL="https://fullnode.testnet.aptoslabs.com/v1"
INITIAL_APEX_SUPPLY="100000000000000"  # 1,000,000 APEX tokens (with 8 decimals)
INITIAL_APT_LIQUIDITY="10000000000"    # 100 APT (with 8 decimals)
INITIAL_APEX_LIQUIDITY="100000000000"  # 1,000 APEX (with 8 decimals)

echo "🚀 Starting Apex DeFi Protocol Initialization..."
echo ""

# Get the current account address
ACCOUNT_ADDRESS=$(aptos config show-profiles --profile default | grep 'account' | awk '{print $2}')
echo "📍 Using account: $ACCOUNT_ADDRESS"
echo ""

# Step 1: Mint initial APEX tokens
echo "📝 Step 1: Minting initial APEX tokens..."
echo "Command: aptos move run --function-id $ACCOUNT_ADDRESS::apex_token::initialize_with_supply --args $INITIAL_APEX_SUPPLY --url $NETWORK_URL"
aptos move run --function-id "$ACCOUNT_ADDRESS::apex_token::initialize_with_supply" --args "$INITIAL_APEX_SUPPLY" --url "$NETWORK_URL"
echo "✅ APEX tokens minted successfully!"
echo ""

# Step 2: Add initial liquidity to DEX
echo "📝 Step 2: Adding initial liquidity to DEX..."
echo "Command: aptos move run --function-id $ACCOUNT_ADDRESS::apex_dex::initialize_with_liquidity --args $INITIAL_APT_LIQUIDITY $INITIAL_APEX_LIQUIDITY --url $NETWORK_URL"
aptos move run --function-id "$ACCOUNT_ADDRESS::apex_dex::initialize_with_liquidity" --args "$INITIAL_APT_LIQUIDITY" "$INITIAL_APEX_LIQUIDITY" --url "$NETWORK_URL"
echo "✅ Initial liquidity added successfully!"
echo ""

# Step 3: Verify the setup
echo "📝 Step 3: Verifying protocol setup..."
echo ""

echo "🔍 Checking APEX supply..."
aptos move view --function-id "$ACCOUNT_ADDRESS::apex_token::get_supply" --url "$NETWORK_URL"
echo ""

echo "🔍 Checking DEX reserves..."
aptos move view --function-id "$ACCOUNT_ADDRESS::apex_dex::get_reserves" --args "address:$ACCOUNT_ADDRESS" --url "$NETWORK_URL"
echo ""

echo "🔍 Checking APT price..."
aptos move view --function-id "$ACCOUNT_ADDRESS::apex_dex::get_apt_price" --args "address:$ACCOUNT_ADDRESS" --url "$NETWORK_URL"
echo ""

echo "🎉 Protocol Initialization Complete!"
echo "✅ APEX tokens minted"
echo "✅ DEX liquidity added"
echo "✅ Protocol ready for use"
echo ""

echo "📊 Summary:"
echo "- APEX Supply: $((INITIAL_APEX_SUPPLY / 100000000)) APEX"
echo "- DEX Liquidity: $((INITIAL_APT_LIQUIDITY / 100000000)) APT + $((INITIAL_APEX_LIQUIDITY / 100000000)) APEX"
echo "- Price Ratio: ~$((INITIAL_APEX_LIQUIDITY / INITIAL_APT_LIQUIDITY)) APEX per APT"
echo ""

echo "🌐 Frontend should now work properly with:"
echo "- Functional swap operations"
echo "- Real price data"
echo "- Working lending protocol"