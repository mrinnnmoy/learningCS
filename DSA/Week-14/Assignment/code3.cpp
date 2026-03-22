#include <iostream>
#include <vector>
using namespace std;

const long long MOD = 1e9 + 7;

// ── Part 1: Binary Exponentiation ────────────
long long power(long long base, long long exp, long long mod)
{
    long long result = 1;
    int multiplications = 0;
    base %= mod;
    while (exp > 0)
    {
        if (exp & 1)
        {
            result = result * base % mod;
            multiplications++;
        }
        base = base * base % mod;
        exp >>= 1;
        if (exp > 0)
            multiplications++;
    }
    cout << "  Multiplications (binary exp) : " << multiplications << "\n";
    cout << "  Multiplications (naive)      : ";
    return result;
}

// Clean version without counting (used internally)
long long pow(long long base, long long exp, long long mod)
{
    long long result = 1;
    base %= mod;
    while (exp > 0)
    {
        if (exp & 1)
            result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

// ── Part 2: Modular Inverse ───────────────────
long long modInverse(long long a, long long mod)
{
    // Using Fermat's Little Theorem: a^(mod-2) % mod
    return pow(a, mod - 2, mod);
}

long long modDivide(long long a, long long b, long long mod)
{
    return (a % mod * modInverse(b, mod)) % mod;
}

// ── Part 3: nCr % MOD ─────────────────────────
const int MAXN = 1001;
vector<long long> fact(MAXN);

void precomputeFactorials()
{
    fact[0] = 1;
    for (int i = 1; i < MAXN; i++)
        fact[i] = fact[i - 1] * i % MOD;
}

long long nCr(int n, int r)
{
    if (r > n || r < 0)
        return 0;
    // nCr = n! * inverse(r!) * inverse((n-r)!) % MOD
    return fact[n] % MOD * modInverse(fact[r], MOD) % MOD * modInverse(fact[n - r], MOD) % MOD;
}

int main()
{
    precomputeFactorials();

    // ── Part 1 ───────────────────────────────
    cout << "Part 1 — Fast Exponentiation:\n";
    cout << "================================\n";

    auto testPower = [&](long long a, long long b)
    {
        cout << a << "^" << b << " % MOD:\n";
        long long res = power(a, b, MOD);
        cout << "  " << b << " (naive would do " << b << " multiplications)\n";
        cout << "  Result = " << res << "\n\n";
    };

    testPower(2, 10);
    testPower(3, 100);

    // ── Part 2 ───────────────────────────────
    cout << "Part 2 — Modular Inverse & Division:\n";
    cout << "================================\n";

    long long inv3 = modInverse(3, MOD);
    cout << "modInverse(3)          : " << inv3 << "\n";
    cout << "Verify 3 * inv(3) % MOD: " << (3 * inv3) % MOD << "\n\n";

    cout << "(18 / 3) % MOD  : " << modDivide(18, 3, MOD) << "\n";
    cout << "(100 / 4) % MOD : " << modDivide(100, 4, MOD) << "\n\n";

    // ── Part 3 ───────────────────────────────
    cout << "Part 3 — Modular Combinations:\n";
    cout << "================================\n";

    auto testNCR = [&](int n, int r)
    {
        cout << "nCr(" << n << ", " << r << ") = " << nCr(n, r) << "\n";
    };

    testNCR(5, 2);
    testNCR(10, 3);
    testNCR(20, 10);

    return 0;
}