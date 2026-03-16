# List of things learned.

## Introduction to Algorithms.

Previously we learned that data structures (like vectors, lists, etc) are used to store and organize data.

**Algorithms** are step-by-step procedures used to solve problems by sorting, searching and manipulating data stored in these structures.

In C++, the `<algorithm>` library provides many useful functions that work with **iterators**.

To use these functions, you must include the following header file:

    // Include the algorithm library
    #include <algorithm>

The STL algorithms help us perform common operations efficiently without writing everything from scratch.

<hr />

## Sorting Algorithms.

Sorting means arranging elements in a specific order, usually:

- Ascending order
- Descending order

Sorting is important because many algorithms (like binary search) only work on **sorted data**.

### STL `sort()` Function.

To sort elements in a data structure, you can use the `sort()` function.

The `sort()` function takes iterators (typically a start iterator returned by `begin()` and an end iterator returned by `end()`) as parameters:

    // Create a vector called cars that will store strings
    vector<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

    // Sort cars alphabetically
    sort(cars.begin(), cars.end());

By default, the elements are sorted in ascending order. In the example above, the elements are sorted alphabetically since they are strings.

If we had a vector of integers, they would be sorted numerically:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Sort numbers numerically
    sort(numbers.begin(), numbers.end());

#### Sorting in Descending Order.

To reverse the order, you can use `rbegin()` and `rend()` instead of `begin()` and `end()`:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Sort numbers numerically in reverse order
    sort(numbers.rbegin(), numbers.rend());

#### Sorting only part of a Container.

To only sort specific elements, you could write:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Sort numbers numerically, starting from the fourth element (only sort 5, 9, and 2)
    sort(numbers.begin() + 3, numbers.end());

<hr />

## Custom Comparator.

A custom comparator allows you to define your own rule for sorting.

This is useful when default sorting is not enough.

For example, sort in descending order:

    #include <iostream>
    #include <vector>
    #include <algorithm>
    using namespace std;

    bool compare(int a, int b){
        return a > b;
    }

    int main(){

        vector<int> nums = {4,1,7,2};

        sort(nums.begin(), nums.end(), compare);

        for(int x : nums)
            cout << x << " ";

    }

    <!-- Output -->
    7 4 2 1

Custom comparators are also used for:

- Sorting pairs
- Sorting objects
- Sorting based on specific conditions

<hr />

## Stable vs Unstable Sorting.

Sorting algorithms can be stable or unstable.

### Stable Sorting.

If two elements are equal, their relative order remains the same.

- Merge Sort
- Insertion Sort

### Unstable Sorting.

Equal elements may change their order.

- Quick Sort
- Heap Sort

Stable sorting is useful when sorting by multiple fields.

<hr />

## Bubble Sort.

Bubble Sort is a simple sorting algorithm that repeatedly swaps adjacent elements if they are in the wrong order.

For example,

    #include <iostream>
    using namespace std;

    int main(){

        int arr[] = {5,3,8,4,2};
        int n = 5;

        for(int i=0;i<n-1;i++){

            for(int j=0;j<n-i-1;j++){

                if(arr[j] > arr[j+1])
                    swap(arr[j], arr[j+1]);

            }

        }

        for(int i=0;i<n;i++)
            cout << arr[i] << " ";

    }

<hr />

## Merge Sort.

Merge Sort is a **divide** and **conquer algorithm**.

It divides the array into smaller parts, sorts them, and then merges them.

Steps:

1. Divide the array into two halves
2. Recursively sort each half
3. Merge the sorted halves

Properties:

- Stable
- Requires extra memory

<hr />

## Quick Sort.

Quick Sort works by selecting a pivot element and partitioning the array around it.

Steps:

1. Choose a pivot
2. Place smaller elements to the left
3. Place larger elements to the right
4. Recursively sort both sides

Quick sort is very fast in practice and widely used.

<hr />

## Searching Algorithms.

Searching means finding a specific element in a data structure.

