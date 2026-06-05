use std::collections::HashMap;
use std::fmt;

#[derive(Debug)]
enum LedgerError {
    AccountNotFound(String),
    InsufficientFunds {
        account: String,
        attempted: i64,
        available: i64,
    },
    InvalidAmount(i64),
}

impl fmt::Display for LedgerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LedgerError::AccountNotFound(name) => {
                write!(f, "account \"{}\" does not exist", name)
            }
            LedgerError::InsufficientFunds {
                account,
                attempted,
                available,
            } => {
                write!(
                    f,
                    "account \"{}\" has {} available, cannot withdraw {}",
                    account, available, attempted
                )
            }
            LedgerError::InvalidAmount(amount) => {
                write!(f, "amount must be greater than zero, got {}", amount)
            }
        }
    }
}

struct Ledger {
    balances: HashMap<String, i64>,
}

impl Ledger {
    fn new() -> Ledger {
        Ledger {
            balances: HashMap::new(),
        }
    }

    fn open_account(&mut self, name: &str, opening_balance: i64) {
        self.balances.insert(name.to_string(), opening_balance);
    }

    fn balance_of(&self, name: &str) -> Option<i64> {
        self.balances.get(name).copied()
    }

    fn withdraw(&mut self, name: &str, amount: i64) -> Result<i64, LedgerError> {
        if amount <= 0 {
            return Err(LedgerError::InvalidAmount(amount));
        }

        let balance = self
            .balances
            .get_mut(name)
            .ok_or_else(|| LedgerError::AccountNotFound(name.to_string()))?;

        if *balance < amount {
            return Err(LedgerError::InsufficientFunds {
                account: name.to_string(),
                attempted: amount,
                available: *balance,
            });
        }

        *balance -= amount;
        Ok(*balance)
    }

    fn deposit(&mut self, name: &str, amount: i64) -> Result<i64, LedgerError> {
        if amount <= 0 {
            return Err(LedgerError::InvalidAmount(amount));
        }

        let balance = self
            .balances
            .get_mut(name)
            .ok_or_else(|| LedgerError::AccountNotFound(name.to_string()))?;

        *balance += amount;
        Ok(*balance)
    }

    fn transfer(&mut self, from: &str, to: &str, amount: i64) -> Result<(), LedgerError> {
        // Confirm the DESTINATION account exists before touching
        // anything. This matters specifically because withdraw() below
        // actually mutates state — if we withdrew first and only then
        // discovered `to` doesn't exist, the source account's balance
        // would already be reduced with nowhere for that amount to
        // have gone. Checking everything that can fail before mutating
        // anything is what keeps a failed transfer from partially
        // happening.
        if !self.balances.contains_key(to) {
            return Err(LedgerError::AccountNotFound(to.to_string()));
        }

        self.withdraw(from, amount)?;
        self.deposit(to, amount)?;
        Ok(())
    }
}

fn main() {
    let mut ledger = Ledger::new();
    ledger.open_account("alice", 200);
    ledger.open_account("bob", 50);

    println!("Opening balances:");
    println!("  alice: {:?}", ledger.balance_of("alice"));
    println!("  bob:   {:?}", ledger.balance_of("bob"));

    println!("\nTransfer 1: alice sends 75 to bob");
    match ledger.transfer("alice", "bob", 75) {
        Ok(()) => println!("  OK"),
        Err(e) => println!("  FAILED: {}", e),
    }
    println!("  alice: {:?}", ledger.balance_of("alice"));
    println!("  bob:   {:?}", ledger.balance_of("bob"));

    println!("\nTransfer 2: bob sends 1000 to alice (should fail: insufficient funds)");
    match ledger.transfer("bob", "alice", 1000) {
        Ok(()) => println!("  OK"),
        Err(e) => println!("  FAILED: {}", e),
    }
    println!("  alice: {:?}", ledger.balance_of("alice"));
    println!("  bob:   {:?}", ledger.balance_of("bob"));

    println!("\nTransfer 3: alice sends 20 to carol (should fail: no such account)");
    match ledger.transfer("alice", "carol", 20) {
        Ok(()) => println!("  OK"),
        Err(e) => println!("  FAILED: {}", e),
    }
    println!("  alice: {:?}", ledger.balance_of("alice"));

    println!("\nLooking up a nonexistent account directly:");
    println!("  carol: {:?}", ledger.balance_of("carol"));
}
