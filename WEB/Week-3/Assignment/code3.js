// Function to create a bank account
function createBankAccount(ownerName, initialBalance) {
    // Private variables
    let balance = initialBalance;
    let transactions = 0;

    // Return object with methods
    return {
        // Deposit money
        deposit(amount) {
            if (amount <= 0) {
                console.log("Deposit amount must be positive.");
                return;
            }

            balance += amount;
            transactions++;

            console.log(`₹${amount} deposited successfully.`);
        },

        // Withdraw money
        withdraw(amount) {
            if (amount <= 0) {
                console.log("Withdrawal amount must be positive.");
                return;
            }

            if (amount > balance) {
                console.log("Insufficient balance.");
                return;
            }

            balance -= amount;
            transactions++;

            console.log(`₹${amount} withdrawn successfully.`);
        },

        // Get current balance
        getBalance() {
            return balance;
        },

        // Get account owner
        getOwner() {
            return ownerName;
        },

        // Get total transactions
        getTransactionCount() {
            return transactions;
        }
    };
}

// Create account
const account = createBankAccount("Mrinmoy", 10000);

// Test operations
console.log("Account Owner:", account.getOwner());

console.log("Current Balance:", account.getBalance());

account.deposit(5000);

account.withdraw(3000);

account.withdraw(20000); // Should fail

account.deposit(-100); // Should fail

console.log("Final Balance:", account.getBalance());

console.log("Total Transactions:", account.getTransactionCount());

// Trying to access private balance directly
console.log(account.balance); // undefined