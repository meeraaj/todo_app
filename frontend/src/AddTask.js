import React, { useState } from 'react';

function AddTask({ onTaskAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          status,
          start_time: startTime ? new Date(startTime).toISOString() : null,
          end_time: endTime ? new Date(endTime).toISOString() : null
        })
      });

      if (response.ok) {
        const newTask = await response.json();
        setName('');
        setStatus('pending');
        setStartTime('');
        setEndTime('');
        if (onTaskAdded) onTaskAdded(); // This will trigger a refresh of the task list
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="add-task-card">
      <h2>Add a New Task</h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Task name"
        className="add-task-input"
      />
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        className="add-task-input"
      />
      <select value={status} onChange={e => setStatus(e.target.value)} className="add-task-input">
        <option value="pending">Pending</option>
        <option value="done">Done</option>
      </select>
      <label>
        Start Time:
        <input
          type="datetime-local"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="add-task-input"
        />
      </label>
      <label>
        End Time:
        <input
          type="datetime-local"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          className="add-task-input"
        />
      </label>
      <div className="add-task-actions">
        <button className="add-task-btn" onClick={handleAdd}>Add Task</button>
      </div>
    </div>
  );
}

export default AddTask;