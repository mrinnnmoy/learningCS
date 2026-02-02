// To fetch the title
const title = document.querySelector('h1');
console.log(title.innerHTML);

// Fetch first todo assignment
const first = document.querySelector('li');
console.log(first.innerHTML);

// Fetch the second todo assignment
const second = document.querySelectorAll('li')[1];
console.log(second.innerHTML);

// Update the first todo contents. (You can use 'innerHTML' or 'textContent')
const updateFirst = document.querySelector('li');
updateFirst.innerHTML = "Don't visit class";

const updateThird = document.querySelectorAll('li')[2];
updateThird.textContent = "Play Cricket";

// Delete a todo element. (You can user 'removeChild' or 'onClick')
// First you have to add a 'Delete' button right next to the todo.
function deleteTodo(index) {
    const element = document.getElementById("todo-" + index);
    element.parentNode.removeChild(element);
}

// Adding elements. (Use 'createElement' or 'appendChild')
function addTodo() {
    // Get the current text inside the input element
    const inputElement = document.getElementById("inputBox");

    // Create a new "div" element
    const textNode = document.createElement("div");
    textNode.innerHTML = inputElement.value;

    // Add the 'text' from the step 1 to the 'div' element
    const parentElement = document.getElementById("todo");

    // Append the div to the todo list
    parentElement.appendChild(textNode);


    // Adding a corresponding 'delete' button. //

    let todoCounter = 4;
    

    // Set id for the new div.
    textNode.id = "todo-" + todoCounter;

    // Create delete button.
    const deletBtn = document.createElement("button");
    deletBtn.innerHTML = "Delete";

    // Connect button to deleteTodo function
    deletBtn.setAttribute("onClick", "deleteTodo(" + todoCounter + ")");

    // Append delet button to the new div
    textNode.appendChild(deletBtn);
    
    todoCounter++;
}