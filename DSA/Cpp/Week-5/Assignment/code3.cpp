#include <iostream>
#include <stack>
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

// Function to add two numbers
Node *addTwoNumbers(Node *l1, Node *l2)
{
    stack<int> s1, s2;

    // Push digits of first list
    while (l1 != NULL)
    {
        s1.push(l1->data);
        l1 = l1->next;
    }

    // Push digits of second list
    while (l2 != NULL)
    {
        s2.push(l2->data);
        l2 = l2->next;
    }

    int carry = 0;
    Node *result = NULL;

    // Process stacks
    while (!s1.empty() || !s2.empty() || carry)
    {
        int sum = carry;

        if (!s1.empty())
        {
            sum += s1.top();
            s1.pop();
        }

        if (!s2.empty())
        {
            sum += s2.top();
            s2.pop();
        }

        carry = sum / 10;

        // Create new node and insert at front
        Node *newNode = new Node(sum % 10);
        newNode->next = result;
        result = newNode;
    }

    return result;
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
    // L1 = [7,2,4,3]
    Node *l1 = new Node(7);
    l1->next = new Node(2);
    l1->next->next = new Node(4);
    l1->next->next->next = new Node(3);

    // L2 = [5,6,4]
    Node *l2 = new Node(5);
    l2->next = new Node(6);
    l2->next->next = new Node(4);

    Node *result = addTwoNumbers(l1, l2);

    cout << "Result: ";
    printList(result);

    return 0;
}
