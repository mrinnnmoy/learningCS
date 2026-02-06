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

int main()
{
    // Manually creating linked list: 10 -> 20 -> 30 -> NULL
    Node *head = new Node(10);
    head->next = new Node(20);
    head->next->next = new Node(30);

    Node *curr = head;

    cout << "Iterating through linked list: " << endl;

    // Iterate untill last node
    while (curr->next != NULL)
    {
        cout << curr->data << " -> ";
        curr = curr->next;
    }

    // Printing the last node seperately
    cout << curr->data << " -> NULL" << endl;

    return 0;
}