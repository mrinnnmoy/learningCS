# List of things learned.

## Introduction to Recursion.

Recursion is a programming technique where a function calls itself repeatedly until a specific base condition is met.

A function that performs such self-calling behavior is known as a recursive function and each instance of the function calling itself is called a recursive call.

For example,

    #include <iostream>
    using namespace std;

    void printHello(int n) {

        // Base Case
        if (n == 0) return;

        cout << "Hello" << endl;

        printHello(n - 1);
    }

    int main() {
        printHello(5);
        return 0;
    }

    <!-- Output -->
    Hello
    Hello
    Hello
    Hello
    Hello

### How recursion works internally. (call stack)

- **Step 1** - Define a base case: Identify the simplest (or base) case for which the solution is known or trivial. This is the stopping condition for the recursion, as it prevents the function from infinitely calling itself.

- **Step 2** - Define a recursive case: Define the problem in terms of smaller subproblems. Break the problem down into smaller versions of itself, and call the function recursively to solve each subproblem.

- **Step 3** - Ensure the recursion terminates: Make sure that the recursive function eventually reaches the base case, and does not enter an infinite loop.

- **Step 4** - Combine the solutions: Combine the solutions of the subproblems to solve the original problem.

### Need for recursion.

- Recursion helps in logic building. Recursive thinking helps in solving complex problems by breaking them into smaller subproblems.
- Recursive solutions work as a a basis for Dynamic Programming and Divide and Conquer algorithms.
- Certain problems can be solved quite easily using recursion like **Towers of Hanoi (TOH)**, **Inorder/Preorder/Postorder Tree Traversals**, **DFS of Graph**, etc.

### What happens if there is no base case? (Stack overflow)

Stack overflow is one of the most common errors associated with the recursion which occurs when a function calls itself too many times.

As we know that each recursive call requires separate space in the limited stack memory.

When there is a large number of recursive calls or recursion goes on infinite times, this stack memory may get exhausted and may not be able to store more data leading to programs' termination.

If the base case is not reached or not defined, then the stack overflow problem may arise.

Let us take an example to understand this.

    int fact(int n)
    {
        // wrong base case (it may cause stack overflow).
        if (n == 100)
            return 1;
        else
            return n*fact(n-1);
    }

- In this example, if `fact(10)` is called, the function will recursively call `fact(9)`, then `fact(8)`, `fact(7)` and so on.

  However, the base case checks if `n == 100`. Since `n` will never reach 100 during these recursive calls, the base case is never triggered.

  As a result, the recursion continues indefinitely.

- This continuous recursion consumes memory on the function call stack.

  If the system's memory is exhausted due to these unending function calls, a stack overflow error occurs.

- To prevent this, it's essential to define a proper base case, such as if `(n == 0)` to ensure that the recursion terminates and the function doesn't run out of memory.

<hr />

## How the Call Stack works.

Recursion uses more memory to store data of every recursive call in an internal function call stack.

- Whenever we call a function, its record is added to the stack and remains there until the call is finished.
- The internal systems use a stack because function calling follows LIFO structure, the last called function finishes first.

When any function is called from `main()`, the memory is allocated to it on the stack.

A recursive function calls itself, the memory for a called function is allocated on top of memory allocated to the calling function and a different copy of local variables is created for each function call.

When the base case is reached, the function returns its value to the function by whom it is called and memory is de-allocated and the process continues.

Let us take the example of how recursion works by taking a simple function.

    // A C++ program to demonstrate working of
    // recursion
    #include <bits/stdc++.h>
    using namespace std;

    void printFun(int test)
    {
        if (test < 1)
            return;
        else {
            cout << test << " ";
            printFun(test - 1); // statement 2
            cout << test << " ";
            return;
        }
    }

    // Driver Code
    int main()
    {
        int test = 3;
        printFun(test);
    }

    <!-- Output -->
    3 2 1 1 2 3

- **Initial Call**: When `printFun(3)` is called from `main()`, memory is allocated for `printFun(3)`. The local variable test is initialized to 3, and statements 1 to 4 are pushed onto the stack.

- **First Recursive Call**:
  - `printFun(3)` calls `printFun(2)`.
  - Memory for `printFun(2)` is allocated, the local variable test is initialized to 2, and statements 1 to 4 are pushed onto the stack.

- **Second Recursive Call**:
  - `printFun(2)` calls `printFun(1)`.
  - Memory for `printFun(1)` is allocated, the local variable test is initialized to 1, and statements 1 to 4 are pushed onto the stack.

