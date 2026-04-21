import { useState } from 'react';

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const startEditing = () => {
        setEditText(todo.text); // reset to current value when entering edit mode
        setIsEditing(true);
    };

    const saveEdit = () => {
        const trimmed = editText.trim();
        if (trimmed && trimmed !== todo.text) {
            onEdit(todo.id, trimmed);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            setEditText(todo.text); // discard changes
            setIsEditing(false);
        }
    };

    return (
        <li className={`todo-item ${todo.done ? 'done' : ''}`}>
            <input
                type="checkbox"
                checked={todo.done}
                onChange={() => onToggle(todo.id)}
                className="todo-checkbox"
            />

            {isEditing ? (
                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="todo-edit-input"
                />
            ) : (
                <span className="todo-text" onDoubleClick={startEditing}>
                    {todo.text}
                </span>
            )}

            <button onClick={() => onDelete(todo.id)} className="delete-btn" aria-label="Delete todo">
                ×
            </button>
        </li>
    );
}