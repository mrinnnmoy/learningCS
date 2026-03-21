#include <iostream>
using namespace std;

// Print binary representation without bitset
void printBinary(int n)
{
    if (n == 0)
    {
        cout << "0";
        return;
    }
    string binary = "";
    int temp = n;
    while (temp > 0)
    {
        binary = (char)('0' + (temp & 1)) + binary;
        temp >>= 1;
    }
    cout << binary;
}

// Check if kth bit is set
bool getBit(int n, int k)
{
    return (n >> k) & 1;
}

// Set the kth bit
int setBit(int n, int k)
{
    return n | (1 << k);
}

// Clear the kth bit
int clearBit(int n, int k)
{
    return n & ~(1 << k);
}

// Toggle the kth bit
int toggleBit(int n, int k)
{
    return n ^ (1 << k);
}

// Check even or odd using bitwise
bool isOdd(int n)
{
    return n & 1;
}

// Check power of 2 using bitwise
bool isPowerOf2(int n)
{
    return n > 0 && (n & (n - 1)) == 0;
}

void inspect(int n, int k)
{
    cout << "================================\n";
    cout << "n = " << n << ", k = " << k << "\n";
    cout << "--------------------------------\n";

    cout << "Binary of " << n << "     : ";
    printBinary(n);
    cout << "\n";
    cout << "Bit " << k << " is set?    : " << (getBit(n, k) ? "Yes" : "No") << "\n";

    int afterSet = setBit(n, k);
    cout << "After setBit(" << k << ")  : " << afterSet << " → ";
    printBinary(afterSet);
    cout << "\n";

    int afterClear = clearBit(n, k);
    cout << "After clearBit(" << k << "): " << afterClear << " → ";
    printBinary(afterClear);
    cout << "\n";

    int afterToggle = toggleBit(n, k);
    cout << "After toggleBit(" << k << "): " << afterToggle << " → ";
    printBinary(afterToggle);
    cout << "\n";

    cout << n << " is         : " << (isOdd(n) ? "Odd" : "Even") << "\n";
    cout << n << " power of 2 : " << (isPowerOf2(n) ? "Yes" : "No") << "\n";
}

int main()
{
    inspect(43, 1);
    inspect(16, 3);
    return 0;
}