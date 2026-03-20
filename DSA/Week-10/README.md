# List of things learned.

## Stack.

Stack is a linear data structure that follows LIFO (Last In First Out) Principle, the last element inserted is the first to be popped out.

It means both insertion and deletion operations happen at one end only.

![stack-img](https://media.geeksforgeeks.org/wp-content/uploads/20250826120607519143/push232.jpg)

### Concept.

To vizualise LIFO, think of a pile of pancakes, where pancakes are both added and removed from the top.

So when removing a pancake, it will always be the last one you added. This way of organizing elements is called LIFO in computer science and programming.

Unlike vectors, elements in the stack are not accessed by index numbers. Since elements are added and removed from the top, you can only access the element at the top of the stack.

### Types of Stack.

1. **Fixed Size Stack.**
   - A fixed size stack has a predefined capacity.
   - Once it becomes full, no more elements can be added (this causes overflow).
   - If the stack is empty and we try to remove an element, it causes underflow.
   - Typically implemented using a static array.

     **Example** : Declaring a stack of size 10 using an array.

2. **Dynamic Size Stack.**
   - A dynamic size stack can grow and shrink automatically as needed.
   - If the stack is full, its capacity expands to allow more elements.
   - As elements are removed, memory usage can shrink as well.
   - Can be implemented using:
     - Linked List → grows/shrinks naturally.
     - Dynamic Array (like vector in C++ or ArrayList in Java) → resizes automatically.

     **Example** : Stack implementation using linked list or resizable array.

### Applications of Stack.

- It can applies on the Expression Evaluation and it can evaluates the prefix, postfix and infix expressions.
- It can applies on the Function calls and recursion.
- It can applies in text editors for undo mechanisms functionalities.
- It can applies on syntax parsing and syntax checking.

### Core Operations & Their Complexity.

Following are some basic operations in the stack that make it easy to manipulate the stack data structure:

| Operation          | Description                                                      | Time Complexity | Space Complexity |
| ------------------ | ---------------------------------------------------------------- | --------------- | ---------------- |
| `push(val)`        | Add the element to the top of the stack.                         | O(1)            | O(1)             |
| `pop()`            | Remove the element on the top of the stack.                      | O(1)            | O(1)             |
| `peek()` / `top()` | Returns the element at the top of the stack without removing it. | O(1)            | O(1)             |
| `isEmpty()`        | Checks if the stack is empty.                                    | O(1)            | O(1)             |
| `size()`           | Check the number of elements                                     | O(1)            | O(1)             |

### Implementaion.

To use a stack, you have to include the `<stack>` header file:

    // Include the stack library
    #include <stack>

1.  **Create a Stack.**

    To create a `stack`, use the stack keyword, and specify the type of values it should store within angle brackets `<>` and then the name of the stack, like: `stack<type> stackName`.

        // Create a stack of strings called cars
        stack<string> cars;

        or

        stack<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

2.  **Add Elements.**

    To add elements to the stack, use the `.push()` function, after declaring the stack:

        // Create a stack of strings called cars
        stack<string> cars;

        // Add elements to the stack
        cars.push("Volvo");
        cars.push("BMW");
        cars.push("Ford");
        cars.push("Mazda");

    The stack will look like this (remember that the last element added is the top element):

        Mazda (top element)
        Ford
        BMW
        Volvo

3.  **Access Stack Elements.**

    You cannot access stack elements by referring to index numbers, like you would with arrays and vectors.

    In a stack, you can only access the top element, which is done using the `.top()` function:

        // Access the top element
        cout << cars.top();  // Outputs "Mazda"

4.  **Change the Top Element.**

    You can also use the `.top` function to change the value of the top element:

        // Change the value of the top element
        cars.top() = "Tesla";

        // Access the top element
        cout << cars.top();  // Now outputs "Tesla" instead of "Mazda"

5.  **Remove Elements.**

    You can use the `.pop()` function to remove an element from the stack.

    This will remove the last element that was added to the stack:

        // Create a stack of strings called cars
        stack<string> cars;

        // Add elements to the stack
        cars.push("Volvo");
        cars.push("BMW");
        cars.push("Ford");
        cars.push("Mazda");

        // Remove the last added element (Mazda)
        cars.pop();

        // Access the top element (Now Ford)
        cout << cars.top();

6.  **Get the size of the stack.**

    To find out how many elements a stack has, use the `.size()` function:

        cout << cars.size();

7.  **Check if the stack is empty.**

    Use the `.empty()` function to find out if the stack is empty or not.

    The `.empty()` function returns `1` (true) if the stack is empty and `0` (false) otherwise:

        stack<string> cars;
        cout << cars.empty(); // Outputs 1 (The stack is empty)

        or

        stack<string> cars;

        cars.push("Volvo");
        cars.push("BMW");
        cars.push("Ford");
        cars.push("Mazda");

        cout << cars.empty();  // Outputs 0 (not empty)

<hr />

## Queue.

A **Queue** Data Structure is a fundamental concept in computer science used for storing and managing data in a specific order, called FIFO.

### Concept.

**FIFO** stands for First in, First Out.

To visualize FIFO, think of a queue as people standing in line in a supermarket. The first person to stand in line is also the first who can pay and leave the supermarket.

This way of organizing elements is called FIFO in computer science and programming.

Unlike vectors, elements in the queue are not accessed by index numbers.

Since queue elements are added at the end and removed from the front, you can only access an element at the front or the back.

### Applications.

- **CPU Scheduling** : Tasks are queued and executed one after another.
- **Job Scheduling** : Printers manage multiple documents in a queue. (ATM Booth Line, Ticket Counter Line)
- **Networking** : Routers, switches and mail queues manage data packets. (Waiting time of each customer at call center)
- **Buffer Management** : Acts as a buffer between slow and fast devices. (Keyboard & CPU, two devices on network)

### Advantages of Queue.

- Queues are useful when a particular service is used by multiple consumers.
- Queues are fast in speed for data inter-process communication.
- Queues can be used for the implementation of other data structures.

### Disadvantages of Queue.

- The operations such as insertion and deletion of elements from the middle are time consuming.
- In a classical queue, a new element can only be inserted when the existing elements are deleted from the queue.
- Searching an element takes O(N) time.
- Maximum size of a queue must be defined prior in case of array implementation.

### Core Operations.

The following are some fundamental operations that allow us to add, remove and access elements efficiently.

- `enqueue()` : Insertion of elements to the queue.
- `dequeue()` : Removal of elements from the queue.
- `getFront()` : Acquires the data element available at the front node of the queue without deleting it.
- `getRear()` : This operation returns the element at the rear end without removing it.
- `isEmpty()` : Checks if the queue is empty.
- `size()` : This operation returns the size of the queue i.e. the total number of elements it contains.

### Implementation.

To use a queue, you have to include the `<queue>` header file:

    // Include the queue library
    #include <queue>

1.  **Create a Queue.**

    To create a `queue`, use the queue keyword, and specify the type of values it should store within angle brackets `<>` and then the name of the queue, like: `queue<type> queueName`.

        // Create a queue of strings called cars
        queue<string> cars;

        or

        queue<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

2.  **Add Elements.**

    To add elements to the queue, you can use the `.push()` function after declaring the queue.

    The `.push()` function adds an element at the end of the queue:

        // Create a queue of strings
        queue<string> cars;

        // Add elements to the queue
        cars.push("Volvo");
        cars.push("BMW");
        cars.push("Ford");
        cars.push("Mazda");

    The queue will look like this:

        Volvo (front (first) element)
        BMW
        Ford
        Mazda (back (last) element)

3.  **Access Queue Elements.**

    You cannot access queue elements by referring to index numbers, like you would with arrays and vectors.

    In a queue, you can only access the element at the front or the back, using `.front()` and `.back()` respectively:

        // Access the front element (first and oldest)
        cout << cars.front();  // Outputs "Volvo"

        // Access the back element (last and newest)
        cout << cars.back();  // Outputs "Mazda"

4.  **Change Front and Back Elements.**

    You can also use `.front` and `.back` to change the value of the front and back elements:

        // Change the value of the front element
        cars.front() = "Tesla";

        // Change the value of the back element
        cars.back() = "VW";

        // Access the front element
        cout << cars.front();  // Now outputs "Tesla" instead of "Volvo"

        // Access the back element
        cout << cars.back();  // Now outputs "VW" instead of "Mazda"

5.  **Remove Elements.**

    You can use the `.pop()` function to remove an element from the queue.

    This will remove the front element (the first and oldest element that was added to the queue):

        // Create a queue of strings
        queue<string> cars;

        // Add elements to the queue
        cars.push("Volvo");
        cars.push("BMW");
        cars.push("Ford");
        cars.push("Mazda");

        // Remove the front element (Volvo)
        cars.pop();

        // Access the front element (Now BMW)
        cout << cars.front();

6.  **Get the Size of a Queue.**

    To find out how many elements there are in a queue, use the `.size()` function:

        cout << cars.size();

7.  **Check if the Queue is Empty.**

    Use the `.empty()` function to find out if the queue is empty or not.

    The `.empty()` function returns `1` (true) if the queue is empty and `0` (false) otherwise:

        queue<string> cars;
        cout << cars.empty(); // Outputs 1 (The queue is empty)

        or

        queue<string> cars;

        cars.push("Volvo");
        cars.push("BMW");
        cars.push("Ford");
        cars.push("Mazda");

        cout << cars.empty();  // Outputs 0 (not empty)

<hr />

## Deque (Double Ended Queue)

A deque (stands for double-ended queue) however, is more flexible, as elements can be added and removed from both ends (at the front and the back).

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250917133632790563/Deque-768.webp)

