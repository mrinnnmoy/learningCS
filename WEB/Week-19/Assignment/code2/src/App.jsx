import { useState, useEffect } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilters from './components/TodoFilters';

const STORAGE_KEY = 'week19-todos';

function App() {
  // Lazy initial state — reads localStorage only once, on the first render,
  // not on every single re-render.
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('all');

  // Sync todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text) => {
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text, done: false },
    ]);
  };

  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo)
    );
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const editTodo = (id, newText) => {
    setTodos(prev =>
      prev.map(todo => todo.id === id ? { ...todo, text: newText } : todo)
    );
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.done));
  };

  // Derived values — computed fresh on every render, never stored as their own state.
  // This guarantees they can NEVER get out of sync with the underlying todos array.
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true; // 'all'
  });

  const activeCount = todos.filter(todo => !todo.done).length;
  const completedCount = todos.filter(todo => todo.done).length;

  return (
    <div className="app">
      <h1 className="page-title">Todo List</h1>

      <TodoInput onAdd={addTodo} />

      <TodoFilters currentFilter={filter} onFilterChange={setFilter} />

      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />

      <div className="todo-footer">
        <span>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>
        {completedCount > 0 && (
          <button onClick={clearCompleted} className="clear-btn">
            Clear completed ({completedCount})
          </button>
        )}
      </div>
    </div>
  );
}

export default App;