# List of things learned.

## Introduction.

A Linked List is, as the word implies, a list where the nodes are linked together.

Each node contains data and a pointer.

![img](https://www.w3schools.com/dsa/img_linkedlists_singly.svg)

The way they are linked together is that each node points to where in the memory the next node is placed.

### Array vs Linked List. (memory layout, pros & cons)

The easiest way to understand linked lists is perhaps by comparing linked lists with arrays.

Linked lists consist of nodes and is a linear data structure we make ourselves, unlike arrays which is an existing data structure in the programming language that we can use.

Nodes in a linked list store links to other nodes, but array elements do not need to store links to other elements.

The table below compares linked lists with arrays to give a better understanding of what linked lists are.

|                                                                                                           | Arrays | Linked List |
| --------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| An existing data structure in the programming language                                                    | Yes    | No          |
| Fixed size in memory                                                                                      | Yes    | No          |
| Elements, or nodes, are stored right after each other in memory (contiguously)                            | Yes    | No          |
| Memory usage is low (each node only contains data, no links to other nodes)                               | Yes    | No          |
| Elements, or nodes, can be accessed directly (random access)                                              | Yes    | No          |
| Elements, or nodes, can be inserted or deleted in constant time, no shifting operations in memory needed. | No     | Yes         |

### Types of Linked List.

Based on the structure of linked lists, they can be classified into several types:

1. Singly Linked List
2. Doubly Linked List
3. Circular Linked List

<hr />

## Applications of Linked Lists.

Following are some common applications of the linked list data structure:

- In **dynamic memory allocation** linked lists are used to keep track of free and allocated memory blocks.
- Linked lists are used in text editors to implement undo and redo operations.
- Linked lists are used to implement **adjacency lists** for the **graph data structures**.
- Linked lists are also used to implement fundamental data structures like **stack** and **queue**.

<hr />

## Node Structure.

### Defining a `Node` using `struct` in C++

In C++, a Node is typically defined using a `struct` to create self-referential data structures like linked lists or trees.

A `struct` allows grouping different data types under a single name, including a pointer to another struct of its own type.

The most common definition includes a data field and a pointer to the next node in the sequence.

    struct Node {
        int data;         // The value stored in the node
        Node* next;       // A pointer to the next node in the sequence
    };

### Creating & Using Nodes.

Once the `struct` is defined, you can create nodes dynamically using the `new` operator and access their members using the dot (`.`) operator for non-pointer variables or the arrow (`->`) operator for pointers.

    #include <iostream>

    int main() {
        // Create the first node dynamically and a pointer to it
        Node* head = new Node;
        head->data = 10;
        head->next = nullptr; // Mark as the last node

        // Create a second node
        Node* second = new Node;
        second->data = 20;
        second->next = nullptr;

        // Link the first node to the second
        head->next = second;

        // Access and print data from the nodes
        std::cout << "First node data: " << head->data << std::endl;
        std::cout << "Second node data: " << head->next->data << std::endl; // Access data via the next pointer

        // In a complete program, you would need to deallocate memory using 'delete'
        delete head;
        delete second;

        return 0;
    }

### For Doubly: `prev` pointer

Here is the C++ code for defining a `Node` using a `struct`:

    struct Node {
        int data;         // The data stored in the node (can be any type)
        Node* prev;       // Pointer to the previous node in the list
        Node* next;       // Pointer to the next node in the list
    };

Each node in a doubly linked list requires this structure to allow for bidirectional traversal (forward and backward).

And for cleaner code and easier initialization, a constructor can be included within the struct or a class definition:

    class Node {
    public:
        int data;
        Node* prev;
        Node* next;

        // Constructor to initialize a new node
        Node(int val) {
            data = val;
            prev = nullptr; // The previous pointer of a new, standalone node is NULL
            next = nullptr; // The next pointer of a new, standalone node is NULL
        }
    };

When creating a new list, the `prev` pointer of the first node (head) should be set to `NULL` (or `nullptr` in C++) as there is no node before it. Similarly, the `next` pointer of the last node should be NULL.

<hr />

## Singly Linked List.

The singly linked list is the simplest form of linked list in which the node contains two members data and a next pointer that stores the address of the next node.

Each node is a singly linked list is connected through the next pointer and the next pointer of the last node points to NULL denoting the end of the linked list.

The following diagram describes the structure of a singly linked list:

![img](https://www.w3schools.com/dsa/img_linkedlists_singly_wvalues.svg)

Singly linked list can be represented as a pointer to the first node, where each node contains:

- Data: Actual information is stored.
- Next: Pointer to the next node.

        // Structure to represent the
        // singly linked list
        struct Node {

        // Data field - can be of
        // any type and count
        int data;

        // Pointer to the next node
        struct Node* next;
        }

Here's an example that demonstrates the core components & operations (append, display) within a `LinkedList` class.

    #include <iostream>

    // Define a Node structure/class, the building block of the list
    class Node {
    public:
        int data;     // The data stored in the node
        Node* next;   // Pointer to the next node in the sequence

        // Constructor to easily create a new node
        Node(int val) : data(val), next(nullptr) {}
    };

    // Define the SinglyLinkedList class to manage the nodes
    class SinglyLinkedList {
    private:
        Node* head; // Pointer to the first node in the list

    public:
        // Constructor to initialize an empty list
        SinglyLinkedList() : head(nullptr) {}

        // Destructor to free dynamically allocated memory and prevent leaks
        ~SinglyLinkedList() {
            Node* current = head;
            while (current != nullptr) {
                Node* nextNode = current->next;
                delete current;
                current = nextNode;
            }
        }

        // Method to insert a new node at the end of the list
        void append(int val) {
            Node* newNode = new Node(val);
            if (head == nullptr) {
                head = newNode; // If list is empty, new node becomes the head
                return;
            }
            Node* current = head;
            while (current->next != nullptr) { // Traverse to the last node
                current = current->next;
            }
            current->next = newNode; // Link the last node to the new node
        }

        // Method to insert a new node at the beginning of the list
        void insertAtHead(int val) {
            Node* newNode = new Node(val);
            newNode->next = head; // New node points to the current head
            head = newNode;        // Head pointer is updated to the new node
        }

        // Method to display the list elements
        void display() {
            Node* current = head;
            while (current != nullptr) {
                std::cout << current->data << " -> ";
                current = current->next;
            }
            std::cout << "NULL" << std::endl;
        }
    };

    // Main function to test the linked list
    int main() {
        SinglyLinkedList sll;

        // Append nodes to the list
        sll.append(10);
        sll.append(20);
        sll.append(30);

        // Insert a node at the beginning
        sll.insertAtHead(5);

        // Display the final list
        std::cout << "Singly Linked List: ";
        sll.display(); // Output: 5 -> 10 -> 20 -> 30 -> NULL

        return 0;
    }

<hr />

## Doubly Linked List.

The doubly linked list is the modified version of the singly linked list where each node of the doubly linked consists of three data members data, next and prev.

The prev is a pointer that stores the address of the previous node in the linked list sequence.

Each node in a doubly linked list except the first and the last node is connected with each other through the prev and next pointer.

The prev pointer of the first node and the next pointer of the last node points to NULL in the doubly linked list.

The following diagram describes the structure of a doubly linked list:

![img](https://www.w3schools.com/dsa/img_linkedlists_doubly_wvalues.svg)

Doubly linked list can be represented as pointer to the first node where each node contains:

- Data: Actual information is stored.
- Next: Pointer stores the address of next node.
- prev: Pointer stores the address of previous node.

        // Structure to represent the doubly linked list
        struct Node {

        // Data field - can be of any type and count
        int data;

        // Pointer to the next node
        struct Node* next;

        // Pointer to the previous node
        struct Node* prev;
        }

Here is a simple manual implementation of a doubly linked list with basic operations like insertion at the end and forward traversal:

    #include <iostream>
    using namespace std;

    // Define the Node
    class Node {
    public:
        int data;
        Node* next;
        Node* prev;
        Node(int val) : data(val), next(nullptr), prev(nullptr) {}
    };

    // Simple list structure
    class DoublyLinkedList {
        Node *head, *tail;
    public:
        DoublyLinkedList() : head(nullptr), tail(nullptr) {}

        void insertEnd(int val) {
            Node* newNode = new Node(val);
            if (!head) { head = tail = newNode; return; }
            tail->next = newNode;
            newNode->prev = tail;
            tail = newNode;
        }
    };

<hr />

## Circular Linked List. (Concept level)

The circular linked list is almost same as the singly linked list but with a small change.

In a circular linked list the next pointer of the last node points to the first node of the linked list rather than pointing to NULL, this makes this data structure circular in nature which is used in various applications like media players.

The following diagram describes the structure of a circular linked list:

![img](https://www.w3schools.com/dsa/img_linkedlists_circsingly_wvalues.svg)

Circular linked list can be represented as pointer to the first node where each node contains:

- Data: Actual information is stored.
- Next: Pointer to the next node and last node Next is pointed to the first node of the linked list.

        // Structure to represent the circular linked list
        struct Node {

        // Data field - can be of any type and count
        int data;

        // Pointer to the next node
        struct Node* next;
        }

The following C++ code demonstrates a basic singly circular linked list implementation with functions for insertion at the end and display.

    #include <iostream>
    using namespace std;

    // Define the Node structure
    class Node {
    public:
        int data;
        Node* next;

        // Constructor to initialize a new node
        Node(int val) : data(val), next(nullptr) {}
    };

    class CircularLinkedList {
    public:
        Node* head;

        CircularLinkedList() : head(nullptr) {}

        // Function to insert a new node at the end of the list
        void insertEnd(int data) {
            Node* newNode = new Node(data);

            // If the list is empty, make the new node the head and point to itself
            if (!head) {
                head = newNode;
                newNode->next = head;
                return;
            }

            // Traverse to the last node
            Node* current = head;
            while (current->next != head) {
                current = current->next;
            }

            // Link the new node
            current->next = newNode;
            newNode->next = head; // The new last node points back to the head
        }

        // Function to display the list
        void display() {
            if (!head) {
                cout << "List is empty" << endl;
                return;
            }

            Node* current = head;
            do {
                cout << current->data << " -> ";
                current = current->next;
            } while (current != head); // Stop when we return to the head
            cout << "(Head)" << endl;
        }

        // Destructor to free memory (optional but good practice for C++)
        ~CircularLinkedList() {
            if (!head) return;

            Node* current = head;
            Node* nextNode;
            while (current->next != head) {
                nextNode = current->next;
                delete current;
                current = nextNode;
            }
            delete current; // Delete the last node
        }
    };

    // Main function to demonstrate the circular linked list
    int main() {
        CircularLinkedList cll;

        cll.insertEnd(10);
        cll.insertEnd(20);
        cll.insertEnd(30);
        cll.insertEnd(40);

        cout << "Circular Linked List: ";
        cll.display();

        return 0;
    }

<hr />

## Advantages of Linked List.

Advantages of linked list are mentioned below:

- Inserting and deleting node is efficient because no need to shifting like in array.
- Linked lists have dynamic size, which allows them to grow or shrink during runtime.
- Memory is utilized more efficiently as linked lists do not require a pre-allocated size, reducing wasted space.
- Efficient for those operations where we need large or frequently changing datasets.
- Linked list used non-contiguous memory blocks, so it is useful for those application where memory is needed.

<hr />

## Disadvantages of Linked List.

Following points shows the disadvantages of linked list:

- Direct access to element is not possible in a linked list; it requires traversing from the start to reach a specific position.
- Each node requires extra memory for storing a pointer.
- Linked lists are more complex to implement and manage.
- Pointers can lead to bugs, memory leaks, or segmentation fault.

<hr />

## Assignment.

1.  Build a `SinglyLinkedList` class that supports the following operations:
    - `insertAtHead(int val)` — Insert at the beginning
    - `insertAtTail(int val)` — Insert at the end
    - `insertAtPosition(int pos, int val)` — Insert at a given position (1-indexed)
    - `deleteAtHead()` — Delete the first node
    - `deleteAtTail()` — Delete the last node
    - `search(int val)` — Return the position of the value, or -1 if not found
    - `getLength()` — Return the number of nodes
    - `display()` — Print the list as: `1 -> 2 -> 3 -> NULL`

            // Test your program with this sequence:
            Insert at tail: 10, 20, 30, 40
            Insert at head: 5
            Insert at position 3: 15
            Display → 5 -> 10 -> 15 -> 20 -> 30 -> 40 -> NULL
            Delete at head → Display
            Delete at tail → Display
            Search for 20 → Print position

    [Solution](./Assignment/code1.cpp)

2.  Build a `DoublyLinkedList` class that supports:
    - `insertAtHead(int val)`
    - `insertAtTail(int val)`
    - `deleteAtHead()`
    - `deleteAtTail()`
    - `displayForward()` — Print: `1 <-> 2 <-> 3 <-> NULL`
    - `displayBackward()` — Print from tail to head using the `prev` pointer
    - `getMiddle()` — Return the middle node's value using the slow & fast pointer technique

            // Test your program with this sequence:
            Insert at tail: 10, 20, 30, 40, 50
            displayForward  → 10 <-> 20 <-> 30 <-> 40 <-> 50 <-> NULL
            displayBackward → 50 <-> 40 <-> 30 <-> 20 <-> 10 <-> NULL
            getMiddle()     → 30
            deleteAtHead()  → displayForward
            deleteAtTail()  → displayForward

    [Solution](./Assignment/code2.cpp)

3.  You are given a singly linked list that may contain a loop (a node's `next` points back to a previous node). Implement the following:
    - `createLoop(int pos)` — Manually connect the last node's `next` to the node at position `pos` (1-indexed) to simulate a loop
    - `detectLoop()` — Return `true` if a loop exists using Floyd's Cycle Detection Algorithm (slow & fast pointer)
    - `removeLoop()` — If a loop exists, detect it and remove it cleanly (set the correct node's `next` to `nullptr`)
    - `display()` — Display the list after loop removal (should terminate at NULL)

            // Test your program with this sequence:
            Insert: 1, 2, 3, 4, 5
            createLoop(pos = 2)   → last node now points to node with value 2
            detectLoop()          → true
            removeLoop()
            detectLoop()          → false (loop removed)
            display()             → 1 -> 2 -> 3 -> 4 -> 5 -> NULL

    [Solution](./Assignment/code3.cpp)
