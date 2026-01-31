# List of things learned.

## **Complex DOM Manipulation.**

**Creating a DOM element which has another DOM element inside.**

Lets write some code in which you have a button. When you click on a button, a slightly complex DOM element gets appended to the DOM.

    <div>
        <h1>hi there<h1>
    </div>

- Approach #1.

        <body>
            <button onclick="createComplexDomElement()">Add</button>
        </body>
        <script>
            function createComplexDomElement() {
                const div = document.createElement("div");
                div.innerHTML = "<h1> hi there </h1>";
                document.querySelector("body").appendChild(div);
            }
        </script>

Lets look at a slightly better approach of doing the same thing.

- Approach #2

        <body>
            <button onclick="createComplexDomElement()">Add</button>
        </body>
        <script>
            function createComplexDomElement() {
                const div = document.createElement("div");
                const h1 = document.createElement("h1");
                h1.innerHTML = "random text";
                div.appendChild(h1);
                document.querySelector("body").appendChild(div);
            }
        </script>

    ![img1](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F06a2060f-f01e-4e10-adb0-52f13a4d11f5%2FScreenshot_2024-08-18_at_3.37.33_PM.png?table=block&id=2d38f04c-ef12-4e7f-8225-513cd8b29335&cache=v2)

    ![img2](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F2e8a1937-8ef2-461c-9153-4235eceeb123%2FScreenshot_2024-08-18_at_3.38.05_PM.png?table=block&id=89e4bf5d-4f99-4fa7-857e-e4727e24b986&cache=v2)

<hr />

## **State derived frontends.**

To make frontends easier to code, the concept of `state` came into the picture. You will see this more when we reach react.

There are three `jargon` we need to understand:

- State : The `variable` parts of an app.
- Components : How to `render`  `state` on screen.
- Rendering : Taking the `state` and rendering it on the `DOM` based on the `components`

![state-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Ff430c97d-e547-44f0-8a37-385d647e773d%2FScreenshot_2024-08-18_at_4.35.34_PM.png?table=block&id=d4099d9a-b465-4c27-a855-787772f29907&cache=v2)

Example 1 (ToDo App):

- State

        const todos = [{
        id: 1,
        description: "Go to gym"
        }, {
        id: 2,
        description: "Eat food"
        }];

- Component

        function todoComponent(todo) {
            const div = document.createElement("div");
            const h1 = document.createElement("h1");
            const button = document.createElement("button");
            button.innerHTML = "Delete";
            h1.innerHTML = todo.title;
            div.appendChild(h1);
            div.appendChild(button);
        }

![todo-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fb37a80ea-6de4-4585-84cf-7b6e50c15430%2FScreenshot_2024-08-18_at_4.40.01_PM.png?table=block&id=0f18c83f-f781-4542-9aac-7a9e847ec8e7&cache=v2)

Example 2 (Linkedin Topbar):

![topbar-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2F9bd65af7-f6d9-4b88-ab07-9a0e50f0a416%2FScreenshot_2024-08-18_at_6.12.31_PM.png?table=block&id=3c53d9f0-da95-4432-b01e-f37ddcdd90b7&cache=v2)

- State

        const state = {
            notifications: {
                home: 0,
                myNetwork: "99+",
                jobs: 0,
                messaging: 0,
                notifications: 25
            },
            profilePicture: "https://media.licdn.com/dms/image/v2/C5603AQFbOqG9og1S5g/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1517251238138?e=1729728000&v=beta&t=xHUuE_3gkUPXYajsv8fk_kv37oB49Mqbi20IVAjn_rw"
        }

- Components

    ![component-img](https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F085e8ad8-528e-47d7-8922-a23dc4016453%2Fc62d9d74-ee56-40e9-af68-f6ed3f395bbb%2FScreenshot_2024-08-18_at_6.15.11_PM.png?table=block&id=f8c01a69-5505-471e-94ee-340cd2b9aca6&cache=v2)

<hr />

## **State derived rendering.**

Given a state variable called `todos`, can you write a function called `render` that takes this as an input and `renders` the current list of todos.

Todos look something like this - 

    const todos = [{
        id: 1,
        title: "Go to gym"
    }, {
        id: 2,
        title: "Clean the car"
    }]

Boilerplate code:

    <body>
    <div id="root"></div>
    <script>
        function render(todos) {
        // your code here
        }
    </script>
    </body>

- Approach #1 (Clean the screen everytime we re-render)

        <body>
        <div id="root"></div>
        <script>
            function render(todos) {
            const todoList = document.getElementById('root');
            todoList.innerHTML = ''; // Clear the list

            todos.forEach(todo => {
                const div = document.createElement('div');
                const h1 = document.createElement('h4');
                h1.textContent = todo.title;
                div.appendChild(h1);
                div.setAttribute('data-id', todo.id);
                todoList.appendChild(div);
            });
            }
            render([{
            id: 1,
            title: "Go to gym"
            }, {
            id: 2,
            title: "Clean the car"
            }])
        </script>
        </body>