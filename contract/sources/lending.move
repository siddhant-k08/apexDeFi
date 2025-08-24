module apex_lending::lending {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::AptosCoin;

    use apex_lending::apex_token::APEX;
    use apex_lending::apex_dex;

    /// The `Lending` resource. This holds the lending protocol state.
    struct Lending has key {
        apt_collateral: Coin<AptosCoin>,
        apex_borrowed: Coin<APEX>,
        protocol_fees: Coin<APEX>,
        is_paused: bool,
        collateral_events: EventHandle<CollateralEvent>,
        borrow_events: EventHandle<BorrowEvent>,
        repay_events: EventHandle<RepayEvent>,
        liquidation_events: EventHandle<LiquidationEvent>,
    }

    /// User position data
    struct UserPosition has key {
        collateral_amount: u64,
        borrowed_amount: u64,
        interest_accrued: u64,
        last_updated: u64,
    }

    /// Events emitted when collateral is added or withdrawn.
    struct CollateralEvent has drop, store {
        user: address,
        action: vector<u8>, // "add" or "withdraw"
        amount: u64,
        price: u64,
        timestamp: u64,
    }

    /// Events emitted when APEX is borrowed.
    struct BorrowEvent has drop, store {
        user: address,
        amount: u64,
        price: u64,
        timestamp: u64,
    }

    /// Events emitted when APEX is repaid.
    struct RepayEvent has drop, store {
        user: address,
        amount: u64,
        price: u64,
        timestamp: u64,
    }

    /// Events emitted when positions are liquidated.
    struct LiquidationEvent has drop, store {
        user: address,
        liquidator: address,
        collateral_liquidated: u64,
        debt_repaid: u64,
        liquidator_reward: u64,
        price: u64,
        timestamp: u64,
    }

    /// The collateralization ratio required (120% = 12000 basis points).
    const COLLATERAL_RATIO: u64 = 12000; // 120%

    /// The liquidator reward percentage (10% = 1000 basis points).
    const LIQUIDATOR_REWARD: u64 = 1000; // 10%

    /// The basis points denominator.
    const BASIS_POINTS: u64 = 10000;

    /// Annual interest rate (5% = 500 basis points).
    const ANNUAL_INTEREST_RATE: u64 = 500; // 5%

    /// Seconds in a year (approximate).
    const SECONDS_PER_YEAR: u64 = 31536000; // 365 days * 24 hours * 60 minutes * 60 seconds

    /// Protocol fee on borrows (0.1% = 10 basis points).
    const BORROW_FEE: u64 = 10; // 0.1%

    /// Protocol fee on repayments (0.05% = 5 basis points).
    const REPAY_FEE: u64 = 5; // 0.05%

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_AMOUNT: u64 = 2;
    const EINSUFFICIENT_COLLATERAL: u64 = 3;
    const EUNSAFE_POSITION: u64 = 4;
    const EINSUFFICIENT_BORROWED: u64 = 5;
    const ENOT_LIQUIDATABLE: u64 = 6;
    const EINSUFFICIENT_LIQUIDATOR_BALANCE: u64 = 7;
    const EZERO_COLLATERAL: u64 = 8;
    const EALREADY_INITIALIZED: u64 = 9;
    const EINSUFFICIENT_INTEREST_PAYMENT: u64 = 10;
    const EPROTOCOL_PAUSED: u64 = 11;

    /// Initialize the Lending protocol.
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<Lending>(account_addr), EALREADY_INITIALIZED);

        // Store the lending state
        move_to(account, Lending {
            apt_collateral: coin::zero<AptosCoin>(),
            apex_borrowed: coin::zero<APEX>(),
            protocol_fees: coin::zero<APEX>(),
            is_paused: false,
            collateral_events: account::new_event_handle<CollateralEvent>(account),
            borrow_events: account::new_event_handle<BorrowEvent>(account),
            repay_events: account::new_event_handle<RepayEvent>(account),
            liquidation_events: account::new_event_handle<LiquidationEvent>(account),
        });
    }

    /// Add APT collateral to the user's position.
    public entry fun add_collateral(
        user: &signer,
        lending_owner: address,
        dex_owner: address,
        amount: u64,
    ) acquires Lending, UserPosition {
        assert!(amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        
        // Check if protocol is paused
        check_not_paused(lending_owner);
        
        let lending = borrow_global_mut<Lending>(lending_owner);
        
        // Transfer APT from user to lending protocol
        let apt_coins = coin::withdraw<AptosCoin>(user, amount);
        coin::merge(&mut lending.apt_collateral, apt_coins);
        
        // Update or create user position
        if (!exists<UserPosition>(user_addr)) {
            move_to(user, UserPosition {
                collateral_amount: amount,
                borrowed_amount: 0,
                interest_accrued: 0,
                last_updated: timestamp::now_seconds(),
            });
        } else {
            let position = borrow_global_mut<UserPosition>(user_addr);
            position.collateral_amount = position.collateral_amount + amount;
            position.last_updated = timestamp::now_seconds();
        };
        
        // Emit collateral event
        let current_price = apex_dex::get_apt_price(dex_owner);
        event::emit_event(&mut lending.collateral_events, CollateralEvent {
            user: user_addr,
            action: b"add",
            amount,
            price: current_price,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Withdraw APT collateral from the user's position.
    public entry fun withdraw_collateral(
        user: &signer,
        lending_owner: address,
        dex_owner: address,
        amount: u64,
    ) acquires Lending, UserPosition {
        assert!(amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        
        // Check if protocol is paused
        check_not_paused(lending_owner);
        
        assert!(exists<UserPosition>(user_addr), EINSUFFICIENT_COLLATERAL);
        
        let position = borrow_global_mut<UserPosition>(user_addr);
        assert!(position.collateral_amount >= amount, EINSUFFICIENT_COLLATERAL);
        
        // Check if withdrawal would make position unsafe
        let new_collateral = position.collateral_amount - amount;
        let current_price = apex_dex::get_apt_price(dex_owner);
        let collateral_value = new_collateral * current_price;
        let borrowed_value = position.borrowed_amount;
        
        if (borrowed_value > 0) {
            let position_ratio = (collateral_value * BASIS_POINTS) / borrowed_value;
            assert!(position_ratio >= COLLATERAL_RATIO, EUNSAFE_POSITION);
        };
        
        // Update position
        position.collateral_amount = new_collateral;
        position.last_updated = timestamp::now_seconds();
        
        // Transfer APT from lending protocol to user
        let lending = borrow_global_mut<Lending>(lending_owner);
        let apt_coins = coin::extract(&mut lending.apt_collateral, amount);
        coin::deposit(user_addr, apt_coins);
        
        // Emit collateral event
        event::emit_event(&mut lending.collateral_events, CollateralEvent {
            user: user_addr,
            action: b"withdraw",
            amount,
            price: current_price,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Borrow APEX against APT collateral.
    public entry fun borrow_apex(
        user: &signer,
        lending_owner: address,
        dex_owner: address,
        amount: u64,
    ) acquires Lending, UserPosition {
        assert!(amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        
        // Check if protocol is paused
        check_not_paused(lending_owner);
        
        assert!(exists<UserPosition>(user_addr), EINSUFFICIENT_COLLATERAL);
        
        let position = borrow_global_mut<UserPosition>(user_addr);
        assert!(position.collateral_amount > 0, EZERO_COLLATERAL);
        
        // Update interest before borrowing
        let current_time = timestamp::now_seconds();
        let time_elapsed = current_time - position.last_updated;
        if (time_elapsed > 0 && position.borrowed_amount > 0) {
            let interest = (position.borrowed_amount * ANNUAL_INTEREST_RATE * time_elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            position.interest_accrued = position.interest_accrued + interest;
            position.last_updated = current_time;
        };
        
        // Calculate new borrowed amount
        let new_borrowed = position.borrowed_amount + amount;
        
        // Check if position would be safe after borrowing
        let current_price = apex_dex::get_apt_price(dex_owner);
        let collateral_value = position.collateral_amount * current_price;
        let position_ratio = (collateral_value * BASIS_POINTS) / new_borrowed;
        assert!(position_ratio >= COLLATERAL_RATIO, EUNSAFE_POSITION);
        
        // Calculate and collect protocol fee
        let fee_amount = (amount * BORROW_FEE) / BASIS_POINTS;
        let user_amount = amount - fee_amount;
        
        // Update position
        position.borrowed_amount = new_borrowed;
        position.last_updated = timestamp::now_seconds();
        
        // Transfer APEX from lending protocol to user (minus fee)
        let lending = borrow_global_mut<Lending>(lending_owner);
        let apex_coins = coin::extract(&mut lending.apex_borrowed, amount);
        
        // Split between user and protocol fees
        coin::deposit(user_addr, coin::extract(&mut apex_coins, user_amount));
        if (fee_amount > 0) {
            coin::merge(&mut lending.protocol_fees, apex_coins);
        } else {
            coin::destroy_zero(apex_coins);
        };
        
        // Emit borrow event
        event::emit_event(&mut lending.borrow_events, BorrowEvent {
            user: user_addr,
            amount,
            price: current_price,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Repay borrowed APEX.
    public entry fun repay_apex(
        user: &signer,
        lending_owner: address,
        dex_owner: address,
        amount: u64,
    ) acquires Lending, UserPosition {
        assert!(amount > 0, EINVALID_AMOUNT);
        
        let user_addr = signer::address_of(user);
        assert!(exists<UserPosition>(user_addr), EINSUFFICIENT_BORROWED);
        
        let position = borrow_global_mut<UserPosition>(user_addr);
        assert!(position.borrowed_amount >= amount, EINSUFFICIENT_BORROWED);
        
        // Update interest before repayment
        let current_time = timestamp::now_seconds();
        let time_elapsed = current_time - position.last_updated;
        if (time_elapsed > 0 && position.borrowed_amount > 0) {
            let interest = (position.borrowed_amount * ANNUAL_INTEREST_RATE * time_elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            position.interest_accrued = position.interest_accrued + interest;
            position.last_updated = current_time;
        };
        
        // Calculate and collect protocol fee
        let fee_amount = (amount * REPAY_FEE) / BASIS_POINTS;
        let protocol_amount = amount - fee_amount;
        
        // Update position
        position.borrowed_amount = position.borrowed_amount - amount;
        position.last_updated = timestamp::now_seconds();
        
        // Transfer APEX from user to lending protocol
        let lending = borrow_global_mut<Lending>(lending_owner);
        let apex_coins = coin::withdraw<APEX>(user, amount);
        
        // Split between protocol reserves and fees
        coin::merge(&mut lending.apex_borrowed, coin::extract(&mut apex_coins, protocol_amount));
        if (fee_amount > 0) {
            coin::merge(&mut lending.protocol_fees, apex_coins);
        } else {
            coin::destroy_zero(apex_coins);
        };
        
        // Emit repay event
        let current_price = apex_dex::get_apt_price(dex_owner);
        event::emit_event(&mut lending.repay_events, RepayEvent {
            user: user_addr,
            amount,
            price: current_price,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Repay accrued interest.
    public entry fun repay_interest(
        user: &signer,
        lending_owner: address,
        dex_owner: address,
    ) acquires Lending, UserPosition {
        let user_addr = signer::address_of(user);
        assert!(exists<UserPosition>(user_addr), EINSUFFICIENT_BORROWED);
        
        let position = borrow_global_mut<UserPosition>(user_addr);
        
        // Update interest before repayment
        let current_time = timestamp::now_seconds();
        let time_elapsed = current_time - position.last_updated;
        if (time_elapsed > 0 && position.borrowed_amount > 0) {
            let interest = (position.borrowed_amount * ANNUAL_INTEREST_RATE * time_elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            position.interest_accrued = position.interest_accrued + interest;
            position.last_updated = current_time;
        };
        
        let interest_to_repay = position.interest_accrued;
        assert!(interest_to_repay > 0, EINVALID_AMOUNT);
        
        // Reset interest accrued
        position.interest_accrued = 0;
        
        // Transfer APEX from user to lending protocol
        let lending = borrow_global_mut<Lending>(lending_owner);
        let apex_coins = coin::withdraw<APEX>(user, interest_to_repay);
        coin::merge(&mut lending.apex_borrowed, apex_coins);
        
        // Emit repay event
        let current_price = apex_dex::get_apt_price(dex_owner);
        event::emit_event(&mut lending.repay_events, RepayEvent {
            user: user_addr,
            amount: interest_to_repay,
            price: current_price,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Liquidate an unsafe position.
    public entry fun liquidate(
        liquidator: &signer,
        lending_owner: address,
        dex_owner: address,
        user: address,
    ) acquires Lending, UserPosition {
        let liquidator_addr = signer::address_of(liquidator);
        assert!(exists<UserPosition>(user), ENOT_LIQUIDATABLE);
        
        let position = borrow_global<UserPosition>(user);
        assert!(position.borrowed_amount > 0, ENOT_LIQUIDATABLE);
        
        // Check if position is liquidatable
        let current_price = apex_dex::get_apt_price(dex_owner);
        let collateral_value = position.collateral_amount * current_price;
        let position_ratio = (collateral_value * BASIS_POINTS) / position.borrowed_amount;
        assert!(position_ratio < COLLATERAL_RATIO, ENOT_LIQUIDATABLE);
        
        // Calculate liquidation amounts
        let debt_to_repay = position.borrowed_amount;
        let collateral_to_liquidate = position.collateral_amount;
        let liquidator_reward = (collateral_to_liquidate * LIQUIDATOR_REWARD) / BASIS_POINTS;
        
        // Check if liquidator has enough APEX to repay debt
        let liquidator_balance = coin::balance<APEX>(liquidator_addr);
        assert!(liquidator_balance >= debt_to_repay, EINSUFFICIENT_LIQUIDATOR_BALANCE);
        
        // Transfer APEX from liquidator to lending protocol
        let lending = borrow_global_mut<Lending>(lending_owner);
        let apex_coins = coin::withdraw<APEX>(liquidator, debt_to_repay);
        coin::merge(&mut lending.apex_borrowed, apex_coins);
        
        // Transfer collateral to liquidator
        let apt_coins = coin::extract(&mut lending.apt_collateral, collateral_to_liquidate);
        coin::deposit(liquidator_addr, coin::extract(&mut apt_coins, liquidator_reward));
        coin::merge(&mut lending.apt_collateral, apt_coins);
        
        // Clear user position
        let position_resource = move_from<UserPosition>(user);
        let UserPosition { collateral_amount: _, borrowed_amount: _, interest_accrued: _, last_updated: _ } = position_resource;
        
        // Emit liquidation event
        event::emit_event(&mut lending.liquidation_events, LiquidationEvent {
            user,
            liquidator: liquidator_addr,
            collateral_liquidated: collateral_to_liquidate,
            debt_repaid: debt_to_repay,
            liquidator_reward,
            price: current_price,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Check if a user's position is liquidatable.
    #[view]
    public fun is_liquidatable(user: address, dex_owner: address): bool acquires UserPosition {
        if (!exists<UserPosition>(user)) {
            return false
        };
        
        let position = borrow_global<UserPosition>(user);
        if (position.borrowed_amount == 0) {
            return false
        };
        
        let current_price = apex_dex::get_apt_price(dex_owner);
        let collateral_value = position.collateral_amount * current_price;
        let position_ratio = (collateral_value * BASIS_POINTS) / position.borrowed_amount;
        
        position_ratio < COLLATERAL_RATIO
    }

    /// Get a user's position data.
    #[view]
    public fun get_user_position(user: address): (u64, u64, u64, u64) acquires UserPosition {
        if (!exists<UserPosition>(user)) {
            return (0, 0, 0, 0)
        };
        
        let position = borrow_global<UserPosition>(user);
        (position.collateral_amount, position.borrowed_amount, position.interest_accrued, position.last_updated)
    }

    /// Calculate the collateral value for a user.
    #[view]
    public fun calculate_collateral_value(user: address, dex_owner: address): u64 acquires UserPosition {
        if (!exists<UserPosition>(user)) {
            return 0
        };
        
        let position = borrow_global<UserPosition>(user);
        let current_price = apex_dex::get_apt_price(dex_owner);
        position.collateral_amount * current_price
    }

    /// Calculate the position ratio for a user.
    #[view]
    public fun calculate_position_ratio(user: address, dex_owner: address): u64 acquires UserPosition {
        if (!exists<UserPosition>(user)) {
            return 0
        };
        
        let position = borrow_global<UserPosition>(user);
        if (position.borrowed_amount == 0) {
            return 0
        };
        
        let current_price = apex_dex::get_apt_price(dex_owner);
        let collateral_value = position.collateral_amount * current_price;
        (collateral_value * BASIS_POINTS) / position.borrowed_amount
    }

    /// Calculate accrued interest for a user.
    #[view]
    public fun calculate_accrued_interest(user: address): u64 acquires UserPosition {
        if (!exists<UserPosition>(user)) {
            return 0
        };
        
        let position = borrow_global<UserPosition>(user);
        if (position.borrowed_amount == 0) {
            return 0
        };
        
        let current_time = timestamp::now_seconds();
        let time_elapsed = current_time - position.last_updated;
        
        if (time_elapsed == 0) {
            return position.interest_accrued
        };
        
        // Calculate interest: (principal * rate * time) / (basis_points * seconds_per_year)
        let interest = (position.borrowed_amount * ANNUAL_INTEREST_RATE * time_elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        position.interest_accrued + interest
    }

    /// Check if protocol is paused.
    fun check_not_paused(lending_owner: address) acquires Lending {
        let lending = borrow_global<Lending>(lending_owner);
        assert!(!lending.is_paused, EPROTOCOL_PAUSED);
    }



    /// Get the total APT collateral in the protocol.
    #[view]
    public fun get_total_collateral(lending_owner: address): u64 acquires Lending {
        let lending = borrow_global<Lending>(lending_owner);
        coin::value(&lending.apt_collateral)
    }

    /// Get the total APEX borrowed from the protocol.
    #[view]
    public fun get_total_borrowed(lending_owner: address): u64 acquires Lending {
        let lending = borrow_global<Lending>(lending_owner);
        coin::value(&lending.apex_borrowed)
    }

    /// Get the collateralization ratio requirement.
    #[view]
    public fun get_collateral_ratio(): u64 {
        COLLATERAL_RATIO
    }

    /// Get the liquidator reward percentage.
    #[view]
    public fun get_liquidator_reward(): u64 {
        LIQUIDATOR_REWARD
    }

    /// Get the annual interest rate.
    #[view]
    public fun get_annual_interest_rate(): u64 {
        ANNUAL_INTEREST_RATE
    }

    /// Get the protocol fees collected.
    #[view]
    public fun get_protocol_fees(lending_owner: address): u64 acquires Lending {
        let lending = borrow_global<Lending>(lending_owner);
        coin::value(&lending.protocol_fees)
    }

    /// Get the borrow fee rate.
    #[view]
    public fun get_borrow_fee(): u64 {
        BORROW_FEE
    }

    /// Get the repay fee rate.
    #[view]
    public fun get_repay_fee(): u64 {
        REPAY_FEE
    }

    /// Pause the protocol (only lending owner can call).
    public entry fun pause_protocol(
        account: &signer,
        lending_owner: address,
    ) acquires Lending {
        let account_addr = signer::address_of(account);
        assert!(account_addr == lending_owner, ENOT_AUTHORIZED);
        
        let lending = borrow_global_mut<Lending>(lending_owner);
        lending.is_paused = true;
    }

    /// Unpause the protocol (only lending owner can call).
    public entry fun unpause_protocol(
        account: &signer,
        lending_owner: address,
    ) acquires Lending {
        let account_addr = signer::address_of(account);
        assert!(account_addr == lending_owner, ENOT_AUTHORIZED);
        
        let lending = borrow_global_mut<Lending>(lending_owner);
        lending.is_paused = false;
    }

    /// Check if protocol is paused.
    #[view]
    public fun is_paused(lending_owner: address): bool acquires Lending {
        let lending = borrow_global<Lending>(lending_owner);
        lending.is_paused
    }

    #[test_only]
    public fun init_module_for_test(account: &signer) {
        initialize(account);
    }
}