- **Third Recursive Call**:
  - `printFun(1)` calls `printFun(0)`.
  - Memory for `printFun(0)` is allocated, the local variable test is initialized to 0, and statements 1 to 4 are pushed onto the stack.

- **Base Case**: When `printFun(0)` is called, it hits the base case (if statement) and returns control to printFun(1).

- **Returning from Recursion**:
  - After returning from `printFun(0)`, the remaining statements of **printFun(1)** are executed and it returns control to **printFun(2)**.
  - Similarly, after returning from **printFun(2)**, control returns to **printFun(3)**.

- **Output**: As a result, the output will print the values in the following order:
  - From 3 down to 1 (as the recursive calls are made).
  - Then from 1 back to 3 (as the recursive calls unwind).

The memory stack grows with each function call and shrinks as the recursion unwinds, following the LIFO structure.

### Fibonacci with Recursion.

Write a program and recurrence relation to find the Fibonacci series of `n` where `n >= 0`.

- Mathematical Equation:

      n if n == 0, n == 1;
      fib(n) = fib(n-1) + fib(n-2) otherwise;

- Recurrence Relation:

      T(n) = T(n-1) + T(n-2) + O(1)

Here's the code,

      // C++ code to implement Fibonacci series
      #include <bits/stdc++.h>
      using namespace std;

      // Function for fibonacci

      int fib(int n)
      {
          // Stop condition
          if (n == 0)
              return 0;

          // Stop condition
          if (n == 1 || n == 2)
              return 1;

          // Recursion function
          else
              return (fib(n - 1) + fib(n - 2));
      }

      // Driver Code
      int main()
      {
          // Initialize variable n.
          int n = 5;
          cout<<"Fibonacci series of 5 numbers is: ";

          // for loop to print the fibonacci series.
          for (int i = 0; i < n; i++)
          {
              cout<<fib(i)<<" ";
          }
          return 0;
      }

      <!-- Output -->
      Fibonacci series of 5 numbers is: 0 1 1 2 3

- **Recursion Tree for the above code**.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250318141757504475/Fibonacci-series-768.webp)

### Common Applications of Recursion.

1. **Tree and Graph Traversal**: Used for systematically exploring nodes/vertices in data structures like trees and graphs.

2. **Sorting Algorithms**: Algorithms like quicksort and merge sort divide data into subarrays, sort them recursively, and merge them.

3. **Divide-and-Conquer Algorithms**: Algorithms like binary search break problems into smaller subproblems using recursion.

4. **Fractal Generation**: Recursion helps generate fractal patterns, such as the Mandelbrot set, by repeatedly applying a recursive formula.

5. **Backtracking Algorithms**: Used for problems requiring a sequence of decisions, where recursion explores all possible paths and backtracks when needed.

6. **Memoization**: Involves caching results of recursive function calls to avoid recomputing expensive subproblems.

These are just a few examples of the many applications of recursion in computer science and programming.

Recursion is a versatile and powerful tool that can be used to solve many different types of problems.

### Drawbacks of Recursion.

- **Performance**: Recursive algorithms can be less efficient than iterative algorithms in some cases, particularly if the data structure is large or if the recursion goes too deep.

- **Memory usage**: Recursive algorithms can use a lot of memory, particularly if the recursion goes too deep or if the data structure is large. Each recursive call creates a new stack frame on the call stack, which can quickly add up to a significant amount of memory usage.

- **Code complexity**: Recursive algorithms can be more complex than iterative algorithms.

- **Debugging**: Recursive algorithms can be more difficult to debug than iterative algorithms, particularly if the recursion goes too deep or if the program is using multiple recursive calls.

- **Stack Overflow**: If the recursion goes too deep, it can cause a stack overflow error, which can crash the program.

<hr />

## Type of Recursion.

Recursion are mainly of 2 types depending on whether a function calls itself from within itself or more than one function call one another mutually.

The first one is called **direct recursion** and another one is called **indirect recursion**.

### Direct Recursion.

These can be further categorized into 4 types.

