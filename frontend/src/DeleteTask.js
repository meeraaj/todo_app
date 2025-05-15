import React from 'react';

function DeleteTask({ todos, deleteTodo }) {
  return (
    <div className="add-task-card">
      <h2>Delete Task</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ flex: 1 }}>
              <strong>{todo.name}</strong> — {todo.description}
            </span>
            <button
              className="add-task-btn"
              style={{ background: '#ff4d4d' }}
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeleteTask;