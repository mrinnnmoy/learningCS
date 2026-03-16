# List of things learned.

## Introduction to Two Pointer Technique.

The Two Pointer Technique is an algorithmic approach where two indices (pointers) are used to iterate through a data structure, usually an array or string.

![img](https://miro.medium.com/v2/resize:fit:828/format:webp/1*MvZl1lTJrU1Pqpj9bPTsRw.png)

Instead of using nested loops, this technique allows us to solve many problems in linear time O(n).

### Why Two Pointers are Useful?

- Reduces time complexity from O(n²) → O(n)
- Works efficiently with sorted data
- Used frequently in DSA interviews and competitive programming

### When to use Two Pointers.

It is commonly used in problems involving:

- **Sorted Input** : If the array or list is already sorted (or can be sorted), two pointers can efficiently find pairs or ranges. Example: Find two numbers in a sorted array that add up to a target.
- **Pairs or Subarrays** : When the problem asks about two elements, subarrays, or ranges instead of working with single elements. Example: Longest substring without repeating characters, maximum consecutive ones, checking if a string is palindrome.
- **Sliding Window Problems** : When you need to maintain a window of elements that grows/shrinks based on conditions. Example: Find smallest subarray with sum ≥ K, move all zeros to end while maintaining order.
- **Linked Lists (Slow–Fast pointers)** : Detecting cycles, finding the middle node, or checking palindrome property. Example: Floyd’s Cycle Detection Algorithm (Tortoise and Hare).

<hr />

## Opposite Direction Pointers.

In this technique, two pointers start from opposite ends of the array.

One pointer starts from the beginning, and the other starts from the end.

They move toward each other until a condition is satisfied.

- left -> start of array
- right -> end of array

Adjust the pointers depending on the condition.

For example,

    int left = 0;
    int right = n - 1;

    while(left < right){

        if(arr[left] + arr[right] == target)
            break;

        else if(arr[left] + arr[right] < target)
            left++;

        else
            right--;
    }

<hr />

## Same Direction Pointers.

In this technique, both pointers move in the same direction.

Usually:

- slow pointer
- fast pointer

The fast pointer scans the array while the slow pointer tracks valid positions.

Some of it's common uses are:

1. Removing duplicates
2. Compressing arrays
3. Partitioning arrays
4. Tracking valid elements

For example,

    int slow = 0;

    for(int fast = 0; fast < n; fast++){

        if(arr[fast] != arr[slow]){
            slow++;
            arr[slow] = arr[fast];
        }

    }

This method is often used when modifying arrays in-place.

<hr />

## Sorted Array Techniques.

Two pointer techniques often work best with sorted arrays.

Sorting allows us to make decisions based on element order.

Here's how this technique works:

1. Sort the array
2. Place one pointer at the start
3. Place the other pointer at the end
4. Move pointers based on conditions

**Time complexity** -> Sorting (`O(n log n)`) + Two Pointers (`O(n)`).

<hr />

## Pair Sum Problem.

One of the most common two-pointer problems is finding two numbers whose sum equals a target value.

For example,

- Given a sorted array, determine if two elements sum to a given target.
  - Array: 1 2 3 4 6
  - Target: 6
  - Pair Found: 2 + 4

  Two Pointer logic:
  - left = 0
  - right = n - 1

  Adjust pointers depending on the sum.

<hr />

## Removing Duplicates.

Two pointers can also be used to remove duplicate elements from sorted arrays.

This technique keeps only unique values while modifying the array in-place.

- Input : 1 1 2 2 3 4 4
- Output : 1 2 3 4

Concept:

- One pointer tracks unique elements
- The other scans the array

<hr />

## Sliding Range Logic.

Sliding Range Logic is a variation of the Two Pointer technique where we maintain a moving window over a range of elements.

This approach is commonly called the Sliding Window Technique.

Two pointers represent a window range.

- left -> start of window
- right -> end of window

The window expands or shrinks based on conditions.

For example,

    while(right < n){

        expand window

        while(condition not satisfied){
            shrink window
            left++
        }

        right++;
    }

Some example of use cases are:

- Maximum subarray problems
- Longest substring without repeating characters
- Minimum window substring
- Fixed window sums

<hr />

## Time Complexity Advantage.

The Two Pointer technique is powerful because it often reduces nested loops into a single pass.

Here's an example of a brute force pair sum:

    for i from 0 → n
        for j from i+1 → n

- Time Complexity (without Two Pointers) : `O(n²)`
- Time Complexity (with Two Pointers) : `O(n)`

This is why the Two Pointer technique is widely used to optimize algorithms.

<hr />

## Assignment.

1.  Given a sorted array, check if there exists a pair whose sum equals a given target.

        Input:
        Array = [1,2,3,4,6]
        Target = 6

        Output:
        Pair Found

    [Solution](./Assignment/code1.cpp)

2.  Given a sorted array, remove duplicates in-place and print the unique elements.

        Input:
        1 1 2 2 3 4 4

        Output:
        1 2 3 4

    [Solution](./Assignment/code2.cpp)

3.  Given an array representing heights of vertical lines, find two lines that together hold the maximum water.

        Input:
        1 8 6 2 5 4 8 3 7

        Output:
        49

    [Solution](./Assignment/code3.cpp)
