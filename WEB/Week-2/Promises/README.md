# List of things learned.

- **Classes in JS.**

    - **Primitive types**

        - number

        - string

        - boolean

    - **Complex types**

        - Objects

        - Arrays

    In JS, classes are a way to define blueprints for creating objects.

    For example.

        class Rectangle {
        constructor(width, height, color) {
                this.width = width;
                this.height = height;
                this.color = color; 
        }
        
        area() {
            const area = this.width * this.height;
                return area;
        }
        
        paint() {
                    console.log(`Painting with color ${this.color}`);
        }
        
        }

        const rect = new Rectangle(2, 4)
        const area = rect.area();
        console.log(area)

    - Key Concepts

        - Class Declaration:

            - You declare a class using the `class` keyword.

            - Inside a class, you define properties (variables) & methods (functions) that will belong to the objects created from this class.

        - Constructor:

            - A special method inside the class that is called when you create an instance (an object) of the class.

            - It’s used to initialize the properties of the object.

        - Methods:

            - Functions that are defined inside the class and can be used by all instances of the class.

        - Inheritance:

            - Classes can inherit properties and methods from other classes, allowing you to create a new class based on an existing one.

        - Static Methods:

            - Methods that belong to the class itself, not to instances of the class. You call them directly on the class.

        - Getters & Setters:

            - Special methods that allow you to define how properties are accessed and modified.

<hr />

- **Inheritance in classes.**

    Inheritance in JavaScript classes allows one class to inherit properties and methods from another class. This mechanism enables code reuse, making it easier to create new classes that are based on existing ones, without having to duplicate code.

    - **Approach #1.** (Create a circle class)

            class Circle {
            constructor(radius, color) {
                this.radius = radius;  
                this.color = color;
            }

            area() {
                const area = this.radius * this.radius * Math.PI;
                return area;
            }
            
            paint() {
                        console.log(`Painting with color ${this.color}`);
            }

            }

            const circle = new Circle(2, "red")
            const area = circle.area();
            console.log(area)

    - **Approach #2.** (Create a base shape class)

        - Base class.

                class Shape {
                    constructor(color) {
                        this.color = color;
                    }

                    paint() {
                            console.log(`Painting with color ${this.color}`);
                    }

                    area() {
                        throw new Error('The area method must be implemented in the subclass');
                    }

                    getDescription() {
                        return `A shape with color ${this.color}`;
                    }
                }

        - Rectangle class.

                class Rectangle extends Shape {
                    constructor(width, height, color) {
                        super(color);  // Call the parent class constructor to set the color
                        this.width = width;
                        this.height = height;
                    }

                    area() {
                        return this.width * this.height;
                    }

                    getDescription() {
                        return `A rectangle with width ${this.width}, height ${this.height}, and color ${this.color}`;
                    }
                }

        - Circle class.

                class Circle extends Shape {
                    constructor(radius, color) {
                        super(color);  // Call the parent class constructor to set the color
                        this.radius = radius;
                    }

                    area() {
                        return Math.PI * this.radius * this.radius;
                    }

                    getDescription() {
                        return `A circle with radius ${this.radius} and color ${this.color}`;
                    }
                }

    Try playing with it.

        const circle = new Circle(20);
        console.log(circle.area());

<hr />

- **Some more classes.**

    - Date.

            const now = new Date(); // Current date and time
            console.log(now.toISOString()); // Outputs the date in ISO format
        
    - Maps.

            const map = new Map();
            map.set('name', 'Alice');
            map.set('age', 30);
            console.log(map.get('name'));

<hr />

- **Promise class.**

    A Promise in JavaScript is an object that represents the `eventual completion` (or failure) of an asynchronous operation and its resulting value. Promises are used to handle asynchronous operations more effectively than traditional callback functions, providing a cleaner and more manageable way to deal with code that executes asynchronously, such as API calls, file I/O, or timers.

    - Using a function that returns a promise.

        Ignore the function definition of `setTimeoutPromisified` for now

            function setTimeoutPromisified(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
            }

            function callback() {
                console.log("3 seconds have passed");
            }

            setTimeoutPromisified(3000).then(callback)

        ![promise-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F8ddf753e-e0b7-47b4-bf8e-4c6bda8cb789%2FScreenshot_2024-08-11_at_6.37.35_PM.png?table=block&id=9c1e86d5-4ea0-462b-9fbb-3314e0428be2&cache=v2)


