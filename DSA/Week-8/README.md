# List of things learned.

## Introduction to Containers.

The Standard Template Library (STL) in C++ provides built-in implementations of commonly used data structures, known as containers.

A container is an object that stores a collection of other objects (its elements).

Containers are implemented as class templates, which means they can store different data types.

There are 4 main types of containers in C++ STL.

1. **Sequence Containers.**

   Sequence containers store elements in linear order, meaning elements are accessed sequentially.

   Following are the sequence containers in C++ STL:

   | Container Name | Description                                                                                |
   | -------------- | ------------------------------------------------------------------------------------------ |
   | `Array`        | Container that wraps over fixed size static array.                                         |
   | `Vector`       | Automatically resizable dynamic array.                                                     |
   | `Deque`        | Dynamic array of fixed-size arrays that allows fast insertions and deletions at both ends. |
   | `List`         | Implementation of Doubly Linked List data structure.                                       |
   | `Forward List` | Implementation of Singly Linked List data structure.                                       |

2. **Associative Containers.**

   Associative containers store elements in sorted order.

   They are implemented using balanced binary trees (Red-Black Trees) which provide O(log n) complexity for insertion, deletion and search.

   | Container Name | Description                                                                                            |
   | -------------- | ------------------------------------------------------------------------------------------------------ |
   | `Set`          | Collection of unique elements sorted on the basis of their values.                                     |
   | `Map`          | Collection of key-value pairs sorted on the basis of the keys where no two pairs have same keys.       |
   | `Multiset`     | Collection of elements sorted on the basis of their values but allows multiple copies of values.       |
   | `Multimap`     | Collection of key-value pairs sorted on the basis of the keys where multiple pairs can have same keys. |

3. **Unordered Associative Containers.**

   Unordered containers store elements using hash tables.

   They do not maintain sorted order, but provide faster average lookup (O(1)).

   | Container Name       | Description                                                                                          |
   | -------------------- | ---------------------------------------------------------------------------------------------------- |
   | `Unordered_Set`      | Collection of unique elements hashed by their values.                                                |
   | `Unordered_Map`      | Collection of key-value pairs that are hashed by their keys where no two pairs have same keys.       |
   | `Unordered_Multiset` | Collection of elements hashed by their values and allows multiple copies of values.                  |
   | `Unordered_Multimap` | Collection of key-value pairs that are hashed by their keys where multiple pairs can have same keys. |

4. **Container Adapters.**

   Container adapters provide special interfaces for existing containers.

   | Container Name   | Description                                                |
   | ---------------- | ---------------------------------------------------------- |
   | `Stacks`         | Adapts a container to provide stack (LIFO) data structure. |
   | `Queue`          | Adapts a container to provide queue (FIFO) data structure. |
   | `Priority_Queue` | Adapts a container to provide heap data structure.         |

<hr />

## `set` (Ordered Set)

A set stores unique elements that are automatically sorted in ascending order.

- Elements are unique
- Automatically sorted
- Cannot access elements using index
- Implemented using Red-Black Tree

To use a set, you have to include the `<set>` header file:

    // Include the set library
    #include<set>

### Basic Operations.

1.  **Create a Set.**

    To create a set, use the `set` keyword and specify the type of values it should store within angle brackets `<>` and then the name of the set, like : `set<type> setName`.

    For example:

        // Create a set called cars that will store strings
        set<string> cars;

    If you want to add elements at the time of declaration, place them in a comma-separated list, inside curly braces `{}`:

        // Create a set called cars that will store strings
        set<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Print set elements
        for (string car : cars) {
            cout << car << "\n";
        }

        // Output
        BMW
        Ford
        Mazda
        Volvo

2.  **Sort a Set in Descending order.**

    By default, the elements in a set are sorted in ascending order. If you want to reverse the order, you can use the `greater<type>` functor inside the angle brackets, like this:

    For example:

        // Sort elements in a set in descending order
        set<int, greater<int>> numbers = {1, 7, 3, 2, 5, 9};

        // Print the elements
        for (int num : numbers) {
        cout << num << "\n";
        }

        // Output
        9
        7
        5
        3
        2
        1

3.  **Add Elements.**

    To add elements to a set, you can use the `.insert()` function:

        set<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Add new elements
        cars.insert("Tesla");
        cars.insert("VW");
        cars.insert("Toyota");
        cars.insert("Audi");

4.  **Remove Elements.**

    To remove specific elements from a set, you can use the `.erase()` function:

        set<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Remove elements
        cars.erase("Volvo");
        cars.erase("Mazda");

    To remove all elements from a set, you can use the `.clear()` function:

        set<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Remove all elements
        cars.clear();

