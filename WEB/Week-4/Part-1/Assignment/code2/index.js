// CLI based FileSystem todo list.

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();
const FILE_PATH = path.resolve("todos.json");


// Read todos from file
function readTodos() {
    try {
        const data = fs.readFileSync(FILE_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Write todos to file
function writeTodos(todos) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(todos, null, 2));
}

// Generate ID
function generateID(todos) {
    if (todos.length === 0) return 1;
    return Math.max(...todos.map(todo => todo.id)) + 1;
}

// Commands

program
    .command("add <Title>")
    .description("Add a new todo")
    .action((title) => {
        const todos = readTodos();

        const newTodo = {
            id: generateID(todos),
            title,
            completed: false,
            createdAt: new Date().toISOString()
        };

        todos.push(newTodo);
        writeTodos(todos);

        console.log("✅ Todo added: ", newTodo);
    });

program
    .command("list")
    .description("List all todos")
    .action(() => {
        const todos = readTodos();

        if (todos.length === 0) {
            console.log("No todos found.");
            return;
        }

        todos.forEach(todo => {
            console.log(
                `${todo.id}. ${todo.title} [${todo.completed ? "Completed" : "Not Completed"}]`
            );
        });
    });

program
    .command("done <id>")
    .description("Mark a todo as completed")
    .action((id) => {
        const todos = readTodos();
        const todo = todos.find(t => t.id === Number(id));

        if (!todo) {
            console.log("❌ Todo not found.");
            return;
        }

        todo.completed = true;
        writeTodos(todos);

        console.log("🎉 Todo marked as done.");
    });

program
    .command("delete <id>")
    .description("Delete a todo")
    .action((id) => {
        const todos = readTodos();
        const updatedTodos = todos.filter(t => t.id !== Number(id));

        if (todos.length === updatedTodos.length) {
            console.log("❌ Todo not found.");
            return;
        }

        writeTodos(updatedTodos);
        console.log("🗑 Todo deleted.");
    });


program.parse();