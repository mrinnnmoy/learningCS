# List of things learned.

## Installing Node.js.

Node.js is a free, open source tool that lets you run JavaScript outside the web browser.

Node.js uses and event-driven, non-blocking model. That can handle many connections at once without waiting for one to finish before starting another.

Built on Chrome's V8 JavaScript engine, making it great for real-time apps and high traffic websites.

Here are some examples of what you can build using Node.js:

- Web servers & websites
- REST APIs
- Real-time apps (like chat)
- Command-line tools
- Working with files & databases
- IoT & Hardware control.

### Installing NodeJS.

1. Got to https://nodejs.org/en/download
2. Download the **LTS** (Long Term Support) version
3. Run the installer and follow the instructions.

### Commands to check installation.

Open your terminal/command prompt and type:

- `node --version`

- `npm --version`

You should see version numbers for both Node.js and npm (Node Package Manager).

<hr />

## Introduction to JavaScript.

JavaScript is the programming language of the web.

Web development involves writing a lot of HTML, CSS and JS code.

Any website that you can see, is a bunch of HTML, CSS and JS files along with some assets (images, videos etc)

### Properties of JS.

Every language comes with it’s unique set of features. Javascript has the following -

1.  **Interpreted.**

    Javascript is an interpreted language, meaning it's executed line-by-line at runtime by the JavaScript engine in the browser or server environment, rather than being compiled into machine code beforehand.

    ![code-runtime-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F3e158041-21f9-4456-b8da-fb7efc1f1c72%2FScreenshot_2024-08-04_at_6.04.48_PM.png?table=block&id=cde43870-90f3-4819-b559-5a1e3a12cc85&cache=v2)
    - Upsides,
      - There is one less step to do before running your code.

    - Downside,
      - Performance overhead.
      - More prone to runtime errors.

