# List of things learned.

## Introduction.

Number Theory is a branch of mathematics that deals with properties and relationships of numbers, especially integers.

In DSA and Competitive Programming, Number Theory is extremely important because many problems involving divisibility, primes, and modular arithmetic appear frequently in coding contests and interviews.

<hr />

## Divisibility & Modular Arithmetic.

### Divisibility Rules.

We say `a` divides `b` (written as `a | b`) if there exists an integer `k` such that `b = a * k`.

For example, `3 | 12` because `12 = 3 * 4`.

#### Properties of Divisibility.

- If `a | b` and `a | c` then `a | (b + c)`
- If `a | b` then `a | (b * k)` for any integer k
- If `a | b` and `b | c` then `a | c`

#### Finding all divisors of a number.

1.  Naive approach — check every number from 1 to n:

        // O(n) approach
        void printDivisors(int n) {
            for (int i = 1; i <= n; i++)
                if (n % i == 0)
                    cout << i << " ";
        }

2.  Optimized approach - only go up to √n:

        // O(√n) approach
        void printDivisors(int n) {
            for (int i = 1; i * i <= n; i++) {
                if (n % i == 0) {
                    cout << i << " ";
                    if (i != n / i)        // Avoid printing duplicate for perfect squares
                        cout << n / i << " ";
                }
            }
        }

### Modular Arithmetic.

The modulo operation `a % m` gives the remainder when `a` is divided by `m`.

For example, `17 % 5 = 2` because `17 = 5 * 3 + 2`.

#### Properties of Modulo.

- `(a + b) % m = ((a % m) + (b % m)) % m`
- `(a - b) % m = ((a % m) - (b % m) + m) % m` ← +m to avoid negative result
- `(a * b) % m = ((a % m) * (b % m)) % m`

#### Why modulo is used in CP?

In competitive programming, answers can be astronomically large. To avoid integer overflow, we are often asked to print the answer modulo 1e9 + 7 (i.e., 1000000007).

1e9 + 7 is a prime number, which makes it very useful for modular inverse calculations as well.

    const int MOD = 1e9 + 7;

    long long add(long long a, long long b) {
        return (a + b) % MOD;
    }

    long long multiply(long long a, long long b) {
        return (a % MOD * b % MOD) % MOD;
    }

<hr />

## Prime Numbers.

A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.

- Prime: 2, 3, 5, 7, 11, 13 ...
- Composite: 4, 6, 8, 9, 10 ... (has more than 2 divisors)
- Special: 1 is neither prime nor composite

### Primality Test.

1.  Naive approach - O(n):

        bool isPrime(int n) {
            if (n <= 1) return false;
            for (int i = 2; i < n; i++)
                if (n % i == 0) return false;
            return true;
        }

2.  Optimized approach — O(√n):

    We only need to check divisors up to √n. If n has a factor greater than √n, the corresponding co-factor must be less than √n and would already have been found.

        bool isPrime(int n) {
            if (n <= 1) return false;
            if (n == 2) return true;
            if (n % 2 == 0) return false;       // Even numbers are not prime
            for (int i = 3; i * i <= n; i += 2) // Only check odd numbers
                if (n % i == 0) return false;
            return true;
        }

### Sieve of Eratosthenes.

The Sieve of Eratosthenes is the most efficient way to find all primes up to a given number `n`.

**Intuition:** Start with all numbers marked as prime. For each prime `p`, mark all its multiples as not prime. Repeat until you've processed all numbers up to √n.

**Step-by-step working (n = 20):**