- **Callback hell.**

    Write a code that

    - logs `hi` after 1 second

    - logs `hello` 3 seconds after `step 1`

    - logs `hello there` 5 seconds after `step 2`

    Solution:

    - has callback hell.

            setTimeout(function () {
            console.log("hi");
            setTimeout(function () {
                console.log("hello");

                setTimeout(function () {
                console.log("hello there");
                }, 5000);
            }, 3000);
            }, 1000);

    - does not have callback hell.

            function step3Done() {
            console.log("hello there");
            }

            function step2Done() {
            console.log("hello");
            setTimeout(step3Done, 5000);
            }

            function step1Done() {
            console.log("hi");
            setTimeout(step2Done, 3000);
            }

            setTimeout(step1Done, 1000);

    **Promisified Version.**

    Now use the `promisified` version we saw in above.

        function setTimeoutPromisified(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
        }

    - has callback hell.

            function setTimeoutPromisified(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
            }

            setTimeoutPromisified(1000).then(function () {
            console.log("hi");
            setTimeoutPromisified(3000).then(function () {
                console.log("hello");
                setTimeoutPromisified(5000).then(function () {
                console.log("hello there");
                });
            });
            });

    - has no callback hell.

            setTimeoutPromisified(1000)
            .then(function () {
                console.log("hi");
                return setTimeoutPromisified(3000);
            })
            .then(function () {
                console.log("hello");
                return setTimeoutPromisified(5000);
            })
            .then(function () {
                console.log("hello there");
            });

<hr />

- **Async await syntax.**

    The `async` and `await` syntax in JavaScript provides a way to write asynchronous code that looks and behaves like synchronous code, making it easier to read and maintain.
    
    It builds on top of Promises and allows you to avoid chaining `.then()` and `.catch()` methods while still working with asynchronous operations.

    `async/await` is essentially syntactic sugar on top of Promises.

    - Write a code in JS that,

        - logs `hi` after 1 second

        - logs `hello` 3 seconds after `step 1`

        - logs `hello there` 5 seconds after `step 2`

                function setTimeoutPromisified(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
                }

                async function solve() {
                    await setTimeoutPromisified(1000);
                    console.log("hi");
                    await setTimeoutPromisified(3000);
                    console.log("hello");
                    await setTimeoutPromisified(5000);
                    console.log("hi there");
                }

                solve();

        Things to keep in mind,

        - You can only call `await` inside a function if that function is `async`.

        - You can't have a `top level await`.

<hr />

- **Defining your own async function.**

    Write a function that,

    - reads the contents of a file

    - trims the extra space from the left and right

    - writes it back to the file

1. **Callback approach**

    In the callback approach, the function signature should look something like this - 

        function onDone() {
            console.log("file has been cleaned");
        }
        cleanFile("a.txt", onDone)

    - Solution

            const fs = require("fs");
            function cleanFile(filePath, cb) {
            fs.readFile(filePath, "utf-8", function (err, data) {
                data = data.trim();
                fs.writeFile(filePath, data, function () {
                cb();
                });
            });
            }

            function onDone() {
            console.log("file has been cleaned");
            }
            cleanFile("a.txt", onDone);

2. **Promisified approach**

    In the promisified approach, the function signature should look something like this - 

        async function main() {
        await cleanFile("a.txt")
        console.log("Done cleaning file");
        }

        main();

    - Solution

            const fs = require("fs");
            function cleanFile(filePath, cb) {
            return new Promise(function (resolve) {
                fs.readFile(filePath, "utf-8", function (err, data) {
                data = data.trim();
                fs.writeFile(filePath, data, function () {
                    resolve();
                });
                });
            });
            }

            async function main() {
            await cleanFile("a.txt");
            console.log("Done cleaning file");
            }

            main();

<hr />

- **err first callback vs rejects in promises.**

    - Callbacks

    `fs.readFile` function used an `err first callback` approach to propagate back errors

        const fs = require("fs")
        function afterDone(err, data) {
        if (err) {
            console.log("Error while reading file");
        } else {
            console.log(data)
        }
        }

        fs.readFile("a.txt", "utf-8", afterDone);

    - Promise

    Promises use the `reject`  argument to propagate errors

        const fs = require("fs");

        function readFilePromisified(filePath) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, "utf-8", function (err, data) {
            if (err) {
                reject("Error while reading file");
            } else {
                resolve(data);
            }
            });
        });
        }

        function onDone(data) {
        console.log(data);
        }

        function onError(err) {
        console.log("Error: " + err);
        }

        readFilePromisified("a.txt").then(onDone).catch(onError);

<hr />

- **Assignment**

    ![Week2-Promises-Assignment](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Ff9bd336e-6925-42df-88cc-d9e21b14a6b1%2FScreenshot_2024-08-11_at_6.25.44_PM.png?table=block&id=2e351175-5069-4ede-ba29-65a7eedd9aff&cache=v2)