module apex_lending::apex_dex {
    use std::signer;
    use std::string;
    use std::option;
    use aptos_framework::coin::{Self, Coin, MintCapability, BurnCapability};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::AptosCoin;

    use apex_lending::apex_token::APEX;

    /// The type identifier of LP tokens.
    struct LPToken has key {}

    /// The `ApexDEX` resource. This holds the DEX state and capabilities.
    struct ApexDEX has key {
        apt_reserves: Coin<AptosCoin>,
        apex_reserves: Coin<APEX>,
        lp_mint_cap: MintCapability<LPToken>,
        lp_burn_cap: BurnCapability<LPToken>,
        swap_events: EventHandle<SwapEvent>,
        liquidity_events: EventHandle<LiquidityEvent>,
    }

    /// Events emitted when swaps occur.
    struct SwapEvent has drop, store {
        swapper: address,
        input_token: vector<u8>,
        input_amount: u64,
        output_token: vector<u8>,
        output_amount: u64,
        timestamp: u64,
    }

    /// Events emitted when liquidity is provided or removed.
    struct LiquidityEvent has drop, store {
        user: address,
        action: vector<u8>, // "add" or "remove"
        apt_amount: u64,
        apex_amount: u64,
        lp_tokens: u64,
        timestamp: u64,
    }

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINSUFFICIENT_LIQUIDITY: u64 = 2;
    const EINVALID_AMOUNT: u64 = 3;
    const EINSUFFICIENT_BALANCE: u64 = 4;
    const EZERO_LIQUIDITY: u64 = 6;
    const EALREADY_INITIALIZED: u64 = 7;