1.  **Tail Recursion** : If a recursive function calling itself and that recursive call is the last statement in the function then it's known as Tail Recursion.

    After that call the recursive function performs nothing. The function has to process or perform any operation at the time of calling and it does nothing at returning time.

    For example,

        // Code Showing Tail Recursion
        #include <iostream>
        using namespace std;

        // Recursion function
        void fun(int n)
        {
            if (n > 0) {
                cout << n << " ";

                // Last statement in the function
                fun(n - 1);
            }
        }

        // Driver Code
        int main()
        {
            int x = 3;
            fun(x);
            return 0;
        }

        <!-- Output -->
        3 2 1

    Let's understand the example by tracing tree of recursive function.

    That is how the calls are made and how the outputs are produced.

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20190621015455/tail1.jpg)
    - **Time Complexity For Tail Recursion** : O(n)
    - **Space Complexity For Tail Recursion** : O(n)

2.  **Head Recursion** : If a recursive function calling itself and that recursive call is the first statement in the function then it's known as Head Recursion.

    There's no statement, no operation before the call. The function doesn't have to process or perform any operation at the time of calling and all operations are done at returning time.

    For example,

        // C++ program showing Head Recursion

        #include <bits/stdc++.h>
        using namespace std;

        // Recursive function
        void fun(int n)
        {
            if (n > 0) {

                // First statement in the function
                fun(n - 1);

                cout << " "<< n;
            }
        }

        // Driver code
        int main()
        {
            int x = 3;
            fun(x);
            return 0;
        }

        <!-- Output -->
        1 2 3

    Let's understand the example by tracing tree of recursive function.

    That is how the calls are made and how the outputs are produced.

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20190621015721/head3.jpg)
    - **Time Complexity For Head Recursion**: O(n)
    - **Space Complexity For Head Recursion**: O(n)

3.  **Tree Recursion** : To understand Tree Recursion let's first understand Linear Recursion.

    If a recursive function calling itself for one time then it's known as Linear Recursion. Otherwise if a recursive function calling itself for more than one time then it's known as Tree Recursion.

    Here's the pseudo code for linear recursion.

        fun(n)
        {
            // some code
            if(n>0)
            {
                fun(n-1); // Calling itself only once
            }
            // some code
        }

    Here's the program for tree recursion.

        // C++ program to show Tree Recursion
        #include <iostream>
        using namespace std;

        // Recursive function
        void fun(int n)
        {
            if (n > 0)
            {
                cout << " " << n;

                // Calling once
                fun(n - 1);

                // Calling twice
                fun(n - 1);
            }
        }

        // Driver code
        int main()
        {
            fun(3);
            return 0;
        }

        <!-- Output -->
        3 2 1 1 2 1 1

    Let's understand the example by tracing tree of recursive function.

    That is how the calls are made and how the outputs are produced.

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20190621015814/tree4.jpg)
    - **Time Complexity For Tree Recursion**: O(2^n)
    - **Space Complexity For Tree Recursion**: O(n)

4.  **Nested Recursion** : In this recursion, a recursive function will pass the parameter as a recursive call.

    That means "recursion inside recursion". Let see the example to understand this recursion.

        // C++ program to show Nested Recursion
        #include <iostream>
        using namespace std;

        int fun(int n)
        {
            if (n > 100)
                return n - 10;

            // A recursive function passing parameter
            // as a recursive call or recursion inside
            // the recursion
            return fun(fun(n + 11));
        }

        // Driver code
        int main()
        {
            int r;
            r = fun(95);

            cout << " " << r;

            return 0;
        }

        <!-- Output -->
        91

    Let's understand the example by tracing tree of recursive function.

    That is how the calls are made and how the outputs are produced.

    ![img](https://media.geeksforgeeks.org/wp-content/uploads/20190621015942/nested2.jpg)

### Indirect Recursion.

In this recursion, there may be more than one functions and they are calling one another in a circular manner.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20190608232223/Capture34.jpg)

From the above diagram `fun(A)` is calling for `fun(B)`, `fun(B)` is calling for `fun(C)` and `fun(C)` is calling for `fun(A)` and thus it makes a cycle.

    // C++ program to show Indirect Recursion
    #include <iostream>
    using namespace std;

    void funB(int n);

    void funA(int n)
    {
        if (n > 0) {
            cout <<" "<< n;

            // fun(A) is calling fun(B)
            funB(n - 1);
        }
    }

    void funB(int n)
    {
        if (n > 1) {
            cout <<" "<< n;

            // fun(B) is calling fun(A)
            funA(n / 2);
        }
    }

    // Driver code
    int main()
    {
        funA(20);
        return 0;
    }

    <!-- Output -->
    20 19 9 8 4 3 1

Let's understand the example by tracing tree of recursive function.

