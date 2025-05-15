import React from 'react';

function Sidebar({ setCurrentView }) {
  return (
    <div className="Sidebar">
      <ul>
        <li>
          <button onClick={() => setCurrentView('add')}>
            <i className="fas fa-plus"></i>
            <span className="sidebar-label">Add Task</span>
          </button>
        </li>
        <li>
          <button onClick={() => setCurrentView('modify')}>
            <i className="fas fa-redo"></i>
            <span className="sidebar-label">Modify Task</span>
          </button>
        </li>
        <li>
          <button onClick={() => setCurrentView('list')}>
            <i className="fas fa-table"></i>
            <span className="sidebar-label">List Tasks</span>
          </button>
        </li>
        <li>
          <button onClick={() => setCurrentView('delete')}>
            <i className="fas fa-trash"></i>
            <span className="sidebar-label">Delete Task</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;