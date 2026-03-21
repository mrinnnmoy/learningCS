# List of things learned.

## Introduction.

Bit Manipulation is a technique used in a variety of problems to get the solution in an optimized way.

This technique is very effective from a Competitive Programming point of view.

All data in computer programs are internally stored as bits, i.e., as numbers 0 and 1.

In programming, an n-bit integer is internally stored as a binary number that consists of n bits.

For example, the C++ type int is a 32-bit type, which means that every int number consists of 32 bits.

The int number 43 = 00000000000000000000000000101011

The bits in the representation are indexed from right to left.

<hr />

## Bitwise Operators in C++.

Bitwise operators are used to perform operations directly on the binary representations of numbers.

These operators work by manipulating individual bits (0s and 1s) in a number.

The following 6 operators are bitwise operators (also known as bit operators as they work at the bit-level).

And are used to perform bitwise operations in C++.

1. **Bitwise AND (`&`)** : Takes two numbers as operands and does AND on every bit of two numbers. The result of AND is 1 only if both bits are 1.

2. **Bitwise OR (`|`)** : Takes two numbers as operands and does OR on every bit of two numbers. The result of OR is 1 if any of the two bits are 1.

3. **Bitwise XOR (`^`)** : Takes two numbers as operands and does XOR on every bit of two numbers. The result of XOR is 1 if two bits are different.

4. **LEFT SHIFT (`<<`)** : Takes two numbers, the left shifts the bits of the first operand and the second operand decides the number of places to shift.

5. **RIGHT SHIFT (`>>`)** : Takes two numbers, right shifts the bits of the first operand and the second operand decides the number of places to shift.

6. **Bitwise NOT (`~`)** : Takes one number and inverts all bits of it.

Here's the truth table of the bitwise operators.

| X   | Y   | `X & Y` | `X \| Y` | `X ^ Y` | `~(X)` |
| --- | --- | ------- | -------- | ------- | ------ |
| 0   | 0   | 0       | 0        | 0       | 1      |
| 0   | 1   | 0       | 1        | 1       | 1      |
| 1   | 0   | 0       | 1        | 1       | 0      |
| 1   | 1   | 1       | 1        | 0       | 0      |

<hr />

## Bit Tricks & Techniques.

1.  **Getting a Bit** : This method is used to find the bit at a particular position(say i) of the given number N.

    The idea is to find the Bitwise AND of the given number and 2i that can be represented as (1 << i).

    If the value return is 1 then the bit at the ith position is set. Otherwise, it is unset.

        // Function to get the bit at the
        // ith position
        bool getBit(int num, int i)
        {
            // Return true if the bit is
            // set. Otherwise return false
            return ((num & (1 << i)) != 0);
        }

2.  **Setting a Bit** : This method is used to set the bit at a particular position(say i) of the given number N.

    The idea is to update the value of the given number N to the Bitwise OR of the given number N and 2i that can be represented as (1 << i).

    If the value return is 1 then the bit at the ith position is set. Otherwise, it is unset.

        // Function to set the ith bit of the
        // given number num
        int setBit(int num, int i)
        {
            // Sets the ith bit and return
            // the updated value
            return num | (1 << i);
        }

3.  **Clearing a Bit** : This method is used to clear the bit at a particular position(say i) of the given number N.

    The idea is to update the value of the given number N to the Bitwise AND of the given number N and the compliment of 2i that can be represented as ~(1 << i).

    If the value return is 1 then the bit at the ith position is set. Otherwise, it is unset.

        // Function to clear the ith bit of
        // the given number num
        int clearBit(int num, int i)
        {

            // Create the mask for the ith
            // bit unset
            int mask = ~(1 << i);

            // Return the updated value
            return num & mask;
        }

<hr />

## Application of Bitwise Operator.

1. Bitwise operations are prominent in embedded systems, control systems, etc where memory(data transmission/data points) is still an issue.

2. They are also useful in networking where it is important to reduce the amount of data, so booleans are packed together. Packing them together and taking them apart use bitwise operations and shift instructions.

3. Bitwise operations are also heavily used in the compression and encryption of data.

4. Useful in graphics programming, older GUIs are heavily dependent on bitwise operations like XOR(^) for selection highlighting and other overlays.

<hr />

## Important Built-in Functions in C++.

The `<bit>` header, available since C++20, provides type-generic functions that are well-defined and highly efficient across different compilers and architectures.

- `__builtin_popcount(x)` / `__builtin_popcountll(x)`: Counts the number of set bits in an int or long long respectively.

- `__builtin_clz(x)` / `__builtin_clzll(x)` : Counts the number of leading zeros. Undefined behavior if x is zero.

- `__builtin_ctz(x)` / `__builtin_ctzll(x)` : Counts the number of trailing zeros. Undefined behavior if x is zero.

- `__builtin_parity(x)` : Checks the parity (if the number of set bits is odd or even).

- `__builtin_ffs(x)` : Finds the index of the first (rightmost) set bit (1-indexed).

<hr />

## Bitmask Techniques.

Bitmasking is a technique used in programming to perform operations more efficiently on binary data.

A frequently employed technique in algorithms to enhance performance in terms of time complexity, utilizing bitwise operators for efficient operations at the bit level.

**For example** : Assuming that we have the set of numbers, whose binary representation has 8 bits in it.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20231211105413/binary-representation-of-one.webp)

Shifting the set bit (the LSB) to 3 places to the left using expression (1<<3) would look something like this:

![img](https://media.geeksforgeeks.org/wp-content/uploads/20231115115958/Binary-Representation-After-Shifting-three-Places-to-Left.webp)

After shifting, the set bit to 3 places, it becomes 8. Similarly, we can do this for any place. We'll use this shifting property in following bitwise techniques to create a bit mask and then perform various bitwise operations with it.

### Bitmasking Operations in C++.

1.  **Setting a Specific Bit.**

    Setting a specific bit basically means changing it from 0 to 1. It can be done by utilizing the Bitwise OR because of its property to give 1 if either of the bits is set to 1 and the bitwise left shift operator.

    We will shift the LSB bit of 1 to the specified position that we want to set and then perform a bitwise OR Operation.

        <!-- Syntax -->
        integer | (1 << bit_position_to_be_set)

    Here, the bit position to be set will be the place of the bit that we want to change to 1.

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20231115122300/setting-a-bit.webp)

        // C++ program to illustrate how to set a particular bit
        #include <iostream>
        using namespace std;

        int main()
        {
            int x = 11;

            // setting fifth bit using bitmask
            x = x | 1 << 5;
            cout << "Result after setting the fifth bit: " << x ;

            return 0;
        }

        <!-- Output -->
        Result after setting the fifth bit: 43

2.  **Clearing a Bit.**

    Clearing a bit means we set it to 0 if it is 1 without touching or affecting any other bits.

    This is done by using Bitwise AND and the negation operator (Bitwise NOT). The Bitwise NOT flips all the bits that are 1 to 0 and 0 to 1.

    This property of the bitwise NOT helps us in clearing a set bit.

        <!-- Syntax -->
        integer & ~(1 << bit_position_to_clear)

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20231115123028/clearing-a-specific-bit.webp)

        // C++ program to illustrate how to clear a particular bit
        #include <iostream>
        using namespace std;

        int main()
        {
            int x = 11;

            // clearing bit at third position
            x = x & ~(1 << 3);
            cout << "Result after clearing the 3rd bit: " << x;

            return 0;
        }

        <!-- Output -->
        Result after clearing the 3rd bit: 3

3.  **Toggle a Bit.**

    In this operation, we flip a bit. If it's set to 1 we make it 0 and if it's set to 0 then we flip it to 1. This is easily achievable by the Bitwise XOR operator (^) and the left shift (<<).

    We will utilize the property of the XOR operator to flip the bits if the bits of 2 different numbers are not the same.

    The same approach is used that is, by shifting 1 to a specific position which we want to flip.

        <!-- Syntax -->
        Integer ^ (1 << bit_position_to_toggle)

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20231115123607/toggling-a-bit.webp)

        // C++ program to illustrate how to toggle a bit
        #include <iostream>
        using namespace std;

        int main()
        {
            int x = 11;
            // toggling zeroth bit
            x = x ^ 1 << 0;
            cout << "Result after toggling the zeroth bit: " << x;

            return 0;
        }

        <!-- Output -->
        Result after toggling the zeroth bit: 10

4.  **Check if a Bit is Set or not.**

    In this operation, we check if a bit at a specific position is set or not. This is done by using the bitwise AND (&) and the Left shift operator.

    We basically left shift the set bit of 1 to the specified position for which we want to perform a check and then perform a bitwise AND Operation.

    If the bit is set then the answer will be - 2(bit_position) For example, if the bit position is 3, then the answer will be 23 = 8. Else if the bit is 0 (not set) then the answer will be 0.

        <!-- Syntax -->
        Integer & (1 << bit_position_to_check)

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20231115124150/checking-if-the-bit-is-set.webp)

        // C++ program to check if the bit is set or not
        #include <iostream>
        using namespace std;

        int main()
        {
            int x = 11;

            // the AND will return a non zero number if the bit is
            // set, otherwise it will return zero
            if (x & (1 << 3)) {
                cout << "Third bit is set\n";
            }
            else {
                cout << "Third bit is not set\n";
            }
            return 0;
        }

        <!-- Output -->
        Third bit is set

<hr />

## Assignment.

1.  Write a program that takes a number `n` and performs the following operations on it, printing the result of each:
    - Print binary representation of `n` (without using `bitset`)
    - Check if `k`th bit is set or not
    - Set the `k`th bit
    - Clear the `k`th bit
    - Toggle the `k`th bit
    - Check if `n` is even or odd using bitwise operator
    - Check if `n` is a power of 2 using bitwise operator

            Test with:
            n = 43, k = 1
            n = 16, k = 3

    [Solution](./Assignment/code1.cpp)

2.  You are given three different arrays. Solve all three using only XOR / bitwise operators — no sorting, no maps, no extra arrays allowed.
    - **Array 1**: Every element appears twice except one. Find the unique element.
    - **Array 2**: Every element appears three times except one. Find the unique element.
    - **Array 3**: Every element appears twice except two elements. Find both unique elements.

            Test with:

            Array 1 : {4, 1, 2, 1, 2}              → Answer: 4
            Array 2 : {5, 5, 3, 5, 2, 3, 3}        → Answer: 2
            Array 3 : {1, 2, 3, 4, 1, 2}           → Answer: 3 and 4

    [Solution](./Assignment/code2.cpp)

3.  Given an array of distinct integers, use bitmask technique to:
    - Generate and print all possible subsets (power set)
    - Print the total count of subsets
    - Print only subsets whose sum is even
    - Print only subsets of exactly size 2

            <!-- Test with: -->
            Array : {1, 2, 3, 4}

            <!-- Expected format: -->
            All Subsets (16 total):
            {}
            {1}
            {2}
            {1, 2}
            ... and so on

            Even Sum Subsets:
            {2, 4}
            {1, 3}
            ... and so on

            Size-2 Subsets:
            {1, 2}
            {1, 3}
            ... and so on

    [Solution](./Assignment/code3.cpp)