    /// Initialize the APEXDEX.
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<ApexDEX>(account_addr), EALREADY_INITIALIZED);

        // Initialize LP token
        let (lp_burn_cap, lp_freeze_cap, lp_mint_cap) = coin::initialize<LPToken>(
            account,
            string::utf8(b"APEX-APT LP"),
            string::utf8(b"LP"),
            8,
            true, // monitor_supply
        );
        
        // Destroy the freeze capability as we don't need it for LP tokens
        coin::destroy_freeze_cap(lp_freeze_cap);

        // Store the DEX state
        move_to(account, ApexDEX {
            apt_reserves: coin::zero<AptosCoin>(),
            apex_reserves: coin::zero<APEX>(),
            lp_mint_cap,
            lp_burn_cap,
            swap_events: account::new_event_handle<SwapEvent>(account),
            liquidity_events: account::new_event_handle<LiquidityEvent>(account),
        });
    }

    /// Initialize DEX with initial liquidity for testing
    /// This function adds initial liquidity to make the DEX functional immediately
    public entry fun initialize_with_liquidity(
        account: &signer,
        apt_amount: u64,
        apex_amount: u64,
    ) acquires ApexDEX {
        let account_addr = signer::address_of(account);
        let dex = borrow_global_mut<ApexDEX>(account_addr);
        
        assert!(apt_amount > 0 && apex_amount > 0, EINVALID_AMOUNT);
        
        // Transfer tokens from user to DEX
        let apt_coins = coin::withdraw<AptosCoin>(account, apt_amount);
        let apex_coins = coin::withdraw<APEX>(account, apex_amount);
        
        coin::merge(&mut dex.apt_reserves, apt_coins);
        coin::merge(&mut dex.apex_reserves, apex_coins);
        
        // Mint LP tokens to the user (simple formula for initial liquidity)
        let lp_tokens = (apt_amount * apex_amount) / 1000000; // Simple formula
        if (lp_tokens > 0) {
            let lp_coins = coin::mint<LPToken>(lp_tokens, &dex.lp_mint_cap);
            coin::deposit(account_addr, lp_coins);
        };
        
        // Emit liquidity event
        event::emit_event(&mut dex.liquidity_events, LiquidityEvent {
            user: account_addr,
            action: b"add",
            apt_amount,
            apex_amount,
            lp_tokens,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Calculate the output amount for a given input amount using the constant product formula.
    /// Formula: output = (input * output_reserves) / (input_reserves + input)
    public fun calculate_output_amount(
        input_amount: u64,
        input_reserves: u64,
        output_reserves: u64,
    ): u64 {
        if (input_reserves == 0 || output_reserves == 0) {
            return 0
        };
        let numerator = input_amount * output_reserves;
        let denominator = input_reserves + input_amount;
        numerator / denominator
    }

    /// Get the current price of APT in APEX.
    #[view]
    public fun get_apt_price(dex_owner: address): u64 acquires ApexDEX {
        let dex = borrow_global<ApexDEX>(dex_owner);
        let apt_reserves = coin::value(&dex.apt_reserves);
        let apex_reserves = coin::value(&dex.apex_reserves);
        
        if (apt_reserves == 0) {
            return 0
        };
        
        // Price = APEX reserves / APT reserves
        apex_reserves / apt_reserves
    }

    /// Get the current price of APEX in APT.
    #[view]
    public fun get_apex_price(dex_owner: address): u64 acquires ApexDEX {
        let dex = borrow_global<ApexDEX>(dex_owner);
        let apt_reserves = coin::value(&dex.apt_reserves);
        let apex_reserves = coin::value(&dex.apex_reserves);
        
        if (apex_reserves == 0) {
            return 0
        };
        
        // Price = APT reserves / APEX reserves
        apt_reserves / apex_reserves
    }

    /// Swap APT for APEX.
    public entry fun swap_apt_to_apex(
        user: &signer,
        dex_owner: address,
        apt_amount: u64,
    ) acquires ApexDEX {
        assert!(apt_amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        let dex = borrow_global_mut<ApexDEX>(dex_owner);
        
        let apt_reserves = coin::value(&dex.apt_reserves);
        let apex_reserves = coin::value(&dex.apex_reserves);
        
        assert!(apt_reserves > 0 && apex_reserves > 0, EINSUFFICIENT_LIQUIDITY);
        
        // Calculate output amount
        let apex_output = calculate_output_amount(apt_amount, apt_reserves, apex_reserves);
        assert!(apex_output > 0, EINSUFFICIENT_LIQUIDITY);
        
        // Transfer APT from user to DEX
        let apt_coins = coin::withdraw<AptosCoin>(user, apt_amount);
        coin::merge(&mut dex.apt_reserves, apt_coins);
        
        // Transfer APEX from DEX to user
        let apex_coins = coin::extract(&mut dex.apex_reserves, apex_output);
        coin::deposit(user_addr, apex_coins);
        
        // Emit swap event
        event::emit_event(&mut dex.swap_events, SwapEvent {
            swapper: user_addr,
            input_token: b"APT",
            input_amount: apt_amount,
            output_token: b"APEX",
            output_amount: apex_output,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Swap APEX for APT.
    public entry fun swap_apex_to_apt(
        user: &signer,
        dex_owner: address,
        apex_amount: u64,
    ) acquires ApexDEX {
        assert!(apex_amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        let dex = borrow_global_mut<ApexDEX>(dex_owner);
        
        let apt_reserves = coin::value(&dex.apt_reserves);
        let apex_reserves = coin::value(&dex.apex_reserves);
        
        assert!(apt_reserves > 0 && apex_reserves > 0, EINSUFFICIENT_LIQUIDITY);
        
        // Calculate output amount
        let apt_output = calculate_output_amount(apex_amount, apex_reserves, apt_reserves);
        assert!(apt_output > 0, EINSUFFICIENT_LIQUIDITY);
        
        // Transfer APEX from user to DEX
        let apex_coins = coin::withdraw<APEX>(user, apex_amount);
        coin::merge(&mut dex.apex_reserves, apex_coins);
        
        // Transfer APT from DEX to user
        let apt_coins = coin::extract(&mut dex.apt_reserves, apt_output);
        coin::deposit(user_addr, apt_coins);
        
        // Emit swap event
        event::emit_event(&mut dex.swap_events, SwapEvent {
            swapper: user_addr,
            input_token: b"APEX",
            input_amount: apex_amount,
            output_token: b"APT",
            output_amount: apt_output,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Add liquidity to the DEX.
    public entry fun add_liquidity(
        user: &signer,
        dex_owner: address,
        apt_amount: u64,
        apex_amount: u64,
    ) acquires ApexDEX {
        assert!(apt_amount > 0 && apex_amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        let dex = borrow_global_mut<ApexDEX>(dex_owner);
        
        let apt_reserves = coin::value(&dex.apt_reserves);
        let apex_reserves = coin::value(&dex.apex_reserves);
        
        let lp_supply = coin::supply<LPToken>();
        let lp_supply_value = if (option::is_some(&lp_supply)) {
            *option::borrow(&lp_supply) as u64
        } else {
            0
        };
        
        let lp_tokens_to_mint = if (lp_supply_value == 0) {
            // Initial liquidity provision
            apt_amount
        } else {
            // Calculate LP tokens based on the smaller ratio
            let apt_ratio = (apt_amount * lp_supply_value) / apt_reserves;
            let apex_ratio = (apex_amount * lp_supply_value) / apex_reserves;
            if (apt_ratio < apex_ratio) apt_ratio else apex_ratio
        };
        
        assert!(lp_tokens_to_mint > 0, EINVALID_AMOUNT);
        
        // Transfer APT from user to DEX
        let apt_coins = coin::withdraw<AptosCoin>(user, apt_amount);
        coin::merge(&mut dex.apt_reserves, apt_coins);
        
        // Transfer APEX from user to DEX
        let apex_coins = coin::withdraw<APEX>(user, apex_amount);
        coin::merge(&mut dex.apex_reserves, apex_coins);
        
        // Mint LP tokens to user
        let lp_coins = coin::mint<LPToken>(lp_tokens_to_mint, &dex.lp_mint_cap);
        coin::deposit(user_addr, lp_coins);
        
        // Emit liquidity event
        event::emit_event(&mut dex.liquidity_events, LiquidityEvent {
            user: user_addr,
            action: b"add",
            apt_amount,
            apex_amount,
            lp_tokens: lp_tokens_to_mint,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Remove liquidity from the DEX.
    public entry fun remove_liquidity(
        user: &signer,
        dex_owner: address,
        lp_amount: u64,
    ) acquires ApexDEX {
        assert!(lp_amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        let dex = borrow_global_mut<ApexDEX>(dex_owner);
        
        let apt_reserves = coin::value(&dex.apt_reserves);
        let apex_reserves = coin::value(&dex.apex_reserves);
        
        let lp_supply = coin::supply<LPToken>();
        let lp_supply_value = if (option::is_some(&lp_supply)) {
            *option::borrow(&lp_supply) as u64
        } else {
            0
        };
        
        assert!(lp_supply_value > 0, EZERO_LIQUIDITY);
        
        // Calculate amounts to return
        let apt_amount = (lp_amount * apt_reserves) / lp_supply_value;
        let apex_amount = (lp_amount * apex_reserves) / lp_supply_value;
        
        assert!(apt_amount > 0 && apex_amount > 0, EINVALID_AMOUNT);
        
        // Burn LP tokens from user
        let lp_coins = coin::withdraw<LPToken>(user, lp_amount);
        coin::burn(lp_coins, &dex.lp_burn_cap);
        
        // Transfer APT from DEX to user
        let apt_coins = coin::extract(&mut dex.apt_reserves, apt_amount);
        coin::deposit(user_addr, apt_coins);
        
        // Transfer APEX from DEX to user
        let apex_coins = coin::extract(&mut dex.apex_reserves, apex_amount);
        coin::deposit(user_addr, apex_coins);
        
        // Emit liquidity event
        event::emit_event(&mut dex.liquidity_events, LiquidityEvent {
            user: user_addr,
            action: b"remove",
            apt_amount,
            apex_amount,
            lp_tokens: lp_amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Get the current reserves of APT and APEX.
    #[view]
    public fun get_reserves(dex_owner: address): (u64, u64) acquires ApexDEX {
        let dex = borrow_global<ApexDEX>(dex_owner);
        (coin::value(&dex.apt_reserves), coin::value(&dex.apex_reserves))
    }

    /// Get the current LP token supply.
    #[view]
    public fun get_lp_supply(): u64 {
        let supply = coin::supply<LPToken>();
        if (option::is_some(&supply)) {
            *option::borrow(&supply) as u64
        } else {
            0
        }
    }

    /// Get the user's LP token balance.
    #[view]
    public fun get_lp_balance(user: address): u64 {
        coin::balance<LPToken>(user)
    }

    #[test_only]
    public fun init_module_for_test(account: &signer) {
        initialize(account);
    }
}