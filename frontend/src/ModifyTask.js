import React, { useState } from 'react';

function ModifyTask({ todos, modifyTodo }) {
  const [id, setId] = useState('');
  const [newText, setNewText] = useState('');

  const handleModify = () => {
    fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newText })
    })
    .then(res => res.json())
    .then(() => {
      // Optionally update state in parent
    });
  };

  const handleCancel = () => {
    setId('');
    setNewText('');
  };

  return (
    <div className="add-task-card">
      <h2>Modify Task</h2>
      <div className="add-task-bar">
        <input
          type="number"
          placeholder="Task ID"
          value={id}
          onChange={e => setId(e.target.value)}
          className="add-task-input"
          style={{ maxWidth: 120, marginRight: 12 }}
        />
        <input
          type="text"
          placeholder="New text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          className="add-task-input"
        />
      </div>
      <div className="add-task-actions">
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        <button className="add-task-btn" onClick={handleModify}>Modify</button>
      </div>
    </div>
  );
}

export default ModifyTask;