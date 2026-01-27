# List of topics learned.

1. What is DSA?

- DSA stands for Data Structures and Algorithms.

- Data Structures means the way some data is stored. For example, we can store data as lists or in a stack or as a tree. All of these are examples of data structures.

- Algorithms is a set of steps you need to follow to solve some problem. Either the set of steps is known (example, sorting, DFS etc) or you derive the set of steps using first principles and logical thinking.

<hr />

2. CP vs DSA?

- CP stands for Competitive Programming. It is a sport where competitors solve DSA problems. They are either online or onsite. CodeChef, Codeforces are examples of online platforms where CP contests are organised. You can participate in these sitting from home. ICPC, IOI, CodeJam, local contests in tech fests etc are example of onsite contests.

- Technically, CP is a sport version of DSA. However, we often use “DSA” to refer to the action of people learning DSA for interview preparation or college exams whereas the term “CP” is used to refer to the action of people participating in the coding competitions / sport.

<hr />

3. Choice of Language.

![comfort-image](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNi6SNjymIYBHDBroB_FyXORT66-M7ThIj8_NQxd3kRw&s)

- All of us wants to stay in our comfort zone. But it’s very difficult to write code in every language or more than 1 language in a live class.

- Try keeping yourself language agnostic. Though focus more on how to think about the problem and solve it than writing the code. However, in some cases we will be writing some code - we can decide on C++ / JS or do alternatively. However, you will also get the code in all other languages in the reading materials.

<hr />

4. Arrays / Lists.

- Collection of elements of some (any) type is called an array / list.

![array-image](https://www.notion.so/image/https%3A%2F%2Fmedia.geeksforgeeks.org%2Fwp-content%2Fuploads%2F20220721080308%2Farray.png?table=block&id=d6a1a5f9-0802-47e0-86f2-350fce2a0551&cache=v2)

- As mentioned above, the type of elements can be fixed or different depending on the language. For strongly types languages like C++, Java etc you need to specify the type of element the array will be holding. However for some languages (generally weakly typed ones) allow you to have heterogeneous arrays i.e a single array can hold different values (ex - Python, JS)

**Operations :**

i. Creating an array/list,
   - For strongly typed languages you need to provide a type
   - You can also specify the size of the array / list
   - If you don’t specify the size, it creates a dynamic array
     -  C++ code.

        `int arr[10]; // Fixed size`

        `int arr[n]; // Dynamic size, Determined at runtime.`
        
        `int \*arr = new int[n]; // Dynamic size, Determined at runtime.`
        
        `vector<int> arr; // Completely dynamic. You can add / remove and its size adjusts`
       
      - JS code.

        `const arr = [];`

        `const arr = [1, 2, 3, 4];`
        
        `const arr = new Array(5) // Not fixed size`

ii. Accessing array elements using index.

   ![array-index-img](https://www.notion.so/image/https%3A%2F%2Fmedia.geeksforgeeks.org%2Fwp-content%2Fuploads%2F20230302092738%2Faccess-array-elements.png?table=block&id=3acace2a-f8d1-4bec-8973-37db495fba54&cache=v2)

iii. Iterating on the elements.

- You can choose to iterate through all the elements of the array. Generally you go left to right or right to left, one element at a time.

iv. Update the value at any index.

- Using an index, you can update the array value at that index. You can only do this for mutable arrays / lists however.

<hr />

5. Strings.

- Array / List of characters is called a string. It is a collection of alphabets, words or other characters.

   `"Hello world"`

   `"Hello"`

   `"Hello, I am 2020 graduate"`

- As it is a list of characters, you can perform similar operations on strings like arrays. Also the language often provides you with more capabilities for string apart from the array operations like splitting a string, searching for a substring within a string etc.

<hr />