That is how the calls are made and how the outputs are produced.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20190621015857/indirect1.jpg)

<hr />

## Understanding Recursion Tree.

The recursion tree method is used to analyze the time complexity of recursive algorithms by visually representing the recurrence as a tree.

Each node of the tree represents the work done in a single recursive call, and each level represents one stage of the recursion.

Below are the steps used to find time complexity using recursion tree method.

1. Draw a recursive tree for given recurrence relation
2. Calculate the cost at each level and count the total no of levels in the recursion tree.
3. Sum up the cost of all the levels in the recursive tree

Let us take the below example code to understand the steps discussed above,

    void fun(int n) {

        if (n <= 1)
            return;

        fun(n / 2);
        fun(n / 2);

        for (int i = 0; i < n; i++) {
            cout << "GFG ";
        }
    }

- **Understanding the Recursion for This Code** : The function makes two recursive calls, each on a subproblem of size `n/2`.

  After both recursive calls return, it performs a loop that prints "GFG" exactly `n` times, which is linear work for each function call.

  The recursion stops when n ≤ 1.

- **Writing the Recurrence Relation** : Each function call makes two recursive calls of size `n/2` and performs linear work after the recursion.

  Therefore, the recurrence relation is: `T(n) = 2T(n/2) + O(n)`

  To find `T(n)`, we analyze the recursion tree and sum the cost at each level.
  - **Level 0**: The root contributes a cost of cn.

  - **Level 1**: The subproblems are of sizes `n/2` and `n/2`.
    Their total cost is: `c(n/2)+ c(n/2) = cn`

  - **Level 2**: There are four subproblems of size `n/4`.
    Continuing this way, the work at each level reamains cn.

- **Total work across all levels** : The input size halves at each level, and the recursion stops when the size becomes constant.

  Hence, the height of the recursion tree is `log⁡n`.

  Since each level contributes a cost of cn, the total work is:

  `T(n) = cn + cn + ....... + cn (log n levels)`

  `T(n) = cn log n`

  Final Result: `T(n) = O(n log n)`

### Another example with unequal subproblems.

Let us see the below code as another recursive code to be analyzed using recursion tree method.

    void fun(int n) {

        if (n <= 1)
            return;

        fun(n / 4);
        fun(n / 2);

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                cout << "GFG ";
            }
        }
    }

- **Understanding the Recursion for This Code** :
  - The function makes two recursive calls:
    - one with input size n/4
    - one with input size n/2

  - After the recursive calls return, the function performs quadratic work, printing "GFG" for every pair (i, j).
  - The recursion stops when n ≤ 1.

- **Writing the Recurrence Relation** :

  The recursive calls contribute T(n/4) and T(n/2).

  The nested loops perform Θ(n²) work.

  Therefore, the recurrence relation is: T(n) = T(n/4) + T(n/2) + O(n2)

### Issue with Recursion Trees Having Unequal Subproblems.

In recursion trees where the problem does not split into equal-sized subproblems, the height of the recursion tree is not uniform across all branches.

In the given example, one recursive call reduces the problem size to n/2, while the other reduces it to n/4.

As a result, some branches of the recursion tree terminate earlier, while others continue deeper.

Because of this imbalance:

- Some leaf nodes appear at lower levels of the recursion tree.
- Other leaf nodes appear at higher levels, making the tree uneven.

When we apply the geometric progression (GP) method to sum the cost across levels, we implicitly assume that all subproblems continue until the same depth.

This assumption is not strictly true for recurrences with unequal subproblem sizes.

However, to simplify the analysis and still obtain a valid asymptotic bound, we take an upper-bound approach:

- We assume that all recursive branches continue until the deepest level of the recursion tree.
- This assumption may overestimate the total work, but it ensures that the computed complexity is a correct upper bound.

To find T(n), we analyze the recursion tree and sum the cost at each level.

- **Level 0**: The root contributes a cost of cn2.

- **Level 1**: The subproblems are of sizes n/2 and n/4.

  Their total cost is: c(n/2)2 + c(n/4)2 = cn2 (1/4 + 1/16) = cn2 ⋅ 5/16

- **Level 2**: The same pattern repeats, and the total cost becomes

  cn2 (5/16)2 = cn2 ⋅ 25/256

  Continuing this way, the total work forms the geometric series:

  T(n) = cn2 (1 + 5/16 + (5/16)2 + ...... )

  This is a geometric progression with common ratio 5/16 < 1 so it converges.

  Summing the infinite series given an upper bound proportional to n2.

