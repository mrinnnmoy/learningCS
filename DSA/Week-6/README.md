# List of things learned.

## Memory Fundamentals.

**Memory management** is the process of controlling how much memory your program uses - and how it is used.

This includes creating, using and releasing memory when it's no longer needed.

When you create a variable in C++, the compiler automatically reserves space in memory for it.

For example :

    int myNumber = 10;

The line above tells the program: **"I need space to store an integer."**

C++ handles this memory automatically, so in this case, you dont have to worry about managing memory.

<hr />

### **Stack vs Heap memory (basic model).**

In C, C++ and Java, memory can be allocated on either a stack or a heap.

Stack allocation happens in the function call stack, where each function gets its own memory for variables.

In C/C++, heap memory is controlled by programmer as there is no automatic garbage collection.

![img](https://camo.githubusercontent.com/ac92230c6f8660c45eb5ceabcaf1147f7495c05cfb99a6e3569db1260c7ff4ae/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e643947635176796b6e54426f454f6d725932494c4961624734457a704447734d53717236506951736e49526b6f3479772673)

To Understand the difference between **stack** and **heap** memory allocation by observing how objects are created and managed in both cases using a class Emp for storing Employee details.

    #include <bits/stdc++.h>
    using namespace std;

    class Emp {
    public:
        int id;
        string emp_name;

        // Constructor to initialize employee details
        Emp(int id, string emp_name) {
            this->id = id;
            this->emp_name = emp_name;
        }
    };

    // Function to create and return an Emp object
    Emp Emp_detail(int id, string emp_name) {
        return Emp(id, emp_name);
    }

    int main() {
        // Initializing employee details
        int id = 21;
        string name = "Maddy";

        // Creating an Emp object using the function
        Emp person_ = Emp_detail(id, name);

        return 0;
    }

![img](https://media.geeksforgeeks.org/wp-content/uploads/20201210222125/Untitled4-660x361.png)

Here's a comparison chart for better understanding.

| Parameter                  | Stack                                                      | Heap                                                                           |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Basic                      | Memory is allocated in a contiguous block.                 | Memory is allocated in any random order.                                       |
| Allocation & De-allocation | Automatic by compiler instructions.                        | Manual by the programmer (in C or C++ and garbage collector in Java or Python) |
| Cost                       | Less                                                       | More                                                                           |
| Implementation             | Easy                                                       | Hard                                                                           |
| Main Issue                 | Shortage of Memory                                         | Memoery fragmentation                                                          |
| Locality of reference      | Excellent                                                  | Adequate                                                                       |
| Safety                     | Thread safe, data stored can only be accessed by the owner | Not Thread safe, data stored visible to all threads                            |
| Flexibility                | Fixed-size                                                 | Resizing is possible                                                           |
| Data type structure        | Linear                                                     | Hierarchical                                                                   |
| Preferred                  | Static memory allocation is preferred in an array.         | Heap memory allocation is preferred in the linked list.                        |
| Size                       | Smaller than heap memory.                                  | Larger than stack memory.                                                      |

<hr />

### How variables are stored in memory.

The memory layout of a program shows how its data is stored in memory during execution. It helps developers understand and manage memory efficiently.

- Memory is divided into sections such as code, data, heap and stack.

- Knowing the memory layout is useful for optimizing performance, debugging and prevent errors like segmentation fault and memory leak.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250122155858092295/Memory-Layout-of-C-Program-768.webp)

1. **Text Segment.**

- The text segment (or code segment) stores the executable code of the program like program’s functions and instructions.
- The segment is usually read-only to prevent accidental modification during execution.
- It is typically stored in the lower part of memory.
- The size of the text segment depends on the number of instructions and the program’s complexity.

2. **Data Segment.**

- The data segment stores global and static variables of the program.
- Variables in this segment retain their values throughout program execution.
- The size of the data segment depends on the number and type of global/static variables.
- It is divided into initialized and uninitialized (BSS) sections.

3. **Heap Segment.**

- The heap segment is used for dynamic memory allocation.
- It starts at the end of the BSS segment and grows towards higher memory addresses.
- Memory in the heap is managed using functions like malloc(), realloc() and free().
- The heap is shared by all shared libraries and dynamically loaded modules in a process.

4. **Stack Segment.**

- The stack stores local variables, function parameters, and return addresses for each function call.
- Each function call creates a stack frame in this segment.
- The stack is usually at higher memory addresses and grows opposite to the heap.
- When the stack and heap meet, the program’s free memory is exhausted.

### What is a memory address?

When you create a variable in c++, the compiler automatically reserves space in memeory for it.

For example:

    int myNumber = 10;

The line above tells the program: "**I need space to store an integer.**"

C++ handles this memory automatically, so in this case, you dont have to worry about managing memory.

You can also check how much memeory a variable type uses with the `sizeof` operator.

    #include <iostream>
    using namespace std;

    int main() {
    int myInt;
    float myFloat;
    double myDouble;
    char myChar;

    cout << sizeof(myInt) << "\n";     // 4 bytes (typically)
    cout << sizeof(myFloat) << "\n";   // 4 bytes
    cout << sizeof(myDouble) << "\n";  // 8 bytes
    cout << sizeof(myChar) << "\n";    // 1 byte
    return 0;
    }

But does that mean, you have to manager memory yourself?

**Sometimes yes & sometime no.**

- For normal variables (like int x = 10;), C++ takes care of the memory for you.
- But when you want to create memory manually while the program is running.

  (for example: based on user input), you need to manage it yourself and clean it up when you're done.

If your program uses too much memory, or forgets to clean up memory it no longer needs, it can lead to slow performance or even crashes.

That's why understanding memory is important. It gives you more control and helps avoid common bugs.

### Using & (address-of operator)

In c++, we can also get the memory address of a variable by using the `&` operator:

    string food = "Pizza"; // A food variable of type string

    cout << food;  // Outputs the value of food (Pizza)
    cout << &food; // Outputs the memory address of food (0x6dfed4)

<hr />

## Introduction to Pointers.

### What is a pointer?

A **pointer** however, is a variable that stores the memory address as its value.

A pointer variable points to a data type (like `int` or `string`) of the same type and is created with the `*` operator.

The address of the variable you're working with is assigned to the pointer:

    string food = "Pizza";  // A food variable of type string
    string* ptr = &food;    // A pointer variable, with the name ptr, that stores the address of food

    // Output the value of food (Pizza)
    cout << food << "\n";

    // Output the memory address of food (0x6dfed4)
    cout << &food << "\n";

    // Output the memory address of food with the pointer (0x6dfed4)
    cout << ptr << "\n";

- Here we're creating a pointer variable with the name `ptr`, that points to a `string` variable, by using the asterisk sign `*` (`string* ptr`).

- Note that the type of the pointer has to match the type of the variable you're working with.

- Use the `&` operator to store the memory address of the variable called food and assign it to the pointer.

- Now, `ptr` holds the value of `food`'s memory address.

### Pointer initialization, declaration and dereferencing.

From the previous example, we used the pointer variable to get the memory address of a variable (used together with the & reference operator).

However, you can also use the pointer to get the value of the variable, by using the \* operator (the dereference operator):

    string food = "Pizza";  // Variable declaration
    string* ptr = &food;    // Pointer declaration

    // Reference: Output the memory address of food with the pointer (0x6dfed4)
    cout << ptr << "\n";

    // Dereference: Output the value of food with the pointer (Pizza)
    cout << *ptr << "\n";

### Modifying Pointers.

You can also change the pointer's value.

But note that this will also change the value of the original variable:

    string food = "Pizza";
    string* ptr = &food;

    // Output the value of food (Pizza)
    cout << food << "\n";

    // Output the memory address of food (0x6dfed4)
    cout << &food << "\n";

    // Access the memory address of food and output its value (Pizza)
    cout << *ptr << "\n";

    // Change the value of the pointer
    *ptr = "Hamburger";

    // Output the new value of the pointer (Hamburger)
    cout << *ptr << "\n";

    // Output the new value of the food variable (Hamburger)
    cout << food << "\n";

<hr />

## Pointer Arithmetic.

In C++, pointer arithmetic means performing valid arithmetic operations on pointer variables to move and access memory locations efficiently.

### Incrementing & decrementing pointers.

The value of pointer is incremented depending on the type of variable address stored in the pointer.

For example, If an integer pointer `ptr` holds the address `1000` and we increment the pointer, then the pointer will be incremented by `4` or `8` bytes (size of the integer).

And the pointer will now hold the address `1004` or `1008`.

Similarly Like increment, the value can also be decreased according to the size of the type.

The following diagram assumes size of integer as 4 bytes.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20230424100855/Pointer-Increment-Decrement-768.webp)

    #include <iostream>
    using namespace std;

    int main() {

        int n = 27;
        int* ptr = &n;

        cout << "Size of int: " << sizeof(int) << endl;
        cout << "Before Increment: " << ptr << endl;

        ptr++;
        cout << "After Increment: " << ptr << endl;
        cout << "Before Decrement: " << ptr << endl;

        ptr--;
        cout << "After Decrement: " << ptr;
        return 0;
    }

    <!-- Output -->
    Size of int: 4
    Before Increment: 0x7ffcbc721cec
    After Increment: 0x7ffcbc721cf0
    Before Decrement: 0x7ffcbc721cf0
    After Decrement: 0x7ffcbc721cec

