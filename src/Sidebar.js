import React from 'react';

function Sidebar({ setCurrentView }) {
  return (
    <div className="Sidebar">
      <h2>My Sidebar</h2>
      <ul>
        <li>
          <button onClick={() => setCurrentView('add')}>Add a New Task</button>
        </li>
        <li>
          <button onClick={() => setCurrentView('modify')}>Modify Task</button>
        </li>
        <li>
          <button onClick={() => setCurrentView('list')}>List Tasks</button>
        </li>
        <li>
          <button onClick={() => setCurrentView('delete')}>Delete Task</button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;