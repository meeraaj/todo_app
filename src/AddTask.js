import React, { useState } from 'react';

function AddTask({ addTodo }) {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  return (
    <div>
      <h2>Add a New Task</h2>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="New task"
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}

export default AddTask;