# List of things learned.

## Introduction to Complexity Analysis.

Complexity analysis is defined as a technique to characterise the time taken by an algorithm with respect to input size (independent from the machine, language and compiler).

It is used for evaluating the variations of execution time on different algorithms.

### Need for Complexity Analysis.

- Complexity Analysis determines the amount of time and space resources required to execute it.
- It is used for comparing different algorithms on different input sizes.
- Complexity helps to determine the difficulty of a problem.
- often measured by how much time and space (memory) it takes to solve a particular problem

## Asymptotic Notations.

Asymptotic notations are the mathematical notations used to describe the running time of an algorithm when the input tends towards a particular value or a limiting value.

There are mainly three asymptotic notations:

- Big-O notation,
- Omega notation &
- Theta notation.

1.  **Big-O Notation.**

    Big-O notation represents the upper bound of the running time of an algorithm.

    Therefore, it gives the **worst-case** complexity of an algorithm.

    By using big O- notation, we can asymptotically limit the expansion of a running time to a range of constant factors above and below.

    It is a model for quantifying algorithm performance.

    ![img](https://camo.githubusercontent.com/9ed197c5802e790668f6c5a7270cd181304acf79d3bccf44b8562e3fadf37ac3/68747470733a2f2f7777772e6e6f74696f6e2e736f2f696d6167652f687474707325334125324625324663646e2e70726f6772616d697a2e636f6d25324673697465732532467475746f7269616c3270726f6772616d25324666696c6573253246626967302e706e673f7461626c653d626c6f636b2669643d62343139623762382d633932652d343032652d626537622d6565333038346136646664342663616368653d7632)
    - We say, a function `f(n)` is `O(g(n))` if there exists c and > 0 such that,

      Examples:

            f(n) = n^2 + 5n - 6
            g(n) = 2n ^ 2
            So g(n) ≥ f(n) n ≥ 3 (Solved using quadratic equation)
            So there exists, c = 2 and = 3 such that f(n) ≤ c \* g(n) for all n ≥
            So f(n) = O(g(n))

2.  **Omega Notation.**

    Omega notation represents the lower bound of the running time of an algorithm.

    Thus, it provides the **best-case** complexity of an algorithm.

    The execution time serves as a lower bound on the algorithm’s time complexity.

    It is defined as the condition that allows an algorithm to complete statement execution in the shortest amount of time.

        Ω(g(n)) = { f(n): there exist positive constants c and n0
        such that 0 ≤ cg(n) ≤ f(n) for all n ≥ n0 }

    ![img](https://camo.githubusercontent.com/497c8aa233862ed37a2ccd3db8980f15fbb65a4056148f1b303e81a1c3646e25/68747470733a2f2f7777772e6e6f74696f6e2e736f2f696d6167652f687474707325334125324625324663646e2e70726f6772616d697a2e636f6d25324673697465732532467475746f7269616c3270726f6772616d25324666696c65732532466f6d6567612e706e673f7461626c653d626c6f636b2669643d30616261303364392d666237622d343962362d386330382d3537623831346439613766612663616368653d7632)

    For example, `f(n) = n^2` and `g(n) = n + 10`

3.  **Theta Notation.**

    Theta notation encloses the function from above and below.

    Since it represents the upper and the lower bound of the running time of an algorithm, it is used for analyzing the **average-case** complexity of an algorithm.

    The execution time serves as both a lower and upper bound on the algorithm’s time complexity.

    It exists as both, the most, and least boundaries for a given input value.

        Θ(g(n)) = { f(n): there exist positive constants c1, c2 and n0
        such that 0 ≤ c1g(n) ≤ f(n) ≤ c2g(n) for all n ≥ n0 }

    ![img](https://camo.githubusercontent.com/2490c153c9371ebf3a3bf62bbf9380ff545871e50b88c116d139c522f4a18170/68747470733a2f2f7777772e6e6f74696f6e2e736f2f696d6167652f687474707325334125324625324663646e2e70726f6772616d697a2e636f6d25324673697465732532467475746f7269616c3270726f6772616d25324666696c657325324674686574612e706e673f7461626c653d626c6f636b2669643d62343230626666612d393334362d346331362d613336352d3436643834646631316435662663616368653d7632)

## How to measure complexity.

The complexity of an algorithm can be measured in three ways:

- Time complexity,
- Space Complexity &
- Auxiliary space.

1.  **Time Complexity.**

    The time complexity of an algorithm is defined as the amount of time taken by an algorithm to run as a function of the length of the input.

    **Note** that the time to run is a function of the length of the input and not the actual execution time of the machine on which the algorithm is running on.
    - **How is Time complexity computed?**

      To estimate the time complexity, we need to consider the cost of each fundamental instruction and the number of times the instruction is executed.
      - If we have statements with basic operations like **comparisons, return statements, assignments and reading a variable**.

        We can assume they take **constant time each O(1)**.

              Statement 1: int a=5;            // reading a variable
              statement 2; if( a==5) return true;  // return statement
              statement 3; int x= 4>5 ? 1:0;     // comparison
              statement 4; bool flag=true;      // Assignment

        This is the result of calculating the overall time complexity.

              total time = time(statement1) + time(statement2) + ... time (statementN)

        Assuming that **n is the size** of the input, let's use `T(n)` to represent the **overall time** and t to represent the **amount of time** that a **statement or collection** of statements takes to **execute**.

              T(n) = t(statement1) + t(statement2) + ... + t(statementN);

        **Overall, T(n)= O(1), which means constant complexity.**
        - For any loop, we find out the runtime of the block inside them and multiply it by the number of times the program will repeat the loop.

                for (int i = 0; i < n; i++) {
                cout << "Hello World." << endl;
                }

          For the above example, the loop will execute `n` times, and it will print "Hello World." N number of times. so the time taken to run this program is:

                T(N)= n *( t(cout statement))
                    = n * O(1)
                    =O(n), Linear complexity.

        - For 2D arrays, we would have nested loop concepts, which means a loop inside a loop.

                for (int i = 0; i < n; i++) {
                for (int j = 0; j < m; j++) {
                    cout << "Hello World." << endl;
                }
                }

          For the above example, the cout statement will execute n*m times, and it will print "Hello World." N * M number of times. so the time taken to run this program is:

                T(N)= n * m *(t(cout statement))
                    = n * m * O(1)
                    =O(n*m), Quadratic Complexity.

2.  **Space Complexity.**

    The amount of memory required by the algorithm to solve a given problem is called the space complexity of the algorithm.

    Problem-solving using a computer requires memory to hold temporary data or final result while the program is in execution.
    - **How is Space complexity computed?**

      The space Complexity of an algorithm is the total space taken by the algorithm with respect to the input size. Space complexity includes both Auxiliary space and space used by input.

      Space complexity is a parallel concept to time complexity. If we need to create an array of size n, this will require `O(n)` space. If we create a two-dimensional array of size `n*n`, this will require `O(n2)` space.

      **In recursive calls stack space also counts.**
      - Example:

            int add (int n){
                if (n <= 0){
                    return 0;
                }
                return n + add (n-1);
            }

            Here each call add a level to the stack :
            1.  add(4)
            2.    -> add(3)
            3.      -> add(2)
            4.        -> add(1)
            5.          -> add(0)
            Each of these calls is added to call stack and takes up actual memory.
            So it takes O(n) space.

        However, just because you have n calls total doesn’t mean it takes O(n) space.

3.  **Auxiliary Space.**

    The temporary space needed for the use of an algorithm is referred to as auxiliary space. Like temporary arrays, pointers, etc.

    It is preferable to make use of Auxiliary Space when comparing things like sorting algorithms.

    For example, **sorting algorithms** take `O(n)` space, as there is an input array to sort, **but auxiliary space is O(1) in that case**.

## Some popular complexities.

- `O(1)` -> Constant time complexity.

  Example: a + b, a % b, swap(a, b)

- `O()` -> Logarithmic complexity.

  Example: Binary search

- `O()` -> Example: Finding divisors of a number

- `O(n)` -> Linear time complexity.

  Example: Linear search, finding maximum element

- `O()` -> Example: Sorting, Seive of Eratosthenes

- `O()` -> Quadratic complexity.

  Example: Insertion sort

- `O()` -> Cubic complexity.

  Example: Floyd Warshall algorithm

- `O()` -> Exponential complexity.

  Example: bitmasking

## Effect of Complexity on any algorithm.

- **Time complexity** of an algorithm quantifies the amount of time taken by an algorithm to run as a function of length of the input.

- While, the **space complexity** of an algorithm quantifies the amount of space or memory taken by an algorithm to run as a function of the length of the input.

## Steps to optimize Complexity Analysis of an algorithm.

Optimization means modifying the brute-force approach to a problem. It is done to derive the best possible solution to solve the problem so that it will take less time and space complexity. We can optimize a program by either limiting the search space at each step or occupying less search space from the start.

We can optimize a solution using both time and space optimization.

To optimize a program,

- We can reduce the time taken to run the program and increase the space occupied;
- we can reduce the memory usage of the program and increase its total run time, or
- we can reduce both time and space complexity by deploying relevant algorithms

## Assignment.

1.  Find the Time Complexity & Space of this code,

        int sum = 0;
        for(int i = 0; i < n; i++) {
            sum += i;
        }

    - **Solution.**
      - **Time Complexity.**

        This loop runs from `0` to `n-1`.

        Meaning, the statement `sum += i` runs `n` times & each operation inside loop = `O(1)`.

        So total time is,

              T(n) = n × O(1) = O(n)

      - **Space Complexity.**

        We're only using, `sum` & `i`.

        So, space stays constant, `O(1)`.

2.  Find the Time complexity & Space complexity of this code,

        for(int i = 0; i < n; i++) {
            for(int j = 0; j < i; j++) {
                cout << i << j;
            }
        }

    - **Solution.**

      Inner loop runs:

            When i = 0 → 0 times
            When i = 1 → 1 time
            When i = 2 → 2 times
            When i = 3 → 3 times
            ...
            When i = n-1 → n-1 times

      So total execution:

            0 + 1 + 2 + 3 + ... + (n-1)

      That sum is:

            n(n-1)/2

      Ignore constants and lower order terms:

            ≈ n²/2 → O(n²)

      - **Time Complexity** = O(n^2)
      - **Space Complexity** = O(1)

3.  Find the Time complexity & Space complexity of this code,

        for(int i = 1; i < n; i = i * 2) {
            for(int j = 0; j < n; j++) {
                cout << i << j;
            }
        }

    - **Solution.**

      First let's understand outer loop,
      - `i` starts at 1 and doubles each time, so outer loop runs `O(log n)` times.

      For each outer iterations, inner loop runs `n` times.
      - So total work is `(log n) * n`.

      - **Time Complexity** = O(n log n)

      - **Space Complexity** = O(1)
