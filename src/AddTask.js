import React, { useState } from 'react';

function AddTask({ addTodo }) {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  const handleCancel = () => {
    setNewTodo('');
  };

  return (
    <div className="add-task-card">
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a task"
        className="add-task-input"
      />
      <div className="add-task-actions">
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        <button className="add-task-btn" onClick={handleAdd}>Add task</button>
      </div>
    </div>
  );
}

export default AddTask;