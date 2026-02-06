#include <iostream>
using namespace std;

class Node
{
public:
    int data;
    Node *next;
    Node *prev;

    // Default constructor
    Node()
    {
        data = 0;
        next = NULL;
        prev = NULL;
    }

    // Parameterized constructor
    Node(int value, Node *n = NULL, Node *p = NULL)
    {
        data = value;
        next = n;
        prev = p;
    }
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

// Function to print list forward
void printForward(Node *head)
{
    Node *curr = head;
    while (curr != NULL)
    {
        cout << curr->data << " ";
        curr = curr->next;
    }
    cout << endl;
}

int main()
{
    Node *head = NULL;

    head = addNodeAtEnd(head, 10);
    head = addNodeAtEnd(head, 20);
    head = addNodeAtEnd(head, 30);

    cout << "Doubly Linked List (Forward): ";
    printForward(head);

    return 0;
}
