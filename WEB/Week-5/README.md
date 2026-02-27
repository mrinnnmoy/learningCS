# List of things learned.

## Synchronous vs Asynchronous JavaScript.

JavaScript is known for its ability to handle both synchronous and asynchronous operations. Understanding how these two things work is important for writing efficient, responsive and user-friendly applications.

### What is synchronous code?

In synchronous programming, operations are performed one after the other, in sequence.

So, basically each line of code waits for the previous one to finish before proceeding to the next.

This means that the program executes in a predictable, linear order, with each task being completed before the next one starts.

Here's an example:

    console.log("Hi");
    console.log("Geek");
    console.log("How are you?");

    <!-- Output -->
    Hi
    Geek
    How are you?

### What is asynchronous code?

Asynchronous programming, on the other hand, allows multiple tasks to run independently of each other.

In asynchronous code, a task can be initiated, and while waiting for it to complete, other tasks can proceed.

This non-blocking nature helps improve performance and responsiveness, especially in web applications.

Here's an example:

    console.log("Hi");

    setTimeout(() => {
        console.log("Geek");
    }, 2000);

    console.log("End");

    <!-- Output -->
    Hi
    End
    Geek

At first, as usual, the Hi statement got logged in.

As we use browsers to run JavaScript, there are the web APIs that handle these things for users. So, what JavaScript does is, it passes the setTimeout function in such web API and then we keep on running our code as usual.

So it does not block the rest of the code from executing and after all the code its execution, it gets pushed to the call stack and then finally gets executed.

This is what happens in asynchronous JavaScript.

<hr />

## The JavaScript Runtime & Event Loop. (Conceptual Foundation)

The event loop is an important concept in JavaScript that enables asynchronous programming by handling tasks efficiently.

Since JavaScript is single-threaded, it uses the event loop to manage the execution of multiple tasks without blocking the main thread.

### How the Event Loop Works.

The event loop continuously checks whether the call stack is empty and whether there are pending tasks in the callback queue or microtask queue.