5.  **Find the Size of a set.**

    To find out how many elements a set has, use the `.size()` function:

        set<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};
        cout << cars.size();  // Outputs 4

6.  **Check if a set is empty.**

    Use the `.empty()` function to find out if a set is empty or not.

    The `.empty()` function returns `1` (true) if the set is empty and `0` (false) otherwise:

        set<string> cars;
        cout << cars.empty();  // Outputs 1 (The set is empty)

        set<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};
        cout << cars.empty();  // Outputs 0 (not empty)

<hr />

## `unordered_set`.

An `unordered_set` is similar to a `set` but does not maintain order.

It uses hash tables for faster lookup.

To use a unordered_set, you have to include the `<unordered_set>` header file:

    // Include the set library
    #include<unordered_set>

### Basic Operations.

- Insert : `numbers.insert(10);`
- Erase : `numbers.erase(5);`
- Find : `numbers.find(8);`
- Size : `numbers.size();`

<hr />

## `map` (Ordered Map).

A map stores elements in **"key/value"** pairs.

Elements in a map are:

- Accessible by keys (not index), and each key is unique.
- Automatically sorted in ascending order by their keys.

To use a map, you have to include the `<map>` header file:

    // Include the map library
    #include<map>

### Basic Operations.

1.  **Create a Map.**

    To create a map, use the `map` keyword, and specify the type of both the key and the value it should store within angle brackets `<>`.

    At last, specify the name of the map, like: `map<keytype, valuetype> mapName`:

        // Create a map called people that will store strings as keys and integers as values
        map<string, int> people

    If you want to add elements at the time of declaration, place them in a comma-separated list, inside curly braces `{}`:

        // Create a map that will store the name and age of different people
        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

2.  **Access a Map.**

    You cannot access map elements by referring to index numbers, like you would with arrays and vectors.

    Instead, you can access a map element by referring to its key inside square brackets `[]`:

        // Create a map that will store the name and age of different people
        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Get the value associated with the key "John"
        cout << "John is: " << people["John"] << "\n";

        // Get the value associated with the key "Adele"
        cout << "Adele is: " << people["Adele"] << "\n";

    You can also access elements with the `.at()` function:

        // Create a map that will store the name and age of different people
        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Get the value associated with the key "Adele"
        cout << "Adele is: " << people.at("Adele") << "\n";

        // Get the value associated with the key "Bo"
        cout << "Bo is: " << people.at("Bo") << "\n";

    **Note**: The `.at()` function is often preferred over square brackets `[]` because it throws an error message if the element does not exist:

        // Create a map that will store the name and age of different people
        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Try to access an element that does not exist (will throw an exception)
        cout << people.at("Jenny");

3.  **Change Values.**

    You can also change the value associated with a key:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Change John's value to 50 instead of 32
        people["John"] = 50;

        cout << "John is: " << people["John"];  // Now outputs John is: 50

    However, it is safer to use the `.at()` function:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Change John's value to 50 instead of 32
        people.at("John") = 50;

        cout << "John is: " << people.at("John");  // Now outputs John is: 50

4.  **Add Elements.**

    To add elements to a map, it is ok to use square brackets `[]`:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Add new elements
        people["Jenny"] = 22;
        people["Liam"] = 24;
        people["Kasper"] = 20;
        people["Anja"] = 30;

    But you can also use the `.insert()` function:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Add new elements
        people.insert({"Jenny", 22});
        people.insert({"Liam", 24});
        people.insert({"Kasper", 20});
        people.insert({"Anja", 30});

5.  **Element with Equal Key.**

    A map cannot have elements with equal keys.

    For example, if we try to add "Jenny" two times to the map, it will only keep the first one:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Trying to add two elements with equal keys
        people.insert({"Jenny", 22});
        people.insert({"Jenny", 30});

    **To sum up;** values can be equal, but keys must be unique.

6.  **Remove Elements.**

    To remove specific elements from a map, you can use the `.erase()` function:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Remove an element by key
        people.erase("John");

    To remove all elements from a map, you can use the `.clear()` function:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        // Remove all elements
        people.clear();

7.  **Find the Size of a Map.**

    To find out how many elements a map has, use the `.size()` function:

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };
        cout << people.size();  // Outputs 3