You can also access elements by index numbers.

### Applications.

Following are some of the common applications of deque:

1. Deque is used to efficiently check if a string is a palindrome by comparing characters from both ends simultaneously.
2. Deque is used to implement undo/redo operations in text editors and other applications by maintaining a history of actions.
3. Deque is used to implement forward and backward navigation in web browsers, allowing efficient movement through browsing history.
4. Deque is used in round-robin scheduling algorithms, where tasks can be added or removed from either end of the queue.
5. Deque is used to solve sliding window maximum/minimum problems efficiently in algorithmic challenges and data processing.
6. Deque is used in certain graph traversal algorithms, such as breadth-first search variations that require bidirectional exploration.

### Core Operations & Their Complexity.

Following are some of the basic operations of a Deque that are required to manipulate its elements:

| Operation        | Description                                    | Time Complexity | Space Complexity |
| ---------------- | ---------------------------------------------- | --------------- | ---------------- |
| `pushFront(val)` | Inserts an element at the front of the deque   | O(1)            | O(1)             |
| `pushBack(val)`  | Inserts an element at the rear of the deque    | O(1)            | O(1)             |
| `popFront()`     | Removes an element from the front of the deque | O(1)            | O(1)             |
| `popBack()`      | Removes an element from the rear of the deque  | O(1)            | O(1)             |
| `front()`        | Returns the element at the front of the deque  | O(1)            | O(1)             |
| `back()`         | Returns the element at the rear of the deque   | O(1)            | O(1)             |
| `isEmpty()`      | Checks if the deque is empty or not            | O(1)            | O(1)             |
| `size()`         | Returns the number of elements in the deque    | O(1)            | O(1)             |

