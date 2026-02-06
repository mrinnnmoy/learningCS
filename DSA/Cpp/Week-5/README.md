# List of things learned.

## **Introduction to Linked Lists.**

Linked List is another linear data structure.

It is similar to arrays but the major difference is, in a linked list, the elements are not next to each other in memory like that in array.

In array, the elements occupy a continous block of memory, whereas in linked list, the elements do not occupy consecutive blocks.

As a result, we cannot use indices in linked list.

Each element (we call it a node of a linked list) holds the address (or reference) to the next node.

![linkedList-img](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSohnX0uFxyLouJXpTvdirTgcl9Msl1JYPb_XV4ZbcDQ&s)

Each element (or node) in a linked list holds at least 2 values:

1. The data to be stored
2. Pointer to the next node

Two important nodes of a linked list are:

1. **Head**: The head is a pointer to the first node of a linked list. We begin our iteration from this node.

   Generally in every linked list, head node will be given.

2. **Tail**: The tail is a pointer to the last node of a linked list.

   This is optional.

<hr />

## **Creating a Linked List.**

First let's define a class that describes a Node. Let's say each element holds an integer value.

    class Node
    {
        public:
            int data;
            Node \*next;

        // Default constructor
        Node()
        {
            data = 0;
            next = NULL;
        }

        // Parameterized constructor
        Node(int v)
        {
            data = v;
            next = NULL;
        }
    };

Now let's write a method that adds a node at the end of the linked list.

    Node *addAtEnd(Node *head, int value)
    {
        // Create new node dynamically
        Node *newElement = new Node(value);

        if (head == NULL)
        {
            // If list is empty
            return newElement;
        }

        Node *curr = head;

        // Traverse till last node
        while (curr->next != NULL)
        {
            curr = curr->next;
        }

        curr->next = newElement;

        return head;
    }

Here's a better optimized [Code](./practise/code1.cpp).

<hr />

## **Iterating in a Linked List.**

To iterate in a linked list, we can start at the head node and go as long as we don’t reach the last node.

The last node is identified using `node.next == NULL`.

    Node *curr = head;
    while (curr->next != NULL) {
    // Do something with curr node
    curr = curr->next;
    }

Here's a better optimized [Code](./practise/code2.cpp).

<hr />

## **Operations on a Linked List.**

- **Add a node at beginning.**

        Node* addNodeAtBeginning(Node *head, int newData) {

        // As we are entering in beginning, the current head becomes the
        // next node of new node. Even works when head = NULL

        Node *node = new Node(newData, head);
        head = node;
        return head;
        }

- **Remove node from beginning.**

        int removeNodeAtBeginning(Node *head) {

        // Assuming it is a valid operation, i.e. there is atleast a single node

        Node *curr = head;
        head = head->next;
        int data = curr->data;
        delete curr;
        return data;
        }

- **Remove node from end.**

        int removeNodeAtEnd(Node *head) {
            Node *curr = head;
            Node *prev = NULL;

            if (head->next == NULL) {
            // Single node
            head = NULL;
            }

            while(curr->next != NULL) {
            prev = curr;
                curr = curr->next;
            }

            if (prev != NULL) {
            prev->next = NULL;
            }
            int data = curr->data;
            delete curr;
            return data;
        }

- **Removing a random node.**

  Assume, every node has a distinct data value. We want to delete the node that has a value of K.

  Whenever we are deleting a node, make sure to adjust the next pointer of the previous node correctly. Let’s consider all 3 cases:
  - **K is the first node**: In this case, the node with K is not linked to next of any node. This becomes same as removing node from beginning.

  - **K is somewhere in middle**: In this case, K is the next of some node and also the node with K has a next node. As K is getting deleted, the previous node’s next value should point to the next of K i.e `prev->next = node->next`.

  - **K is at end**: In this case, K is the next of some node, but K has no next node. However, the above statement (2) still holds true, as prev→next = node→next = NULL. Also, if there is a tail pointer, we should adjust it

          void deleteNode(Node *head, int K) {
          if (head->data == K) {
              Node *curr = head;
              head = head->next;
              delete curr;
              return;
          }

          Node *curr = head;
          Node *prev;

          while(curr != NULL && curr->data != K) {
              prev = curr;
              curr = curr->next;
          }

          if (curr == NULL) return;

          prev->next = curr->next;
          delete curr;
          }

<hr />

## **Doubly Linked List.**

In a normal linked list, each node stores the data and a pointer to the next node. In DLLs, each node stores an additional value which is a pointer to the previous node as well.

So, in a DLL you can easily travel in both directions i.e right to left and left to right.

![DLL-img](https://www.notion.so/image/https%3A%2F%2Fmedia.geeksforgeeks.org%2Fwp-content%2Fcdn-uploads%2Fgq%2F2014%2F03%2FDLL1.png?table=block&id=595ec2bd-e9ad-4093-80f8-3ae709d7de77&cache=v2)

Most of the things are similar to single linked list, except we can now travel in both directions.

Also, in all the operations, we have to handle the previous node pointer as well. Let’s look into some operations.

- **Add a node at end.**

        class Node
        {
        public:
            int data;
            Node *next;
            Node *prev;

            // Constructor here
        };

        // Function to add node at end
        Node *addNodeAtEnd(Node *head, int x)
        {

            // If list is empty
            if (head == NULL)
            {
                head = new Node(x);
                return head;
            }

            Node *curr = head;

            // Traverse to last node
            while (curr->next != NULL)
            {
                curr = curr->next;
            }

            // Create new node
            Node *newNode = new Node(x, NULL, curr);

            // Link last node to new node
            curr->next = newNode;

            return head;
        }

Here's a better optimized [code](./practise/code3.cpp).

- **Remove a node.**

        Node* removeNode(Node* head, int K) {

            if (head == NULL)
                return NULL;

            Node* curr = head;

            // If head needs to be deleted
            if (curr->data == K) {
                head = curr->next;

                if (head != NULL)
                    head->prev = NULL;

                delete curr;
                return head;
            }

            // Search for the node with value K
            while (curr != NULL && curr->data != K) {
                curr = curr->next;
            }

            // If node found
            if (curr != NULL) {

                // If not last node
                if (curr->next != NULL)
                    curr->next->prev = curr->prev;

                // If not first node
                if (curr->prev != NULL)
                    curr->prev->next = curr->next;

                delete curr;
            }

            return head;
        }

Here's a better optimized [code](./practise/code4.cpp).

<hr />

## **Assignments.**

1. **Reversing a Linked List.**

   Given the head of a singly linked list, reverse the list and return the reversed list.

   **Example**:

   ![problem1-img](https://assets.leetcode.com/uploads/2021/02/19/rev1ex1.jpg)
   - Input: head = [1,2,3,4,5]
   - Output: [5,4,3,2,1]

   [Solution](./Assignment/code1.cpp)

<hr />

2. **Detect cycle in a Linked List.**

   Given `head`, the head of a linked list, determine if the linked list has a cycle in it.

   There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer.

   Internally, `pos` is used to denote the index of the node that tail's `next` pointer is connected to. Note that `pos` is not passed as a parameter.

   Return `true` if there is a cycle in the linked list. Otherwise, return `false`.

   **Example**:

   ![problem2-img](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist.png)
   - Input: head = [3,2,0,-4], pos = 1
   - Output: true
   - Explanation: There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).

   [Solution](./Assignment/code2.cpp)

<hr />

3. **Add 2 numbers.**

   You are given two non-empty linked lists representing two non-negative integers.

   The most significant digit comes first and each of their nodes contains a single digit.

   Add the two numbers and return the sum as a linked list.

   You may assume the two numbers do not contain any leading zero, except the number 0 itself.

   **Example**:

   ![problem3-img](https://assets.leetcode.com/uploads/2021/04/09/sumii-linked-list.jpg)
   - Input: L1 = [7,2,4,3], L2 = [5,6,4]
   - Output: [7,8,0,7]

   [Solution](./Assignment/code3.cpp)

<hr />