**Final Result**: T(n) = O(n2)

<hr />

## Back Tracking.

Backtracking is a problem-solving algorithmic technique that involves finding a solution incrementally by trying different options and undoing them if they lead to a dead end.

- Backtracking is used to explore multiple possibilities in problems such as finding a path in a maze or solving puzzles like Sudoku, by systematically trying different choices.

- When a choice leads to a dead end, the algorithm backtracks to the previous decision point and tries a different path, avoiding unnecessary exploration of invalid solutions.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250925170402526734/frame_3105-768.webp)

### How does Backtracking work?

Backtracking is a systematic trial-and-error technique where we build a solution step by step and undo (or “backtrack”) whenever we hit a dead end.

The idea is simple:

1. **Choose** – Start by making a choice that could lead toward a solution.
2. **Explore** – Recursively move forward with this choice.
3. **Check validity** – If the choice leads to an invalid state, undo it (backtrack) and try another option.
4. **Repeat** – Continue this process until all possibilities are explored or a valid solution is found.

Backtracking ensures we don’t waste time pursuing impossible paths. Instead, it systematically explores only feasible ones by backing up whenever a choice fails.

### Difference between Recursion and Backtracking.

| SL No. | Recursion                                                                                                                                          | Backtracking                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Recursion does not always need backtracking                                                                                                        | Backtracking is often implemented using recursion, but it can also be implemented iteratively                                                                            |
| 2      | A recursive function solves a particular problem by calling a copy of itself and solving smaller subproblems of the original problems.             | Backtracking at every step eliminates those choices that cannot give us the solution and proceeds to those choices that have the potential of taking us to the solution. |
| 3      | Recursion is a part of backtracking itself and it is simpler to write.                                                                             | Backtracking is comparatively complex to implement.                                                                                                                      |
| 4      | Applications of recursion are Tree and Graph Traversal, Towers of Hanoi, Divide and Conquer Algorithms, Merge Sort, Quick Sort, and Binary Search. | Application of Backtracking is N Queen problem, Rat in a Maze problem, Knight's Tour Problem, Sudoku solver, and Graph coloring problems.                                |
| 5      | Recursion usually involves O(n) stack space.                                                                                                       | Backtracking can be O(n!) or more depending on constraints.                                                                                                              |

### Standard Backtracking Problems.

