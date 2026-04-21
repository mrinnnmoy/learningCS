import { useState } from 'react';

export default function TodoInput({ onAdd }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return; // reject empty / whitespace-only todos
        onAdd(trimmed);
        setText(''); // clear the input after a successful add
    };

    return (
        <form onSubmit={handleSubmit} className="todo-input-form">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What needs to be done?"
                className="todo-input"
            />
            <button type="submit" className="add-btn">Add</button>
        </form>
    );
}