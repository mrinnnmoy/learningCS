# List of topics learned.

- # Complexity Analysis.

    - Generally there can be multiple ways to solve a problem. For example, in our last class we learn’t about finding intersections for multiple intervals / ranges. But we need a way to compare which one is better than the other. We can do this comparison using Complexity Analysis.

    - Usually, we compare 2 things:
        - Time Complexity
        - Space Complexity
    
    - **Time Complexity.**

        - Time complexity of an algorithm quantifies the amount of time taken by an algorithm to run as a function of the length of the input.
        
            `t(n) = n^2 + 2n + 6`

        - Here t(n), is a function that returns the time taken by the algorithm for an input of length n.

    - **Space Complexity.**

        - Space complexity of an algorithm quantifies the amount of space or memory taken by an algorithm to run as a function of the length of the input.

            `t(n) = n^2`
        
        - Here t(n), is a function that returns the additional space used by the algorithm for an input of length n.

<hr />

- # Asymptotic Notations.

    - Asymptotic notations are the mathematical notations used to describe the running time of an algorithm when the input tends towards a particular value or a limiting value.

    - There are mainly three asymptotic notations:
        - Big-O notation
        - Omega notation
        - Theta notation

    - **Big-O Notation.**

        - Big-O notation represents the upper bound of the running time of an algorithm. Thus, it gives the worst-case complexity of an algorithm.

            ![Big-O-image](https://www.notion.so/image/https%3A%2F%2Fcdn.programiz.com%2Fsites%2Ftutorial2program%2Ffiles%2Fbig0.png?table=block&id=b419b7b8-c92e-402e-be7b-ee3084a6dfd4&cache=v2)

        - We say, a function f(n) is O(g(n)) if there exists c and  > 0 such that,
        
            Examples:

                f(n) = n^2  + 5n - 6
                g(n) = 2n ^ 2
                So g(n) ≥ f(n)  n ≥ 3  (Solved using quadratic equation)
                So there exists, c = 2 and  = 3 such that f(n) ≤ c * g(n) for all n ≥ 
                So f(n) = O(g(n))

    - **Omega Notation.**

        - Omega notation represents the lower bound of the running time of an algorithm. Thus, it provides the best case complexity of an algorithm.

                Ω(g(n)) = { f(n): there exist positive constants c and n0
                    such that 0 ≤ cg(n) ≤ f(n) for all n ≥ n0 }
            
            ![Omega-Notation](https://www.notion.so/image/https%3A%2F%2Fcdn.programiz.com%2Fsites%2Ftutorial2program%2Ffiles%2Fomega.png?table=block&id=0aba03d9-fb7b-49b6-8c08-57b814d9a7fa&cache=v2)

                For example, f(n) = n^2 and g(n) = n + 10


    - **Theta Notation.**

        - Theta notation encloses the function from above and below. Since it represents the upper and the lower bound of the running time of an algorithm, it is used for analyzing the average-case complexity of an algorithm.

                Θ(g(n)) = { f(n): there exist positive constants c1, c2 and n0
                    such that 0 ≤ c1g(n) ≤ f(n) ≤ c2g(n) for all n ≥ n0 }

            ![Theta-Notation](https://www.notion.so/image/https%3A%2F%2Fcdn.programiz.com%2Fsites%2Ftutorial2program%2Ffiles%2Ftheta.png?table=block&id=b420bffa-9346-4c16-a365-46d84df11d5f&cache=v2)

<hr />

- # Some popular complexeties.

    - O(1) -> Constant time complexity. Example: a + b, a % b, swap(a, b)
 
    - O() -> Logarithmic complexity. Example: Binary search
 
    - O() -> Example: Finding divisors of a number
 
    - O(n) -> Linear time complexity. Example: Linear search, finding maximum element
 
    - O() -> Example: Sorting, Seive of Eratosthenes
 
    - O() -> Quadratic complexity. Example: Insertion sort
 
    - O() -> Cubic complexity. Example: Floyd Warshall algorithm
 
    - O() -> Exponential complexity. Example: bitmasking

<hr />

- # Master Theorem.

    ![Master-Theorem](https://www.notion.so/image/https%3A%2F%2Fmedia.geeksforgeeks.org%2Fwp-content%2Fuploads%2Fma-1.png?table=block&id=9971e177-8ff4-460b-a429-b8bb7ae484cc&cache=v2)

    where n = size of the problem

    a = number of subproblems in the recursion and a >= 1
    
    n/b = size of each subproblem
    
    b > 1, k >= 0 and p is a real number.
    
    Then,

    1. If a > , then 
    
    2. If , then
        - If p > -1, then 
        - If p = -1, then 
        - If p < -1, then 

    3. If , then
        - if p >= 0, then 
        - if p < 0, then