- [N-Queen Problems](https://www.geeksforgeeks.org/dsa/printing-solutions-n-queen-problem/)
- [Solve Sudoku](https://www.geeksforgeeks.org/dsa/sudoku-backtracking-7/)
- [M-coloring problem](https://www.geeksforgeeks.org/dsa/m-coloring-problem/)
- [Rat in a Maze](https://www.geeksforgeeks.org/dsa/rat-in-a-maze/)
- [The Knight's tour problem](https://www.geeksforgeeks.org/dsa/the-knights-tour-problem/)
- [Permutation of a given string](https://www.geeksforgeeks.org/dsa/write-a-c-program-to-print-all-permutations-of-a-given-string/)

<hr />

## Memoization. (Recursion + Caching)

Memoization is an optimization technique primarily used to enhance the performance of algorithms by storing the results of expensive function calls and reusing them when the same inputs occur again.

The term comes from "memorandum", which refers to a note intended to help with memory.

Memoization is particularly effective in scenarios involving repeated computations, like recursive algorithms, where the same calculations may be performed multiple times.

### Why is Memoization used?

Memoization is a specific form of caching that is used in dynamic programming.

The purpose of caching is to improve the performance of our programs and keep data accessible that can be used later.

It basically stores the previously calculated result of the subproblem and reuses the stored result for the same subproblem.

This removes the extra effort to calculate again and again for the same problem.

### Where to use Memoization?

Memoization is useful in situations where previously calculated results can be reused.

It is particularly effective in **recursive problems**, especially those involving **overlapping subproblems**, where the same calculations are repeated multiple times.

### Types of Memoization.

The implementation of memoization depends on the parameters that change and are responsible for solving the problem.

Memoization can be applied in various ways, based on the number of arguments in the recursive function.

Below are some common types of memoization:

- **1D Memoization**: Used when the recursive function has one argument whose value changes with every function call.

- **2D Memoization**: Used when the recursive function has two arguments whose values change with every function call.

- **3D Memoization**: Used when the recursive function has three arguments whose values change with every function call.

<hr />

## Time & Space Complexity of Recursion.

- Time complexity = number of recursive calls × work per call
- Space complexity = maximum depth of call stack
- Complexity of common recursive patterns:
  - Linear recursion: O(n) time, O(n) space
  - Tree recursion (fibonacci): O(2^n) time, O(n) space
  - Divide & conquer (binary search): O(log n) time, O(log n) space
  - Backtracking (subsets): O(2^n) time, O(n) space
  - Backtracking (permutations): O(n!) time, O(n) space

The analysis of a recursive function involves finding an asymptotic upper bound on the running time.

- Many algorithms use recursion, and analyzing their time complexity often leads to a recurrence relation. A recurrence relation expresses the running time for an input of size n in terms of the running time for smaller input sizes.

- For example, in **Merge Sort**, the array is divided into two halves, each half is sorted recursively, and the results are then merged. This leads to the recurrence relation T(n) = 2T(n/2) + cn where the term cn represents the time required to merge the two sorted halves.

Consider the following code for example.

    void fun(int n) {

        if (n <= 1)
            return;

        fun(n / 2);
        fun(n / 2);

        for (int i = 0; i < n; i++) {
            cout << "GFG ";
        }
    }

The time complexity of this function is written as `T(n) = 2T(n/2) + O(n)`.

Now to find the time complexity, we need to solve this recurrence.

There are mainly three common methods used to solve recurrence relations that arise in the analysis of recursive algorithms.

- **Substitution Method** : We guess the form of the solution and prove it using mathematical induction.

- **Recurrence Tree Method** : This method represents the recurrence as a tree and computes the total cost by summing the cost at each level.

- **Master Theorem** : The Master Theorem provides a direct way to solve divide-and-conquer recurrences of the form: `T(n) = aT(n/b) + f(n)`.

<hr />

## Assignment.

1.  Solve all of the following using pure recursion only — no loops allowed anywhere.
    - `sumArray(arr, n)` — Return sum of all elements
    - `maxArray(arr, n)` — Return maximum element
    - `isSorted(arr, n)` — Return true if array is sorted in ascending order
    - `reverseString(s, l, r)` — Reverse a string in-place using two indices
    - `isPalindrome(s, l, r)` — Return true if string is a palindrome
    - `countOccurrence(s, ch, i)` — Count occurrences of character ch in string

          Test with:
          arr     = {3, 1, 7, 2, 9, 4}
          sorted  = {1, 2, 3, 4, 5}
          s1      = "recursion"
          s2      = "madam"
          ch      = 'a', string = "abracadabra"

          Expected output:
          Sum of arr          : 26
          Max of arr          : 9
          Is arr sorted?      : No
          Is sorted sorted?   : Yes
          Reverse of s1       : noisrucer
          Is s2 palindrome?   : Yes
          Count of 'a' in str : 5

    [Solution](./Assignment/code1.cpp)

2.  Using recursion and backtracking, implement the following two programs:
    - **Part 1 — All Subsets**:
      - Generate and print all subsets (power set) of a given array
      - Each subset should be printed on a new line
      - Empty subset `{}` should also be printed

    - **Part 2 — All Permutations**:
      - Generate and print all permutations of a given string
      - Use the swap-based backtracking approach
      - After each recursive call, swap back to restore original state

            Test with:
            Array : {1, 2, 3}
            String: "ABC"

            Expected output:
            All Subsets of {1, 2, 3}:
            {}
            {1}
            {2}
            {1 2}
            {3}
            {1 3}
            {2 3}
            {1 2 3}
            Total: 8

            All Permutations of "ABC":
            ABC
            ACB
            BAC
            BCA
            CBA
            CAB
            Total: 6

    [Solution](./Assignment/code2.cpp)

3.  Place `N` queens on an `N×N` chessboard such that no two queens attack each other. Two queens attack each other if they are in the same row, column, or diagonal.
    - **Implement the following**:
      - `solveNQueens(n)` — Find and print all valid arrangements
      - For each solution, print the board visually using Q for queen and . for empty
      - Print the total number of solutions at the end

            Test with:
            N = 4
            N = 5 (only print count, not all boards)

            Expected output for N = 4:
            Solution 1:
            . Q . .
            . . . Q
            Q . . .
            . . Q .

            Solution 2:
            . . Q .
            Q . . .
            . . . Q
            . Q . .

            Total solutions for N=4: 2
            Total solutions for N=5: 10

    [Solution](./Assignment/code3.cpp)
