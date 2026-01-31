# List of things learned.

## **What is DOM?**

The DOM or Document Object Model is a programming interface for web documents.

It represents the structure of a web page as a tree of objects.

![dom-image](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F9e77867b-8f87-4375-8f27-a337a97ee7b2%2FScreenshot_2024-08-17_at_4.26.44_PM.png?table=block&id=0c1c77ac-b1f9-4fdd-8d67-f2436cd1905b&cache=v2)

    <html>
        <head>
            <title>Simple app</title>
            <meta name="description" content="A brief description of the webpage content for search engines and social media.">
        </head>
        <body>
            <h1>
                hi there
            </h1>
        </body>
    </html>

![example-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fb81f1fe7-e3b7-45b0-932e-6380656d1c8b%2FScreenshot_2024-08-17_at_4.27.14_PM.png?table=block&id=9e27a75d-9faf-40d5-835c-caec9ea1b312&cache=v2)

## Why DOM?

The DOM abstracts the structure of the document into a tree of objects, allowing scripts to manipulate the content and structure dynamically.

This abstraction enables more complex interactions and functionalities beyond just static HTML.

<hr />

## **Static HTML.**

As the name suggests, `static HTML` represents HTML that does not change.

For example,

    <!DOCTYPE html>
    <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>replit</title>
        <link href="style.css" rel="stylesheet" type="text/css" />
        </head>
        
        <body>
        <h1>Todo list</h1>
        <h4>1. Take class</h4>
        <h4>2. Go out to eat</h4>
        <div>
            <input type="text"></input>
            <button>Add Todo</button>
        </div>
        <script src="script.js"></script>
        </body>
        
    </html>

If you click on the `Add Todo` button, nothing happens

![todo-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fc47f3133-5023-4ad8-b477-8c72fca99597%2FScreenshot_2024-08-17_at_5.35.13_PM.png?table=block&id=aa9edf84-269d-4a4c-b27a-254610e39af9&cache=v2)

<hr />

## **Dynamic HTML.**

How can you update the elements of the page `dynamically`?

When the user clicks on the `Add todo` button, a new TODO should be added.

![newTODO-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F5b92f338-dd9d-4657-b581-d4c1f8124ca9%2FScreenshot_2024-08-17_at_5.36.33_PM.png?table=block&id=646b7954-5df6-413d-95a8-4dd0f62f679a&cache=v2)

## document object.

In the browser, the `document` object is a fundamental part of the Document Object Model (DOM). It represents the web page currently loaded in the browser and provides a way to interact with and `manipulate` its content.

<hr />

## **Fetching Elements.**

There are 5 popular methods available for fetching DOM elements:

- querySelector
- querySelectorAll
- getElementById
- getElementByClassName
- getElementsByClassName

