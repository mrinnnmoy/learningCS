const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
          <span>${task.text}</span>
          <button class="delete-btn" data-index="${index}">
            Delete
          </button>
        `;

        li.setAttribute("data-index", index);

        taskList.appendChild(li);
    });
}

// Add task
function addTask() {
    const taskText = taskInput.value.trim();

    // Prevent empty tasks
    if (taskText === "") {
        alert("Task cannot be empty!");
        return;
    }

    // Add new task
    tasks.push({
        text: taskText,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
}

// Add button click
addBtn.addEventListener("click", addTask);

// Press Enter to add task
taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// Event Bubbling for Delete & Complete
taskList.addEventListener("click", function (event) {

    const index = event.target.parentElement.dataset.index;

    // Delete task
    if (event.target.classList.contains("delete-btn")) {
        tasks.splice(index, 1);
    }

    // Toggle completed
    else {
        tasks[index].completed = !tasks[index].completed;
    }

    saveTasks();
    renderTasks();
});

// Initial render
renderTasks();