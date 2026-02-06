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

// Function to detect cycle
bool hasCycle(Node *head)
{
    if (head == NULL)
        return false;

    Node *slow = head;
    Node *fast = head;

    while (fast != NULL && fast->next != NULL)
    {
        slow = slow->next;       // move 1 step
        fast = fast->next->next; // move 2 steps

        if (slow == fast)
        {
            return true; // cycle detected
        }
    }

    return false; // no cycle
}

int main()
{
    // Creating nodes
    Node *head = new Node(3);
    Node *second = new Node(2);
    Node *third = new Node(0);
    Node *fourth = new Node(-4);

    // Connecting nodes: 3 -> 2 -> 0 -> -4
    head->next = second;
    second->next = third;
    third->next = fourth;

    // Creating cycle: tail connects to node at index 1 (value 2)
    fourth->next = second;

    if (hasCycle(head))
        cout << "true" << endl;
    else
        cout << "false" << endl;

    return 0;
}
