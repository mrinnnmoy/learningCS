use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
struct Account {
    #[allow(dead_code)]
    owner: String,
    balance: i64,
}

impl Account {
    fn new(owner: &str, balance: i64) -> Account {
        Account {
            owner: owner.to_string(),
            balance,
        }
    }

    fn deposit(&mut self, amount: i64) {
        self.balance += amount;
    }

    fn withdraw(&mut self, amount: i64) -> bool {
        if amount > self.balance {
            return false;
        }
        self.balance -= amount;
        true
    }
}

// A "handle" represents one of possibly several independent parts of a
// program that all need to read and modify the SAME underlying
// Account — think of a teller terminal and a mobile app both operating
// on one real bank account, never a separate copy each.
struct AccountHandle {
    label: String,
    account: Rc<RefCell<Account>>,
}

impl AccountHandle {
    fn new(label: &str, account: Rc<RefCell<Account>>) -> AccountHandle {
        AccountHandle {
            label: label.to_string(),
            account,
        }
    }

    fn deposit(&self, amount: i64) {
        // borrow_mut() gets a runtime-checked mutable borrow of the
        // Account inside the RefCell. Unlike a plain &mut reference,
        // this rule is enforced WHILE THE PROGRAM RUNS, not by the
        // compiler ahead of time — which is exactly what makes it
        // possible to mutate through a shared &self here at all.
        self.account.borrow_mut().deposit(amount);
        println!("[{}] deposited {}", self.label, amount);
    }

    fn withdraw(&self, amount: i64) {
        let success = self.account.borrow_mut().withdraw(amount);
        if success {
            println!("[{}] withdrew {}", self.label, amount);
        } else {
            println!(
                "[{}] withdrawal of {} REJECTED (insufficient funds)",
                self.label, amount
            );
        }
    }

    fn print_balance(&self) {
        let account = self.account.borrow();
        println!("[{}] sees balance: {}", self.label, account.balance);
    }
}

fn main() {
    let shared_account = Rc::new(RefCell::new(Account::new("Alice", 100)));
    println!(
        "Rc strong count after creation: {}",
        Rc::strong_count(&shared_account)
    );

    // Cloning an Rc does NOT clone the Account inside it — it creates
    // a new pointer to the SAME underlying data and increments a
    // reference count. Both handles below share one real Account.
    let teller = AccountHandle::new("Teller", Rc::clone(&shared_account));
    let mobile_app = AccountHandle::new("Mobile App", Rc::clone(&shared_account));

    println!(
        "Rc strong count after cloning twice: {}\n",
        Rc::strong_count(&shared_account)
    );

    teller.deposit(50);
    mobile_app.print_balance();

    mobile_app.withdraw(30);
    teller.print_balance();

    teller.withdraw(1000);
    mobile_app.print_balance();

    drop(mobile_app);
    println!(
        "\nRc strong count after dropping one handle: {}",
        Rc::strong_count(&shared_account)
    );

    // Below is what happens when RefCell's runtime borrow rule is
    // violated on purpose: holding two mutable borrows of the same
    // RefCell at the same time. Uncomment all three lines to see it
    // panic while the program is running, rather than fail to compile.
    // let first_borrow = shared_account.borrow_mut();
    // let second_borrow = shared_account.borrow_mut();
    // println!("{} {}", first_borrow.balance, second_borrow.balance);
}
