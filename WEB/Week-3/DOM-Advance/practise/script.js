function createComplexDomElement() {
    const div = document.createElement("div");
    document.querySelector("body").appendChild(div);

    const h2 = document.createElement("h2");
    h2.innerHTML = "hi there.";
    div.appendChild(h2);
}

// Using State rendering.
let todos = [];
function addTodo() {
    todos.push({
        title: document.querySelector("input").value
    })
    render();
}

function deleteLastTodo() {
    todos.splice(todos.length - 1, 1); // remove the last element from the arr
    render();
}


function deleteFirstTodo() {
    todos.splice(0, 1); // remove the last element from the arr
    render();
}


function createTodoComponent(todo) {
    const div = document.createElement("div");
    const h1 = document.createElement("h1");
    const button = document.createElement("button");
    button.innerHTML = "Delete";
    h1.innerHTML = todo.title;
    div.append(h1);
    div.append(button);
    return div;
}

// react 
function render() {
    document.querySelector("#todos").innerHTML = "";
    for (let i = 0; i < todos.length; i++) {
        const element = createTodoComponent(todos[i]);
        document.querySelector("#todos").appendChild(element);
    }
}