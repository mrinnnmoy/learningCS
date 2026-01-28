# List of things learned.

- **JavaScript - The Basics.**

    Web development involves writing a lot of HTML, CSS and JS code.

    Historically (and even today to some extend), browsers could only understand HTML, CSS and JS.

    Any website that you can see, is a bunch of HTML, CSS and JS files along with some assets (images, videos etc)

    ![img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F7ec5034a-be7d-4e01-90e8-c82713918f55%2FScreenshot_2024-08-04_at_5.56.48_PM.png?table=block&id=82c27591-39d6-4982-9c63-55cbdd90fa38&cache=v2)

<hr />

- **Facts/Callouts.**

    - React, NextJS are frameworks . They compile down to HTML, CSS, JS in the end. That is what your browser understands.
            
    - When you run your C++ code on leetcode , it does not run on your browser/machine. It runs somewhere else. Your browser can’t (almost) compile and run C++ code.

    - If someone asks — What all languages can your browser interpret, the answer is HTML, CSS, JS and WebAssembly. It can, technically, run C++/Rust code that is compiled down to Wasm.

<hr />

- **Properties of JS.**

    Every language comes with it’s unique set of features. Javascript has the following -
    
    - **Interpreted.**

        Javascript is an interpreted language, meaning it's executed line-by-line at runtime by the JavaScript engine in the browser or server environment, rather than being compiled into machine code beforehand.

        ![code-runtime-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F3e158041-21f9-4456-b8da-fb7efc1f1c72%2FScreenshot_2024-08-04_at_6.04.48_PM.png?table=block&id=cde43870-90f3-4819-b559-5a1e3a12cc85&cache=v2)

        - Upsides,

            - There is one less step to do before running your code.

        - Downside,

            - Performance overhead.

            - More prone to runtime errors.

    - **Dynamically-Types.**

         Variables in JavaScript are not bound to a specific data type. Types are determined at runtime and can change as the program executes.

         C++ code (won't compile)

            #include <iostream>

            int main() { 
            int a = 1;
            a = "hello";
            a = true;
            }

         JS code (will compile)

            var a = 1;
            a = "harkirat";
            a = true;

            console.log(a);

    - **Single Threaded.**

        JavaScript executes code in a single-threaded environment, meaning it processes one task at a time.

        ![js-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F524dfd92-1f94-472b-ade8-e988608116f7%2FScreenshot_2024-08-04_at_6.13.11_PM.png?table=block&id=3e7388e9-5708-4bfe-9d7f-8c32cc680408&cache=v2)
    
    - **Garbage Collected.**

        JavaScript automatically manages memory allocation and deallocation through garbage collection, which helps prevent memory leaks by automatically reclaiming memory used by objects no longer in use.

        ![js4-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fec5e527b-de5a-4718-b3b2-d5c4a95f279c%2FScreenshot_2024-08-04_at_6.16.07_PM.png?table=block&id=1d3a4740-c417-46c4-abce-e27475bc9d86&cache=v2)

<hr />

- **Syntax of JavaScript.**

    - Variables.

        Variables are used to store data. In JavaScript, you declare variables using `var`, `let` or `const`.

            let name = "John";     // Variable that can be reassigned
            const age = 30;        // Constant variable that cannot be reassigned
            var isStudent = true;  // Older way to declare variables, function-scoped

        [Example-1](./Practise/code1.js)
    
    - Data types.

            let number = 42;             // Number
            let string = "Hello World";  // String
            let isActive = false;        // Boolean
            let numbers = [1, 2, 3];     // Array

    - Operators.

            let sum = 10 + 5;          // Arithmetic operator
            let isEqual = (10 === 10); // Comparison operator
            let isTrue = (true && false); // Logical operator

    - Functions.

            // Function declaration
            function greet(name) {
                return "Hello, " + name;
            }

            // Function call
            let message = greet("John"); // "Hello, John"

        [Example-1](./Practise/code2.js)

        [Example-2](./Practise/code3.js)

    - If/else.

            if (age >= 18) {
                console.log("You are an adult.");
            } else {
                console.log("You are a minor.");
            }

        [Example-1](./Practise/code4.js)

    - Loops.

            // For loop
            for (let i = 0; i < 5; i++) {
                console.log(i); // Outputs 0 to 4
            }

            // While loop
            let j = 0;
            while (j < 5) {
                console.log(j); // Outputs 0 to 4
                j++;
            }

        [Example-1](./Practise/code5.js)

<hr />

- **Complex Types.**

    - Object.

        An object in JavaScript is a collection of `key-value pairs`, where each `key` is a string and each `value` can be any valid JavaScript data type, including another object.

        ![objects-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F3282ffa1-783b-478a-87d3-3bba79f09d15%2FScreenshot_2024-08-04_at_6.43.02_PM.png?table=block&id=e3a09d36-b901-4ea0-8d6f-903ab5851304&cache=v2)

            let user = {
                name: "Harkirat",
                age: 19
            }

            console.log("Harkirats age is " + user.age);

        [Example-1](./Practise/code6.js)
        
        [Example-2](./Practise/code7.js)
        
        [Example-3](./Practise/code8.js)

<hr />

- **Arrays.**

    Arrays let you group data together.

        const users = ["harkirat", "raman", "diljeet"];
        const tatalUsers = users.length;
        const firstUser = users[0];
    
    [Example-1](./Practise/code9.js)

<hr />

- **Array of objects.**

    We can have more complex objects, for example an array of objects.

        const users = [{
                name: "Harkirat",
                age: 21
            }, {
                name: "raman",
                age: 22
            }
        }

        const user1 = users[0] 
        const user1Age = users[0].age

    [Example-1](./Practise/code10.js)

<hr />

- **Object of Objects.**

    We can have an even more complex object (object of objects).

        const user1 = {
            name: "harkirat",
            age: 19,
            address: {
                city: "Delhi",
                country: "India",
                address: "1122 DLF"
            }
        }

        const city = user1.address.city;

    [Example-1](./Practise/code11.js)

<hr />

- Assignment.

    Build a simple interst calculator using html,css & js that takes capital, years & interest rate as input and displays the final amount.

    [Simple-Calculator](./Assignment/index.html)