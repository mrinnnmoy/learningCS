#include <iostream>
using namespace std;

class Node
{
public:
    int data;
    Node *next;

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

// Function to add note at end
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

// Function to print list
void printList(Node *head)
{
    Node *curr = head;
    while (curr != NULL)
    {
        cout << curr->data << " -> ";
        curr = curr->next;
    }
    cout << "NULL" << endl;
}

int main()
{
    Node *head = NULL;

    head = addAtEnd(head, 10);
    head = addAtEnd(head, 20);
    head = addAtEnd(head, 30);

    printList(head);

    return 0;
}