8.  **Check if a Map is Empty.**

    Use the `.empty()` function to find out if a map is empty or not.

    The `.empty()` fnction returns `1` (true) if the map is empty and `0` (false) otherwise:

        map<string, int> people;
        cout << people.empty(); // Outputs 1 (The map is empty)

        map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };
        cout << people.empty();  // Outputs 0 (not empty)

    **Note**: You can also check if a specific element exists, by using the `.count(key)` function.

    It returns `1` (true) if the element exists and `0` (false) otherwise:

9.  **Loop Through a Map.**

    You can loop through a map with the **for-each** loop. However, there are a couple of things to be aware of:
    - You should use the `auto` keyword (introduced in C++ version 11) inside the `for` loop. This allows the compiler to automatically determine the correct data type for each key-value pair.
    - Since map elements consist of both keys and values, you have to include `.first` to access the keys, and `.second` to access values in the loop.
    - Elements in the map are sorted automatically in ascending order by their keys:

            map<string, int> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

            for (auto person : people) {
            cout << person.first << " is: " << person.second << "\n";
            }

            // Output
            Adele is: 45
            Bo is: 29
            John is: 32

    If you want to reverse the order, you can use the `greater<type>` functor inside the angle brackets, like this:

        map<string, int, greater<string>> people = { {"John", 32}, {"Adele", 45}, {"Bo", 29} };

        for (auto person : people) {
        cout << person.first << " is: " << person.second << "\n";
        }

        <!-- Output -->
        John is: 32
        Bo is: 29
        Adele is: 45

<hr />

## `unordered_map`.

`unordered_map` stores key-value pairs using hash tables.

To use a unordered_map, you have to include the `<unordered_map>` header file:

    // Include the map library
    #include<unordered_map>

<hr />

## Frequency Maps.

Frequency maps are commonly used in DSA problems to count occurrences.

    unordered_map<int,int> freq;

    int arr[] = {1,2,2,3,3,3};

    for(int i=0;i<6;i++){
        freq[arr[i]]++;
    }

    for(auto p : freq){
        cout << p.first << " -> " << p.second << endl;
    }

    <!-- Output -->
    1 -> 1
    2 -> 2
    3 -> 3

<hr />

## set vs map. (Difference)

| set                                           | map                                                       |
| --------------------------------------------- | --------------------------------------------------------- |
| Set is used to store all the unique elements. | map is used to store all the unique elements.             |
| Its syntax is -: `set<data_type>name_of_set;` | Its syntax is -: `map<data_type , data_type>name_of_map;` |
| It stores the elements in increasing order    | It stores the elements in key , value pairs.              |
| Set is implemented using Binary search tree.  | Map is implemented using Balance Binary tree.             |
| Sets are traversed using the iterators.       | It is defined in #include <map> header file.              |

<hr />

## Iterators.

Iterators are used to traverse containers.

They act like pointers that point to container elements.

To iterate through a vector, look at the following example:

    // Create a vector called cars that will store strings
    vector<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

    // Create a vector iterator called it
    vector<string>::iterator it;

    // Loop through the vector with the iterator
    for (it = cars.begin(); it != cars.end(); ++it) {
        cout << *it << "\n";
    }

1. First we create a vector of strings to store the names of different car manufactures.
2. Then we create a "vector iterator" called `it`, that we will use to loop through the vector.
3. Next, we use a `for` loop to loop through the vector with the iterator. The iterator (`it`) points to the first element in the vector (`cars.begin()`) and the loop continues as long as `it` is not equal to `cars.end()`.
4. The increment operator (`++it`) moves the iterator to the next element in the vector.
5. The dereference operator (`*it`) accesses the element the iterator points to.

- What are iterators
- How iterators work in STL containers

### Types of Iteration.

