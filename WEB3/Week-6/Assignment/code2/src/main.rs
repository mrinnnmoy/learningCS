#[derive(Debug)]
struct Account {
    owner: String,
    balance: i64,
}

#[derive(Debug)]
enum Operation {
    Deposit(i64),
    Withdraw(i64),
}

#[derive(Debug)]
enum TransactionResult {
    Success { new_balance: i64 },
    InsufficientFunds { attempted: i64, available: i64 },
    InvalidAmount,
}

impl Account {
    fn new(owner: &str, opening_balance: i64) -> Account {
        Account {
            owner: owner.to_string(),
            balance: opening_balance,
        }
    }

    fn apply(&mut self, operation: &Operation) -> TransactionResult {
        match operation {
            Operation::Deposit(amount) => {
                // `amount` here is &i64 (match ergonomics, since we
                // matched on a &Operation) — re-binding to a plain i64
                // up front keeps every line below it simple i64
                // arithmetic, with no further dereferencing needed.
                let amount = *amount;
                if amount <= 0 {
                    return TransactionResult::InvalidAmount;
                }
                self.balance += amount;
                TransactionResult::Success {
                    new_balance: self.balance,
                }
            }
            Operation::Withdraw(amount) => {
                let amount = *amount;
                if amount <= 0 {
                    return TransactionResult::InvalidAmount;
                }
                if amount > self.balance {
                    return TransactionResult::InsufficientFunds {
                        attempted: amount,
                        available: self.balance,
                    };
                }
                self.balance -= amount;
                TransactionResult::Success {
                    new_balance: self.balance,
                }
            }
        }
    }
}

fn describe_result(result: &TransactionResult) -> String {
    match result {
        TransactionResult::Success { new_balance } => {
            format!("OK — new balance: {}", new_balance)
        }
        TransactionResult::InsufficientFunds {
            attempted,
            available,
        } => {
            format!(
                "REJECTED — tried to withdraw {} but only {} available",
                attempted, available
            )
        }
        TransactionResult::InvalidAmount => {
            "REJECTED — amount must be greater than zero".to_string()
        }
    }
}

fn main() {
    let mut account = Account::new("Alice", 100);
    println!("Starting account: {:?}\n", account);

    let operations = vec![
        Operation::Deposit(50),
        Operation::Withdraw(30),
        Operation::Withdraw(1000),
        Operation::Deposit(-10),
        Operation::Withdraw(120),
    ];

    for operation in &operations {
        let result = account.apply(operation);
        println!("{:?} -> {}", operation, describe_result(&result));
    }

    println!("\nFinal account: {:?}", account);
}
