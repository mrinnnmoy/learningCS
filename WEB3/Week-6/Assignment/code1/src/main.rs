fn main() {
    let owner = String::from("Alice");
    let transactions: Vec<i64> = vec![100, -30, 50, -20, 200];

    // print_owner takes a REFERENCE (&String), so ownership of `owner`
    // stays with main() — we can keep using `owner` afterward, exactly
    // as the println! two lines below does.
    print_owner(&owner);

    // sum_transactions also borrows, for the same reason: main() still
    // needs `transactions` afterward, to print each individual step.
    let total = sum_transactions(&transactions);
    println!("Total balance for {}: {}", owner, total);

    println!("\nStep-by-step balance:");
    print_running_balance(&transactions);

    // Below is what happens when a function takes OWNERSHIP instead of
    // borrowing, and why that matters. Uncomment both lines to see the
    // compile error described in the comment above take_ownership_demo.
    // take_ownership_demo(transactions);
    // println!("{:?}", transactions); // <- fails to compile: value used after move
}

fn print_owner(owner: &String) {
    println!("Account owner: {}", owner);
}

fn sum_transactions(transactions: &Vec<i64>) -> i64 {
    let mut total: i64 = 0;
    for amount in transactions {
        total += *amount;
    }
    total
}

fn print_running_balance(transactions: &Vec<i64>) {
    let mut balance: i64 = 0;
    for amount in transactions {
        balance += *amount;
        println!("  {:+} -> balance: {}", *amount, balance);
    }
}

// This function takes OWNERSHIP of `transactions` (no & in the
// parameter type) instead of borrowing it. Calling this consumes the
// Vec — after the call, whoever called it no longer owns that Vec and
// cannot use it again. Rust enforces this AT COMPILE TIME, not with a
// runtime error, which is why the two commented-out lines above would
// fail to build rather than crash while running.
#[allow(dead_code)]
fn take_ownership_demo(transactions: Vec<i64>) {
    println!("This function now owns the Vec: {:?}", transactions);
}
