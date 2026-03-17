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

    ~SinglyLinkedList()
    {
        Node *current = head;
        while (current != nullptr)
        {
            Node *next = current->next;
            delete current;
            current = next;
        }
    }

    void insertAtHead(int val)
    {
        Node *newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }

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

    void insertAtPosition(int pos, int val)
    {
        if (pos == 1)
        {
            insertAtHead(val);
            return;
        }
        Node *newNode = new Node(val);
        Node *current = head;
        for (int i = 1; i < pos - 1 && current; i++)
            current = current->next;
        if (!current)
        {
            cout << "Position out of range\n";
            return;
        }
        newNode->next = current->next;
        current->next = newNode;
    }

    void deleteAtHead()
    {
        if (!head)
        {
            cout << "List is empty\n";
            return;
        }
        Node *temp = head;
        head = head->next;
        delete temp;
    }

    void deleteAtTail()
    {
        if (!head)
        {
            cout << "List is empty\n";
            return;
        }
        if (!head->next)
        {
            delete head;
            head = nullptr;
            return;
        }
        Node *current = head;
        while (current->next->next)
            current = current->next;
        delete current->next;
        current->next = nullptr;
    }

    int search(int val)
    {
        Node *current = head;
        int pos = 1;
        while (current)
        {
            if (current->data == val)
                return pos;
            current = current->next;
            pos++;
        }
        return -1;
    }

    int getLength()
    {
        int count = 0;
        Node *current = head;
        while (current)
        {
            count++;
            current = current->next;
        }
        return count;
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
};

int main()
{
    SinglyLinkedList sll;

    sll.insertAtTail(10);
    sll.insertAtTail(20);
    sll.insertAtTail(30);
    sll.insertAtTail(40);
    sll.insertAtHead(5);
    sll.insertAtPosition(3, 15);

    cout << "After insertions: ";
    sll.display();

    sll.deleteAtHead();
    cout << "After deleteAtHead: ";
    sll.display();

    sll.deleteAtTail();
    cout << "After deleteAtTail: ";
    sll.display();

    int pos = sll.search(20);
    cout << "Search 20: position " << pos << "\n";

    return 0;
}