1. Fetching the title.

    ![title-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F32405ea3-b9b2-4dca-85fe-104329f6ad6e%2FScreenshot_2024-08-17_at_5.39.48_PM.png?table=block&id=a4652ede-6101-4dcb-b5f4-945007843aa2&cache=v2)

        const title = document.querySelector('h1);
        console.log(title.innerHTML);

2. Fetching the first TODO.

    ![first-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F96a53c36-b961-4adf-ae9f-38fd9ac4870e%2FScreenshot_2024-08-17_at_5.42.34_PM.png?table=block&id=3d216c96-4fc2-487c-a1af-a2eec7cca071&cache=v2)

        const firstTodo = document.querySelector('h4');
        console.log(firstTodo.innerHTML)

3. Fetching the `second` todo.

    ![second-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fc6711776-eb43-4f83-aaa6-721da76c2292%2FScreenshot_2024-08-17_at_5.44.15_PM.png?table=block&id=e3469432-9cd6-4b65-b2d8-ee9401e6787e&cache=v2)

        const secondTodo = document.querySelectorAll('h4')[1];
        console.log(secondTodo.innerHTML)

<hr />

## **Updating elements.**

- .innerHTML - Used for updating the `HTML` inside and element.

- .textContent - Used for updating the `text content` inside an element.

Eg: Update the first todo's content.

![update-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F241027ee-29ca-4aac-812c-58893d79ec4f%2FScreenshot_2024-08-17_at_5.42.34_PM.png?table=block&id=69409284-3277-4145-8498-26d479391e89&cache=v2)

    const firstTodo = document.querySelector("h4");
    firstTodo.innerHTML = "Dont' take class"

<hr />

## **Deleting elements.**

- removeChild - Removes a specific node of a parent

- onclick - function that triggers whenever you click on a button

Eg: Add a delete button right next to the todo that deletes that todo.

    <!DOCTYPE html>
    <html>

    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>replit</title>
    <link href="style.css" rel="stylesheet" type="text/css" />
    </head>

    <body>
    <h1>Todo list</h1>
    <div>
        <div id="todo-1">
        <h4>1. Take class</h4>
        <button onclick="deleteTodo(1)">delete</button>
        </div>
        <div id="todo-2">
        <h4>2. Go out to eat</h4>
        <button onclick="deleteTodo(2)">delete</button>
        </div>
    </div>
    <div>
        <input type="text"></input>
        <button>Add Todo</button>
    </div>
    </body>

    <script>
    function deleteTodo(index) {
        const element = document.getElementById("todo-" + index);
        element.parentNode.removeChild(element);
    }
    </script>

    </html>

Another approach:

    <html>
        <body id="body">
            <h2>Todo 1</h2>
            <h2>Todo 2</h2>
            <h2>Todo 3</h2>
            <button onclick="deleteRandomTodo()">Delete todo!</button>
        </body>
        <script>
            function deleteRandomTodo() {
                const element = document.querySelector("h2");
                const parentElement = element.parentNode;
                parentElement.removeChild(element);
            }

        </script>
    </html>

<hr />

## **Adding elements**

What we're learning -

- createElement
- appendChild

Write a function to add a TODO `text` to the list of todos.

Steps -

- Get the current text inside the input element

- Create a new `div` element

- Add the `text` from step 1 to the `div` element

- Append the `div` to the todos list

        <!DOCTYPE html>
        <html>

        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>replit</title>
        <link href="style.css" rel="stylesheet" type="text/css" />
        </head>

        <body>
        <h1>Todo list</h1>
        <div id="todos">
            <div id="todo-1">
            <h4>1. Take class</h4>
            <button onclick="deleteTodo(1)">delete</button>
            </div>
            <div id="todo-2">
            <h4>2. Go out to eat</h4>
            <button onclick="deleteTodo(2)">delete</button>
            </div>
        </div>
        <div>
            <input id="inp" type="text"></input>
            <button onclick="addTodo()">Add Todo</button>
        </div>
        </body>

        <script>
        function addTodo() {
            const inputEl = document.getElementById("inp");
            const textNode = document.createElement("div");
            textNode.innerHTML = inputEl.value;
            const parentEl = document.getElementById("todos");
            parentEl.appendChild(textNode);

        }
        </script>

        </html>

    ![adding-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F7f30661b-5052-4e15-9f94-1239b54ff2bf%2FScreenshot_2024-08-17_at_6.55.43_PM.png?table=block&id=f3a19c89-0824-49a3-801e-fb38bccab8b1&cache=v2)

<hr />

## **More Complex elements.**

Untill now, we created a simple `div` element.

    const textNode = document.createElement("div");
    textNode.innerHTML = inputEl.value;

The problem is it doesn't have a corresponding `delete` button.

![delete-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F0478828d-e281-45e4-b82f-58353be8553e%2FScreenshot_2024-08-17_at_7.05.47_PM.png?table=block&id=5962d472-3977-44d8-8eb0-951bd4ee705a&cache=v2)

- Approach #1.

        <!DOCTYPE html>
        <html>

        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>replit</title>
        <link href="style.css" rel="stylesheet" type="text/css" />
        </head>

        <body>
        <h1>Todo list</h1>
        <div id="todos">
            <div id="todo-1">
            <h4>1. Take class</h4>
            <button onclick="deleteTodo(1)">delete</button>
            </div>
            <div id="todo-2">
            <h4>2. Go out to eat</h4>
            <button onclick="deleteTodo(2)">delete</button>
            </div>
        </div>
        <div>
            <input id="inp" type="text"></input>
            <button onclick="addTodo()">Add Todo</button>
        </div>
        </body>

        <script>
        let currentIndex = 3;
        function addTodo() {
            const inputEl = document.getElementById("inp");
            const textNode = document.createElement("div");
            textNode.innerHTML = "<div id='todo-" + currentIndex + "'><h4>" + inputEl.value + '</h4><button onclick="deleteTodo(' + currentIndex + ') ">Delete</button>';
            const parentEl = document.getElementById("todos");
            parentEl.appendChild(textNode);

            currentIndex = currentIndex + 1;
        }

        function deleteTodo(index) {
            const element = document.getElementById("todo-" + index);
            element.parentNode.removeChild(element);
        }
        </script>

        </html>

- Approach #2

        <html>

        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>Todo List</title>
        <link href="style.css" rel="stylesheet" type="text/css" />
        </head>

        <body>
        <h1>Todo list</h1>
        <div id="todos">
            <div id="todo-1">
            <h4>1. Take class</h4>
            <button onclick="deleteTodo(1)">Delete</button>
            </div>
            <div id="todo-2">
            <h4>2. Go out to eat</h4>
            <button onclick="deleteTodo(2)">Delete</button>
            </div>
        </div>
        <div>
            <input id="inp" type="text">
            <button onclick="addTodo()">Add Todo</button>
        </div>

        <script>
            let currentIndex = 3;

            function addTodo() {
            const inputEl = document.getElementById("inp");
            const todoText = inputEl.value.trim();

            if (todoText === '') {
                alert('Please enter a todo item.');
                return;
            }

            const parentEl = document.getElementById("todos");

            // Create new todo div
            const newTodo = document.createElement('div');
            newTodo.setAttribute("id", 'todo-' + currentIndex);

            // Create new heading element
            const newHeading = document.createElement('h4');
            newHeading.textContent = currentIndex + '. ' + todoText;

            // Create new button element
            const newButton = document.createElement('button');
            newButton.textContent = 'Delete';
            newButton.setAttribute("onclick", "deleteTodo(" + currentIndex + ")");

            // Append elements to the new todo div
            newTodo.appendChild(newHeading);
            newTodo.appendChild(newButton);

            // Append new todo to the parent element
            parentEl.appendChild(newTodo);

            // Increment the index for the next todo item
            currentIndex++;

            // Clear the input field
            inputEl.value = '';
            }

            function deleteTodo(index) {
            const element = document.getElementById("todo-" + index);
            if (element) {
                element.parentNode.removeChild(element);
            }
            }
        </script>
        </body>

        </html>

- Code to debug.

        <html>

        <body>
        <input type="text"></input>
        <button onclick="addTodo()">Add todo!</button>
        </body>
        <script>
        let ctr = 1;
        function deleteTodo(index) {
            const element = document.getElementById(index);
            element.parentNode.removeChild(element);
        }

        function addTodo() {
            const inputEl = document.querySelector("input");
            const value = inputEl.value;

            const newDivEl = document.createElement("div");
            newDivEl.setAttribute("id", ctr);
            ctr = ctr + 1;
            newDivEl.innerHTML = "<div>" + value + '</div><button onclick="deleteTodo(' + ctr + ')">delete</button>';

            document.querySelector("body").appendChild(newDivEl)
        }
        </script>

        </html>