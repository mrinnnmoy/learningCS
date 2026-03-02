# List of things learned.

## Introduction to Strings.

Strings are used to store and manipulate text (sequence of characters).

In C++, strings are objects of the `std::string` class from the `<string>` library.

    #include <iostream>
    #include <string>
    using namespace std;

    int main() {
        string greeting = "Hello World";
        cout << greeting;
    }

- Why `std::string`?
  1.  Automatically manages memeory
  2.  Can grow and shrink dynamically
  3.  Provides many built-in functions
  4.  Easier and safer than C-style character arrays

<hr />

## `std::string` vs C-Style Strings.

### C++ String (`std::string`)

    string s = "Hello";

- Dynamic size
- Built-int functions available
- Safe and easy to use

### C-Style String (`char[]`)

    char s[] = "Hello";

- Fixed size
- Must manage memory manually
- Uses `<cstring>` functions

<hr />

## String Input Method.

It is possible to use the extraction operator `>>` on `cin` to store a string entered by a user:

    string firstName;
    cout << "Type your first name: ";
    cin >> firstName; // get user input from the keyboard
    cout << "Your name is: " << firstName;

    // Type your first name: John
    // Your name is: John

However, `cin` considers a space (whitespace, tabs, etc) as a terminating character, which means that it can only store a single word (even if you type many words):

    string fullName;
    cout << "Type your full name: ";
    cin >> fullName;
    cout << "Your name is: " << fullName;

    // Type your full name: John Doe
    // Your name is: John

From the example above, you would expect the program to print "John Doe", but it only prints "John".

That's why, when working with strings, we often use the `getline()` function to read a line of text. It takes `cin` as the first parameter, and the string variable as second:

    string fullName;
    cout << "Type your full name: ";
    getline (cin, fullName);
    cout << "Your name is: " << fullName;

    // Type your full name: John Doe
    // Your name is: John Doe

<hr />

## String Namespace.

You might see some C++ programs that run without the standard namespace library.

The `using namespace std` line can be omitted and replaced with the `std` keyword, followed by the `::` operator for `string` (and `cout`) objects:

    #include <iostream>
    #include <string>
    // using namespace std; - Remove this line

    int main() {
    std::string greeting = "Hello";
    std::cout << greeting;
    return 0;
    }

<hr />

## Basic String Opeations.

### Initializing a String.

- Initialization of a string assigns characters to the string at the time of creation.

        #include <iostream>
        #include <string>
        using namespace std;

        int main() {

            // Initializing a string directly
            string str1 = "Hello World";
            string str2("Hello World");

            // Printing the string
            cout << str1 << endl;
            cout << str2 << endl;

            return 0;
        }

        <!-- Output -->
        Hello World
        Hello World

- A string can be initialized directly using = or constructor syntax with text inside quotes.

### Accessing Characters.

- Characters of a string can be accessed using the [] operator or the .at() function.

        string s = "Hello";

        cout << s[0]; // H
        cout << s.at(1); // e
        cout << s[s.length()-1]; // Last character

- Time Complexity: : O(1)

### Modifying Characters.

- To change the value of a specific character in a string, refer to the index number and use single quotes.

        string s = "Hello";
        s[0] = 'J'; // Jello

### String Length.

- The number of characters in a string can be found using `size()` or `length()`.

        string s = "Hello";

        cout << s.length();
        cout << s.size();

- Time Complexity: O(1)

<hr />

## String Concatenation.

### Using `+` Operator.

The `+` opeartor can be used between strings to add them together to make a new string. This is called concatentation.

    string firstName = "John ";
    string lastName = "Doe";
    string fullName = firstName + lastName;
    cout << fullName;

In the example above, we added a space after firstName to create a space between John and Doe on output.

Howerver you can also add a space with quotes (`" "`) or (`' '`).

### Using `append()`.

A string in C++ is actually an object, which contains functions that can perform certain operations on strings.

For example, you can also concatenate strings with the `append()` function:

    string firstName = "John ";
    string lastName = "Doe";
    string fullName = firstName.append(lastName);
    cout << fullName;

<hr />

## Important STL String Functions.

C++ provides some inbuilt functions which are used for string manipulation, such as the strcpy() and strcat() functions for copying and concatenating strings.

Some of them are:

| Function               | Description           |
| ---------------------- | --------------------- |
| length()/size()        | Returns string length |
| substr(pos, len)       | Extract substring     |
| find(str)              | Find first occurrence |
| rfind(str)             | Find last occurrence  |
| erase(pos, len)        | Remove part of string |
| replace(pos, len, str) | Replace part          |
| compare(str)           | Compare two strings   |
| push_back(ch)          | Add character at end  |
| pop_back()             | Remove last character |
| clear()                | Remove all characters |
| resize(n)              | Resize string         |
| swap(str)              | Swap two strings      |

<hr />

## Substring Extraction.

- The .substr(pos,len) is used to extract a part of a string, where pos means the starting position and len means how many characters you want to copy.
- This function creates a new string containing the selected portion, starting at pos and copying len characters.
- Time complexity of extraction is O(len).

        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string str = "Hello Geeks";

            // Extract "Hello"
            string sub1 = str.substr(0, 5);
            cout << "Substring 1: " << sub1 << endl;

            // Extract "Geeks"
            string sub2 = str.substr(6, 5);
            cout << "Substring 2: " << sub2 << endl;

            return 0;
        }

<hr />

## Numbers and Strings.

C++ uses the `+` operator for both addition and concatenation.

Numbers are added. Strings are concatenated.

If you add two numbers, the result will be a number.

    int x = 10;
    int y = 20;
    int z = x + y;      // z will be 30 (an integer)

If you add two strings, the result will be a string concatenation.

    string x = "10";
    string y = "20";
    string z = x + y;   // z will be 1020 (a string)

But if you try to add a number to a string, an error occurs.

### Basic Parsing.

- Convert String to Integer.

        string s = "123";
        int num = stoi(s);

- Convert Integer to String.

        int x = 456;
        string s = to_string(x);

<hr />

## Escape Characters.

Because strings must be written within quotes, C++ will misunderstand this string and generate an error.

    string txt = "We are the so-called "Vikings" from the north.";

The solution to avoid this problem, is to use the backslash escape character (`\`).

It turns special characters into string characters:

| Escape character | Result | Description  |
| ---------------- | ------ | ------------ |
| \'               | '      | Single quote |
| \"               | "      | Double quote |
| \\\              | \      | Backslash    |

For example:

    string txt1 = "We are the so-called \"Vikings\" from the north.";
    string txt2 = "It\'s alright.";
    string txt3 = "The character \\ is called backslash.";

Other popular escape characters in C++ are:

| Escape character | Result   |
| ---------------- | -------- |
| \n               | new line |
| \t               | Tab      |

<hr />

## Assignment.

1. Take a string as input and print the reversed string.

   [Solution](./Assignment/code1.cpp)

2. Check whether a string is a palindrome or not. (Ignore uppercase/lowercase difference)

   [Solution](./Assignment/code2.cpp)

3. Given a string, print:
   - frequency of each character (ignore spaces)
   - the most frequent character.

   [Solution](./Assignment/code3.cpp)
