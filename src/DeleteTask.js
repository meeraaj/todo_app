import React from 'react';

function DeleteTask({ todos, deleteTodo }) {
  return (
    <div className="add-task-card">
      <h2>Delete Task</h2>
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ flex: 1 }}>{todo.text}</span>
            <button className="add-task-btn" style={{ background: '#ff4d4d', marginLeft: 12 }} onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeleteTask;