#include <iostream>
using namespace std;

// Pass by Value
void swapValue(int a, int b)
{
    int temp = a;
    a = b;
    b = temp;
}

// Pass by Reference
void swapReference(int &a, int &b)
{
    int temp = a;
    a = b;
    b = temp;
}

// Pass by Address (Pointer)
void swapAddress(int *a, int *b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main()
{
    int x, y;
    cout << "Enter two numbers: ";
    cin >> x >> y;

    cout << "\nOriginal: " << x << " " << y << endl;

    swapValue(x, y);
    cout << "After Pass by Value: " << x << " " << y << endl;

    swapReference(x, y);
    cout << "After Pass by Reference: " << x << " " << y << endl;

    swapAddress(&x, &y);
    cout << "After Pass by Address: " << x << " " << y << endl;

    return 0;
}
