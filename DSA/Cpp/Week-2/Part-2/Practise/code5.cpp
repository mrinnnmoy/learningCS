// Memory Allocation / Pointers.

#include<iostream>

using namespace std;

int main(){

    int x = 10;
    
    int *ptr = &x; //ptr stores address of x
    int *ptr1 = ptr; //ptr1 stores same address of prt

    cout << "Value of x: " << x << endl;
    cout << "Address of x: " << &x << endl;

    cout << "Value of x using pointer: " << *ptr << endl;
    cout << "Address stored in ptr: " << ptr << endl;

    return 0;
}