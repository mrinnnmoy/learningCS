#include <iostream>
using namespace std;

class Node
{
public:
    int data;
    Node *next;

    Node(int value)
    {
        data = value;
        next = NULL;
    }
};

// Function to reverse the linked list
Node *reverseList(Node *head)
{
    Node *prev = NULL;
    Node *curr = head;
    Node *next = NULL;

    while (curr != NULL)
    {

        // Store next node
        next = curr->next;

        // Reverse current node's pointer
        curr->next = prev;

        // Move prev forward
        prev = curr;

        // Move curr forward
        curr = next;
    }

    return prev; // New head
}

// Function to print list
void printList(Node *head)
{
    while (head != NULL)
    {
        cout << head->data << " ";
        head = head->next;
    }
    cout << endl;
}

int main()
{
    // Creating list: 1->2->3->4->5
    Node *head = new Node(1);
    head->next = new Node(2);
    head->next->next = new Node(3);
    head->next->next->next = new Node(4);
    head->next->next->next->next = new Node(5);

    cout << "Original List: ";
    printList(head);

    head = reverseList(head);

    cout << "Reversed List: ";
    printList(head);

    return 0;
}