2.  **Dynamically-Types.**

    Variables in JavaScript are not bound to a specific data type. Types are determined at runtime and can change as the program executes.
    - C++ code (won't compile)

            #include <iostream>

            int main() {
            int a = 1;
            a = "hello";
            a = true;
            }

    - JS code (will compile)

            var a = 1;
            a = "max";
            a = true;

            console.log(a);

3.  **Single Threaded.**

    JavaScript executes code in a single-threaded environment, meaning it processes one task at a time.

    ![js-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F524dfd92-1f94-472b-ade8-e988608116f7%2FScreenshot_2024-08-04_at_6.13.11_PM.png?table=block&id=3e7388e9-5708-4bfe-9d7f-8c32cc680408&cache=v2)

4.  **Garbage Collected.**

    JavaScript automatically manages memory allocation and deallocation through garbage collection, which helps prevent memory leaks by automatically reclaiming memory used by objects no longer in use.

    ![js4-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fec5e527b-de5a-4718-b3b2-d5c4a95f279c%2FScreenshot_2024-08-04_at_6.16.07_PM.png?table=block&id=1d3a4740-c417-46c4-abce-e27475bc9d86&cache=v2)

### Running a JS code.

Here's a simple JS program, that you can test on your computer:

1.  Create a file and name it. (suppose "index.js". Don't forget to put a ".js" extension after the file name)

2.  Now write this basic program to calculate the sum and save the program.

        function sum (x, y){
        return x + y;
        }

        sum(5,6);

3.  Now open terminal and run "node index.js". You will be able to see the output as **11**.

<hr />

## Variables.

The JavaScript syntax defines two types of values:

- **Literals** (Fixed values)
- **Variables** (Variable values)

JavaScript variables are containers for data. And variables can be declared in 4 ways:

1. Modern JavaScript.
   - Using `let`
   - Using `const`
2. Older JavaScript
   - Using `var` (Not recommended)

### Declaring Variables.

Creating a variable in JavaScript is called declaring a variable.

You declare a JavaScript variable with the `let` keyword or the `const` keyword.

For example:

    let carName;
    <!-- After the declaration, the variable has no value (technically it is undefined). -->

    carName = "Volvo";
    <!-- Assign a value to the variable, using the equal sign. -->

### When to Use var, let or const?

- Always declare variables
- Always use `const` if the value should not be changed
- Always use `const` if the type should not be changed (Arrays and Objects)
- Only use `let` if you cannot use `const`
- Never use `var` if you can use `let` or `const`

### Difference between var, let or const.

|       | Scope | Redeclare | Reassign | Hoisted | Binds this |
| ----- | ----- | --------- | -------- | ------- | ---------- |
| var   | No    | Yes       | Yes      | Yes     | Yes        |
| let   | Yes   | No        | Yes      | No      | No         |
| const | Yes   | No        | No       | No      | No         |

<hr />

## Data Types.

JavaScript variables can hold 8 types of data:

| Type      | Description                                   |
| --------- | --------------------------------------------- |
| String    | A text of characters enclosed in quptes       |
| Number    | A number representing a mathematical value    |
| Big int   | A number representing a large integer         |
| Boolean   | A data type representing ture or false        |
| Object    | A collection of key-value pairs of data       |
| Undefined | A primitive variable with no assigned value   |
| Null      | A primitive value representing object absence |
| Symbol    | A unique and primitive identifies             |

Here's an example:

    // String
    let color = "Yellow";
    let lastName = "Johnson";

    // Number
    let length = 16;
    let weight = 7.5;

    // BigInt
    let x = 1234567890123456789012345n;
    let y = BigInt(1234567890123456789012345)

    // Boolean
    let x = true;
    let y = false;

    // Object
    const person = {firstName:"John", lastName:"Doe"};

    // Array object
    const cars = ["Saab", "Volvo", "BMW"];

    // Date object
    const date = new Date("2022-03-25");

    // Undefined
    let x;
    let y;

    // Null
    let x = null;
    let y = null;

    // Symbol
    const x = Symbol();
    const y = Symbol();

### The typeof Operator.

You can use the JavaScript `typeof` operator to find the type of a JavaScript variable.

The `typeof` operator returns the type of a variable or an expression:

    typeof ""             // Returns "string"
    typeof "John"         // Returns "string"
    typeof "John Doe"     // Returns "string"

    typeof 0              // Returns "number"
    typeof 314            // Returns "number"
    typeof 3.14           // Returns "number"
    typeof (3)            // Returns "number"
    typeof (3 + 4)        // Returns "number"

<hr />

## Operators.

Operators are for Mathematical and Logical Computations.

### Types of JavaScript Operators.

There are different types of JS operators:

1.  Arithmetic Operators

    Arithmetic Operators are used to perform arithmetic on numbers:

    For example:

        let a = 3;
        let x = (100 + 50) * a;

    Different types of arithmetic operators:

    | Operator | Description                  |
    | -------- | ---------------------------- |
    | +        | Addition                     |
    | -        | Subtraction                  |
    | \*       | Multiplication               |
    | \*\*     | Exponentian                  |
    | /        | Division                     |
    | %        | Modulus (Division remainder) |
    | ++       | Increment                    |
    | --       | Decrement                    |

2.  Assignment Operators

    Assignment operators assign values to JavaScript variables.

    For example:

        let x = 10;
        x += 5;

    Different types of assignment operators:

    | Operator | Example   | Same as      |
    | -------- | --------- | ------------ |
    | =        | x = y     | x = y        |
    | +=       | x += y    | x = x + y    |
    | -+       | x -= y    | x = x - y    |
    | \*=      | x \*= y   | x = x \* y   |
    | /=       | x /= y    | x = x / y    |
    | %=       | x %= y    | x = x % y    |
    | \*\*=    | x \*\*= y | x = x \*\* y |

3.  Comparison Operators

    Comparison operators are used to compare two values.

    Comparison operators always return `true` or `false`.

    For example:

        let x = 5;
        let result = x > 8;

    Different types of comparison operators:

    | Operator | Description                       | Example |
    | -------- | --------------------------------- | ------- |
    | ==       | equal to                          | x == 5  |
    | ===      | equal value and equal type        | x === 5 |
    | !=       | not equal                         | x != 5  |
    | !==      | not equal value or not equal type | x !== 5 |
    | >        | greater than                      | x > 5   |
    | <        | less than                         | x < 5   |
    | >=       | greater than or equal to          | x >= 5  |
    | <=       | less than or equal to             | x <= 5  |

4.  Logical Operators

    Logical operators are used to combine boolean expressions.

    Logical operators can be used to modify the results of comparisons.

    For example:

        if((x == 5) && (x > 5)){
            return x;
        }

    Different types of logical operators:

    | Operator | Description |
    | -------- | ----------- |
    | &&       | logical and |
    | \|\|     | logical or  |
    | !        | logical not |

<hr />

## Conditions.

Conditional statements allow us to perform different actions for different conditions.

Consitional statements run different code depending on true or false conditions.

Conditional statement include:

- if
- if...else
- if...else if...else
- switch
- ternary

### When to use conditionals?

- Use `if` to specify a code block to be executed, if a specified condition is `true`
- Use `else` to specify a code block to be executed, if the same condition is `false`
- Use `else if` to specify a new condition to test, if the first condition is `false`
- Use `switch` to specify many alternative code blocks to be executed
- Use `(? :)` (ternary) as a shorthand for `if...else`

### The `if` Statement.

Use `if` to specify a code block to be executed, if a specified condition is `true`.

For example:

    if(condition){
        <!-- code to execute if the condition is true -->
    }

### The `else` Statement.

Use `else` to specify a code block to be executed, if the same condition is `false`.

For example:

    if(condition){
        <!-- code to execute if the condition is true -->
    } else {
        <!-- code to execute if the condition is false -->
    }

### The `else if` Statement.

Use `else if` to specify a new condition to test, if the first condition is `false`.

For example:

    if (condition1) {
        <!-- code to execute if condition1 is true -->
    } else if (condition2) {
        <!-- code to execute if the condition1 is false and condition2 is true -->
    } else {
        <!-- code to execute if the condition1 is false and condition2 is false -->
    }

### The switch Statement.

Use `switch` to specify many alternative code blocks to be executed.

For example:

    switch(expression) {
    case x:
        // code block
        break;
    case y:
        // code block
        break;
    default:
        // code block
    }

- When JavaScript reaches a `break` keyword, it breaks out (stops execution) of the switch block.

- The `default` keyword specifies a block of code to run if there is no case match.

- The `continue` statement skips the current iteration in a loop. The remaining code in the iteration is skipped and processing moves to the next iteration.

### Ternary Operator (?:).

Use `(? :)` (ternary) as a shorthand for `if...else`.

For example:

    condition ? expression1 : expression2

<hr />

## Loops.

Loops are used to execute a block of code multiple times.

Loops are handy, if you want to run the same code over and over agin, each time with a different value.

### The for Loop.

The `for` statement creates a loop with 3 optional expressions:

    for(expr1; expr2; expr3){
        <!-- code to be executed -->
    }

- expr1 is executed one time before the execution of the code block.

- expr2 defines the condition for executing the code block.

- expr3 is executed every time the code block has been executed.

For example:

    for(let i = 0; i < 5 ; i++){
        text += "The number is " + i + "<br>";
    }

### The while Loop.

The `while` loop, loops through a block of code as long as a specified condition is true.

    while(condition){
        <!-- code to be executed -->
    }

For example:

    while(i < 10){
        text += "The number is " + i;
        i++;
    }

### The do while Loop.

The `do while` loop is a variant of the `while` loop.

The `do while` loop will execute the code block once, before checking if the condition is true, then it will repeat the loop as long as the condition is true.

    do {
        <!-- code to be executed -->
    }
    while(condition);

For example:

    do {
        text += "The number is " + i;
        i++
    }
    while(i < 10);

<hr />

## Strings.

Strings are for storing text and are written with quotes.

    let text = "John Doe";

### Basic String Methods.

JavaScript strings are primitive and immutable: All string methods produce a new string without altering the original string.

1.  String Length.

    The `length` property returns the length of a string:

        let text = `Hello`;
        let length = text.length;

2.  String charAt().

    The `charAt()` methods returns the character at a specified index (position) in a string:

        let text = `Hello`;
        let char = text.chartAt(0);

3.  String charCodeAt().

    The `charCodeAt()` methods returns the code of the character at a specified index in a string:

    The methods returns a UTF-16 code (an integer between 0 and 65535).

        let text = `Hello World`;
        let char = text.charCodeAt(0);

4.  String at().

    The `at()` method returns the character at a specified index (position) in a string.

        let text = `Hello World`;
        let char = text.at(1);

5.  String concat().

    The `concat()` method can be used instead of the plus operator. These two lines do the same:

        let text = `Hello` + ` ` + `World`;
        <!-- or -->
        let text = `Hello`.concat(` `, `World`);

6.  String slice().

    `slice()` extracts a part of a string and returns the extracted part in a new string.

        let text = `Apple, Banana, Mango`;
        let part = text.slice(7, 13);

7.  String toUpperCase().

    A string is converted to upper case using this method.

        let text1 = `hello world`;
        let text2 = text1.toUpperCase();

8.  String toLowerCase().

    A string is converted to upper case using this method.

        let text1 = `HELLO WORLD`;
        let text2 = text1.toLowerCase();

<hr />

## Functions.

Functions are blocks of code that is:

- reusable and designed to perform a particular task,
- executed when they are called or invoked &
- fundamental in all programming languages.

A function can be created with the function keyword, a name & parentheses.

And to run the function, you call it by using its name followed by parenthesis.

    function greet(){
        return `Hello World`;
    }

    greet();

### Return Statement.

The `return` statement is used to send a value out of a function.

When a function reaches a return statement, the function stops executing.

The value after the return keyword is sent back to the caller.

### Parameter vs Arguments.

In JavaScript, function parameters and arguments are distinct concepts:

- Parameters are the names listed in the function definition.

- Arguments are the real values passed to, and received by the function.

        function sum (a, b){
            return a + b;
        }

        sum(10, 5);

  In the example above:
  - a and b are parameters
  - 10 and 5 are arguments

### Arrow Functions.

Arrow Functions allow a shorter syntax for function expressions.

You can skip the function keyword, the return keyword, and the curly brackets:

    const sum = (a, b) => a + b;

- When to use arrow function:
  - for short functions
  - for callbacks and array methods
  - when you do not need your owh `this`

- When not to use arrow functions:
  - as object methods
  - when you need your own this
  - when using function declarations

<hr />

## Objects.

Objects are variables that can store both values and functions.

Values are stored as key:value pairs called properties.

Functions are stored as key:function() pairs called methods.

For example:

    <!-- Here "car" is the object -->
    <!-- with name, model, weight and color as it's properties. -->
    const car = {
        name : "Fiat",
        model : 500,
        weight : 850,
        color : "white",
    }

    <!-- Here are examples of methods -->
    car.start();
    car.drive();
    car.brake();
    car.stop();

### Creating Objects.

An object literal is the simplest and most common way to define a JavaScript object.

    <!-- Creating an object -->
    const person = {
        firstName : "Mrinmoy",
        lastName : "Porel",
        age : 22,
        eyeColor : "brown"
    };

### Accessing Properties.

You can access object properties in two ways:

1.  Dot notation

        <!-- objectName.propertyName -->
        person.firstName;

2.  Bracket notation

        <!-- ObjectName["propertyName"] -->
        person["firstName"];

### Adding/Updating/Deleting Properties.

You can also change the value of a property.

- You can add a new property:

      person.nationality = "Indian";

- You can also update a new property:

        person.age = 25;

- You can also delete a property:

        delete person.age;

### Object Methods.

Objects can also have methods.

And methods are actions that can be performed on objects.

Object methods are function definitions stored as property values:

    const person = {
        firstName : "Mrinmoy",
        lastName : "Porel",
        age : 22,
        fullName : function(){
            return this.firstName + " " + this.lastName;
        }
    };

In the above example, `this` refers to the `person` object.

You can also access object methods using:

    <!-- ObjectName.methodsName() -->
    person.fullName();

<hr />

## Scope.

Scope = Visibility

Scope determines the accessibility (visibility) of variables.

JavaScript variables have 3 types of scope:

1.  Global scope

    Variables declared Globally (outside any block or function) have Global scope.

    Global variables can be accessed from anywhere in a JS program.

    Variables declared with `var`, `let` and `const` are quite similar when declared outside a block.

    They all have Global Scope.

        var x = 1;
        let y = 2;
        const z = 3;

2.  Function scope

    Each JS function have their own scope.

    Variables defined inside a function are not accessible (visible) from outside the function.

    Variables declared with `var`, `let` and `const` are quite similar when declared inside a function.

    They all have Function Scope.

        function car1(){
            var carName = "BMW";
        }

        function car2(){
            let carName = "BMW";
        }

        function car3(){
            const carName = "BMW";
        }

3.  Block scope

    Earlier JS variables could only have Global scope or Function scope.

    But since ES6, `let` and `const` provide Block scope in JS.

    Variables declared with `let` and `const` inside a code block are "block-scoped", meaning they are only accessible within that block.

        {
            let x = 2;
        }
        <!-- x cannot be used here -->

## JavaScript Hoisting.

In JavaScript, a variable can be declared after it has been used.

In other words, a variable can be used before it has been declared.

Example 1:

    x = 5;
    var x;

Example 2:

    var x;
    x = 5;

Example 1 gives the same result as Example 2.

Variables defined with `let` and `const` are hoisted to the top of the block, but not initialized.

Meaning: The block of code is aware of the variable, but it cannot be used until it has been declared.

Using a `let` variable before it is declared will result in a `ReferenceError`.

Using a `const` variable before it is declare, is a syntax error, so the code will simply not run.

<hr />

## Arrays.

An array is an object type designed for storing data collections.

Key characteristics of JavaScript arrays are:

- Elements: An array is a list of values, know as elements.
- Ordered: Array elements are ordered based on their index.
- Zero indexed: The first element is at index 0, the second at index 1 and so on.
- Dynamic size: Arrays can grow or shrink as elements are added or removed.
- Heterogeneous: Arrays can store elements of different data types (numbers, string, object and other arrays).

### Creating Arrays.

Using an array literal is the easiest way to create a JavaScript Array.

    const num = ["first", "second", "third"];

You can also create an empty array and provide elements later:

    const cars = [];

    cars[0] = "BMW";
    cars[1] = "Fiat";
    cars[2] = "Volvo";
    cars[3] = "Honda";

### Accessing Elements.

You can access an array element by referring to the index number.

    const cars = ["BMW", "Fiat", "Volvo", "Honda"];
    console.log(cars[2]);

### Basic Methods.

There are multiple methods you can perform using arrays. Here are some examples:

1.  Array length.

    The length property returns the length (size) of an array.

        const fruits = ["apple", "banana", "mango", "orange"];

        let size = fruits.length;

2.  Array toString()

    The `toString()` method returns the elements of an array as a comma separated string.

        const fruits = ["Banana", "Orange", "Apple", "Mango"];

        let myList = fruits.toString();

3.  Array at()

    The `at()` methods returns an index element from an array.

        const fruits = ["Banana", "Orange", "Apple", "Mango"];
        let fruit = fruits.at(2);

4.  Array join()

    The `join()` method also joins all array elements into a string.

    It behaves just like `toString`, but in addition you can specify the seperator:

        const fruits = ["Banana", "Orange", "Apple", "Mango"];
        let fruit = fruits.join(" * ");

        <!-- Output -->
        Banana * Orange * Apple * Mango

5.  Array pop()

    The pop() method removes the last element from an array:

        const fruits = ["Banana", "Orange", "Apple", "Mango"];
        fruits.pop();

    The `pop()` method returns the value that was "popped out".

6.  Array push()

    The `push()` method adds a new element to an array (at the end):

        const fruits = ["Banana", "Orange", "Apple", "Mango"];
        fruits.push("Kiwi");

    The `push()` method returns the new array length.

7.  Array delete()

        const fruits = ["Banana", "Orange", "Apple", "Mango"];
        delete fruits[0];

    - Using `delete()` leaves undefined holes in the array.

    - Use `pop()` or `shift()` instead.

8.  Array concat()

    The `concat()` method creates a new array by merging (concatenating) existing arrays:

        const myGirls = ["Cecilie", "Lone"];
        const myBoys = ["Emil", "Tobias", "Linus"];

        const myChildren = myGirls.concat(myBoys);

9.  Array slice()

    The `slice()` method slices out a piece of an array into a new array:

        const fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
        const citrus = fruits.slice(1);

10. Array splice()

    The `splice()` method can be used to add new items to an array:

        const fruits = ["Banana", "Orange", "Apple", "Mango"];
        fruits.splice(2, 0, "Lemon", "Kiwi");

<hr />

## Maps.

A JavaScript Map is an object that can store collections of key-value pairs, similar to a dictionary in other programming languages.

Maps differ from standard objects in that keys can be of any data type.

### Characteristics.

- Key Types: Map keys can be any type (strings, numbers, objects, etc).

- Insertion Order: The Map remembers the original insertion order of the keys.

- Size: The number of items in a Map is easily retrieved using the size property.

- Performance: Maps are optimized for frequent additions and removals of key-value pairs.

- Iteration: Maps are iterable, allowing for direct use of for...of loops or methods like forEach().

- Iteration Order: The original order is preserved during iteration.

### How to create a Map.

You create a JavaScript Map by:

1.  Creating a new Map and add elements with `Map.set()`

    Here's an example:

        // Create an empty Map
        const fruits = new Map();

        // Set Map Values
        fruits.set("apples", 500);
        fruits.set("bananas", 300);
        fruits.set("oranges", 200);

2.  Passing an existing Array to the `new Map()` constructor

    Here's an example:

        // Create a Map
        const fruits = new Map([
            ["apples", 500],
            ["bananas", 300],
            ["oranges", 200]
        ]);

The way you created JS Map using `set()` method, you can similarly use `get()` method:

    fruits.get("apples");
    <!-- Returns 500 -->

### When to use Objects and maps.

Difference between JavaScript Object and Maps:

| Object                           | Map                           |
| -------------------------------- | ----------------------------- |
| Not directly iterable            | Directly iterable             |
| Do not have a size property      | Have a size property          |
| Key must be strings (or symbols) | Keys can be any datatype      |
| Keys are not well ordered        | Keys are ordered by insertion |
| Have default keys                | Do not have default keys      |

<hr />

## Closures. (Basics)

Javascript variables can belong to:

- The local scope
- The global scope

Global variables can be made local (private) with closure.

Closures make it possible for a function to have "private" variables.

A closure is created when a function remembers the variables from its outer scope, even after the outer function has finished executing.

Here's an example:

    function myCounter() {
        let counter = 0;
        return function() {
            counter++;
            return counter;
        };
    }

    const add = myCounter();
    add();
    add();
    add();

    // the counter is now 3

Closures has historically been used to:

- Create private variables
- Preserve state between function calls
- Simulate block-scoping before let and const existed
- Implement certain design patterns like currying and memoization

<hr />

## Debuggin basics.

Debugging means finding and fixing mistakes (bugs) in your code.

Bugs are normal. The skill is learning how to locate them quickly.

A good debugging habit is:

1. Check the console for errors
2. Read the error message carefully
3. Log values with `console.log()`
4. Reduce the problem to a small example
5. Fix one thing at a time.

Debugging is not easy. But fortunately, all modern browsers have a built-in JavaScript debugger.

1. The browser `console` shows errors and messages from JavaScript.

   If your code "does nothing", the console often tells you why.

2. In JavaScript `console.log()` prints values to the console.

   This helps you to see what your code is doing.

3. Error messages look scary, but they usually mean one of a few common things.

   `ReferenceError`

   Means: This name does not exist.

   Often a misspelling or variable not declared.

4. `TypeError` means, you tried to use a value in an impossible way.

   Often `undefined` or `null`.

You can activate debugging in your browser with `F12` and select **Console** in the debugger menu.

<hr />

## Assignment.

1.  Create a program that takes an array of students marks `[72, 45, 90, 33, 68, 55]` as input and:
    - Count how many students passed (>= 40)
    - Count how many failed
    - Find the highest mark
    - Find the lowest mark
    - Calculate average mark

    Print results clearly.

    [Solution](./Assignment/code1.js)

2.  Create and inventory system for a small store, where each profuct shoul be an object like:

        {
            id: 1,
            name: "Laptop",
            price: 50000,
            quantity: 3
        }

    Create an array of atleast 5 products and:
    - calculate total inventory value (price \* Quantity for each item)
    - Find most expensive product & product with lowest stock.
    - create a new array that contains only products that have quantity < 5.
    - Increase price of all products by 10% using `map()`.

    [Solution](./Assignment/code2.js)

3.  Create a function : `createBankAccount(ownerName, initialBalance)` and return an object with methods:
    - deposit(amount)
    - withdraw(amount)
    - getBalance()
    - getOwner()

    **Rules**:
    1. Balance must be PRIVATE (not directly accessible)
    2. Cannot withdraw more than balance
    3. Cannot deposit negative numbers
    4. Each transaction should log a message
    5. Keep track of total number of transactions internally

    [Solution](./Assignment/code3.js)