1.  **Using `begin()` and `end()`.**

    `begin()` and `end()` are functions that belong to data structures, such as vectors and lists. They do not belong to the iterator itself. Instead, they are used with iterators to access and iterate through the elements of these data structures.
    - `begin()` returns an iterator that points to the first element of the data structure.
    - `end()` returns an iterator that points to one position after the last element.

    To understand how they work, let's continue to use vectors as an example:

        vector<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        vector<string>::iterator it;

    `begin()` points to the first element in the vector (index 0, which is "Volvo"):

        // Point to the first element in the vector
        it = cars.begin();

    To point to the second element (BMW), you can write `cars.begin() + 1`:

        // Point to the second element
        it = cars.begin() + 1;

    And of course, that also means you can point to the third element with `cars.begin() + 2`:

        // Point to the third element
        it = cars.begin() + 2;

    `end()` points to one position after the last element in the vector (meaning it doesn't point to an actual element, but rather indicates that this is the end of the vector).

    So, to use `end()` to point to the last element in the cars vector (Mazda), you can use `cars.end() - 1`:

        // Point to the last element
        it = cars.end() - 1;

2.  **Using `auto`.**

    In C++ 11 and later versions, you can use the `auto` keyword instead of explicitly declaring and specifying the type of the iterator.

    The `auto` keyword allows the compiler to automatically determine the correct data type, which simplifies the code and makes it more readable:

        <!-- Instead of this: -->
        vector<string>::iterator it = cars.begin();

        <!-- You can simply write this: -->
        auto it = cars.begin();

    In the example above, the compiler knows the type of `it` based on the return type of `cars.begin()`, which is `vector<string>::iterator`.

    The `auto` keyword works in `for` loops as well:

        for (auto it = cars.begin(); it != cars.end(); ++it) {
            cout << *it << "\n";
        }

3.  **Using range-based loops.**

    You can use a for-each loop to just loop through elements of a data structure, like this:

        // Create a vector called cars that will store strings
        vector<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Print vector elements
        for (string car : cars) {
            cout << car << "\n";
        }

    When you are just reading the elements, and don't need to modify them, the for-each loop is much simpler and cleaner than iterators.

    However, when you need to add, modify, or remove elements during iteration, iterate in reverse, or skip elements, you should use iterators:

        // Create a vector called cars that will store strings
        vector<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

        // Loop through vector elements
        for (auto it = cars.begin(); it != cars.end(); ) {
            if (*it == "BMW") {
                it = cars.erase(it); // Remove the BMW element
            } else {
                ++it;
            }
        }

        // Print vector elements
        for (const string& car : cars) {
            cout << car << "\n";
        }

<hr />

## Algorithms with Iterators.

Another important feature of iterators is that they are used with different algorithm functions, such as `sort()` and `find()` (found in the `<algorithm>` library), to sort and search for elements in a data structure.

For example, the `sort()` function takes iterators (typically returned by `begin()` and `end()`) as parameters to sort elements in a data structure from the beginning to the end.

In this example, the elements are sorted alphabetically since they are strings:

    #include <iostream>
    #include <vector>
    #include <algorithm>  // Include the <algorithm> library
    using namespace std;

    int main() {
    // Create a vector called cars that will store strings
    vector<string> cars = {"Volvo", "BMW", "Ford", "Mazda"};

    // Sort cars in alphabetical order
    sort(cars.begin(), cars.end());

    // Print cars in alphabetical order
    for (string car : cars) {
        cout << car << "\n";
    }

    return 0;
    }

And in this example, the elements are sorted numerically since they are integers:

    #include <iostream>
    #include <vector>
    #include <algorithm>
    using namespace std;

    int main() {
    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Sort numbers numerically
    sort(numbers.begin(), numbers.end());

    for (int num : numbers) {
        cout << num << "\n";
    }

    return 0;
    }

To reverse the order, you can use `rbegin()` and `rend()` instead of `begin()` and `end()`:

    #include <iostream>
    #include <vector>
    #include <algorithm>
    using namespace std;

    int main() {
    // Create a vector called numbers that will store integers
    vector<int> numbers = {1, 7, 3, 5, 9, 2};

    // Sort numbers numerically in reverse order
    sort(numbers.rbegin(), numbers.rend());

    for (int num : numbers) {
        cout << num << "\n";
    }

    return 0;
    }

<hr />

## Time Complexity Comparison.

| Operation | set      | unordered_set | map      | unordered_map |
| --------- | -------- | ------------- | -------- | ------------- |
| Insert    | 0(log n) | O(1) avg      | 0(log n) | O(1) avg      |
| Search    | 0(log n) | O(1) avg      | 0(log n) | O(1) avg      |
| Delete    | 0(log n) | O(1) avg      | 0(log n) | O(1) avg      |

<hr />

## Assignment.

1. Given an array of integers, print all the unique elements in sorted order. (use a `set`)
   - Input : `n = 7`, `arr = 4 2 7 2 4 9 1`
   - Output : `1 2 4 7 9`

   [Solution](./Assignment/code1.cpp)

2. Given an array of integers, count the frequency of each element. (use an `ordered_map`)
   - Input : `n = 6`, `arr = 1 2 2 3 3 3`
   - Output :
     `1 -> 1`
     `2 -> 2`
     `3 -> 3`

   [Solution](./Assignment/code2.cpp)

3. Given an array of integers, find the first non-repeating element.
   - Input : `n = 7`, `arr = 4 5 1 2 0 4 1`
   - Output : 5

   [Solution](./Assignment/code3.cpp)
