#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
using namespace std;

// Print all divisors using O(√n)
vector<int> getDivisors(int n)
{
    vector<int> divisors;
    for (int i = 1; i * i <= n; i++)
    {
        if (n % i == 0)
        {
            divisors.push_back(i);
            if (i != n / i)
                divisors.push_back(n / i);
        }
    }
    sort(divisors.begin(), divisors.end());
    return divisors;
}

// O(√n) primality test
bool isPrime(int n)
{
    if (n <= 1)
        return false;
    if (n == 2)
        return true;
    if (n % 2 == 0)
        return false;
    for (int i = 3; i * i <= n; i += 2)
        if (n % i == 0)
            return false;
    return true;
}

// Prime factorization
map<int, int> primeFactors(int n)
{
    map<int, int> factors;
    while (n % 2 == 0)
    {
        factors[2]++;
        n /= 2;
    }
    for (int i = 3; i * i <= n; i += 2)
        while (n % i == 0)
        {
            factors[i]++;
            n /= i;
        }
    if (n > 1)
        factors[n]++;
    return factors;
}

// Euclidean GCD
long long gcd(long long a, long long b)
{
    while (b != 0)
    {
        long long t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// LCM using GCD
long long lcm(long long a, long long b)
{
    return (a / gcd(a, b)) * b;
}

void inspect(int n, int m)
{
    cout << "================================\n";
    cout << "n = " << n << ", m = " << m << "\n";
    cout << "--------------------------------\n";

    // Divisors
    vector<int> divs = getDivisors(n);
    cout << "Divisors     : ";
    for (int d : divs)
        cout << d << " ";
    cout << "\nTotal        : " << divs.size() << "\n";

    // Primality
    cout << "Is Prime?    : " << (isPrime(n) ? "Yes" : "No") << "\n";

    // Prime Factorization
    map<int, int> factors = primeFactors(n);
    cout << "Factorization: ";
    bool first = true;
    for (auto [prime, exp] : factors)
    {
        if (!first)
            cout << " * ";
        cout << prime << "^" << exp;
        first = false;
    }
    cout << "\n";

    // GCD & LCM
    cout << "GCD(" << n << ", " << m << ") : " << gcd(n, m) << "\n";
    cout << "LCM(" << n << ", " << m << ") : " << lcm(n, m) << "\n";
}

int main()
{
    inspect(360, 48);
    inspect(97, 36);
    return 0;
}