1.  Start : 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
2.  Mark multiples of 2 : cross out 4,6,8,10,12,14,16,18,20
3.  Mark multiples of 3 : cross out 9,15
4.  Mark multiples of 5 : nothing new up to 20
5.  Remaining primes : 2 3 5 7 11 13 17 19

        <!-- Implementation -->

        #include <iostream>
        #include <vector>
        using namespace std;

        vector<int> sieve(int n) {
            // Initially mark all numbers as prime
            vector<bool> isPrime(n + 1, true);
            isPrime[0] = isPrime[1] = false;    // 0 and 1 are not prime

            for (int i = 2; i * i <= n; i++) {
                if (isPrime[i]) {
                    // Mark all multiples of i as not prime
                    // Start from i*i because smaller multiples
                    // were already marked by previous primes
                    for (int j = i * i; j <= n; j += i)
                        isPrime[j] = false;
                }
            }

            // Collect all primes
            vector<int> primes;
            for (int i = 2; i <= n; i++)
                if (isPrime[i])
                    primes.push_back(i);

            return primes;
        }

        int main() {
            vector<int> primes = sieve(50);
            cout << "Primes up to 50: ";
            for (int p : primes) cout << p << " ";
            return 0;
        }

- **Time Complexity**: O(n log log n)
- **Space Complexity**: O(n)

<hr />

## Greatest Common Divisor (GCD) & Least Common Multiple (LCM).

1.  GCD (Greatest Common Divisor)

    GCD of two numbers `a` and `b` is the largest number that divides both of them.

    For example, `GCD(12, 8) = 4`.
    - **Naive approach** — O(min(a,b)):

            int gcd(int a, int b) {
                int result = min(a, b);
                while (result > 0) {
                    if (a % result == 0 && b % result == 0)
                        break;
                    result--;
                }
                return result;
            }

    - **Euclidean Algorithm** — O(log(min(a,b))):

      The key insight is: `gcd(a, b) = gcd(b, a % b)`

      This works because any divisor of `a` and `b` also divides `a % b`.

            gcd(48, 18)
            = gcd(18, 48 % 18) = gcd(18, 12)
            = gcd(12, 18 % 12) = gcd(12, 6)
            = gcd(6,  12 % 6)  = gcd(6, 0)
            = 6

    - **Recursive & Iterative implementation.**

            // Recursive
            int gcd(int a, int b) {
                if (b == 0) return a;
                return gcd(b, a % b);
            }

            // Iterative
            int gcd(int a, int b) {
                while (b != 0) {
                    int temp = b;
                    b = a % b;
                    a = temp;
                }
                return a;
            }

    - **Built-in C++ functions.**

            #include <numeric>
            int result = gcd(48, 18);

2.  **LCM (Least Common Multiple)**

    LCM of two numbers `a` and `b` is the smallest number that is divisible by both.

    For example, `LCM(4, 6) = 12`.
    - **Relationship between GCD and LCM:**

            lcm(a, b) = (a / gcd(a, b)) * b

    - **Why divide before multiply**

      We divide `a` by `gcd` first (before multiplying by `b`) to prevent overflow.

            // Always divide first to avoid overflow
            long long lcm(long long a, long long b) {
                return (a / gcd(a, b)) * b;
            }

    - **Built-in C++17:**

            #include <numeric>
            long long result = lcm(4, 6);   // returns 12

<hr />

## Prime Factorization.

Prime Factorization means expressing a number as a product of its prime factors.

For example, `36 = 2² × 3²`.

### Optimized approach — O(√n):

    #include <iostream>
    #include <map>
    using namespace std;

    map<int, int> primeFactors(int n) {
        map<int, int> factors;  // factor → exponent

        // Divide out all 2s first
        while (n % 2 == 0) {
            factors[2]++;
            n /= 2;
        }

        // Now check odd factors from 3 to √n
        for (int i = 3; i * i <= n; i += 2) {
            while (n % i == 0) {
                factors[i]++;
                n /= i;
            }
        }

        // If n is still > 1, then it's a prime factor itself
        if (n > 1) factors[n]++;

        return factors;
    }

    int main() {
        int n = 360;
        auto factors = primeFactors(n);

        cout << n << " = ";
        for (auto [prime, exp] : factors)
            cout << prime << "^" << exp << " * ";

        return 0;
    }
    // Output: 360 = 2^3 * 3^2 * 5^1

### Number of divisors from Prime Factorization.

If `n = p1^a * p2^b * p3^c ...` then:

Total divisors = `(a + 1) * (b + 1) * (c + 1) ...`

For example, `360 = 2^3 * 3^2 * 5^1`
→ divisors = `(3+1) * (2+1) * (1+1) = 4 * 3 * 2 = 24`