### Implementation.

To use a deque, you have to include the `<deque>` header file:

    // Include the deque library
    #include <deque>

1.  **Create a Deque.**

    To create a `deque`, use the deque keyword, and specify the type of values it should store within angle brackets `<>` and then the name of the deque, like: `deque<type> dequeName`.

        // Create a deque called cars that will store strings
        deque<string> cars;

    If you want to add elements at the time of declaration, place them in a comma-separated list, inside curly braces `{}`:

        // Create a deque called cars that will store strings
        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Print deque elements
        for (string car : cars) {
          cout << car << "\n";
        }

2.  **Access a Deque.**

    You can access a deque element by referring to the index number inside square brackets `[]`.

    Deques are 0-indexed, meaning that `[0]` is the first element, `[1]` is the second element, and so on:

        // Create a deque called cars that will store strings
        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Get the first element
        cout << cars[0];  // Outputs Volvo

        // Get the second element
        cout << cars[1];  // Outputs BMW

    You can also access the first or the last element of a deque with the `.front()` and `.back()` functions:

        // Create a deque called cars that will store strings
        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Get the first element
        cout << cars.front();

        // Get the last element
        cout << cars.back();

    To access an element at a specified index, you can use the `.at()` function and specify the index number:

        // Create a deque called cars that will store strings
        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Get the second element
        cout << cars.at(1);

        // Get the third element
        cout << cars.at(2);

    **Note:** The `.at()` function is often preferred over square brackets `[]` because it throws an error message if the element is out of range:

        // Create a deque called cars that will store strings
        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Try to access an element that does not exist (will throw an exception)
        cout << cars.at(6);

