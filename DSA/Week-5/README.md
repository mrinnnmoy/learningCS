# Lists of things learned.

## Introduction to Arrays.

Arrays are used to store multiple values in a single variable, instead of declaring seperate variables for each value.

![array-img](https://camo.githubusercontent.com/64df9278cbb7ca901094ac28aa1302a3ac7011aa0008f77595269dee05291ccf/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e64394763527a326c734e664876484a673679586170575f6c7a5a663553496c534256387753506b613842577a766a2673)

### Declaring an Array.

To declare an array, define the variable type, specify the name of the array followed by **square brackets** and specify the number of elements it should store:

    string cars[4];

### Initializing an Array.

We have now declared a variable that holds an array of four strings. To insert values to it, we can use an array literal - place the values in a comma-seperated list, inside curly braces:

    string cars[4] = {"Volvo", "BMW", "Ford", "Mazda"};

To create and array of three integers, you could write:

    int myNum[3] = {10, 20, 30};

### Accessing the Elements of an Array.

You access an array element by referring to the index number inside square brackets `[]`.

This statement accesses the value of the **first element** in **cars**:

    string cars[4] = {"Volvo", "BMW", "Ford", "Mazda"};

    cout << cars[0];
    // Outputs Volvo

### Updating an Array Element.

To update the value of a specific element, refer to the index number:

    string cars[4] = {"Volvo", "BMW", "Ford", "Mazda"};

    cars[0] = "Opel";
    cout << cars[0];
    // Now outputs Opel instead of Volvo

## Traversing Arrays.

### Looping through an Array.

You can loop through the array elements with the for loop.

The following example outputs all elements in the cars array:

    // Create an array of strings
    string cars[5] = {"Volvo", "BMW", "Ford", "Mazda", "Tesla"};

    // Loop through strings
    for (int i = 0; i < 5; i++) {
    cout << cars[i] << "\n";
    }

## Vectors (Dynamic Arrays in C++)

For operations that require adding and removing array elements, C++ provides **vectors**, which are **resizable arrays**.

The size of a vector is dynamic, meaning it can grow and shrink as needed.

Vectors are found in the `<vector>` library and they come with many useful functions to add, remove and modify elements:

Here's an example,

    // A vector with 3 elements
    vector<string> cars = {"Volvo", "BMW", "Ford"};

    // Adding another element to the vector
    cars.push_back("Tesla");

### Basic Operations.

- `push_back()`

  Adds an element at the end of the vector.

        vector<int> v = {1, 2, 3};
        v.push_back(4);   // v becomes {1, 2, 3, 4}

- `pop_back()`

  Removes the last element of the vector.

        vector<int> v = {1, 2, 3};
        v.pop_back();   // v becomes {1, 2}

- `size()`

  Returns the number of elements currently stored in the vector.

        vector<int> v = {10, 20, 30};
        cout << v.size();   // Output: 3

- `empty()`

  Checks whether the vector is empty.

        vector<int> v;
        if(v.empty()) {
            cout << "Vector is empty";
        }

        <!-- Output -->
        Returns true if size is 0.
        Returns false otherwise.

- `clear()`

  Removes all elements from the vector.

        vector<int> v = {1, 2, 3};
        v.clear();   // v becomes empty

- `resize()`

  Changes the size of the vector.

        vector<int> v = {1, 2, 3};

        v.resize(5);
        // v becomes {1, 2, 3, 0, 0}

        v.resize(2);
        // v becomes {1, 2}

## Prefix & Prefix Sum Technique.

### Concept of Prefix.

A prefix is a letter or group of letters, for example 'un-' or 'multi-', which is added to the beginning of a word in order to form a different word.

Example: unmanageable, unhappy.

### Prefix in arrays.

Any continuous segment of array starting from index 0 is a prefix.

Example,

`Array = [1, 2, 3, 4, 5];`

`Prefixes: [1] [1, 2] [1, 2, 3] [1, 2, 3, 4] [1, 2, 3, 4, 5];`

### Prefix Sum Array.

It is a sum array that we create from main array, where `prefix_sum[i] = sum of all the elements of the array from 0 to i`.

![prefixSum-img](https://camo.githubusercontent.com/14724fbea6848d40d07d37e05602c31d6c73843dceaa3c91f21443270a87c5a6/68747470733a2f2f7777772e6e6f74696f6e2e736f2f696d6167652f68747470732533412532462532466d69726f2e6d656469756d2e636f6d2532467632253246726573697a65253341666974253341383030253246312a6b4a75794d72477a68394d4579334c5843324e4c39772e6a7065673f7461626c653d626c6f636b2669643d34616230666232372d316237642d343736342d623236622d6365353033663966333632352663616368653d7632)

## 2-D Arrays. (Matrices)

A multi-dimensional array is an array of arrays.

### Declaring a 2-D Array.

To declare a multi-dimensional array, define the variable type, specify the name of the array followed by square brackets which specify how many elements the main array has, followed by another set of square brackets which indicates how many elements the sub-arrays have:

    string letters[2][4];

As with ordinary arrays, you can insert values with an array literal - a comma-seperated list inside curly braces.

### Initializing a 2-D Array.

In a multi-dimensional array, each element in an array literal is another array literal.

    string letters[2][4] = {
    { "A", "B", "C", "D" },
    { "E", "F", "G", "H" }
    };

Each set of square brackets in an array declaration adds another **dimension** to an array. An array like the one above is said to have two dimensions.

### Accessing Elements in a 2-D Array.

Arrays can have any number of dimensions. The more dimensions an array has, the more complex the code becomes. The following array has three dimensions:

    string letters[2][2][2] = {
    {
        { "A", "B" },
        { "C", "D" }
    },
    {
        { "E", "F" },
        { "G", "H" }
    }
    };

### Accessing the elements of a 2-D Aray.

To access an element of a multi-dimensional array, specify an index number in each of the array's dimensions.

This statement accesses the value of the element in the **first row (0)** and **third column (2)** of the letters array.

Example

    string letters[2][4] = {
    { "A", "B", "C", "D" },
    { "E", "F", "G", "H" }
    };

    cout << letters[0][2];  // Outputs "C"

### Changing Elements in a 2-D Array.

To change the value of an element, refer to the index number of the element in each of the dimensions:

    string letters[2][4] = {
    { "A", "B", "C", "D" },
    { "E", "F", "G", "H" }
    };
    letters[0][0] = "Z";

    cout << letters[0][0];  // Now outputs "Z" instead of "A"

### Looping through a 2-D Array.

To loop through a multi-dimensional array, you need one loop for each of the array's dimensions.

The following example outputs all elements in the letters array:

    string letters[2][4] = {
        { "A", "B", "C", "D" },
        { "E", "F", "G", "H" }
    };

    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 4; j++) {
            cout << letters[i][j] << "\n";
        }
    }

## Assignment.

1. Given an array of size n, find the second largest element.

   [Solution](./Assignment/code1.cpp)

2. You are given:
   - An array of size `n`,
   - `q` queries

   Each query contains two indices `l` and `r`.

   For each query, print the sum of elements from index `l` to `r`.

   [Solution](./Assignment/code2.cpp)

3. You are given a 2D matrix of size `n × m`.
   Count how many 2×2 submatrices have an even sum.

   [Solution](./Assignment/code3.cpp)