<hr />

## Fast Exponentation (Binary Exponentiation).

### Problem.

Computing `a^b` naively requires `b` multiplications — O(b). When `b` is huge (like `10^18`), this is too slow.

### Idea.

Repeatedly square the base and halve the exponent:

- If b is even : `a^b = (a^(b/2))^2`
- If b is odd : `a^b = a * a^(b-1)`

        Trace for 2^10:

        2^10 = (2^5)^2
        2^5  = 2 * (2^4)
        2^4  = (2^2)^2
        2^2  = (2^1)^2
        2^1  = 2 * (2^0)
        2^0  = 1

Only 4 multiplications instead of 10.

- **Time Complexity:** O(log b)

### Implementation.

    // Recursive
    long long power(long long base, long long exp, long long mod) {
        if (exp == 0) return 1;
        if (exp % 2 == 0) {
            long long half = power(base, exp / 2, mod);
            return (half * half) % mod;
        }
        return (base % mod * power(base, exp - 1, mod)) % mod;
    }

    // Iterative (preferred in CP)
    long long power(long long base, long long exp, long long mod) {
        long long result = 1;
        base %= mod;
        while (exp > 0) {
            if (exp & 1)                    // If current bit of exp is set
                result = result * base % mod;
            base = base * base % mod;       // Square the base
            exp >>= 1;                      // Move to next bit
        }
        return result;
    }

    int main() {
        cout << power(2, 10, 1e9+7);    // Output: 1024
        cout << power(3, 100, 1e9+7);   // Very large, safely computed
    }

<hr />

## Modular Inverse.

The modular inverse of `a` with respect to modulus `m` is a number `x` such that:

- `a * x ≡ 1 (mod m)`

It is analogous to the regular inverse (`1/a`) but in modular arithmetic.

### When does it exist?

Modular inverse of `a` exists only when `gcd(a, m) = 1` i.e. `a` and `m` are coprime.

### Using Fermat's Little Theorem.

If `m` is a **prime** number, then by Fermat's Little Theorem:

    a^(m-1) ≡ 1 (mod m)


    <!-- Multiplying both sides by `a^(-1)`: -->

    a^(m-2) ≡ a^(-1) (mod m)

So the modular inverse = `a^(m-2) % m`, which we compute using binary exponentiation.

    const long long MOD = 1e9 + 7;

    long long power(long long base, long long exp, long long mod) {
        long long result = 1;
        base %= mod;
        while (exp > 0) {
            if (exp & 1) result = result * base % mod;
            base = base * base % mod;
            exp >>= 1;
        }
        return result;
    }

    long long modInverse(long long a, long long mod) {
        return power(a, mod - 2, mod);
    }

    int main() {
        long long a = 3;
        cout << "Inverse of 3 mod 1e9+7 = " << modInverse(a, MOD);
        // Verify: 3 * modInverse(3) % MOD should be 1
        cout << "\nVerify: " << (a * modInverse(a, MOD)) % MOD;  // Output: 1
    }

### Practical use — Modular Division:

In CP, you can't directly do `(a / b) % m`. Instead:

    (a / b) % m = (a * modInverse(b, m)) % m

<hr />

## Euler's Totient Function (concept level).

### What is `φ(n)`?

Euler's Totient Function `φ(n)` counts how many integers from `1` to `n` are **coprime** with `n` (i.e., their GCD with n is 1).

    φ(1)  = 1          → {1}
    φ(6)  = 2          → {1, 5}
    φ(7)  = 6          → {1,2,3,4,5,6}  (7 is prime)
    φ(12) = 4          → {1, 5, 7, 11}

### Formula.

    φ(n) = n * ∏ (1 - 1/p)    for each distinct prime factor p of n

    <!-- For example, `n = 12 = 2² × 3`: -->

    φ(12) = 12 * (1 - 1/2) * (1 - 1/3)
          = 12 * (1/2) * (2/3)
          = 4

### Key Properties.

