import React from 'react';

function DeleteTask({ todos, deleteTodo }) {
  return (
    <div>
      <h2>Delete Task</h2>
      {todos.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default DeleteTask;