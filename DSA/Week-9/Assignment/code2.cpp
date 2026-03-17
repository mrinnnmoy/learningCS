#include <iostream>
using namespace std;

class Node
{
public:
    int data;
    Node *prev;
    Node *next;
    Node(int val) : data(val), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList
{
private:
    Node *head;
    Node *tail;

public:
    DoublyLinkedList() : head(nullptr), tail(nullptr) {}

    ~DoublyLinkedList()
    {
        Node *current = head;
        while (current)
        {
            Node *next = current->next;
            delete current;
            current = next;
        }
    }

    void insertAtHead(int val)
    {
        Node *newNode = new Node(val);
        if (!head)
        {
            head = tail = newNode;
            return;
        }
        newNode->next = head;
        head->prev = newNode;
        head = newNode;
    }

    void insertAtTail(int val)
    {
        Node *newNode = new Node(val);
        if (!tail)
        {
            head = tail = newNode;
            return;
        }
        tail->next = newNode;
        newNode->prev = tail;
        tail = newNode;
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
        if (head)
            head->prev = nullptr;
        else
            tail = nullptr;
        delete temp;
    }

    void deleteAtTail()
    {
        if (!tail)
        {
            cout << "List is empty\n";
            return;
        }
        Node *temp = tail;
        tail = tail->prev;
        if (tail)
            tail->next = nullptr;
        else
            head = nullptr;
        delete temp;
    }

    void displayForward()
    {
        Node *current = head;
        while (current)
        {
            cout << current->data << " <-> ";
            current = current->next;
        }
        cout << "NULL\n";
    }

    void displayBackward()
    {
        Node *current = tail;
        while (current)
        {
            cout << current->data << " <-> ";
            current = current->prev;
        }
        cout << "NULL\n";
    }

    int getMiddle()
    {
        Node *slow = head;
        Node *fast = head;
        while (fast && fast->next)
        {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow ? slow->data : -1;
    }
};

int main()
{
    DoublyLinkedList dll;

    dll.insertAtTail(10);
    dll.insertAtTail(20);
    dll.insertAtTail(30);
    dll.insertAtTail(40);
    dll.insertAtTail(50);

    cout << "Forward:  ";
    dll.displayForward();
    cout << "Backward: ";
    dll.displayBackward();
    cout << "Middle: " << dll.getMiddle() << "\n";

    dll.deleteAtHead();
    cout << "After deleteAtHead: ";
    dll.displayForward();

    dll.deleteAtTail();
    cout << "After deleteAtTail: ";
    dll.displayForward();

    return 0;
}