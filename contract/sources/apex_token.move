module apex_lending::apex_token {
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::coin::{Self, BurnCapability, FreezeCapability, MintCapability};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::signer;
    use aptos_framework::timestamp;

    /// The type identifier of APEX coins.
    struct APEX has key {}

    /// The `ApexLending` resource. This holds the capabilities
    /// to mint and burn APEX coins.
    struct ApexLending has key {
        burn_cap: BurnCapability<APEX>,
        freeze_cap: FreezeCapability<APEX>,
        mint_cap: MintCapability<APEX>,
        mint_events: EventHandle<MintEvent>,
        burn_events: EventHandle<BurnEvent>,
        freeze_events: EventHandle<FreezeEvent>,
        unfreeze_events: EventHandle<UnfreezeEvent>,
    }

    /// Events emitted when APEX coins are minted.
    struct MintEvent has drop, store {
        amount: u64,
        to: address,
    }

    /// Events emitted when APEX coins are burned.
    struct BurnEvent has drop, store {
        amount: u64,
        from: address,
    }

    /// Events emitted when APEX coins are frozen.
    struct FreezeEvent has drop, store {
        account: address,
    }

    /// Events emitted when APEX coins are unfrozen.
    struct UnfreezeEvent has drop, store {
        account: address,
    }

    /// The maximum supply of APEX coins.
    const MAX_SUPPLY: u64 = 1000000000000000; // 1 quadrillion APEX

    /// The decimals of APEX coins.
    const DECIMALS: u8 = 8;

    /// The name of APEX coins.
    const NAME: vector<u8> = b"APEX";

    /// The symbol of APEX coins.
    const SYMBOL: vector<u8> = b"APEX";

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINSUFFICIENT_BALANCE: u64 = 2;
    const EINVALID_AMOUNT: u64 = 3;
    const EMAX_SUPPLY_EXCEEDED: u64 = 4;
    const EALREADY_INITIALIZED: u64 = 5;

    /// Initialize the APEX coin.
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<ApexLending>(account_addr), EALREADY_INITIALIZED);

        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<APEX>(
            account,
            string::utf8(NAME),
            string::utf8(SYMBOL),
            DECIMALS,
            true, // monitor_supply
        );

        move_to(account, ApexLending {
            burn_cap,
            freeze_cap,
            mint_cap,
            mint_events: account::new_event_handle<MintEvent>(account),
            burn_events: account::new_event_handle<BurnEvent>(account),
            freeze_events: account::new_event_handle<FreezeEvent>(account),
            unfreeze_events: account::new_event_handle<UnfreezeEvent>(account),
        });
    }

    /// Initialize with initial token supply for testing
    /// This function mints initial tokens to the deployer for DEX liquidity
    public entry fun initialize_with_supply(
        account: &signer,
        initial_supply: u64,
    ) acquires ApexLending {
        let account_addr = signer::address_of(account);
        let apex_lending = borrow_global_mut<ApexLending>(account_addr);
        
        // Mint initial supply to the deployer
        let apex_coins = coin::mint<APEX>(initial_supply, &apex_lending.mint_cap);
        coin::deposit(account_addr, apex_coins);
        
        // Emit mint event
        event::emit_event(&mut apex_lending.mint_events, MintEvent {
            to: account_addr,
            amount: initial_supply,
        });
    }

    /// Mint APEX coins to the specified address.
    /// Only the account that initialized the coin can call this function.
    public entry fun mint_to(
        account: &signer,
        to: address,
        amount: u64,
    ) acquires ApexLending {
        let account_addr = signer::address_of(account);
        let apex_lending = borrow_global_mut<ApexLending>(account_addr);
        
        // Check if the amount is valid
        assert!(amount > 0, EINVALID_AMOUNT);
        
        // Check if minting would exceed max supply
        let current_supply = coin::supply<APEX>();
        if (option::is_some(&current_supply)) {
            let supply_value = *option::borrow(&current_supply);
            assert!((supply_value as u64) + amount <= MAX_SUPPLY, EMAX_SUPPLY_EXCEEDED);
        };

        let coins = coin::mint<APEX>(amount, &apex_lending.mint_cap);
        coin::deposit(to, coins);

        // Emit mint event
        event::emit_event(&mut apex_lending.mint_events, MintEvent {
            amount,
            to,
        });
    }

    /// Burn APEX coins from the specified address.
    /// Only the account that initialized the coin can call this function.
    public entry fun burn_from(
        account: &signer,
        from: address,
        amount: u64,
    ) acquires ApexLending {
        let account_addr = signer::address_of(account);
        let apex_lending = borrow_global_mut<ApexLending>(account_addr);
        
        // Check if the amount is valid
        assert!(amount > 0, EINVALID_AMOUNT);

        let coins = coin::withdraw<APEX>(account, amount);
        coin::burn(coins, &apex_lending.burn_cap);

        // Emit burn event
        event::emit_event(&mut apex_lending.burn_events, BurnEvent {
            amount,
            from,
        });
    }

    /// Freeze APEX coins for the specified address.
    /// Only the account that initialized the coin can call this function.
    public entry fun freeze_coin_store(
        account: &signer,
        target: address,
    ) acquires ApexLending {
        let account_addr = signer::address_of(account);
        let apex_lending = borrow_global_mut<ApexLending>(account_addr);

        coin::freeze_coin_store<APEX>(target, &apex_lending.freeze_cap);

        // Emit freeze event
        event::emit_event(&mut apex_lending.freeze_events, FreezeEvent {
            account: target,
        });
    }

    /// Unfreeze APEX coins for the specified address.
    /// Only the account that initialized the coin can call this function.
    public entry fun unfreeze_coin_store(
        account: &signer,
        target: address,
    ) acquires ApexLending {
        let account_addr = signer::address_of(account);
        let apex_lending = borrow_global_mut<ApexLending>(account_addr);

        coin::unfreeze_coin_store<APEX>(target, &apex_lending.freeze_cap);

        // Emit unfreeze event
        event::emit_event(&mut apex_lending.unfreeze_events, UnfreezeEvent {
            account: target,
        });
    }

    /// Get the current supply of APEX coins.
    #[view]
    public fun get_supply(): u64 {
        let supply = coin::supply<APEX>();
        if (option::is_some(&supply)) {
            *option::borrow(&supply) as u64
        } else {
            0
        }
    }

    /// Get the maximum supply of APEX coins.
    #[view]
    public fun get_max_supply(): u64 {
        MAX_SUPPLY
    }

    /// Get the decimals of APEX coins.
    #[view]
    public fun get_decimals(): u8 {
        DECIMALS
    }

    /// Get the name of APEX coins.
    #[view]
    public fun get_name(): String {
        string::utf8(NAME)
    }

    /// Get the symbol of APEX coins.
    #[view]
    public fun get_symbol(): String {
        string::utf8(SYMBOL)
    }

    #[test_only]
    public fun init_module_for_test(account: &signer) {
        initialize(account);
    }
}