- For prime `p`: `φ(p) = p - 1`
- For prime power: `φ(p^k) = p^k - p^(k-1)`
- `φ(1) = 1`

        int eulerTotient(int n) {
            int result = n;
            for (int i = 2; i * i <= n; i++) {
                if (n % i == 0) {
                    // i is a prime factor
                    while (n % i == 0) n /= i;
                    result -= result / i;
                }
            }
            if (n > 1)              // n is a remaining prime factor
                result -= result / n;
            return result;
        }

<hr />

## Important Identities & Tricks for CP.

- Always use `long long` when numbers can exceed `2 * 10^9`
- Cast to `(long long)` before multiplying to avoid overflow:

      long long result = (long long)a * b % MOD;

- Use `n & 1` instead of `n % 2` to check odd/even (faster)
- Use `__gcd(a, b)` for quick GCD in CP
- Always add `+m` when doing modular subtraction to avoid negative values
- Memorize: sum of 1 to n = `n*(n+1)/2`, always compute with `long long`

<hr />

## Assignment.

1.  Write a program that takes a number `n` and performs the following operations, printing the result of each:
    - Print all divisors of `n` using the optimized O(√n) approach
    - Print the count of total divisors
    - Check if `n` is prime using O(√n) primality test
    - Print the prime factorization of `n` in the form `p1^a * p2^b * ...`
    - Compute `GCD` and `LCM` of `n` with another number `m`

            Test with:
            n = 360, m = 48
            n = 97,  m = 36

            Expected output format:
            n = 360, m = 48
            Divisors     : 1 2 3 4 5 6 8 9 10 12 ...
            Total        : 24
            Is Prime?    : No
            Factorization: 2^3 * 3^2 * 5^1
            GCD(360, 48) : 24
            LCM(360, 48) : 720

    [Solution](./Assignment/code1.cpp)

2.  Using the Sieve of Eratosthenes, solve the following two parts:

    **Part 1 — Prime queries:**
    - Build a sieve up to `10^6`
    - Answer `q` queries, each asking:
      - How many primes exist between `l` and `r`?
      - Is a given number `n` prime?

    **Part 2 — Goldbach's Conjecture:**

    Goldbach's Conjecture states that every even number greater than 2 can be expressed as the sum of two prime numbers. Verify this for a range of even numbers and print one valid pair for each.

        Test with:
        Queries:
        l=1,   r=50   → count primes
        l=100, r=200  → count primes
        n=97          → is prime?
        n=100         → is prime?

        Goldbach pairs:
        28 → ?
        100 → ?
        56  → ?


        Expected output format:
        Primes between 1 and 50   : 15
        Primes between 100 and 200: 21
        97  is prime  : Yes
        100 is prime  : No

        Goldbach pairs:
        28  = 5 + 23
        100 = 3 + 97
        56  = 3 + 53

    [Solution](./Assignment/code2.cpp)

3.  Build a complete modular arithmetic toolkit that solves the following three parts using `MOD = 1e9 + 7`:

    **Part 1 — Fast Exponentiation:**
    - Compute `a^b % MOD` using binary exponentiation
    - Trace and print how many multiplications were done vs naive approach

    **Part 2 — Modular Inverse & Division:**
    - Compute modular inverse of `a` using Fermat's Little Theorem
    - Compute `(a / b) % MOD` using modular inverse
    - Verify: `(a * modInverse(b)) % MOD == (a / b) % MOD` only when b divides a evenly

    **Part 3 — Modular Combinations (nCr % MOD):**
    - Compute `nCr % MOD` using the formula:

            nCr = n! / (r! * (n-r)!)
                = n! * modInverse(r!) * modInverse((n-r)!) % MOD

    - Use precomputed factorials for efficiency

            Test with:
            Part 1:
            a=2,  b=10   → 2^10   % MOD = 1024
            a=3,  b=100  → 3^100  % MOD = ?

            Part 2:
            modInverse(3)        → ?
            (18 / 3) % MOD       → 6
            (100 / 4) % MOD      → 25

            Part 3:
            nCr(5,  2)  → 10
            nCr(10, 3)  → 120
            nCr(20, 10) → 184756

    [Solution](./Assignment/code3.cpp)
