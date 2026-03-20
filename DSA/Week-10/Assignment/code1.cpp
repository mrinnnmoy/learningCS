#include <iostream>
#include <queue>
#include <stack>
using namespace std;

void reverseQueue(queue<int> &q)
{
    stack<int> st;

    // Step 1: Push all queue elements into stack
    while (!q.empty())
    {
        st.push(q.front());
        q.pop();
    }

    // Step 2: Pop from stack back into queue
    while (!st.empty())
    {
        q.push(st.top());
        st.pop();
    }
}

void display(queue<int> q)
{
    while (!q.empty())
    {
        cout << q.front();
        q.pop();
        if (!q.empty())
            cout << " → ";
    }
    cout << "\n";
}

int main()
{
    queue<int> q;
    q.push(10);
    q.push(20);
    q.push(30);
    q.push(40);
    q.push(50);

    cout << "Input Queue  : ";
    display(q);
    reverseQueue(q);
    cout << "Output Queue : ";
    display(q);

    return 0;
}