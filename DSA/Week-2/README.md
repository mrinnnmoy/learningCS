# List of Things Learned

## Fundamentals of Loops.

### Nested loops.

Nested loop means a loop statement inside another loop statement.

That is why nested loops are also called as "**loop inside loop**".

For a nested loop, the inner loop performs all of its iterations for each iteration of the outer loop.

If the outer loop is running from `i = 1` to `5` and the inner loop is running from `j = 0` to `3`.

Then, for each value of the outer loop variable (i), the inner loop will run from `j = 0` to `3`.

1.  **Nested For Loop.**

    A nested for loop means using one for loop inside another for loop, where the inner for loop executes fully for every single iteration of the outer for loop.

        // Example : Print Identity Matrix Using Nested for Loops

        #include <iostream>
        using namespace std;

        int main() {
            int n = 4;
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= n; j++) {
                    if (i == j)
                        cout << "1 ";
                    else
                        cout << "0 ";
                }
                cout << endl;
            }
            return 0;
        }

        <!-- Output -->
        1 0 0 0
        0 1 0 0
        0 0 1 0
        0 0 0 1

    - Explanation.
      - n = 4 sets the size of the square matrix.
      - The outer loop (i) controls the rows of the matrix.
      - The inner loop (j) controls the columns in each row.
      - if (i == j) prints 1 on the diagonal and 0 in all other positions.

      ![explanation-img](https://media.geeksforgeeks.org/wp-content/uploads/20250709150510369261/Nested-for-Loop.webp)

2.  **Nested While Loop.**

    A nested while loop means using one while loop inside another while loop, where the inner while loop executes completely for every single iteration of the outer while loop.

        // Example : Print a Square Pattern Using Nested while Loops

        #include <iostream>
        using namespace std;

        int main() {
            int i = 1, j;
            int n = 4;
            while (i <= n) {              // Outer while loop
                j = 1;
                while (j <= n) {          // Inner while loop
                    cout << "* ";
                    j++;
                }
                cout << endl;
                i++;
            }
            return 0;
        }

        <!-- Output -->
        * * * *
        * * * *
        * * * *
        * * * *

    - **Explanation**.
      - n = 4 decides how many rows and columns will be printed.
      - The outer while loop (i) controls the number of rows.
      - The inner while loop (j) prints stars in each row.

      ![img](https://media.geeksforgeeks.org/wp-content/uploads/20250709150619671410/Nested-do-while-Loop.webp)

3.  **Nested Do-While Loop.**

    A nested do-while loop means using one do-while loop inside another do-while loop, where the inner loop runs completely for every single iteration of the outer loop.

        // Example : Print a Star Triangle Using Nested do-while Loops

        #include <iostream>
        using namespace std;

        int main() {
            int i = 1, j;
            int n = 4;

            do {
                j = 1;
                do {
                    cout << "* ";
                    j++;
                } while (j <= i);
                cout << endl;
                i++;
            } while (i <= n);

            return 0;
        }

        //Output
        *
        * *
        * * *
        * * * *

    - **Explanation.**
      - n = 4 sets how many rows will be printed.
      - The outer do-while loop (i) controls the row number.
      - The inner do-while loop (j) prints stars equal to the current row number.
      - cout << endl; moves to the next line after completing each row.

- **Uses of Nested Loops** :
  - **Printing Patterns**: Nested loops are often used to print complex patterns such as printing shapes, grids, or tables.
  - **Searching and Sorting**: Nested loops are used in algorithms that involve searching for or sorting elements like bubble sort, insertion sort, matrix searching etc.
  - **Multi-Dimensional Data**: Nested loops are useful when dealing with multidimensional data structures like 2D or 3D arrays, matrices, list of lists.
  - **Dynamic Programming**: Nested loops are commonly used in dynamic Programming for solving problems like knapsack problem or longest common subsequence.

<hr />

## Basic Patterns

- Square.

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter size of square: ";
            cin >> n;

            for(int i = 1; i <= n; i++) {        // Outer loop for rows
                for(int j = 1; j <= n; j++) {    // Inner loop for columns
                    cout << "* ";
                }
                cout << endl; // Move to next line after each row
            }

            return 0;
        }

        // Output
        * * * *
        * * * *
        * * * *
        * * * *

- Rectangle.

        #include <iostream>
        using namespace std;

        int main() {
            int rows, cols;

            cout << "Enter number of rows: ";
            cin >> rows;

            cout << "Enter number of columns: ";
            cin >> cols;

            for(int i = 1; i <= rows; i++) {      // Outer loop for rows
                for(int j = 1; j <= cols; j++) {  // Inner loop for columns
                    cout << "* ";
                }
                cout << endl; // Move to next line after each row
            }

            return 0;
        }

        // Output
        * * * * *
        * * * * *
        * * * * *

- Increasing triangle.

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter number of rows: ";
            cin >> n;

            for(int i = 1; i <= n; i++) {        // Outer loop for rows
                for(int j = 1; j <= i; j++) {    // Inner loop prints stars equal to row number
                    cout << "* ";
                }
                cout << endl; // Move to next line after each row
            }

            return 0;
        }

        // Output
        *
        * *
        * * *
        * * * *

