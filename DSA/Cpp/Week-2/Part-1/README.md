# List of topics learned.

- # C++ Setup.

    - **Installing compiler and configuring with VS Code.**

        - For compiling C++ programs to machine code (executables), you need g++ compilers. Generally with Mac and Linux, g++ comes preinstalled. Check using the command.

                g++ --version

        - For installing on Windows, you need to install mingw and then add it to PATH.
        
            Tutorial: [Using GCC with MinGW](https://code.visualstudio.com/docs/cpp/config-mingw#_prerequisites)
        
        - You can also setup a VS Code extension for features like Code Completion, Running on VS Code by clicking button etc.

            [C/C++ for Visual Studio Code](https://code.visualstudio.com/docs/languages/cpp)
            |
            [Code Runner](https://marketplace.visualstudio.com/items?itemName=formulahendry.code-runner)

    - **How it all works?**

        - You write your code in a file with extension `.cpp`. For example: `main.cpp`

        - Then you convert your CPP file to a machine executable using the compiler: `g++ main.cpp`.

        - This creates an executable file which depends on the OS. For example, in Windows it creates `a.exe` whereas in UNIX systems (LINUX/Mac) it creates an `a.out`.

        - You can execute this file to run the program and get output. `./a.out` 

        - If you want to change the name of the executable, you can pass the `-o` argument: `g++ main.cpp -o main.out`

    - **Want to try it out yourself?**

        - Create a new file and open it in VSCode, or some text editor.
        
        - Paste the following code
            
                #include<iostream>
                
                using namespace std;

                int main() {
                    cout<<"Hello World!"<<endl;
                    return 0;
                }

        - Save the file with the name `main.cpp`. [Main.cpp file](./Practise/main.cpp)

        - Now compile the file and create an executable using the following command: `g++ main.cpp -o main.out` (Replace it with `g++ main.cpp -o main.exe` in case of Windows machine)

        - You can see a new file `main.out`(or `main.exe`) got created in the same directory (or current working directory)

        - Let’s run the program now. Run `./main.out` if you are in Unix systems (Mac / Linux) or `.\main.exe` if you are in Windows machine. You should see “Hello World!” printed on your terminal.

<hr />

- # Understanding basic C++ program.

    - Let's understand it part by part,

        - `#include<iostream>` : This is how we import libraries in C++. Consider it same as `import axios from "axios"`. The general structure is `#include<library_name>` . `iostream` is a library that imports the I/O objects.

        - `using namespace std;` : In C++, a namespace is a collection of related names or identifiers (functions, class, variables) which helps to separate these identifiers from similar identifiers in other namespaces or the global namespace. Almost everytime, we will be using the `std` namespace only, so don’t worry about this a lot.

        - `int main()`: `main` function is the entry point for a file / program. `int` is the return type of the main method. Generally we will return 0 to indicate successful completion. We can also return error codes to indicate what kind of error occurred. However, in our case we will only return 0.

        - `cout`: Used for printing the output to the terminal (or some file). Similar to `console.log()` in Javascript.
        
        - `endl`: Prints a new line after the output is printed. In C++, we need to manually specify newlines using `endl` or `\n`. For example:

                cout<<"Hello ";
                cout<<"World";

                Output: Hello World

        - `return 0` : It returns 0 from the main function.

    - **What libraries to import?**

        - An obvious question comes to our mind, what are the different libraries we need to import? We can import different libraries separately for getting different functionalities and data structures. For example, `iostream` for I/O operations, `stack` for Stacks, `vector` for vectors (dynamic arrays).

        - However, don’t worry! You don’t need to import all of them. There is a special library called `bits/stdc++.h` that includes all these common libraries. You will in 99% of the cases (if not 100), not need to import anything else.
        
            Import it using: `#include<bits/stdc++.h>`

<hr />

- # I/O operations.

    - **Output.**

        - For output, we can generally use `cout` statement.

                cout<<"Hello World!";

        - To print new lines, we can use `endl` or `\n`.

        - So let's see what the difference is.

        - `\n` : It inserts a new line to the output stream.

        - `endl` : It inserts a new line and flushes the output stream.

        - So eventually `cout<<endl;` is equivalent to using `cout<<'\n<<flush;`

        - But which one to use?
        
            `\n` is much faster than `endl`. So use `\n` every time if possible (unless you need to flush the output). However, when you are printing a single element or some fixed set of elements (like 100), you can use `endl` as well.

    - **Input.**

        - For reading input, we generally use `cin` statement.

                int x;
                cin>>x;

                // We can even read multiple space or newline separated inputs like this
                int x, y;
                cin>>x>>y;

    - **Fast IO.**

        - Generally, as mentioned above, the input and output streams are tied, which causes flushing before every IO operation. This can make program execution slower in case of large input size. So we can untie the streams using the statements `cin.tie(NULL)` and `cout.tie(NULL)`. Just add this at beginning of your program.

        - `std::ios_base::sync_with_stdio` : Sets whether the standard C++ streams are synchronized to the standard C streams after each input/output operation. In practice, this means that the synchronized C++ streams are unbuffered, and each I/O operation on a C++ stream is immediately applied to the corresponding C stream's buffer. This makes it possible to freely mix C++ and C I/O.
        
        - In addition, synchronized C++ streams are guaranteed to be thread-safe (individual characters output from multiple threads may interleave, but no data races occur).

        - If the synchronization is turned off, the C++ standard streams are allowed to buffer their I/O independently, which may be considerably faster in some cases.
        
        - So overall, add these 2 things before the start of any program. Example: 

                #include<bits/stdc++.h>

                using namespace std;

                int main() {
                ios_base::sync_with_stdio(false);
                cin.tie(NULL);
                cout.tie(NULL);
                
                // Your program here
                }


<hr />

- # Data types in C++.

    - C++ is a strictly typed language. So you need to specify the data type of all variables before assigning them values or using them. Generally, data types can be categorised into 3 types:
        
        - Primary / Built-in data types
        
        - Derived data types
        
        - User defined data type

        ![Datatypes-img](https://www.notion.so/image/https%3A%2F%2Fmedia.geeksforgeeks.org%2Fwp-content%2Fcdn-uploads%2F20191113115600%2FDatatypesInC.png?table=block&id=1f64dd67-dcdc-44aa-b7bd-ed14952fefbe&cache=v2)

    - Sizes of Primary data types.

        ![Datatypes-size-img](https://www.notion.so/image/https%3A%2F%2Flikhithanjali.github.io%2Ftutorials%2Fimages%2Fcpp_datatype1.png?table=block&id=4f3758e3-aa82-4b32-b613-ae91212bf2e7&cache=v2)

<hr />

- # Conditional statements in C++.

    - C++ like Javascript has the following conditional statements:
        
        - **if else,** [Example](./Practise/EligibleVoter.cpp)

                if (condition_1) {
                // Executed if condition_1 is true
                } else if (condition_2) {
                // Executed if condition_1 is false and condition_2 is true
                } else {
                // Executed if both condition_1 and condition_2 are false
                }

        - **switch case,** [Example](./Practise/Calculator.cpp)

                switch(variable) {
                case 1:
                    // When variable is 1
                    break;
                    case 2:
                        // When variable is 2
                        break;
                    default:
                        // When none of the case statements is satisfied
                }

        - **ternary operator,** [Example](./Practise/number.cpp)

                condition ? true_statement : false_statement
    
<hr />

- # Looping statements.

    - Similar to Javascript, C++ also supports `for` and `while` loops. There is another looping statement called `do while` but you will rarely encounter this, so we will be skipping it.

        - **for loop,** [Example](./Practise/PrintNum.cpp)

                for (int i=0; i<n; i++) {
                // do something
                }

                // You don't always need to iterate on integer values only. Example:
                for(char i='a'; i<='z'; i++) {
                // do something
                }

                // We also have for-each loop in C++, similar to javascript
                for(int x: arr) {
                // You get each array values one by one in x. 
                }

                // We can also have nested loops
                for(int i=0; i<n; i++) {
                for(int j=0; j<n; j++) {
                    // Nested loop example
                }
                }
        
            - **Early exits.**
                
                - Sometimes, we might want to break the loop before it runs to completion. Or we might want to skip to the next iteration in some cases. We can do these using `break` and `continue` statements respectively.

                        for(int i=0; i<n; i++) {
                        if (i == 5) break; // We break when i reaches 5. So it does not continue with remaining iteration
                        if (i % 2 == 0) continue; // We don't execute the loop for even values of i, just continue to next iteration value of i
                        sum += i;
                        }

        - **While Loop,** [Example](./Practise/PrintNumWhile.cpp)

                while (i < 10) {
                // do something
                i++;
                }



<hr />

- # Functions.

    - A function is a block of code which only runs when it is called.
    
    - You can pass data, known as parameters, into a function. [Example](./Practise/greet.cpp)

    - Functions are used to perform certain actions, and they are important for reusing code: Define the code once, and use it many times.
 
    - Functions take in some arguments and returns (may or may not) some value. The return type of a function determines what type of data is returned. If return type is `void` it does not return any value.

            int sum(int x, int y) {
            return x + y;
            }


            void print_data(int x) {
                    cout<<"Number is: " << x <<endl;
            }

            int find_max(int a, int b) {
            if (a > b) return a;
            return b;
            }

            string concatenate(string a, string b) {
            string res = "";
            for(char x: a) res.push_back(x);
                for(char x: b) res.push_back(x);
            return res;
            }

        - **Function in Overloading.**

            - Function Overloading is defined as the process of having two or more function with the same name, but different in parameters is known as function overloading in C++. In function overloading, the function is redefined by using either different types of arguments or a different number of arguments.

                    int add(int a, int b) {
                    return a + b;
                    }

                    float add(float a, float b) {
                    return a + b;
                    }

                    int add(int a, int b, int c) {
                        return a + b + c;
                    }

                    string add(string a, string b) {
                    return a + b;
                    }

                    add(2, 3); // Works
                    add(2.2, 3.5); // Works as well
                    add(2, 3, 4); // Works as well
                    add("ab", "cd"); // Works as well

<hr />

- # Arrays.

    - Collection of elements of similar type is called an array. Similar to javascript. However, as C++ is strictly typed, we can only store elements of a single type, unlike Javascript.
 
    - Each array element has some index. It starts from 0. We will learn more about the actual meaning of indices, once we go through pointers.

        ![Arrays-img](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz2lsNfHvHJg6yXapW_lzZf5SIlSBV8wSPka8BWzvj&s)

        - **Creating arrays.**

            - Approach 1:

                    int arr[] = {1, 2, 3, 4};

                    // You either need to specify the size or initial elements.
                    int arr[10];
                
                To create dynamic sized arrays, we can do the following:

                    int n;
                    cin>>n;
                    int arr[n];

                    // Now take input
                    for(int i=0; i<n; i++) {
                    cin>>arr[i];
                    }

            - Approach - 2 (Using vector)

                - The above arrays created have fixed size (i.e. once created, the size is not changed). If you want to dynamically change array size, you can use pointers to create a dynamic array and change its size using realloc. However, there is a C++ collection called vector that allows us to create dynamic arrays.                

        - **Looping on arrays.**

            - Similar to javascript we can run a for loop
                    int arr[n];

                    for(int i=0; i<n; i++) {
                    cin>>arr[i];
                    }

            - We can also run for-each loops as well, these assigns the array values to the variable directly instead of needing to access by index.
 
                    for(int x: arr) {
                    cout<<x<<" ";
                    }

        - **Accessing elements.**

            - We can access elements of array using their index. For example, `arr[3]` gives the element at index 3, which is the 4th element of the array (Remember, array indices are 0 based)

        - **Updating elements.**

            - We can assign values to array elements using = operator. Example:
            
                    arr[0] = 10;

                    arr[i] = i + 10;