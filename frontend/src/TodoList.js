import React from 'react';

function TodoList({ todos }) {
  return (
    <div className="add-task-card">
      <h2>List Tasks</h2>
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ fontSize: '1.2rem', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <strong>{todo.name}</strong> - {todo.description} [{todo.status}]
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;