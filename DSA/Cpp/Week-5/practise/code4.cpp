#include <iostream>
using namespace std;

class Node
{
public:
    int data;
    Node *next;
    Node *prev;

    Node(int value)
    {
        data = value;
        next = NULL;
        prev = NULL;
    }
};

// Add node at end (helper function)
Node *addAtEnd(Node *head, int value)
{
    Node *newNode = new Node(value);

    if (head == NULL)
        return newNode;

    Node *curr = head;
    while (curr->next != NULL)
        curr = curr->next;

    curr->next = newNode;
    newNode->prev = curr;

    return head;
}

// Remove node with value K
Node *removeNode(Node *head, int K)
{

    if (head == NULL)
        return NULL;

    Node *curr = head;

    // If head needs to be deleted
    if (curr->data == K)
    {
        head = curr->next;

        if (head != NULL)
            head->prev = NULL;

        delete curr;
        return head;
    }

    // Search for node
    while (curr != NULL && curr->data != K)
    {
        curr = curr->next;
    }

    // If node found
    if (curr != NULL)
    {

        // If it's not the last node
        if (curr->next != NULL)
            curr->next->prev = curr->prev;

        // Link previous node to next
        if (curr->prev != NULL)
            curr->prev->next = curr->next;

        delete curr;
    }

    return head;
}

// Print list forward
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
    Node *head = NULL;

    head = addAtEnd(head, 10);
    head = addAtEnd(head, 20);
    head = addAtEnd(head, 30);
    head = addAtEnd(head, 40);

    cout << "Original List: ";
    printList(head);

    head = removeNode(head, 30);

    cout << "After Removing 30: ";
    printList(head);

    return 0;
}