3.  **Change a Deque.**

    To change the value of a specific element, you can refer to the index number:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Change the value of the first element
        cars[0] = "Opel";

        cout << cars[0];  // Now outputs Opel instead of Volvo

    However, it is safer to use the `.at()` function:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Change the value of the first element
        cars.at(0) = "Opel";

        cout << cars.at(0);  // Now outputs Opel instead of Volvo

4.  **Add Deque Elements.**

    To add elements to a deque, you can use `.push_front()` to insert an element at the beginning of the deque and `.push_back()` to add an element at the end:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Add an element at the beginning
        cars.push_front("Tesla");

        // Add an element at the end
        cars.push_back("VW");

5.  **Remove Deque Elements.**

    To remove elements from a deque, use `.pop_front()` to remove an element from the beginning of the deque and `.pop_back()` to remove an element at the end:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Remove the first element
        cars.pop_front();

        // Remove the last element
        cars.pop_back();

6.  **Deque Size.**

    To find out how many elements a deque has, use the `.size()` function:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};
        cout << cars.size();  // Outputs 4

7.  **Check if a Deque is Empty.**

    Use the `.empty()` function to find out if a deque is empty or not.

    The `.empty()` function returns `1` (true) if the deque is empty and `0` (false) otherwise:

        deque<string> cars;
        cout << cars.empty();  // Outputs 1 (The deque is empty)

        or

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};
        cout << cars.empty();  // Outputs 0 (not empty)

8.  **Loop through a Deque.**

    You can loop through the deque elements by using a `for` loop combined with the `.size()` function:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        for (int i = 0; i < cars.size(); i++) {
          cout << cars[i] << "\n";
        }

    You can also use a **for-each loop** (introduced in C++ version 11, 2011), which is cleaner and more readable:

        deque<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        for (string car : cars) {
          cout << car << "\n";
        }

<hr />

## Comparison (Queue vs Deque).

| Feature            | Queue                                                           | Deque                                                                                           |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Definition         | A linear data structure that follows FIFO (First-in-First-Out). | A generalized version of queue that allows insertion and deletion from both ends.               |
| Operations Allowed | Enqueue (add to rear) & Dequeue (remove from front)             | Insert Front, Insert Rear, Delete Front, Delete Rear                                            |
| Access             | Restricted: insertion at rear and deletion at front only.       | More flexible: insertions and deletions at both front and rear.                                 |
| Use Case           | When you need strict FIFO ordering (e.g., task scheduling)      | When you need both FIFO and LIFO behavior (e.g., sliding window problems, palindrome checking). |
| Efficiency         | Simpler, but limited in functionality                           | Slightly more complex, but more powerful                                                        |
| Types              | Simple Queue, Circular Queue, Priority Queue                    | Input-Restricted Deque (insert rear only), Output-Restricted Deque (delete front only)          |

<hr />

## Assignment.

1.  Given a queue of integers, reverse the order of all its elements using a `std::stack`. No other data structure allowed.

        Input Queue  : 10 → 20 → 30 → 40 → 50 (front to back)
        Output Queue : 50 → 40 → 30 → 20 → 10 (front to back)

    [Solution](./Assignment/code1.cpp)

2.  Design a special stack that supports all regular stack operations plus a `getMin()` function that returns the minimum element in the stack in O(1) time.

    Operations to support:
    - `push(int val)`
    - `pop()`
    - `top()`
    - `getMin()` — returns current minimum, must be O(1)

          Test your program with:

          push(5) → getMin() = 5
          push(3) → getMin() = 3
          push(7) → getMin() = 3
          push(2) → getMin() = 2
          pop()   → getMin() = 3
          pop()   → getMin() = 3
          pop()   → getMin() = 5

    [Solution](./Assignment/code2.cpp)

3.  There are `n` petrol pumps arranged in a circle. Each pump has:
    - `petrol` : how much fuel it provides
    - `distance` : fuel needed to reach the next pump

    Find the starting pump index from which a truck can complete the full circle without running out of fuel. If no such starting point exists, return `-1`.

        Test your program with:

        Pumps (petrol, distance):
        { {4,6}, {6,5}, {7,3}, {4,5} }
        Answer: Starting index = 1

        Pumps (petrol, distance):
        { {2,3}, {3,4}, {1,2} }
        Answer: Starting index = -1

    [Solution](./Assignment/code3.cpp)