- Decreasing triangle.

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter number of rows: ";
            cin >> n;

            for(int i = n; i >= 1; i--) {        // Outer loop for rows (decreasing)
                for(int j = 1; j <= i; j++) {    // Inner loop prints stars
                    cout << "* ";
                }
                cout << endl; // Move to next line
            }

            return 0;
        }

        // Output
        * * * *
        * * *
        * *
        *

<hr />

## Pattern Logic Building

1. **Row and column thinking.**
   - Understanding that the outer loop controls rows.

   - Understanding that the inner loop controls columns.

   - Visualizing patterns as a grid structure.

   - Identifying what changes row by row.

2. **Space and symbol separation.**
   - Breaking each row into two parts: spaces and symbols.

   - Handling spaces using logic like `n - i`.

   - Printing symbols using row-based formulas.

   - Structuring patterns as:
     - Print spaces,
     - Print symbols,
     - Move to next line.

3. **Avoiding hardcoded values.**
   - Using variables instead of fixed numbers.

   - Writing patterns that work for any input size n.

   - Deriving formulas instead of guessing counts.

   - Making code reusable and scalable.

<hr />

## Mathematical Patterns

1. **n - i logic.**
   - Used to control spaces in right-aligned patterns.

   - Helps shift patterns to the right.

   - Commonly used in pyramids and aligned triangles.

2. **2\*i - 1 logic.**
   - Used to print odd numbers of symbols in pyramid patterns.

   - Helps create centered symmetry.

   - Explains why pyramid rows increase as 1, 3, 5, 7…

3. **Increasing and decreasing sequences.**
   - Understanding patterns where values grow row by row.

   - Handling reverse logic using decreasing loops.

   - Observing number progressions in pattern printing.

   - Recognizing arithmetic growth inside nested loops.

<hr />

## Symmetry & Advanced Patterns

1.  **Pyramid pattern.**

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter number of rows: ";
            cin >> n;

            for(int i = 1; i <= n; i++) {

                // Print spaces
                for(int j = 1; j <= n - i; j++) {
                    cout << " ";
                }

                // Print stars
                for(int k = 1; k <= 2*i - 1; k++) {
                    cout << "*";
                }

                cout << endl; // Move to next row
            }

            return 0;
        }

        // Output
           *
          ***
         *****
        *******

2.  **Number pattern.**

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter number of rows: ";
            cin >> n;

            for(int i = 1; i <= n; i++) {        // Outer loop for rows
                for(int j = 1; j <= i; j++) {    // Inner loop prints numbers
                    cout << j << " ";
                }
                cout << endl; // Move to next line
            }

            return 0;
        }

        // Output
        1
        1 2
        1 2 3
        1 2 3 4

3.  **Inverted pattern.**

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter number of rows: ";
            cin >> n;

            for(int i = n; i >= 1; i--) {

                // Print spaces
                for(int j = 1; j <= n - i; j++) {
                    cout << " ";
                }

                // Print stars
                for(int k = 1; k <= 2*i - 1; k++) {
                    cout << "*";
                }

                cout << endl; // Move to next line
            }

            return 0;
        }

        // Output
        *******
         *****
          ***
           *

4.  **Hollow pattern.**

        #include <iostream>
        using namespace std;

        int main() {
            int n;

            cout << "Enter size of square: ";
            cin >> n;

            for(int i = 1; i <= n; i++) {          // Outer loop for rows
                for(int j = 1; j <= n; j++) {      // Inner loop for columns

                    // Print star only on borders
                    if(i == 1 || i == n || j == 1 || j == n) {
                        cout << "* ";
                    } else {
                        cout << "  ";  // Print space inside
                    }
                }
                cout << endl;
            }

            return 0;
        }

        // Output
        * * * * *
        *       *
        *       *
        *       *
        * * * * *

<hr />

## Assignment.

1.  Print this Right-angled Number Triangle.

        1
        2 2
        3 3 3
        4 4 4 4

    [Solution](./Assignment/code1.cpp)

2.  Print a Centered Star Pyramid.

           *
          ***
         *****
        *******

    [Solution](./Assignment/code2.cpp)

3.  Print a Palindromic Number Pyramid.

           1
          121
         12321
        1234321

    [Solution](./Assignment/code3.cpp)
