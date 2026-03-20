#include <iostream>
#include <stack>
using namespace std;

class MinStack
{
private:
    stack<int> mainStack; // Stores all elements
    stack<int> minStack;  // Stores minimums in sync

public:
    void push(int val)
    {
        mainStack.push(val);

        // Push to minStack if it's empty OR val is <= current min
        if (minStack.empty() || val <= minStack.top())
            minStack.push(val);
    }

    void pop()
    {
        if (mainStack.empty())
        {
            cout << "Stack is empty!\n";
            return;
        }

        // If popped element is the current min, remove from minStack too
        if (mainStack.top() == minStack.top())
            minStack.pop();

        mainStack.pop();
    }

    int top()
    {
        if (mainStack.empty())
        {
            cout << "Stack is empty!\n";
            return -1;
        }
        return mainStack.top();
    }

    int getMin()
    {
        if (minStack.empty())
        {
            cout << "Stack is empty!\n";
            return -1;
        }
        return minStack.top();
    }
};

int main()
{
    MinStack ms;

    ms.push(5);
    cout << "push(5) → getMin() = " << ms.getMin() << "\n";

    ms.push(3);
    cout << "push(3) → getMin() = " << ms.getMin() << "\n";

    ms.push(7);
    cout << "push(7) → getMin() = " << ms.getMin() << "\n";

    ms.push(2);
    cout << "push(2) → getMin() = " << ms.getMin() << "\n";

    ms.pop();
    cout << "pop()   → getMin() = " << ms.getMin() << "\n";

    ms.pop();
    cout << "pop()   → getMin() = " << ms.getMin() << "\n";

    ms.pop();
    cout << "pop()   → getMin() = " << ms.getMin() << "\n";

    return 0;
}