#include <iostream>
using namespace std;

class Node
{
public:
    int data;
    Node *next;
    Node(int val) : data(val), next(nullptr) {}
};

class SinglyLinkedList
{
private:
    Node *head;

public:
    SinglyLinkedList() : head(nullptr) {}

    void insertAtTail(int val)
    {
        Node *newNode = new Node(val);
        if (!head)
        {
            head = newNode;
            return;
        }
        Node *current = head;
        while (current->next)
            current = current->next;
        current->next = newNode;
    }

    // Connects last node to node at given position (1-indexed)
    void createLoop(int pos)
    {
        Node *tail = head;
        while (tail->next)
            tail = tail->next;

        Node *loopNode = head;
        for (int i = 1; i < pos; i++)
            loopNode = loopNode->next;

        tail->next = loopNode;
        cout << "Loop created: last node -> node(" << loopNode->data << ")\n";
    }

    bool detectLoop()
    {
        Node *slow = head;
        Node *fast = head;
        while (fast && fast->next)
        {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast)
                return true; // meeting point found
        }
        return false;
    }

    void removeLoop()
    {
        Node *slow = head;
        Node *fast = head;

        // Step 1: Detect meeting point
        while (fast && fast->next)
        {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast)
                break;
        }

        // No loop found
        if (slow != fast)
            return;

        // Step 2: Find start of loop
        // Reset slow to head, keep fast at meeting point
        // Move both one step at a time — they meet at loop start
        slow = head;
        while (slow->next != fast->next)
        {
            slow = slow->next;
            fast = fast->next;
        }

        // Step 3: fast is now the last node of the loop — break it
        fast->next = nullptr;
    }

    void display()
    {
        Node *current = head;
        while (current)
        {
            cout << current->data << " -> ";
            current = current->next;
        }
        cout << "NULL\n";
    }

    ~SinglyLinkedList()
    {
        Node *current = head;
        while (current)
        {
            Node *next = current->next;
            delete current;
            current = next;
        }
    }
};

int main()
{
    SinglyLinkedList sll;

    sll.insertAtTail(1);
    sll.insertAtTail(2);
    sll.insertAtTail(3);
    sll.insertAtTail(4);
    sll.insertAtTail(5);

    sll.createLoop(2);

    cout << "Loop detected: " << (sll.detectLoop() ? "true" : "false") << "\n";

    sll.removeLoop();

    cout << "Loop detected: " << (sll.detectLoop() ? "true" : "false") << "\n";

    cout << "List after removal: ";
    sll.display();

    return 0;
}