### Pointer arithmetic with integers.

We can add integer values to Pointers and the pointer is adjusted based on the size of the data type it points to.

For example, if an integer pointer ptr stores the address 1000 and we add the value 5 to the pointer.

    ptr + 5

It will calculate the new address as:

    1000 + (5 * 4(size of an integer)) = 1020

![img](https://media.geeksforgeeks.org/wp-content/uploads/20230424100935/Pointer-Addition-768.webp)

    #include <iostream>
    using namespace std;

    int main(){

        int n = 20;
        int* ptr = &n;

        cout << "Address stored in ptr: " << ptr << endl;
        ptr = ptr + 1;
        cout << "Adding 1 to ptr: " << ptr << endl;

        ptr = ptr + 2;
        cout << "Adding 2 to ptr: " << ptr;
        return 0;
    }

    <!-- Output -->
    Address stored in ptr: 0x7ffc79d0fcec
    Adding 1 to ptr: 0x7ffc79d0fcf0
    Adding 2 to ptr: 0x7ffc79d0fcf8

### Pointer arithmetic with arrays.

Pointers contain addresses.

Adding two addresses makes no sense because there is no idea what it would point to.

Subtracting two addresses lets you compute the offset between the two addresses.

An array name acts like a pointer constant.

The value of this pointer constant is the address of the first element.

**For Example**: if an array is named `arr` then `arr` and `&arr[0]` can be used to reference the array as a pointer.

    #include <stdio.h>

    int main(){

        int N = 5;

        // An array
        int arr[] = { 1, 2, 3, 4, 5 };

        // Declare pointer variable
        int* ptr;

        // Point the pointer to first
        // element in array arr[]
        ptr = arr;

        // Traverse array using ptr
        for (int i = 0; i < N; i++) {

            // Print element at which
            // ptr points
            printf("%d ", ptr[0]);
            ptr++;
        }
    }

    <!-- Output -->
    1 2 3 4 5

<hr />

## Dynamic Memory Allocation.

In C++, **stack memory** is automatically allocated for variables at compile time and has a fixed size. For greater control and flexibility, **dynamic memory allocation** on the heap is used, allowing manual allocation with new and deallocation with delete.

It allows the program to request memory from the heap at runtime using the `new` operator and release it using the `delete` operator. This is useful when the size of required memory isn’t known at compile time, such as for variable-sized arrays or dynamic data structures like linked lists and trees.

The new operator in C++ allocates memory from the `Free Store` (a portion of the heap). If enough memory is available, it initializes the memory with a default value based on its type and returns the address of the allocated memory

### `new` operator.

A `new` operator is also used to dynamically allocate a block (an array) of memory of given data type as shown below:

    new data_type[n];

This statement dynamically allocates memory for `n` elements of given `data_type`. Arrays can also be initialized during allocation.

    #include <iostream>
    #include <memory>
    using namespace std;

    int main() {

        // Declared a pointer to store
        // the address of the allocated memory
        int *nptr;

        // Allocate and initialize array of
        // integer with 5 elements
        nptr = new int[5]{1, 2, 3, 4, 5};

        // Print array
        for (int i = 0; i < 5; i++)
            cout << nptr[i] << " ";
        return 0;
    }

    <!-- Output -->
    1 2 3 4 5

### `delete` operator.

In C++, `delete` operator is used to release dynamically allocated memory. It deallocates memory that was previously allocated with new.

- Syntax:
  delete ptr;

where, `ptr` is the pointer to the dynamically allocated memory.

- To free the dynamically allocated array pointed by pointer variable, use the following form of delete:

        delete[] arr;

- Example.

        #include <iostream>
        using namespace std;

        int main() {
            int *ptr = NULL;

            // Request memory for integer variable
            // using new operator
            ptr = new int(10);
            if (!ptr) {
                cout << "allocation of memory failed";
                exit(0);
            }

            cout << "Value of *p: " << *ptr << endl;

            // Free the value once it is used
            delete ptr;

            // Allocate an array
            ptr = new int[3];
            ptr[2] = 11;
            ptr[1] = 22;
            ptr[0] = 33;
            cout << "Array: ";
            for (int i = 0; i < 3; i++)
                cout << ptr[i] << " ";

            // Deallocate when done
            delete[] ptr;

            return 0;
        }

        <!-- Output -->
        Value of *p: 10
        Array: 33 22 11

### Memory leaks (basic awareness)

As powerful as dynamic memory allocation is it is also prone to one of the worst errors in C++. Major ones are:

- Memory Leaks.

  Memory leak is a situation where the memory allocated for a particular task remains allocated even after it is no longer needed. Moreover, if the address to the memory is lost, then it will remain allocated till the program runs.

  **Solution**: Use smart pointers whenever possible. They automatically deallocate when goes out of scope.

- Dangling Pointers.

  Dangling pointers are created when the memory pointed by the pointer is accessed after it is deallocated, leading to undefined behaviour (crashes, garbage data, etc.).

  **Solution**: Initialize pointers with nullptr and assign nullptr again when deallocated.

- Double Deletion.

  When delete is called on the same memory twice, leading to crash or corrupted program.

  **Solution**: assign nullptr to the memory pointer when deallocated.

<hr />

## Passing Arguments in Functions.

In C++, data can be sent to functions when they are called in order to perform operations. This data is called parameters or arguments and there are various parameter passing methods available in C++. In this article, we will discuss various parameter-passing techniques in C++.

Before you see the techniques, first understand the difference between the following terms:

- **Formal Parameters**: Variables used in parameter list of a function as placeholders. Also called only parameters.
- **Actual Parameters**: The expressions or values passed in during a function call. Also called arguments.

There are 3 different methods using which we can pass parameters to a function in C++.

1.  **Pass by value**.

    In pass by value method, a variable's value is copied and then passed to the function. As the result, any changes to the parameter inside the function will not affect the variable's original value in the caller. This method is simple, easy to understand and implement but it is not preferred for large size of data structures at it involves copying the value.

        #include <iostream>
        using namespace std;

        // Arguments are pass by value
        void change(int a) {

            // Modifying arguments
            a = 22;
        }

        int main() {
            int x = 5;

            // Passing x by value to change()
            change(x);

            cout << x;
            return 0;
        }

        <!-- Output -->
        5

    In this program, when the change function is called with x as the argument, a copy of x is created and passed to the function. Inside the function, the parameter a is modified, but this modification only affects the local copy of the value, not the original variable x, as demonstrated by the output.

2.  **Pass by reference**.

    In pass-by-reference method, instead of passing the value of the argument, we pass the reference of an argument to the function. This allows the function to change the value of the original argument. This is useful when you have to pass large size data.

        #include <iostream>
        using namespace std;

        // Arguments are pass by value
        void change(int& a) {

            // Modifying arguments
            a = 22;
        }

        int main() {
            int x = 5;

            // Passing x by reference to change()
            change(x);

            cout << x;
            return 0;
        }

        <!-- Output -->
        22

    As we can see, the original value is modified. Just declaring the parameter a as a reference changes it from pass by value to pass by reference.

3.  **Pass by address (using pointers)**.

    The pass-by-pointer is very similar to the pass-by-reference method. The only difference is that we pass the raw address of the argument as the parameter to the function instead of reference.

        #include <iostream>
        using namespace std;

        // Arguments are pass by value
        void change(int* a) {

            // Modifying arguments
            *a = 22;
        }

        int main() {
            int x = 5;

            // Passing address of x to change()
            change(&x);

            cout << x;
            return 0;
        }

        <!-- Output -->
        22

    The original value is modified, but it increased to complexity of the program as we need to be careful of referencing, referencing and passing addresses. So, passing reference is preferred over this method.

### Difference between reference and pointer.

Below are key difference between pointers and references in C++ based on their behavior, usage and memory handling.

| Feature        | Pointer                                                 | Reference                                                       |
| -------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Definition     | A pointer stores the memory address of another variable | A reference is an alias (another name) for an existing variable |
| Declaration    | Uses \* symbol                                          | Uses & symbol                                                   |
| Initialization | Can be declared without initialization                  | Must be initialized at the time of declaration                  |
| Null Value     | Can be NULL or nullptr                                  | Cannot be null                                                  |
| Reassignment   | Can point to another variable                           | Cannot be reassigned to refer to another variable               |
| Memory Address | Has its own memory address                              | Shares the same memory address as the referenced variable       |
| Dereferencing  | Requires dereferencing using \*                         | No dereferencing needed                                         |
| Usage          | Useful for dynamic memory, arrays, and data structures  | Useful for function parameters and operator overloading         |
| Safety         | Less safe (can cause dangling pointers)                 | Safer compared to pointers                                      |

<hr />

## Assignment.

1. Write a program in c++ that takes two integers as input,
   - Swap them using :
     - Pass by value,
     - Pass by reference,
     - Pass by address (pointer)
   - Print the values before & after each swap.

   [Solution](./Assignment/code1.cpp)

2. Write a program in c++ that takes `n` as input,
   - Dynamically allocates an array of size `n` using `new`.
   - Takes array elements from user
   - Uses pointer arithmetic only (no indexing like `arr[i]`) to:
     - Print the array
     - Calculate sum of elements
   - Deallocate memory peoperly using `delete[]`.

   [Solution](./Assignment/code2.cpp)

3. Write a program in c++ that takes `n` as input,
   - Dynamically creates an array of size `n`.
   - Takes elements as input.
   - Create a function that:
     - Accepts the array using pass by address
     - Modifies each element (e.g., multiply by 2)
   - Print the modified array in `main`.
   - Properly free memory.

   [Solution](./Assignment/code3.cpp)
