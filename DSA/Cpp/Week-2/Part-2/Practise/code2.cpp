// Accessing characters.

#include<iostream>

using namespace std;

int main(){

    string s = "Hello";

    // Using for loop
    // for(int i = 0; i < s.length(); i++){
    //     cout<<s[i]<<endl;
    // }

    // Using for each loop
    for(char x:s){
        cout<<x<<endl;
    }

    return 0;
}