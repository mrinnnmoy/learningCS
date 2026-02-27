# List of things learned.

## Understanding the DOM.

The HTML Document Object Model is an Object Model for HTML Documents.

![DOM-img](https://www.w3schools.com/js/img_htmltree_800.png)

A tree of nodes that represents an HTML page.

When a web page loads, the browser creates a tree-like representation of the HTML document.

Each part of the document are nodes in the tree:

| Node      | Description                        |
| --------- | ---------------------------------- |
| Document  | Owner of all nodes in the document |
| `<html>`  | Element Node                       |
| `<head>`  | Element Node                       |
| `<body>`  | Element Node                       |
| `<a>`     | Element Node                       |
| `href`    | Attribute Node                     |
| `<h1>`    | Element Node                       |
| My Header | Text Node                          |

### HTML DOM API.

The DOM API (Application programming Interface) is a set of Methods and Properties that allow JavaScript to change the content, structure and style of any elements.

An API works an an action that you can do on an HTML element.

An API Property is a value that you can access on an HTML element.

For example:

    <html>
    <body>

    <p id="demo"></p>

    <script>
    // Access a paragraph Element
    const myPara = document.getElementById("demo");

    // Change the content of the Element
    myPara.innerHTML = "Hello World!";
    </script>

    </body>
    </html>

Here:

- `document` is the HTML document.
- `getElementById()` is a document method.
- `myPara = getElementById("demo")` retrieves the "demo" element.
- `innerHTML` is an element property.
- `myPara.innerHTML = "Hello World!` changes the property.

### HTML DOM API Abilities.

The HTML DOM API provides us with the ability to:

- Find and select elements
- Change element content and attributes
- Add, remove or modify elements
- Change css styles
- Add event listners to react to user input

### API Methods and Properties.

Developers use global objects like **document** and **window** as entry points to any API.

If you want to access any element in an HTML page, you always start with accessing the document object. The **document Object** represents your web page.

To mainpulate HTML with JavaScript, you first need to **select and element**.

Below are some examples of how you can use the document object to access HTML:

<hr />

## Selecting & Modifying Elements.

| Method                                | Description                                        |
| ------------------------------------- | -------------------------------------------------- |
| document.getElementById(id)           | Find an element by element id                      |
| document.getElementsByTagName(name)   | Find elements by tag name                          |
| document.getElementsByClassName(name) | Find elements by class name                        |
| document.querySelector(selector)      | Find the first element that matches a CSS selector |
| document.querySelectorAll(selector)   | Find all elements that match a CSS selector        |

### Accessing Element Content.

| Property            | Description                    |
| ------------------- | ------------------------------ |
| element.innerHTML   | The HTML content of an element |
| element.textContent | The text content of an element |

### Accessing Element Attributes.

| Property               | Description                                   |
| ---------------------- | --------------------------------------------- |
| element.attribute      | Change the attribute value of an HTML element |
| element.style.property | The style of an HTML element                  |

### Changing Element Attributes.

| Method                 | Description                   |
| ---------------------- | ----------------------------- |
| element.setAttribute() | Create or set a new attribute |

### Manipulating Structures.

| Method                   | Description                |
| ------------------------ | -------------------------- |
| document.createElement() | Creates a new HTML element |
| document.removeChild()   | Remove an HTML element     |
| document.appendChild()   | Add an HTML element        |
| document.replaceChild()  | Replace an HTML element    |

### Adding Event Handlers.

| Method                                                 | Description                                   |
| ------------------------------------------------------ | --------------------------------------------- |
| document.getElementById(id).onclick = function(){code} | Adding event handler code to an onclick event |

<hr />

## Creating, Removing & Replacing Elements.

1.  Creating New HTML Elements. (Nodes)

    To add a new element to the HTML DOM, you must create the element (element node) first and then append it to an existing element.

    Here's an example:

        <div id="div1">
          <p id="p1">This is a paragraph.</p>
          <p id="p2">This is another paragraph.</p>
        </div>

        <script>
        const para = document.createElement("p");
        const node = document.createTextNode("This is new.");
        para.appendChild(node);

        const element = document.getElementById("div1");
        element.appendChild(para);
        </script>

    - This code creates a new `<p>` element: `const para = document.createElement("p");`

    - To add text to the `<p>` element, you must create a text node first. This code creates a text node: `const node = document.createTextNode("This is a new paragraph.");`

    - Then you must append the text node to the `<p>` element: `para.appendChild(node);`

    - Finally you must append the new element to an existing element.

    - This code finds an existing element: `const element = document.getElementById("div1");`

    - This code appends the new element to the existing element: `element.appendChild(para);`

2.  Removing existing HTML Element.

    To remove an HTML element, use the remove() method:

    Here's an example:

        <div>
          <p id="p1">This is a paragraph.</p>
          <p id="p2">This is another paragraph.</p>
        </div>

        <script>
        const elmnt = document.getElementById("p1"); elmnt.remove();
        </script>

    - The HTML document contains a `<div>` element with two child nodes (two `<p>` elements):

          <div>
            <p id="p1">This is a paragraph.</p>
            <p id="p2">This is another paragraph.</p>
          </div>

    - Find the element you want to remove: `const elmnt = document.getElementById("p1");`

    - Then execute the remove() method on that element: `elmnt.remove();`

3.  Removing a Child Node.

    For browsers that does not support the remove() method, you have to find the parent node to remove an element:

    Here's an example:

          <div id="div1">
            <p id="p1">This is a paragraph.</p>
            <p id="p2">This is another paragraph.</p>
          </div>

          <script>
            const parent = document.getElementById("div1");
            const child = document.getElementById("p1");
            parent.removeChild(child);
          </script>

    - This HTML document contains a `<div>` element with two child nodes (two `<p>` elements):

          <div id="div1">
            <p id="p1">This is a paragraph.</p>
            <p id="p2">This is another paragraph.</p>
          </div>

    - Find the element with `id="div1"`: `const parent = document.getElementById("div1");`

    - Find the `<p>` element with `id="p1"`: `const child = document.getElementById("p1");`

    - Remove the child from the parent: `parent.removeChild(child);`

    - Here is a common workaround: Find the child you want to remove, and use its `parentNode` property to find the parent:

          const child = document.getElementById("p1");
          child.parentNode.removeChild(child);`

4.  Replacing HTML Elements.

    To replace an element to the HTML DOM, use the replaceChild() method:

        <div id="div1">
          <p id="p1">This is a paragraph.</p>
          <p id="p2">This is another paragraph.</p>
        </div>

        <script>
        const para = document.createElement("p");
        const node = document.createTextNode("This is new.");
        para.appendChild(node);

        const parent = document.getElementById("div1");
        const child = document.getElementById("p1");
        parent.replaceChild(para, child);
        </script>

<hr />

## Events.

HTML events are things that happen to HTML elements.

Examples of events:

- An HTML button is clicked
- A web page has finished loading
- The mouse moves over an element
- A keyboard key is pressed
- An HTML input field is changed

### Common HTML Events.

Here is a list of some common HTML events:

| Event       | Description                                        |
| ----------- | -------------------------------------------------- |
| onchange    | An HTML element has been changed                   |
| onclick     | The user clicks an HTML element                    |
| onmouseover | The user moves the mouse over an HTML element      |
| onmouseout  | The user moves the mouse away from an HTML element |
| onkeydown   | The user pushes a keyboard key                     |
| onload      | The browser has finished loading the page          |

### JavaScript Event Handlers.

An event handler is JavaScript code that runs when an event happens.

Event handlers can be used to handle and verify user input, user actions and browser actions:

- Things that should be done every time a page loads
- Things that should be done when the page is closed
- Action that should be performed when a user clicks a button
- Content that should be verified when a user inputs data
  And more ...

### Using an Event Listner.

Using event attributes like `onclick` are easy to use.

Nevertheless, using `addEventListner()` is the recommended way to handle events.

The `addEventListener()` method makes it easier to control how the event reacts to bubbling.

    element.addEventListener(event, function, useCapture);

You can easily remove an event listener by using the `removeEventListener()` method.

Here are some ways you can listen and trigger events:

1. JavaScript Mouse Events.

   Mouse Events happen when the user interacts with the mouse.

   Some common mouse events:
   - click : Fires after both a mousedown and mouseup event occur on the same element with the main mouse button (usually the left).
   - double click : Fires after two rapid clicks on the same element.
   - mouseover / mouseout : Fires when the pointer moves over an element or leaves an element.
   - mosemove : Fires continuously as the mouse pointer moves over an element, providing positional information (coordinates) about the cursor.
   - mousedown / mouseup : These events fire when a mouse button is pressed down (mousedown) or released (mouseup) over an element, respectively.

2. JavaScript Keyboard Events.

   Keyboard events happen when the user presses a key on the keyboard:
   - keydown
   - keyup
   - keypress

   The KeyboardEvent object provides useful properties to determine which key was involved in the event:

   | Property   | Description                                                        | When pressing Z                   |
   | ---------- | ------------------------------------------------------------------ | --------------------------------- |
   | event.key  | Returns the value of the key. Can vary based on language settings. | Returns z (or Z if shift is held) |
   | event.code | Returns the key code. Constant, regardless of language settings.   | Always returns "KeyZ"             |

3. JavaScript Load Events.

   Load Events happen when the browser has finished loading an element.

   The two most important load events:
   - **DOMContentLoaded** (when HTML is ready)

     The DOMContentLoaded event fires when the browser has fully loaded the HTML and built the Document Object Model (DOM) tree, but has not necessarily finished loading external resources like images and stylesheets.

     The DOMContentLoaded event is best for initializing the user interface, attaching event handlers, and performing actions that only require the DOM to be ready.

   - **load** (waits for pages, images, CSS, etc.)

     The load event fires when the entire page has fully loaded, including all dependent resources such as images, stylesheets, and sub-frames.

     The load event is best for actions that require all resources available, such as getting the dimensions of an image or checking the browser type.

4. JavaScript Timing Events.

   Timing Events let you run code:
   - After a Delay
   - Or Repeatedly

   Timing is driven by Timing Events generated by the system clock.

   | Function        | Description                             |
   | --------------- | --------------------------------------- |
   | setTimeout()    | Sets a clock timeout (runs once)        |
   | setInterval()   | Sets a clock interval (runs repeatedly) |
   | clearTimeout()  | Clears a timeout                        |
   | clearInterval() | Clears an interval                      |

<hr />

## Event Bubbling & Capturing.

Event bubbling and event capturing are the two interesting concepts of JavaScript.

An event listener contains three parameters and it can be defined using the following syntax.

    <element>.addEventListener(<eventName>,
    <callbackFunction>, {capture : boolean});

- `<element>`: The element to which an event listener is attached.
- `<eventName>`: It can be 'click','key up','key down' etc. events.
- `<callbackFunction>`: This function fires after the event happened.
- `{capture: boolean}`: It tells whether the event will be in the capture phase or in the bubbling phase (optional)

Event capturing of event listeners happens first and then the event bubbling happens.

This means the propagation of event listeners first goes from outside to inside and then from inside to outside in the DOM.

Here are some key points:

- Event capturing means propagation of event is done from ancestor elements to child element in the DOM while event bubbling means propagation is done from child element to ancestor elements in the DOM.
- The event capturing occurs followed by event bubbling.
- If {capture: true} ,event capturing will occur else event bubbling will occur.
- Both can be prevented by using the stopPropagation() method.

<hr />

## Form Handling & Validation.

HTML form validation can be done by JavaScript.

If a form field (fname) is empty, this function alerts a message, and returns false, to prevent the form from being submitted:

Here's an example:

    function validateForm() {
        let x = document.forms["myForm"]["fname"].value;
        if (x == "") {
            alert("Name must be filled out");
            return false;
        }
    }

The function can be called when the form in sbumitted:

    <form name="myForm" action="/action_page.php" onsubmit="return validateForm()" method="post">
        Name: <input type="text" name="fname">
        <input type="submit" value="Submit">
    </form>

### Data Validation.

Data validation is the process of ensuring that user input is clean, correct, and useful.

Typical validation tasks are:

- has the user filled in all required fields?
- has the user entered a valid date?
- has the user entered text in a numeric field?

Most often, the purpose of data validation is to ensure correct user input.

Validation can be defined by many different methods, and deployed in many different ways.

**Server side validation** is performed by a web server, after input has been sent to the server.

**Client side validation** is performed by a web browser, before input is sent to a web server.

<hr />

## JavaScript JSON.

JSON stands for JavaScript Object Notation.

JSON is a plain text format for storing and transporting data.

JSON is similar to the syntax for creating JavaScript objects.

JSON is used to send, receive and store data.

For example: `'{"name":"John", "age":30, "car":null}'`

- Why JSON?
  - JSON is make it easy to send and store data between computers
  - JSON is text only and language independent \*

JavaScript has a built in function for converting JSON strings into JavaScript objects: `JSON.parse()`.

JavaScript also has a built in function for converting an object into a JSON string: `JSON.stringify()`.

- The file type for JSON files is ".json"
- The MIME type for JSON text is "application/json"

<hr />

## LocalStorage.

The `localStorage` object allows you to save key/value pairs in the browser.

The `localStorage` object stores data with no expiration date.

The data is not deleted when the browser is closed and are available for future sessions.

- Syntax : `window.localStorage` or `localStorage`
- Save Data to Local Storage : `localStorage.setItem(key, value);`
- Read Data from Local Storage : `let lastname = localStorage.getItem(key);`
- Remove Data from Local Storage : `localStorage.removeItem(key);`
- Remove All (Clear Local Storage) : `localStorage.clear();`

| Parameter | Description                     |
| --------- | ------------------------------- |
| Key       | Required. The name of a key.    |
| Value     | Required. The value of the key. |

- Return value

  | Type      | Description            |
  | --------- | ---------------------- |
  | An Object | A localStorage object. |

### Storing data.

When storing data, the data has to be a certain format, and regardless of where you choose to store it, text is always one of the legal formats.

JSON makes it possible to store JavaScript objects as text.

For example:

    {
    "employees":[
      {"firstName":"John", "lastName":"Doe"},
      {"firstName":"Anna", "lastName":"Smith"},
      {"firstName":"Peter", "lastName":"Jones"}
    ]
    }

If you parse the JSON string with a JavaScript program, you can access the data as an object:

    let personName = obj.name;
    let personAge = obj.age;

<hr />

## Assignment.

1. Build a small counter application that,
   - displays a number (start at 0)
   - has 3 buttons (increment, decrement, reset)
   - prevent the number from going below 0
   - store the current count in `localStorage`
   - when page reloads, restore the previous value.

   [Solution](./Assignment/code1.js)

2. Build a fully functional To-Do List,
   - input field + add button
   - add task dynamically to a list
   - each task must include : task text, delete button
   - clicking delete removes that specific task
   - pressing Enter should also add a task
   - prevent empty task submission
   - persist tasks using `localStorage`
   - tasks should reload when page refreshes.

   **Bonus** (Optional)
   - Mark task as completed (toggle class)
   - Use event bubbling intelligently

   [Solution](./Assignment/code2.js)

3. Build a Notes application.
   1. **Add Notes** :
      - Form with:
        - Title input.
        - Description textarea
      - Add note dynamically to page

   2. **Note Structure** :
      - Each note must include:
        - Title
        - Description
        - Edit button
        - Delete button

   3. **Edit Feature** :
      - Clicking Edit allows user to modify the note
      - Save updated content
      - Update `localStorage`

   4. **Delete Feature** :
      - Remove note from DOM
      - Remove from `localStorage`

   5. **Persistence** :
      - All notes must persist using `localStorage`
      - Use JSON properly
      - Store notes as array of objects

   6. **Event Delegation** :
      - Instead of adding event listners to each button individually :
        - Add 1 event listners to the notes container
        - Use `event.target`
        - Handle edit/delete using bubbling

   7. **Extra Requirements** :
      - Prevent empty inputs
      - Show validation message
      - Clear form after submit

   [Solution](./Assignment/code3.js)
