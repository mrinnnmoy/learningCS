struct Transaction {
    category: String,
    amount: i64,
}

// A custom iterator that lazily yields the running balance after each
// transaction, one at a time. Implementing the Iterator trait directly
// (rather than pre-computing a Vec of every balance up front) is what
// lets this struct be used anywhere a normal iterator works: for
// loops, .last(), .collect(), and more, all for free.
struct RunningBalance {
    amounts: Vec<i64>,
    index: usize,
    balance: i64,
}

impl RunningBalance {
    fn new(transactions: &[Transaction]) -> RunningBalance {
        let amounts: Vec<i64> = transactions.iter().map(|t| t.amount).collect();
        RunningBalance {
            amounts,
            index: 0,
            balance: 0,
        }
    }
}

impl Iterator for RunningBalance {
    type Item = i64;

    fn next(&mut self) -> Option<i64> {
        if self.index >= self.amounts.len() {
            return None;
        }
        self.balance += self.amounts[self.index];
        self.index += 1;
        Some(self.balance)
    }
}

// Takes a closure so the caller decides what "matches" means, without
// this function needing to know anything about categories in advance.
// `impl Fn(&Transaction) -> bool` means "some closure or function that
// can be called any number of times, only borrowing its environment" —
// the right, least-restrictive bound for a filter predicate that gets
// called once per transaction and never consumes anything.
fn total_matching(transactions: &[Transaction], matches: impl Fn(&Transaction) -> bool) -> i64 {
    transactions
        .iter()
        .filter(|t| matches(*t))
        .map(|t| t.amount)
        .sum()
}

fn main() {
    let transactions = vec![
        Transaction {
            category: "salary".to_string(),
            amount: 3000,
        },
        Transaction {
            category: "groceries".to_string(),
            amount: -150,
        },
        Transaction {
            category: "rent".to_string(),
            amount: -1200,
        },
        Transaction {
            category: "freelance".to_string(),
            amount: 500,
        },
        Transaction {
            category: "groceries".to_string(),
            amount: -80,
        },
    ];

    let total_deposits: i64 = transactions
        .iter()
        .filter(|t| t.amount > 0)
        .map(|t| t.amount)
        .sum();
    let total_withdrawals: i64 = transactions
        .iter()
        .filter(|t| t.amount < 0)
        .map(|t| t.amount)
        .sum();

    println!("Total deposits: {}", total_deposits);
    println!("Total withdrawals: {}", total_withdrawals);

    let groceries_total = total_matching(&transactions, |t| t.category == "groceries");
    println!("Total spent on groceries: {}", groceries_total);

    println!("\nRunning balance, via a custom Iterator:");
    for balance in RunningBalance::new(&transactions) {
        println!("  {}", balance);
    }

    let final_balance = RunningBalance::new(&transactions).last();
    println!(
        "\nFinal balance (via .last() on a fresh iterator): {:?}",
        final_balance
    );
}