The `<algorithm>` library provides useful searching functions.

### `find()` Function.

To search for specific elements in a vector, you can use the `find()` function.

It takes three parameters: `start_iterator`, `end_iterator` & `value`, where **value** is the value to search for:

For example, search for the number **3** in **"numbers"**:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Search for the number 3
    auto it = find(numbers.begin(), numbers.end(), 3);

<hr />

## Binary Search.

Binary Search is a fast searching algorithm that works on **sorted arrays**.

Instead of checking every element, it repeatedly **divides the search space into halves**.

Steps:

1. Find the middle element
2. Compare it with the target
3. If equal → found
4. If smaller → search right half
5. If larger → search left half

For example,

    #include <iostream>
    #include <vector>
    #include <algorithm>
    using namespace std;

    int main(){

        vector<int> nums = {1,3,5,7,9};

        int target = 5;

        if(binary_search(nums.begin(), nums.end(), target))
            cout << "Element Found";
        else
            cout << "Element Not Found";

    }

### `lower_bound()` Function.

`lower_bound()` returns the first element greater than or equal to the target value.

It works only on **sorted containers**.

Syntax : `lower_bound(start_iterator, end_iterator, value)`

For example,

    vector<int> nums = {1,2,4,4,5,6};

    auto it = lower_bound(nums.begin(), nums.end(), 4);

    cout << *it;

    <!-- Output -->
    4

### `upper_bound()` Function.

To search for the first element that is greater than a specific value, you can use the `upper_bound()` function:

For example, find the first value greater than **5** in **"numbers"**:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Sort the vector in ascending order
    sort(numbers.begin(), numbers.end());

    // Find the first value that is greater than 5 in the sorted vector
    auto it = upper_bound(numbers.begin(), numbers.end(), 5);

The `upper_bound()` function is typically used on sorted data structures. That's why we first sort the vector in the example above.

To find the smallest element in a vector, use the `min_element()` function:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Find the smallest number
    auto it = min_element(numbers.begin(), numbers.end());

To find the largest element, use the `max_element()` function:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Find the largest number
    auto it = max_element(numbers.begin(), numbers.end());

<hr />

## Modifying Algorithms.

### `copy()` Function.

To copy elements from one vector to another, you can use the `copy()` function:

For example, copy elements from one vector to another:

    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Create a vector called copiedNumbers that should store 6 integers
    vector<int> copiedNumbers(6);

    // Copy elements from numbers to copiedNumbers
    copy(numbers.begin(), numbers.end(), copiedNumbers.begin());

### `fill()` Function.

To fill all elements in a vector with a value, you can use the `fill()` function:

For example, fill an elements in the numbers vector with the value 35:

    // Create a vector called numbers that will store 6 integers
    vector<int> numbers(6);

    // Fill all elements in the numbers vector with the value 35
    fill(numbers.begin(), numbers.end(), 35);

<hr />

## Search Space Thinking.

Search space thinking is a powerful problem-solving technique.

Instead of checking every value, we apply binary search on possible answers.

Steps:

1. Define a range of possible answers
2. Check if a value is valid
3. Use binary search to narrow the range

This technique is commonly used in problems like:

- Minimum speed problems
- Maximum allocation problems
- Optimization problems

<hr />

## Assignment.

1. Given an array of integers, sort the array in ascending order and print the result.
   - Input : `5`, `4 2 7 1 3`
   - Output : `1 2 3 4 7`

   [Solution](./Assignment/code1.cpp)

2. Given a sorted array and a number `x`, find how many time `x` appears in the array.
   - Input : `7`, `1 2 4 4 4 5 6`, `4`
   - Output : `3`

   [Solution](./Assignment/code2.cpp)

3. Given a sorted array and a number `x`, find the index of x using binary search. If the element does not exist, print `-1`.
   - Input : `5`, `1 3 5 7 9`, `7`
   - Output : `3`

   [Solution](./Assignment/code3.cpp)
