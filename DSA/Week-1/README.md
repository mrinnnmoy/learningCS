# List of things learned.

## Introduction to C++.

C++ is a general-purpose programming language that was developed by **Bjarne Stroustrup** as an enhancement of the C language to add object-oriented paradigm.

The main features of C++ programming language are as follows:

- **Simple** : It is a simple language in the sense that programs can be broken down into logical units and parts, and has a rich library support and a variety of datatypes.

- **Machine Independent** : C++ code can be run on any machine as long as a suitable compiler is provided.

- **Low-level Access** : C++ provides low-level access to system resources, which makes it a suitable choice for system programming and writing efficient code.

- **Fast Execution Speed** : C++ is one of the fastest high-level languages. There is no additional processing overhead in C++, it is blazing fast.

- **Object-Oriented** : One of the strongest points of the language which sets it apart from C. Object-Oriented support helps C++ to make maintainable and extensible programs. i.e. large-scale applications can be built.

<hr />

## Basic Program structure.

The basic structure of a C++ program defines the standard way every program must be written.

Otherwise, it will cause a compilation error.

The structure includes:

![structure-img](https://media.geeksforgeeks.org/wp-content/uploads/20250915124731412435/prim_s_algorithm_14.webp)

1. **Header File** : #include <iostream> adds input/output objects (cin, cout, etc.) via the preprocessor. Common headers: fstream (files), string (strings), vector (STL), bits/stdc++.h (all-in-one).

2. **Namespace Declaration** : using namespace std; allows direct use of standard names like "cout" without std::

3. **Main Function** : int main() is the program’s entry point; execution starts here and returns an integer with 0 return mean successful execution.

4. **Comments** : // for single line, /_...._/ for multi-line are ignored by the compiler and used only for code documentation.

5. **Statement** : Contains executable code. Here, cout << "Hello World!", prints the text on the screen using the insertion operator (<<).

6. **Return** : The return 0; statement terminates the main() function and indicates that the program executed successfully.

<hr />

## Data types.

Data types specify the type of data that a variable can store. Whenever a variable is defined in C++, the compiler allocates memory for that variable based on the data type with which it is declared.

![datatypes-img](https://media.geeksforgeeks.org/wp-content/uploads/20250714112214026299/Data-Type-in-C-2.webp)

Below is an example of data-types.

    #include <iostream>
    using namespace std;

    int main() {

        // Creating a variable to store integer
        int var = 10;
        cout << var; // Output : 10

        // Character variable
        char c = 'A';
        cout << c; // Output : A

        // Boolean Data-type
        bool isTrue = true;
        cout << isTrue; // Output : 1

        // Floating Point Data type
        float f = 36.5;
        cout << f; // Output : 36.5

        // Double Data-type
        double pi = 3.1415926535;
        cout << pi; // Output : 3.14159

        // Void Data-type
        bool a = 10.248f;
        cout << a; // Output : 1

        return 0;
    }

### Data Type Conversion.

Type conversion refers to the process of changing one data type into another compatible one without losing its original meaning.

It's an important concept for handling different data types in C++.

    #include <iostream>
    using namespace std;

    int main()
    {
        int n = 3;
        char c = 'C';

        // Convert char data type into integer
        cout << (int)c << endl; // Output : 67

        int sum = n + c;
        cout << sum; // Output : 70
        return 0;
    }

### Size of Data Types in C++.

We can find the size of the data type using sizeof operator.

According to this type, the range of values that a variable of given data types can store are decided.

    #include <iostream>
    using namespace std;

    int main()
    {

        // Printing the size of each data type
        cout << "Size of int: " << sizeof(int) << " bytes" << endl;
        cout << "Size of char: " << sizeof(char) << " byte" << endl;
        cout << "Size of float: " << sizeof(float) << " bytes" << endl;
        cout << "Size of double: " << sizeof(double) << " bytes";

        return 0;
    }

    <!-- Output -->
    Size of int: 4 bytes
    Size of char: 1 byte
    Size of float: 4 bytes
    Size of double: 8 bytes

<hr />

## Variables.

In C++, variable is a name given to a memory location. It is the basic unit of storage in a program.

The value stored in a variable can be accessed or changed during program execution.

    #include <iostream>
    using namespace std;

    int main() {
        // Creating a single character variable
        int num = 3;

        // Accessing and printing above variable
        cout << num << endl;

        // Update the value
        num = 7;

        // Printing the updated value
        cout << num;

        return 0;
    }

### Rules for naming variables.

The names given to a variable are called identifiers.

There are some rules for creating these identifiers (names):

- A name can only contain letters (A-Z or a-z), digits (0-9), and underscores (\_).
- It should start with a letter or an underscore only.
- It is case sensitive.
- The name of the variable should not contain any whitespace and special characters (i.e. #, $, %, \*, etc).
- We cannot use C++ keyword (e.g. float, double, class) as a variable name.

### Memory management of variables.

When we create or declare a variable, a fixed-size memory block is assigned to the variable, and its initial value is a garbage value. Initialization assigns a meaningful value using the assignment operator. Variables essentially manipulate specific memory locations, and their stored data is accessed via their names.

![mm-img](https://media.geeksforgeeks.org/wp-content/uploads/20241218171410693103/variable-memory-management-in-cpp.png)

Moreover, different variables may be stored in different section of memory according to its storage class.

<hr />

## Operators.

C++ operators are the symbols that operate on values to perform specific mathematical or logical computations on given values.

They are the foundation of any programming language.

    #include <iostream>
    using namespace std;
    int main() {

        int a = 10 + 20;

        cout << a;
        return 0;
    }

### Types of Operators.

C++ operators are classified into 6 types on the basis of type of operation they perform:

1.  **Arithmetic Operators.**

    Arithmetic operators are used to perform arithmetic or mathematical operations on the operands.
    - **Addition** (+) : Adds two operands
    - **Subtraction** (-) : Subtracts second operand from the first
    - **Multiplication** (\*) : Multiplies two operands
    - **Division** (/) : Divides first operand by the second operand
    - **Modulo Operation** (%) : Returns the remainder of an integer division
    - **Increment** (++) : Increases the value of operand by 1
    - **Decrement** (--) : Decreases the value of operand by 1

            #include <iostream>
            using namespace std;

            int main() {
                int a = 8, b = 3;

                // Addition
                cout << "a + b = " << (a + b) << endl;

                // Subtraction
                cout << "a - b = " << (a - b) << endl;

                // Multiplication
                cout << "a * b = " << (a * b) << endl;

                // Division
                cout << "a / b = " << (a / b) << endl;

                // Modulo
                cout << "a % b = " << (a % b) << endl;

                // Increament
                cout << "++a = " << ++a << endl;

                // Decrement
                cout << "b-- = " << b--;

                return 0;
            }

            <!-- Output -->
            a + b = 11
            a - b = 5
            a * b = 24
            a / b = 2
            a % b = 2
            ++a = 9
            --b = 2

2.  **Relational Operators.**

    Relational operators are used for the comparison of the values of two operands.
    - **Is Equal To** (==) : Checks if both operands are equal
    - **Greater Than** (>) : Checks if the first operand is greater than the second operand
    - **Greater Than or Equal To** (>=) : Checks if the first operand is greater than or equal to the second operand
    - **Less Than** (<) : Checks if the first operand is lesser than the second operand
    - **Less Than or Equal To** (<=) : Checks if the first operand is lesser than or equal to the second operand
    - **Not Equal To** (!=) : Checks if both operands are not equal

            #include <iostream>
            using namespace std;

            int main() {
                int a = 6, b = 4;

                // Equal operator
                cout << "a == b is " << (a == b) << endl;

                // Greater than operator
                cout << "a > b is " << (a > b) << endl;

                // Greater than Equal to operator
                cout << "a >= b is " << (a >= b) << endl;

                //  Lesser than operator
                cout << "a < b is " << (a < b) << endl;

                // Lesser than Equal to operator
                cout << "a <= b is " << (a <= b) << endl;

                // Not equal to operator
                cout << "a != b is " << (a != b);

                return 0;
            }

            <!-- Output -->
            a == b is 0
            a > b is 1
            a >= b is 1
            a < b is 0
            a <= b is 0
            a != b is 1

3.  **Logical Operator.**

    Logical operators are used to combine two or more conditions or constraints or to complement the evaluation of the original condition in consideration.

    The result returns a Boolean value, i.e., true or false.
    - **Logical AND** (&&) : Returns true only if all the operands are true or non-zero
    - **Logical OR** (||) : Returns true if either of the operands is true or non-zero
    - **Logical NOT** (!) : Returns true if the operand is false or zero

            #include <iostream>
            using namespace std;

            int main() {
                int a = 6, b = 4;

                // Logical AND operator
                cout << "a && b is " << (a && b) << endl;

                // Logical OR operator
                cout << "a || b is " << (a || b) << endl;

                // Logical NOT operator
                cout << "!b is " << (!b);

                return 0;
            }

            <!-- Output -->
            a && b is 1
            a || b is 1
            !b is 0

4.  **Bitwise Operators.**

    Bitwise operators works on bit-level.

    So, compiler first converts to bit-level and then the calculation is performed on the operands.
    - **Binary AND** (&) : Copies a bit to the result if it exists in both operands
    - **Binary OR** (|) : Copies a bit to the result if it exists in any of the operands
    - **Binary XOR** (^) : Copies the bit to the result if it is present in either of the operands but not both
    - **Left Shift** (<<) : Shifts the value to the left by the number of bits specified by the right operand
    - **Right Shift** (>>) : Shifts the value to the right by the number of bits specified by the right operand
    - **One's Complement** (~) : Changes binary digits 1 to 0 and 0 to 1

    **Note**: Only char and int data types can be used with Bitwise Operators.

        #include <iostream>
        using namespace std;

        int main() {
            int a = 6, b = 4;

            // Binary AND operator
            cout << "a & b is " << (a & b) << endl;

            // Binary OR operator
            cout << "a | b is " << (a | b) << endl;

            // Binary XOR operator
            cout << "a ^ b is " << (a ^ b) << endl;

            // Left Shift operator
            cout << "a << 1 is " << (a << 1) << endl;

            // Right Shift operator
            cout << "a >> 1 is " << (a >> 1) << endl;

            // One’s Complement operator
            cout << "~(a) is " << ~(a);

            return 0;
        }

        <!-- Output -->
        a & b is 4
        a | b is 6
        a ^ b is 2
        a<<1 is 12
        a>>1 is 3
        ~(a) is -7

5.  **Assignment Operators.**

    Assignment operators are used to assign value to a variable.

    We assign the value of right operand into left operand according to which assignment operator we use.
    - **Assignment** (=) : Assigns the value on the right to the variable on the left
    - **Add and Assignment** (+=) : Adds the right operand to the left operand and assigns the result to the left operand
    - **Subtract and Assignment** (-=) : Subtracts the right operand from the left operand and assigns the result to the left operand
    - **Multiply and Assignment** (\*=) : Multiplies the left operand by the right operand and assigns the result to the left operand
    - **Divide and Assignment** (/=) : Divides the left operand by the right operand and assigns the result to the left operand

            #include <iosteam>
            using namespace std;

            int main() {
                int a = 6, b = 4;

                // Assignment Operator.
                cout << "a = " << a << endl;

                //  Add and Assignment Operator.
                cout << "a += b is " << (a += b) << endl;

                // Subtract and Assignment Operator.
                cout << "a -= b is " << (a -= b) << endl;

                //  Multiply and Assignment Operator.
                cout << "a *= b is " << (a *= b) << endl;

                //  Divide and Assignment Operator.
                cout << "a /= b is " << (a /= b);

                return 0;
            }

            <!-- Output -->
            a = 6
            a += b is 10
            a -= b is 6
            a *= b is 24
            a /= b is 6

6.  **Ternary or Conditional Operators.**

    Conditional operator returns the value, based on the condition.

    This operator takes three operands, therefore it is known as a Ternary Operator.

    Syntax:

    `Expression1 ? Expression2 : Expression3`

    In the above statement:
    - The ternary operator ? determines the answer on the basis of the evaluation of Expression1.
    - If Expression1 is true, then Expression2 gets evaluated.
    - If Expression1 is false, then Expression3 gets evaluated.

            #include <iostream>
            using namespace std;

            int main() {
                int a = 3, b = 4;

                // Conditional Operator
                int result = (a < b) ? b : a;
                cout << "The greatest number "
                    "is " << result;

                return 0;
            }

            <!-- Output -->
            The greatest number is 4

<hr />

## Basic Input/Output.

In C++, data is read and written using streams, which are sequences of bytes.

- **Input stream** : Data flows from a device (like the keyboard) to the computer’s memory.
- **Output stream** : Data flows from memory to an output device (like the screen).
- These streams are defined in the `<iostream>` header file.
- The most common stream objects are,
    - `cin` : for taking input and
    - `cout` : for displaying output.

### Standard Output Stream - `cout`.

- `cout` is an instance of the ostream class used to display output on the screen.
- Data is sent to cout using the insertion operator <<.

        #include <iostream>
        using namespace std;

        int main()
        {
            cout << "Hello World.";
            return 0;
        }

        // Output : Hello World.

### Standard Input Stream - `cin`.

- `cin` is an instance of the istream class used to read input from the keyboard.
- The extraction operator >> is used with cin to get data from the input stream and store it in a variable.

        #include <iostream>
        using namespace std;

        int main()
        {
            int age;
            // Taking input from user and store it in variable
            cin >> age;

            // Output the entered age
            cout << "Age entered: " << age;
            return 0;
        }

        // Output :
        // 18
        // Age entered: 18

<hr />

## Conditionals.

In C++ conditions are used to perform different actions depending on whether something is `true` or `false`.

C++ has the following conditional statements:

- **if** : to specify a block of code to be executed, if a condition is true
- **else** : to specify a block of code to be executed, if the same condition is false
- **else if** : to specify a new condition to test, if the first condition is false
- **switch** : to specify many alternative blocks of code to be executed

### The if Statement.

Use the `if` statement to specify a block of C++ code to be executed if a condition is true.

- Syntax,

        if (condition) {
        // block of code to be executed if the condition is true
        }

- Example,

        if (20 > 18) {
        cout << "20 is greater than 18";
        }

### The else Statement.

Use the `else` statement to specify a block of code to be executed if the condition is false.

- Syntax,

        if (condition) {
        // block of code to be executed if the condition is true
        } else {
        // block of code to be executed if the condition is false
        }

- Example,

        int time = 20;

        if (time < 18) {
        cout << "Good day.";
        } else {
        cout << "Good evening.";
        }

        // Outputs "Good evening."

### The else if Statement.

Use the `else if` statement to specify a new condition to test if the first condition is `false`.

You can use `else if` to check multiple conditions, one after another.

- Syntax,

        if (condition1) {
        // block of code to be executed if condition1 is true
        } else if (condition2) {
        // block of code to be executed if condition1 is false and condition2 is true
        } else {
        // block of code to be executed if both conditions are false
        }

**Note**: The conditions are checked from top to bottom. As soon as one condition is true, its block of code is executed, and the rest are skipped.

- Example,

        int time = 16;

        if (time < 12) {
        cout << "Good morning.";
        } else if (time < 18) {
        cout << "Good day.";
        } else {
        cout << "Good evening.";
        }

        // Outputs "Good evening."

### The switch Statement.

Use the `switch` statement to select one of many code blocks to be executed.

- Syntax,

        switch(expression) {
        case x:
            // code block
            break;
        case y:
            // code block
            break;
        default:
            // code block
        }

- **This is how it works** :
  - The switch expression is evaluated once
  - The value of the expression is compared with the values of each case
  - If there is a match, the associated block of code is executed
  - The `break` and `default` keywords are optional.

  - When C++ reaches a `break` keyword, it breaks out of the switch block.

  - This will stop the execution of more code and case testing inside the block.

  - When a match is found, and the job is done, it's time for a break. There is no need for more testing.

  - The `default` keyword specifies some code to run if there is no case match.

- Example,

        int day = 4;
        switch (day) {
        case 1:
            cout << "Monday";
            break;
        case 2:
            cout << "Tuesday";
            break;
        case 3:
            cout << "Wednesday";
            break;
        case 4:
            cout << "Thursday";
            break;
        case 5:
            cout << "Friday";
            break;
        case 6:
            cout << "Saturday";
            break;
        case 7:
            cout << "Sunday";
            break;
        default:
            cout << "Looking forward to the Weekend";
        }
        // Outputs "Thursday" (day 4)

<hr />

## Loops.

In C++ programming, sometimes there is a need to perform some operation more than once or (say) n number of times.

In such cases, loops come into play, allowing users to repeatedly execute a block of statements any number of times.

### Different types of loops.

1.  **for Loop.**

    The `for` loop is an entry-controlled loop, which means that it checks whether the test condition is true before executing the statements inside it.
    - Syntax,

            for (initialization; condition; updation) {
                // body of for loop
            }

    - The various **parts of the for loop** are:
      - **Initialization** : Initialize the variable to some initial value.
      - **Test Condition** : This specifies the test condition. If the condition evaluates to true, then body of the loop is executed. If evaluated false, loop is terminated.
      - **Update Expression** : After the execution loop's body, this expression increments/decrements the loop variable by some value.

      All these together is used to create a logic and flow of the loop.

    - Example,

            #include <iostream>
            using namespace std;

            int main() {

                // For loop that starts with i = 1 and ends
                // when i is greater than 5.
                for (int i = 1; i <= 5; i++) {
                    cout << i << " ";
                }
                return 0;
            }

            <!-- Output -->
            1 2 3 4 5

    - Flow chart of for loop:

      ![flow-chart-img](https://media.geeksforgeeks.org/wp-content/uploads/20250719173109620611/Forloop.webp)

2.  **while loop.**

    The while loop is also an **entry-controlled loop** which is used in situations where we do not know the exact number of iterations of the loop beforehand.

    In for loop, we have seen that the number of iterations is known **beforehand**, i.e. the number of times the loop body is needed to be executed is known to us and we create the condition on the basis of it. But while loops execution is solely based on the condition.
    - Syntax,

            while (condition) {
                // Body of the loop
                // update expression
            }

      Only the condition is the part of while loop syntax, we have to initialize and update loop variable manually.

    - Example,

            #include <iostream>
            using namespace std;

            int main() {

                // Initialization
                int i = 1;

                // while loop that starts with i = 1 and ends
                // when i is greater than 5.
                while (i <= 5) {
                    cout << i << " ";

                    // Updation
                    i++;
                }
                return 0;
            }

            <!-- Output -->
            1 2 3 4 5

    - Flowchart for while loop:

    ![flow-chart-img](https://media.geeksforgeeks.org/wp-content/uploads/20250719173109511150/While-loop.webp)

3.  **do while loop.**

    The do-while loop is an **exit-controlled loop** which means the condition is checked after executing the body of the loop. So, in a do-while loop, the loop body will **execute at least once** irrespective of the test condition.
    - Syntax,

            do {
                // Body of the loop
                // Update expression
            } while (condition);

      Like while loop, only the `condition` is the part of do while loop syntax, we have to do the `initialization` and `updation` of loop variable manually.

    - Example,

            #include <iostream>
            using namespace std;

            int main() {

                // Initialization
                int i = 1;

                // while loop that starts with i = 1 and ends
                // when i is greater than 5.
                do {
                    cout << i << " ";

                    // Updation
                    i++;
                }while (i <= 5);

                return 0;
            }

            <!-- Output -->
            1 2 3 4 5

    - Flowchart for do while loop,

      ![flowchart-img](https://media.geeksforgeeks.org/wp-content/uploads/20250719173109396294/Do-while-loop.webp)

4.  **for each loop.**

    The for-each loop in C++ is a range-based for loop. It automatically iterates over each element of a container or array using the container's begin() and end() functions internally.
    - Use of Reference vs Value :
      - **By Value** : for(auto it : arr), works on a copy, modifications won't affect the original.
      - **By Reference** : for(auto &it : arr), you can modify elements directly.

    - Example,

            #include <iostream>
            #include <vector>
            using namespace std;

            int main() {

                vector<int> arr = {1, 2, 3, 4, 5};

                // By value
                cout << "Iterating by value" << endl;
                for(auto it : arr){
                    cout << it <<" ";
                }
                cout<< endl;

                // By reference
                cout << "Iterating with reference" << endl;
                for(auto &it : arr){
                    cout << it << " ";
                }
                cout<<endl;
                return 0;
            }

            <!-- Output -->
            Iterating by value
            1 2 3 4 5
            Iterating with reference
            1 2 3 4 5

5.  **Infinite Loops.**

    An infinite loop (sometimes called an endless loop) is a piece of coding that lacks a functional exit so that it repeats indefinitely.

    An infinite loop occurs when a condition is always evaluated to be true. Usually, this is an error. We can manually create an infinite loop using all three loops:

        #include <iostream>
        using namespace std;

        int main() {

            // This is an infinite for loop as the condition
            // expression is blank
            for (;;) {
                cout << "This loop will run forever.\n";
            }
            return 0;
        }

        <!-- Output -->
        This loop will run forever.
        This loop will run forever.
        ...................

6.  **Nesting of Loops.**

    Nesting of loops refers to placing one loop inside another. The inner loop is executed completely for each iteration of the outer loop.

    This is useful when you need to perform multiple iterations within each iteration of a larger loop, such as iterating over a two-dimensional array or performing operations that require more than one level of iteration.

        #include <iostream>
        using namespace std;

        int main() {

            for (int i = 0; i < 3; i++) {

                // Outer loop runs 3 times
                for (int j = 0; j < 2; j++) {

                    // Inner loop runs 2 times for each
                    // outer loop iteration
                    cout << "i = " << i << ", j = " << j << endl;
                }
            }
            return 0;
        }

        <!-- Output -->
        i = 0, j = 0
        i = 0, j = 1
        i = 1, j = 0
        i = 1, j = 1
        i = 2, j = 0
        i = 2, j = 1

<hr />

## Functions.

A function is a reusable block of code that performs a specific task. It divides a program into smaller logical units, improves readability, and makes code easier to maintain.

A function can accept parameters, execute statements, and optionally return a value.

- A function allows you to write a piece of logic once and reuse it wherever needed in the program.
- This helps keep your code clean, organized, easier to understand and manage.

        #include <iostream>
        using namespace std;

        // function definition
        int square(int x) {
            return x * x;
        }

        int main() {

            // Calling the function
            int result = square(5);

            cout << "Square of 5 is: " << result << endl;

            return 0;
        }

        <!-- Output -->
        Square of 5 is: 25

![functionUse-img](https://media.geeksforgeeks.org/wp-content/uploads/20260109115849475633/why_use_functions_.webp)

### Function Syntax.

A function in C++ follows this general format:

![functionSyntax-img](https://media.geeksforgeeks.org/wp-content/uploads/20260113104235019468/keyword.webp)

Each part has a specific role:

- **Return type**: Specifies what type of value the function returns. Use void if there is no return value.
- **Function name**: The name you will use to call the function.
- **Parameter list**: Inputs that the function accepts. It can be empty if no inputs are needed.
- **Function body**: The block of code that runs when the function is called.

### Function Declaration vs Definition.

A function declaration introduces a function to the compiler by specifying its return type, name, and parameters without the body, and is used when the function is defined later or in another file.

    // Declaration
    int add(int, int);

Function definition contains the actual code that specifies what the function does when it is called.

    //Definition
    int add(int a, int b) {
    return a + b;
    }

### Calling a function.

A function is used by calling its name followed by parentheses, passing required arguments if any, which executes the code inside the function.

    #include <iostream>
    using namespace std;
    ​
    void greet() {
        cout << "Welcome to C++ Programming!" << endl;
    }
    
    int multiply(int a, int b) {
        return a * b;
    }
    ​
    int main() {
        greet();
        int result = multiply(4, 5);
        cout << "Multiplication result: " << result << endl;
        return 0;
    }

    <!-- Output -->
    Welcome to C++ Programming!
    Multiplication result: 20

- **Explanation**,
  - **greet() function**: A parameterless void function that prints a welcome message and is called in main() using greet();.
  - **multiply(int a, int b) function**: Takes two integers, returns their product, and is called in main() with 4 and 5, storing the result in result which is then printed.

### Types of Functions in C++.

In C++, functions can be broadly categorized based on two criteria:

1. **Based on origin** :
   - **Library Functions**: These are built-in functions provided by C++ standard libraries, such as `cout`, `sqrt()`, `abs()`, and `getline()`. You can use them by including appropriate headers like `<iostream>`, `<cmath>` or `<string>`.
   - **User-Defined Functions**: These are functions created by the programmer to perform specific tasks in the program.

2. **Based on input and return type** :

   User-defined functions can be further classified based on whether they accept parameters or return a value:
   - **No parameters, no return value**: The function performs a task but does not take input or return anything.
   - **Parameters, no return value**: The function takes input but does not return a result.
   - **No parameters, return value**: The function returns a result but does not take any input.
   - **Parameters and return value**: The function takes input and returns a result.

<hr />

## Assignment.

1.  Write a program in c++ to take a positive integer `N` as input & you must,
    - Print the sum of it's digits.
    - Print the total number of digits.
    - Print the reversed number.

    [Solution](./Assignment/code1.cpp)

2.  Write a program in c++ to take two integer `L` & `R` (L <= R) as input & you must,
    - Print all prime numbers between `L` and `R`.
    - Print the number of prime numbers in that range.
    - Print the largest prime in that range (if none exist, print -1).

    [Solution](./Assignment/code2.cpp)

3.  Write a program in C++ to take a number `N` as input & repeat the following process until `N` becomes a single digit:

        If `N` is even -> divide it by 2.
        If `N` is odd -> multiply it by 3 & add 1.

    - Count how many steps it takes to reach a single digit.

    - Also print the sequence of number formed.

    [Solution](./Assignment/code3.cpp)