![img](https://media.geeksforgeeks.org/wp-content/uploads/20250208123836185275/Event-Loop-in-JavaScript-768.jpg)

- **Call Stack** : JavaScript has a call stack where function execution is managed in a Last-In, First Out (LIFO) order.

- **Web APIs (or Background Tasks)** : These includes setTimeout, setInterval, fetch, DOM events and other non-blocking operations.

- **Callback Queue** : When an asynchronous operation is completed, its callback is pushed into the task queue.

- **Microtask Queue** : Promises and other microtasks go into the microtask queue, which is processed before the task queue.

- **Event Loop** : It continously checks the call stack and if empty, moves tasks from the queue to the stack for execution.

Here's an example:

    function run(){
      console.log("I will run after 3s");
    }

    setTimeout(run, 3000);
    console.log("I will run immediately");

Try running this code on [Latentflip](http://latentflip.com/loupe/) for a visual understanding.

### Phases of the Event Loop.

The event loop operates in multiple phases.

- **Timers Phase**: Executes callbacks from `setTimeout` and `setInterval`.
- **I/O Callbacks Phase**: Handles I/O operations like file reading, network requests, etc.
- **Prepare Phase**: Internal phase used by Node.js.
- **Poll Phase**: Retrieves new I/O events and executes callbacks.
- **Check Phase**: Executes callbacks from setImmediate.
- **Close Callbacks Phase**: Executes close `event callbacks`, e.g., socket.on('close').
- **Microtasks Execution**: After each phase, the event loop processes the microtask queue before moving to the next phase.

### Best Practices for Working with the Event Loop.

- **Use Asynchronous Operations**: Avoid blocking the event loop with synchronous file reads or complex calculations.
- **Optimize Long-Running Tasks**: Use worker threads or child processes for CPU-intensive tasks.
- **Use Microtasks Wisely**: Since microtasks execute before other queued tasks, excessive usage can delay other operations.
- **Leverage setImmediate() for High-Priority Tasks**: Unlike setTimeout(fn, 0), setImmediate() executes immediately after the I/O phase.
- **Debug Using Performance Tools**: Utilize Node.js Performance Hooks and the Chrome DevTools profiler to monitor the event loop behavior.

<hr />

## Callbacks.

In JavaScript, callbacks are functions that are passed as arguments from one function to another and are executed after the completion of a certain task.

They are commonly used in asynchronous operations, such as **reading files**, **making HTTP requests** or **handling user input**.

- A function can accept another function as a parameter.
- Callbacks allow one function to call another at a later time.
- A callback function can execute after another function has finished.

### Types of Callbacks.

1. **Asynchronous Callbacks**.

   Asynchronous callbacks are executed at a later time, allowing the main program to continue running without waiting.

   This is essential for preventing the application from freezing during long-running tasks like network requests.

2. **Synchronous Callbacks**.

   Synchronous Callbacks are executed immediately within the outer function, blocking further operations until completion.

   Array methods like `map()`, `filter()` and `forEach()` use synchronous callbacks.

### How do Callbacks Work in JavaScript?

JavaScript executes code line by line (synchronously), but sometimes we need to delay execution or wait for a task to complete before running the next function.

Callbacks help achieve this by passing a function that is executed later.

Here's an example:

    function greet(name, callback) {
        console.log(`Hello, ${name}!`);
        callback();  // calling the callback function
    }

    function afterGreet() {
        console.log('Greeting is complete!');
    }

    greet('Mrinmoy', afterGreet);

    <!-- Output -->
    Hello, Mrinmoy!
    Greeting is complete!

In this example:

- `greet()` accepts a name and a callback function afterGreet.
- After printing the greeting message, it calls `afterGreet()`, indicating that the greeting process is complete.

### Problem with Callbacks.

1.  **Callback Hell** (Pyramid of Doom.)

    When multiple asynchronous operations depend on each other, callbacks get deeply nested, making the code hard to read and maintain.

        getUser(userId, (user) => {
            getOrders(user, (orders) => {
                processOrders(orders, (processed) => {
                    sendEmail(processed, (confirmation) => {
                        console.log("Order Processed:", confirmation);
                    });
                });
            });
        });

    The indentation increases with each level, making the code difficult to follow.

2.  **Error Handling in Mested Callbacks**.

    Handling errors in nested callbacks is complex, as you must check for errors at each level manually.

        readFile("data.txt", (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }
            parseData(data, (err, result) => {
                if (err) {
                    console.error("Error parsing data:", err);
                    return;
                }
                console.log("Parsed data:", result);
            });
        });

    Each function must handle errors separately, leading to repetitive code.

<hr />

## Callback hell.

Callback Hell in JavaScript can be defined as the situation where we have nested callbacks(functions passed as arguments to other functions) which makes the code difficult to read and debug.

The term "callback hell" describes the deep nesting of functions that can result in poor code readability and difficulty in debugging, especially when handling multiple asynchronous operations.

For example:

    function task1(callback) {
        setTimeout(() => {
            console.log("Task One completed");
            callback();
        },);
    }

    function task2(callback) {
        setTimeout(() => {
            console.log("Task Two completed");
            callback();
        },);
    }

    task1(function () {
        task2(function () {
            console.log("Both tasks completed");
        });
    });

    <!-- Output -->
    Task One completed
    Task Two completed
    Both tasks completed

In this example:

- The two tasks (task1 and task2) are executed one after the other.
- Each task has a callback that triggers the next task, causing the callback to be nested inside the other, leading to Callback Hell.

### Causes of Callback Hell in JavaScript.

JavaScript handles asynchronous tasks in the background using callbacks, but chaining many dependent operations can make the code complex and hard to manage.

- Asynchronous tasks run without blocking the main execution flow.
- Operations like data fetching, file reading, and timers complete later.
- A callback function handles the result once an operation finishes.
- Sequential dependencies force callbacks to be nested inside one another.
- Excessive nesting increases complexity and leads to Callback Hell.

### Drawbacks of Callback Hell in JavaScript.

- **Difficult to Read**: In callback hell there is the nested callbacks due to which the code becomes hard to understand.
- **Hard to Maintain**: When we try to add some new features or make changes in the nested callback it becomes challenging.
- **Error Handling**: With deeply nested callbacks error handling becomes more difficult.

### Solution to Callback Hell.

1.  **Modularizing Code.**

    We should break down the code into small parts and reusable functions. This will reduce the depth of nesting of the function making it easier to understand.

    Here's an example:

        function getData(callback) {
            getDataFromAPI(callback);
        }

        function parseAndProcessData(data, callback) {
            parseData(data, function (parsedData) {
                processData(parsedData, callback);
            });
        }

        getData(function (data) {
            parseAndProcessData(data, function (finalData) {
                saveData(finalData, function (savedData) {
                    sendEmail(savedData, function (response) {
                        console.log('Email sent!', response);
                    });
                });
            });
        });

2.  **Promises.**

    Promises can help handle the asynchronous code. Promises represent the failure of an asynchronous operation.

    Here's an example:

        getDataFromAPI()
            .then(parseData)
            .then(processData)
            .then(saveData)
            .then(sendEmail)
            .then(response => {
                console.log('Email sent!', response);
            })
            .catch(error => {
                console.error('Error:', error);
            });

3.  **Async/Await**

    Async/Await was introduced in ES8, which simplifies the syntax for working the promises. With async/await, we can write asynchronous code that looks like synchronous code, making it more readable and easier to manage.

    Here's an example:

        async function handleData() {
            try {
                const data = await getDataFromAPI();
                const parsedData = await parseData(data);
                const processedData = await processData(parsedData);
                const savedData = await saveData(processedData);
                const response = await sendEmail(savedData);
                console.log('Email sent!', response);
            } catch (error) {
                console.error('Error:', error);
            }111111111111111111
        }

        handleData();

### Callback vs Callback Hell.

| Feature         | Callback                                                                                      | Callback Hell                                                                           |
| --------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Definition      | A function is passed to another function to execute after an asynchronous operation.          | A scenario where multiple nested callbacks lead to deeply indented, hard-to-read code.  |
| Readability     | Generally easy to read and understand when used sparingly.                                    | Difficult to read due to deep nesting and indentation, forming a "pyramid of doom."     |
| Maintainability | Relatively easy to maintain in simple cases.                                                  | Hard to maintain and update due to complex, nested structure.                           |
| Debugging       | Easier to debug when isolated in simple, flat structures.                                     | Difficult to debug, as tracing errors through deeply nested callbacks is challenging.   |
| Use Case        | Suitable for handling simple asynchronous tasks like reading a file or making an API request. | Often occurs in situations where multiple asynchronous operations depend on each other. |

<hr />

## Promises.

JavaScript Promises make handling asynchronous operations like API calls, file loading or time delays easier.

Think of a Promise as a placeholder for a value that will be available in the future.

It can be in 1 of 3 states:

- **Pending**: The task is in the initial state.
- **Fulfilled**: The task was completed successfully, and the result is available.
- **Rejected**: The task failed, and an error is provided.

### Benefits of Promises.

- **Avoid Callback Hell** : Promises organize asynchronous code more neatly than nested callbacks.

- **Error Handling** : Errors can be caught in one place using .catch() Method.

- **Chaining** : Perform tasks sequentially with .then() Method/

### Creating a Promise.

The Promise constructor takes a function with two parameters.

    let myPromise = new Promise(function(resolve, reject){
        <!-- Code that may take some time -->

        resolve(value); // when successfuk
        reject(value); // when error
    });

| Parameter | Description                               |
| --------- | ----------------------------------------- |
| resolve   | function to run if finishes successfully  |
| reject    | function to run if finishes with an error |

### Using a Promise.

A Promise contains both the **producing code** and calls to the **consuming code**.

    // Create a Promise Object
    let myPromise = new Promise(function(resolve, reject) {
    ok = false;

    // Code that may take some time (Producing code)

    if (ok) {
        resolve("OK");
    } else {
        reject("Error");
    }
    });

    // Using then() to display the result (Consuming code)
    myPromise.then(
    function(value) {myDisplayer(value);},
    function(value) {myDisplayer(value);}
    );

When the producing code obtains the result, it should call one of the two callbacks:

| When    | Call           |
| ------- | -------------- |
| Success | resolve(value) |
| Error   | reject(value)  |

### Core Methods and Usage.

Promises are consumed using methods attached to the promise object:

- **.then(onFulfilled, onRejected)**:
  This method attaches handlers for both the fulfillment and rejection cases. It returns a new promise, which enables method chaining.

- **.catch(onRejected)**:
  This is a shorthand for .then(null, onRejected) and is typically used to handle errors at the end of a promise chain.

- **.finally(onFinally)**:
  This handler is called when the promise is settled (either fulfilled or rejected), regardless of the outcome. It's useful for cleanup operations.

### Returning a Promise.

You do not read a promise result immediately.

You attach code that runs when the promise finishes.

`then()` runs when a promise is fullfilled.

`catch()` runs when a promise is rejected.

    let promise = Promise.reject("Error");

    promise
    .then(function(value) {
    console.log(value);
    })
    .catch(function(value) {
    myDisplayer(value);
    });

At the same time, Promises become powerful when you return a promise from `then()`, creating a clean chain.

For example:

    // Three functions to run in steps
    function step1() {
    return Promise.resolve("A");
    }
    function step2(value) {
    return Promise.resolve(value + "B");
    }
    function step3(value) {
    return Promise.resolve(value + "C");
    }

    // Run the three functions in steps
    step1()
    .then(function(value) {
    return step2(value);
    })
    .then(function(value) {
    return step3(value);
    })
    .then(function(value) {
    myDisplayer(value);
    });

Similarly you can handle errors at the end of the chain.

A single `catch()` can catch errors from any step above.

    step1()
    .then(function(value) {
    return step2(value);
    })
    .then(function(value) {
    return step3(value);
    })
    .catch(function(error) {
    console.log(error);
    });

This is one reason promises are easier than many nested callbacks.

### Promise API Static Methods.

JavaScript also provides static methods on the Promise object for handling multiple promises at once:

- **Promise.all(iterable)**:
  Fulfills when all promises in the iterable are fulfilled; rejects immediately if any promise rejects.

- **Promise.allSettled(iterable)**:
  Waits for all promises to settle (either fulfill or reject) and returns an array of their results.

- **Promise.race(iterable)**:
  Settles (fulfills or rejects) as soon as any of the promises in the iterable settles.

- **Promise.any(iterable)**:
  Fulfills as soon as any promise in the iterable fulfills; rejects if all promises reject.

### JavaScript Promise Example.

To demonstrate the use of promises, let's use an example:

- Waiting for a Timeout:
  1.  Example using callback.

            // Wait 3 seconds, then call myFunction
            setTimeout(function () {
                myFunction("Hello World !!!");
            }, 3000);

            function myFunction(value) {
                console.log(value);
            }

  2.  Example using Promise.

            let myPromise = new Promise(function (myResolve, myReject) {
                setTimeout(function () {
                    myResolve("Hello World !!");
                }, 3000);
            });

            myPromise.then(function (value) {
                console.log(value);
            });

<hr />

## Async/Await.

`async` and `await` make promises easier.

Here's how a Promises example looks like,

    // Three functions to run in steps
    function step1() {
        return Promise.resolve("A");
    }
    function step2(value) {
        return Promise.resolve(value + "B");
    }
    function step3(value) {
        return Promise.resolve(value + "C");
    }

    // Run the three functions in steps
    step1()
        .then(function(value) {
        return step2(value);
    })
        .then(function(value) {
        return step3(value);
    })
        .then(function(value) {
        myDisplayer(value);
    });

The same flow with `asycn` and `await` is easier to read.

    // Function to run the three functions in steps
    async function run() {
        let v1 = await step1();
        let v2 = await step2(v1);
        let v3 = await step3(v2);
        myDisplayer(v3);
    }

    run();

### The async keyword.

The `async` keyword is written before a function that helps the function return a promise.

The result is handled with `then()` because it is a promise:

    async function myFunction() {
        return "Hello";
    }
    myFunction().then(
        function(value) {myDisplayer(value);}
    );

### The await keyword.

The `await` keyword makes a function pause the execution and wait for a resolved promise before it continue:

    function step1() {
        return Promise.resolve("A");
    }

    async function run() {
        let value = await step1();
        myDisplayer(value);
    }

    run();

The `await` keyword can only be used inside an `async` function.

### Handling errors using try...catch

Promises use `catch()` for errors.

`asycn` and `await` use `try...catch`.

Here's an example:

    function fail() {
        return Promise.reject("Failed");
    }

    async function run() {
    try {
        let value = await fail();
        console.log(value);
    }   catch (error) {
        console.log(error);
        }
    }

    run();

### Sequential vs Parallel.

Awaiting one by one runs tasks in sequence.

This is correct when one step depends on the previous step.

    async function run() {
        let a = await step1();
        let b = await step2();
        console.log(a, b);
    }

If tasks do not depend on each other, you can run them in paralle.

Use `Promise.all()` to wait for both.

    async function run() {
        let p1 = step1();
        let p2 = step2();
        let values = await Promise.all([p1, p2]);
        console.log(values);
    }

### Real example with fetch.

`fetch()` returns a promise.

This makes it a perfect example for `async` and `await`.

    async function loadData() {
        try {
            let response = await fetch("data.json");
            let data = await response.json();
            console.log(data);
    }   catch (error) {
            console.log(error);
        }
    }

    loadData();

    This is promise-based async code written in a synchronous style.

<hr />

## Fetch API.

The Fetch API is a modern interface in JavaScript that allows you to make HTTP requests.

It replaces the older XMLHttpRequest method and provides a cleaner and more flexible way to fetch resources asynchronously.

The Fetch API uses Promises, making it easier to work with asynchronous data.

### Syntax.

    fetch(url, options)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

- **url**: The API endpoint from which data is fetched.
- **options (optional)**: Specifies method, headers, body, etc.
- **response.json()**: Parses the response as JSON.
- **.catch(error)**: Handles any errors that occur during the request.

### How Fetch API Works?

- A request is sent to the specified URL.
- The server processes the request and sends a response.
- The response is converted to JSON (or another format) using .json().
- Errors are handled using .catch() or try-catch blocks.

### Common HTTP Request Methods in Fetch API.

- **GET**: This request helps to retrieve some data from another server.
- **POST**: This request is used to add some data onto the server.
- **PUT**: This request is used to update some data on the server.
- **DELETE**: This request is used to delete some data on the server.

### Making a GET request (Basic Fetch Request).

A simple GET request to fetch data from and API.

    fetch('https://fakestoreapi.com/products/1')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

- `fetch()` sends an HTTP request to the specified URL.
- `.json()` parses the response body as JSON.
- `.then()` handles the resolved promise with the fetched data and `.catch()` catches any errors (e.g., network issues).

### Using async/await with Fetch API.

Using async/await makes handling asynchronous code like fetch cleaner and more readable.

It allows you to write code that appears synchronous while still being non-blocking.

    async function getP() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            if (response.ok) {
                const data = await response.json();
                console.log(data);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    getP()

- **async function getP()**: This defines an asynchronous function, meaning it can handle tasks like fetching data without blocking the rest of the program.
- **await fetch()**: The await keyword pauses the function until the fetch() request is complete, so the data can be used right after it’s retrieved.
- **response.ok**: Checks if the fetch request was successful by ensuring the response status is in the 200-299 range.
- **await response.json()**: If the response is successful, it converts the data from the server (usually in JSON format) into a JavaScript object.
- **try/catch block**: Catches any errors that may happen (like network problems) and logs them, preventing the program from crashing.

### Handling Response Status Codes.

When making an HTTP request, handling response status codes is crucial for determining whether the request was successful or if there was an error.

The status code provides information about the result of the request.

    // Example of using fetch() to get data from an API
    // Note: The link used here (https://api.example.com/data) is just a placeholder.
    // It’s not a real API, so this code will NOT show any output in the console.

    fetch('https://api.example.com/data')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => console.log(data))
        .catch(error => console.error('There was a problem with the fetch operation:', error));

- **fetch()**: Initiates a network request to the provided URL.
- **response.ok**: Checks if the HTTP response status is in the range of 200–299, indicating success.
- **return response.json()**: If the response is successful, the data is parsed as JSON for further use.
- **throw new Error()**: If the status code indicates an error (e.g., 404 or 500), an error is thrown to handle it.
- **catch(error)**: Catches any errors (network or HTTP issues) and logs them to the console for debugging.

### Handling Errors in Fetch API.

When making requests with fetch(), errors can occur due to network issues or invalid responses.

Proper error handling ensures a smooth user experience.

    // Example of using fetch() to get data from an API
    // Note: The link used here (https://api.example.com/data) is just a placeholder.
    // It’s not a real API, so this code will NOT show any output in the console.

    fetch('https://api.example.com/data')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log('Data:', data))
    .catch(error => console.error('Fetch error:', error.message));

