# List of things learned.

- **Normal functions in JS.**

    The way to write functions in JS is as follows -

    - **Find sum of two numbers.**

            function sum(a, b) {
                return a + b;
            }

            let ans = sum(2, 3)
            console.log(sum);

    - **Find sum from 1 to a number.**

            function sum(n) {
                let ans = 0;
                for (let i = 1; i <= n; i++) {
                    ans = ans + i
                }
                return ans;
            }

            const ans = sum(100);
            console.log(ans);

<hr />

- **Synchronous code.**

    Synchronous code is executed line by line, in order it's written. Each operation waits for the previous one to complete before moving on to the next one.

    For example,

        function sum(n) {
            let ans = 0;
            for (let i = 1; i <= n; i++) {
                ans = ans + i
            }
            return ans;
        }

        const ans1 = sum(100);
        console.log(ans1);
        const ans2 = sum(1000);
        console.log(ans2);
        const ans3 = sum(10000);
        console.log(ans3);

<hr />

- **I/O heavy operations.**

    Input/Output heavy operations refers to tasks in a computer program that involve a lot of data transfer between the program and external systems or devices. These operations usually require waiting for data to be read from or written to sources like disks, networks, databases or other external devices, which can be time-consuming compared to in-memory computations.

    Example of I/O heavy operations:

    - Reading a file

    - Starting a clock

    - HTTP Requests

    [Example-1](./Practise/IO-Heavy-Operations/code1.js)

    [Example-2](./Practise/IO-Heavy-Operations/code2.js)

<hr />

- **I/O bound tasks vs CPU bound tasks.**

    - **CPU bound tasks**

        CPU-bound tasks are operations that are limited by the speed and power of the CPU. These tasks require significant computation and processing power, meaning that the performance bottleneck is the CPU itself.

            let ans = 0;
            for (let i = 1; i <= 1000000; i++) {
                ans = ans + i
            }
            console.log(ans);

    - **I/O bound tasks**

        I/O-bound tasks are operations that are limited by the system’s input/output capabilities, such as disk I/O, network I/O, or any other form of data transfer. These tasks spend most of their time waiting for I/O operations to complete.

            const fs = require("fs");

            const contents = fs.readFileSync("a.txt", "utf-8");
            console.log(contents);

<hr />

- **Doing I/O bound tasks in real world.**

    What if you were tasked with doing 3 things

    - Boil some water

    - Do some laundry

    - Send a package via mail

    Would you do these

    - One by one (synchronously)

            const fs = require("fs");

            const contents = fs.readFileSync("a.txt", "utf-8");
            console.log(contents);

            const contents2 = fs.readFileSync("b.txt", "utf-8");
            console.log(contents2);

            const contents3 = fs.readFileSync("b.txt", "utf-8");
            console.log(contents3);

        ![sync-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F1f5c8758-8659-4af9-9e83-129cc504bf93%2FScreenshot_2024-08-10_at_6.35.54_PM.png?table=block&id=44149294-43d5-4614-b31f-15f8d9aa0ded&cache=v2)

    - Context swicth between them (concurrently)

    - Start all 3 task together & wait for them to finish.

            const fs = require("fs");

            fs.readFile("a.txt", "utf-8", function (err, contents) {
            console.log(contents);
            });

            fs.readFile("b.txt", "utf-8", function (err, contents) {
            console.log(contents);
            });

            fs.readFile("a.txt", "utf-8", function (err, contents) {
            console.log(contents);
            });

        ![async-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F26968ae9-1e84-4b7a-8287-660ab511cd13%2FScreenshot_2024-08-10_at_6.36.25_PM.png?table=block&id=bb6b7285-c8a2-4cb2-8412-f042c44cf956&cache=v2)

<hr />

- **Functional arguments.**

    Write a `calculator` program that adds, subtract, multiply & divides two arguments.

    - **Approach #1.** (Calling the respective function)

            function sum(a, b) {
            return a + b;
            }

            function multiply(a, b) {
            return a * b;
            }

            function subtract(a, b) {
            return a - b;
            }

            function divide(a, b) {
            return a / b;
            }

            function doOperation(a, b, op) {
            return op(a, b)
            }

            console.log(sum(1, 2))

    - **Approach #2.** (Passing in what needs to be done as an argument)

            function sum(a, b) {
            return a + b;
            }

            function multiply(a, b) {
            return a * b;
            }

            function subtract(a, b) {
            return a - b;
            }

            function divide(a, b) {
            return a / b;
            }

            function doOperation(a, b, op) {
            return op(a, b)
            }

            console.log(doOperation(1, 2, sum))

<hr />

- **Asynchronous code, Callbacks.**

    Let’s look at the code to read from a file `asynchronously`. Here, we pass in a `function` as an `argument`. This function is called a `callback` since the function gets `called back` when the file is read.

    ![async-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F7228c0d3-27b1-4a85-b374-6738f3eacf2e%2FScreenshot_2024-08-10_at_6.43.49_PM.png?table=block&id=affee6d5-62a1-43e3-bb14-17a0e27c79e0&cache=v2)

        const fs = require("fs");

        fs.readFile("a.txt", "utf-8", function (err, contents) {
        console.log(contents);
        });

    - **setTimeout**

        setTimeout is another asynchronous function that executes a certain code after some time.

            function run() {
                console.log("I will run after 1s");
            }

            setTimeout(run, 1000);
            console.log("I will run immedietely");

<hr />

- **JS Architecture for async code.**

    How JS executes asynchronous code.

    [latentflip](http://latentflip.com/loupe/)

    ![latentflip-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F6990879d-ab77-4d93-993e-90366256fe54%2FScreenshot_2024-08-10_at_7.08.49_PM.png?table=block&id=fd766e43-ff67-44fb-a1a3-92b438f25c3e&cache=v2)

    - **Call Stack**

        - The call stack is a data structure that keeps track of the function calls in your program. It operates in a "Last In, First Out" (LIFO) manner, meaning the last function that was called is the first one to be executed and removed from the stack.

        - When a function is called, it gets pushed onto the call stack. When the function completes, it's popped off the stack.

                function first() {
                console.log("First");
                }
                function second() {
                first();
                console.log("Second");
                }
                second();

    - **Web APIs**

        - Web APIs are provided by the browser (or the Node.js runtime) and allow you to perform tasks that are outside the scope of the JavaScript language itself, such as making network requests, setting timers, or handling DOM events.

    - **Callback Queue**

        The callback queue is a list of tasks (callbacks) that are waiting to be executed once the call stack is empty. These tasks are added to the queue by Web APIs after they have completed their operation.

    - **Event Loop**

        The event loop constantly checks if the call stack is empty. If it is, and there are callbacks in the callback queue, it will push the first callback from the queue onto the call stack for execution.