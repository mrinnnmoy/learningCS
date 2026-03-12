# List of things learned.

## Introduction to Prefix Sum and Sliding Window.

Prefix Sum and Sliding Window are powerful techniques used to efficiently solve range queries and subarray problems.

Instead of recalculating sums repeatedly, these techniques help reduce time complexity from `O(n²)` to `O(n)` in many cases.

These methods are widely used in problems involving:

- Subarrays
- Range sum queries
- Maximum or minimum subarray values
- Longest or shortest valid windows

### Why these techniques are important.

- Reduce repeated computations
- Improve performance for range queries
- Solve subarray problems efficiently
- Commonly used in competitive programming and interviews

<hr />

## Prefix Sum (1D).

Prefix Sum is a technique used to precompute cumulative sums of an array.

Each position stores the sum of all elements from the beginning of the array up to that index.

Given an array `arr` of length `n`, the prefix sum array `prefix` is defined as:

    <!-- Input -->
    arr = [3, 5, 2, -1, 6];

    <!-- Using formula to calculate -->
    prefix[i] = prefix[i-1] + arr[i]

    <!-- Output -->
    prefix = [3, 8, 10, 9, 15]

Because:

- `prefix[0]` = 3
- `prefix[1]` = 3 + 5 = 8
- `prefix[2]` = 8 + 2 = 10
- `prefix[3]` = 10 - 1 = 9
- `prefix[4]` = 9 + 6 = 15

Here's an example:

    #include <iostream>
    #include <vector>
    using namespace std;

    int main(){

        vector<int> arr = {1,2,3,4,5};

        vector<int> prefix(arr.size());

        prefix[0] = arr[0];

        for(int i = 1; i < arr.size(); i++)
            prefix[i] = prefix[i-1] + arr[i];

        for(int x : prefix)
            cout << x << " ";

    }

<hr />

## Prefix Sum (2D).

2D Prefix Sum is used when working with matrices or grids.

It helps calculate the sum of a submatrix efficiently.

Each cell stores the sum of all elements from the top-left corner to that position.

    prefix[i][j] = prefix[i-1][j] + prefix[i][j-1] - prefix[i-1][j-1] + matrix[i][j]

For example, here a matrix

    arr = [[1, 2], [3, 4]]

    2D prefix = [[1, 3], [4, 10]]

This allows quick queries of rectangular regions.

<hr />

## Range Queries using Prefix Sum.

Prefix sums allow us to compute subarray sums quickly.

Instead of summing elements every time, we use precomputed values.

### Range Sum Formula.

To find the sum from index L to R:

    sum(L, R) = prefix[R] - prefix[L-1]

For example,

    arr = [1, 2, 3, 4, 5]

    prefix = [1, 3, 6, 10, 15]

    <!-- sum from index 1 to 3 -->
    prefix[3] - prefix[0] = 10 - 1 = 9

<hr />

## Sliding Window Technique.

Sliding Window is a technique used to **reduce time complexity** by avoiding unnecessary repeated work — especially when dealing with **contiguous subarrays** or **strings**.

Instead of computing results from scratch for every window (or subarray), you “slide” the window and **reuse** part of the previous computation.

Here are common problems that can be solved using prefix sum:

![img](https://miro.medium.com/v2/resize:fit:828/format:webp/1*d66h5Wt_czVMObntUYHtRA.png)

### Fixed Window.

A Fixed Window maintains a constant window size.

Example: Find the maximum sum of a subarray of size k.

Concept:

1.  Compute the first window sum
2.  Slide the window forward
3.  Add new element
4.  Remove old element

        #include <iostream>
        #include <vector>
        using namespace std;

        int main(){

            vector<int> arr = {2,1,5,1,3,2};
            int k = 3;

            int windowSum = 0;

            for(int i = 0; i < k; i++)
                windowSum += arr[i];

            int maxSum = windowSum;

            for(int i = k; i < arr.size(); i++){

                windowSum += arr[i];
                windowSum -= arr[i-k];

                maxSum = max(maxSum, windowSum);
            }

            cout << maxSum;

        }

### Variable Window.

A Variable Window does not have a fixed size.

The window expands and shrinks based on conditions.

For Example : Find the smallest subarray whose sum ≥ target.

    while(right < n){

        expand window

        while(condition satisfied){
            shrink window
            left++
        }

        right++
    }

This technique is very useful for solving dynamic subarray problems.

<hr />

## Time Complexity.

Usually `O(n)` because each element is added/removed at most once from the window.

### Sliding Window vs Prefix Sum.

![img](https://miro.medium.com/v2/resize:fit:828/format:webp/1*9d3dnhvv9_sBjiaJ5dxJEg.png)

<hr />

## Assignment.

1.  You are given an array of integers and multiple queries. Each query asks for the sum of elements between index L and R. Use Prefix Sum to answer queries efficiently.

        <!-- Input -->
        Array: 1 2 3 4 5
        Query: L = 1, R = 3

        <!-- Output -->
        9

        <!-- Explanation -->
        2 + 3 + 4 = 9

    [Solution](./Assignment/code1.cpp)

2.  Given an array and an integer `k`, find the maximum sum of subarray of size k.

        <!-- Input -->
        Array: 2 1 5 1 3 2
        k = 3

        <!-- Output -->
        9

        <!-- Explanation -->
        Subarrays of size 3:

        2 1 5 → 8
        1 5 1 → 7
        5 1 3 → 9  ← maximum
        1 3 2 → 6

    [Solution](./Assignment/code2.cpp)

3.  Given an array of positive integers and a target value, find the length of the smallest subarray whose sum is greater than or equal to the target.

    If no such subarray exists, return 0.

        <!-- Input -->
        Array: 2 3 1 2 4 3
        Target = 7

        <!-- Output -->
        2

        <!-- Explanation -->
        Subarray: 4 + 3 = 7
        Length = 2

    [Solution](./Assignment/code3.cpp)
