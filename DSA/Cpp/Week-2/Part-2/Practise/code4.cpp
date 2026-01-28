// Different String methods.

#include<iostream>

using namespace std;

int main(){

    string s = "Hello World";

    // Check length.
    cout<<s.length()<<endl; //11

    // Concatenation
    string a = "Hello", b = "World";
    cout<<a + b<<endl; //HelloWorld

    // Equality
    string c = "Test", d = "Test";
    cout<<c.compare(d)<<endl; // 0
    
    bool result = a == b;
    cout<<result<<endl; // 0

    // Substring extraction
    cout<<s.substr(1,4)<<endl; // ello

    // Replacing substring
    cout<<s.replace(0,3, "Hi")<<endl; // Hilo World

    // Inserting substring
    cout<<s.insert(5, "new")<<endl; // Hilo newWorlde

    // Erase
    cout<<s.erase(2,3)<<endl; // HinewWorld

    return 0;
}