- **Fetching Data**: The fetch('https://api.example.com/data') call requests data from the API.
- **Checking for Errors**: The .then(response => { ... }) block checks if response.ok is true. If not, it throws an error with the status code.
- **Parsing JSON**: If successful, response.json() converts the response into JSON format.
- **Logging Data**: The .then(data => console.log('Data:', data)) logs the received data.
- **Handling Errors**: The .catch(error => console.error('Fetch error:', error.message)) captures and logs errors.

### Handling Different Request Methods.

1.  GET Request to Retrieve Data.

    Fetching a list of items from an API.

        fetch('https://fakestoreapi.com/products/1')
            .then(response => response.json())
            .then(items => console.log(items));

    - fetch() sends the GET request to the specified URL.
    - The response.json() method parses the JSON response.
    - .then() logs the list of items once they are fetched.

2.  POST Request to Submit Data.

    Sending data to an API using POST.

        const data = { name: 'Pranjal', age: 25 };
        fetch('https://fakestoreapi.com/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => console.log(result));

    - The method: 'POST' tells Fetch to send data to the server.
    - The headers include the Content-Type to indicate we are sending JSON.
    - The body contains the data to be sent, which is stringified using JSON.stringify().

3.  PUT Request to Update Data.

    Updating existing user information.

    const updatedData = { id: 1, price: 300 };

        fetch('https://fakestoreapi.com/products/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
            .then(response => response.json())
            .then(result => console.log(result));

    - The method: 'PUT' indicates we are updating data.
    - The body sends the updated data, converted to JSON.
    - The response is parsed as JSON, and the updated result is logged.

4.  DELETE Request to Remove Data.

    Deleting a user from an API.

        fetch('https://fakestoreapi.com/products/1', {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => console.log('Deleted:', result));

    - method: 'DELETE' indicates that we want to delete the specified resource.
    - The response is parsed as JSON to confirm the deletion.
    - The result is logged to indicate the operation was successful.

<hr />

## Error Handling in Asynchronous Code.

Async code often fails after your function has already returned.

This makes it feel like nothing happened.

For example:

    async function loadData() {
    let response = await fetch("missing.json");
    let data = await response.json();
    console.log(data);
    }

    loadData();
    console.log("Done");

The `Done` message prints even if the fetch fails later.

- **Rule 1: Always Handle Errors**

  Unhandled promise rejections confuse beginners.

  Handle errors early and clearly.

        async function loadData() {
        try {
                let response = await fetch("missing.json");
                let data = await response.json();
                console.log(data);
            } catch (error) {
            console.log(error);
            }
        }

  This catches network errors and JSON parsing errors.

- **Rule 2: Check response.ok**

  Fetch does not reject on HTTP errors like 404.

  You must check `response.ok`.

        async function loadData() {
        try {
            let response = await fetch("missing.json");

            if (!response.ok) {
            console.log("HTTP Error:", response.status);
            return;
            }

            let data = await response.json();
            console.log(data);
        } catch (error) {
            console.log("Network error");
        }
        }

  This separates HTTP errors from network errors.

- **Rule 3: Log the Right Things**

  Logging a promise is not the same as logging the data.

  Log the response and status first.

        async function loadData() {
        let response = await fetch("data.json");
        console.log(response.status);
        console.log(response.headers.get("content-type"));
        }

  This tells you if the server returned what you expected.

### Debugging Checklist.

- Check the console for errors.
- Add `try...catch` around awaited code.
- Check `response.ok` and `response.status`.
- Use the Network tab.
- Use breakpoints on `await` lines.

<hr />

## Axios vs Fetch.

**Fetch** and **Axios** are commonly used in web applications to make HTTP requests from the frontend to the backend.

While Fetch is built into modern browsers, Axios is a popular library known for its simplicity and extra features.

Both can handle the same tasks like sending and receiving data.

Here's an example:

    axios.get('url')
    .then((response) => {
        // Code for handling the response
    })
    .catch((error) => {
        // Code for handling the error
    })

- The axios.get() method makes a GET request to the specified URL and returns a promise.
- The .then() method handles the successful response, while .catch() handles any errors that occur during the request.

Here's a quick comparison between Axios and Fetch.

| Axios                                                   | Fetch                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Third-party library that needs installation.            | Built-in browser API, no installation needed.                                        |
| Request URL is included in the request/response object. | You manually define and track the URL.                                               |
| Has built-in XSRF protection.                           | No built-in XSRF protection.                                                         |
| Uses data to send and receive content.                  | Uses body for sending data.                                                          |
| Sends JavaScript objects directly.                      | Data must be stringified using JSON.stringify().                                     |
| Automatically parses JSON responses.                    | You must call .json() to parse the response.                                         |
| Returns error only when status is not in the 200 range. | Requires manual check of response.ok for errors.                                     |
| Supports request timeout and cancellation.              | Supports cancellation via AbortController, but no built-in timeout.                  |
| Can intercept requests/responses easily.                | No native intercept support.                                                         |
| Built-in support for download/upload progress.          | No built-in progress support.                                                        |
| Widely supported in all browsers.                       | Supported in modern browsers only (Chrome 42+, Firefox 39+, Edge 14+, Safari 10.1+). |
| Ignores body in a GET request.                          | Allows body in GET request (though not recommended).                                 |

### When to Use Fetch.

Fetch is a great choice if you prefer a lightweight, native solution without the need for additional libraries.

- **Native Solution**: Fetch is built into modern browsers, so no installation is needed.
- **Lightweight**: If you prefer minimal dependencies, Fetch keeps your codebase slim.
- **Custom Error Handling & Parsing**: You’ll need to manually handle error catching and JSON parsing, but this gives more control.

### When to Use Axios.

Axios is perfect if you need more advanced features and a higher level of convenience in handling requests.

- **Request/Response Interceptors**: Easily handle requests and responses before they are sent or after they are received.
- **Automatic JSON Parsing**: Axios automatically converts JSON responses, saving you time.
- **Request Cancellation**: You can stop requests when needed.
- **Timeout Handling**: Set a timeout for requests to avoid hanging indefinitely.
- **Progress Tracking**: Easily track file uploads or downloads.
- **Simplified Error Handling**: Axios simplifies the process of catching and managing errors.

<hr />

## Practical Patterns.

Practical API patterns enhance frontend resilience and user experience by managing data fetching states and optimizing network traffic.

Key techniques include using loading spinners during requests, bundling concurrent API calls (Promise.all), implementing exponential backoff for retries, setting request timeouts, and utilizing debouncing or throttling to control input-driven API calls.

- **Loading Indicators**: Display UI loaders (spinners, skeletons) immediately when a request starts and hide them in a finally block to ensure they disappear regardless of success or failure.

- **Handling Multiple API Calls**:
  - Parallel: Use Promise.all([api1(), api2()]) to fire multiple independent requests simultaneously, decreasing total loading time.
  - Sequential (Chaining): Use async/await to pass the output of one API to the next.
  - Caching: Use shareReplay (RxJS) or similar caching mechanisms to prevent redundant API calls.

- **Retry Logic Basics**: Implement "retry-with-delay" for transient network failures. Use exponential backoff (e.g., wait 1s, 2s, 4s) to avoid overwhelming the server.

- **Timeout Handling**: Set a maximum time limit for requests to prevent infinite loading spinners. If the API doesn't respond within the budget, abort the request and show an error.

- **Debouncing (Concept)**: Delays function execution until a user stops interacting for a specified time (e.g., waiting 300ms after a user stops typing in a search box before calling the API).

- **Throttling (Concept)**: Limits the number of function executions over time (e.g., allowing an API call at most once every 1 second, even if the user is scrolling continuously).

<hr />

## Assignment.

1.  Write a single JS file that:
    - Logs synchronous messages
    - Uses `setTimeout`, `Promise.resolve().then()`, `async/await`
    - Logs output in a very specific order

    **Requirements**:

    Your program must include:
    - At least:
      - 2 `setTimeout`
      - 2 `Promise.then`
      - 1 async function
    - Nested Promise inside a `then`
    - At least one `await`

    [Solution](./Assignment/code1.js)

2.  Build a small app that:
    - fetched data from a public API: [Link](https://jsonplaceholder.typicode.com/users)
    - Displays (Name, Email, Company)
    - Handles (Network errors, HTTP errors, JSON parsing errors)

    **Requirements**:
    - Loading State (Display): `Loading...`
    - Error Handling (If):
      - Network fails -> show "Network Error"
      - Status is not 200 -> show "API Error"
      - JSON fails -> show "Data Parsing Error"
    - Add a "Reload" button:
      - It fetches again
      - Cancels old requests
      - Updates UI cleanly

    [Solution](./Assignment/code2.js)

3.  Create 5 fake async tasks:

        function fakeApiCall(id, delay) {
        return new Promise((resolve) => {
            setTimeout(() => {
            resolve(`Task ${id} completed`);
            }, delay);
        });
        }

    - **Sequential Execution**.

      Write a function that (use `async/await`):
      - Runs tasks one after another
      - waits for each to complete before starting next
      - Logs total time taken

    - **Parallel Execution**.

      Write a function that:
      - Runs all tasks at the same time
      - Uses `Promise.all`
      - Logs total time taken

    - **Failure Handling**.

      Modify one task to randomly fail:

            if (Math.random() > 0.7) reject("Task failed");

      Now:
      - Handle failure in sequential version
      - Handle failure in parallel version
      - Show difference in behaviour

    [Solution](./Assignment/code3.js)
