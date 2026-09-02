module counter_addr::counter {
    struct Counter has key {
        value: u64,
    }

    public fun create(account: &signer) {
        move_to(account, Counter { value: 0 });   // the Counter now BELONGS to this account — linearly, enforced
    }

    public fun increment(addr: address) acquires Counter {
        let counter = borrow_global_mut<Counter>(addr);
        counter.value = counter.value + 1;
    }

    public fun get(addr: address): u64 acquires Counter {
        borrow_global<Counter>(addr).value
    }
}