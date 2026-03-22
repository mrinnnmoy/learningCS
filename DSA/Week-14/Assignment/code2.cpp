#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 1e6;
vector<bool> isPrime(MAXN + 1, true);
vector<int> prefixCount(MAXN + 1, 0); // prefixCount[i] = number of primes <= i

// Build sieve + prefix count
void buildSieve()
{
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; i * i <= MAXN; i++)
        if (isPrime[i])
            for (int j = i * i; j <= MAXN; j += i)
                isPrime[j] = false;

    // Build prefix count array for range queries
    for (int i = 1; i <= MAXN; i++)
        prefixCount[i] = prefixCount[i - 1] + (isPrime[i] ? 1 : 0);
}

// Count primes in range [l, r]
int countPrimes(int l, int r)
{
    return prefixCount[r] - prefixCount[l - 1];
}

// Goldbach pair for even number n
pair<int, int> goldbachPair(int n)
{
    for (int i = 2; i <= n / 2; i++)
        if (isPrime[i] && isPrime[n - i])
            return {i, n - i};
    return {-1, -1}; // No pair found (shouldn't happen for valid even n > 2)
}

int main()
{
    buildSieve();

    // ── Prime Range Queries ───────────────────
    cout << "Prime Range Queries:\n";
    cout << "--------------------------------\n";

    auto printRange = [&](int l, int r)
    {
        cout << "Primes between " << l << " and " << r
             << " : " << countPrimes(l, r) << "\n";
    };

    printRange(1, 50);
    printRange(100, 200);

    // ── Is Prime Queries ─────────────────────
    cout << "\nIs Prime Queries:\n";
    cout << "--------------------------------\n";

    auto printPrime = [&](int n)
    {
        cout << n << " is prime : "
             << (isPrime[n] ? "Yes" : "No") << "\n";
    };

    printPrime(97);
    printPrime(100);

    // ── Goldbach Pairs ───────────────────────
    cout << "\nGoldbach Pairs:\n";
    cout << "--------------------------------\n";

    vector<int> evens = {28, 100, 56};
    for (int n : evens)
    {
        auto [a, b] = goldbachPair(n);
        cout << n << " = " << a << " + " << b << "\n";
    }

    return 0;
}