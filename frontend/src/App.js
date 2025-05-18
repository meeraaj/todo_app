import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const fetchTodos = () => {
    fetch(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => setTodos(data));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Cannot connect to server. Please make sure the backend is running.');
      }
    }
  };

  const addTodo = (text) => {
    const newTodo = { id: Date.now(), text };
    setTodos([...todos, newTodo]);
  };

  const modifyTodo = (id, updatedTask) => {
    console.log(`Sending PUT request to: ${API_BASE_URL}/tasks/${id}`); // Add logging
    fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updatedTask)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(() => fetchTodos())
    .catch(error => console.error('Error:', error));
  };

  const deleteTodo = (id) => {
    fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(() => fetchTodos());
  };

  const addTask = (newTask) => {
    console.log('Adding task:', newTask); // Add logging
    fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(newTask)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Task added:', data); // Add logging
      fetchTodos(); // Refresh the list after adding
    })
    .catch(error => {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserDetails(null);
    setShowProfile(false);
  };

  useEffect(() => {
    // Check if token exists and is valid
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={() => setShowRegister(false)} 
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="App">
      <div className="page-header">
        <h1 className="page-title">Task Manager</h1>
        <div className="header-actions">
          <button className="btn btn-add" onClick={() => {
            setCurrentTask({});
            setIsModalOpen(true);
          }}>Add Task</button>
          <div 
            className="user-icon"
            onClick={() => {
              if (userDetails) {
                setShowProfile(true);
              } else {
                fetchUserDetails().then(() => setShowProfile(true));
              }
            }}
            role="button"
            aria-label="User profile"
          >
            <img 
              src="/default-avatar.png"
              alt="Profile" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23718096" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Status</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.map(todo => (
              <tr key={todo.id}>
                <td>{todo.name}</td>
                <td>
                  <span className={`status-badge status-${todo.status.toLowerCase()}`}>
                    {todo.status}
                  </span>
                </td>
                <td>{todo.start_time ? new Date(todo.start_time).toLocaleString() : '-'}</td>
                <td>{todo.end_time ? new Date(todo.end_time).toLocaleString() : '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-modify"
                      onClick={() => {
                        setCurrentTask(todo);
                        setIsModalOpen(true);
                      }}
                    >
                      Modify
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{currentTask.id ? 'Modify Task' : 'Add Task'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const taskData = {
                name: formData.get('name'),
                status: formData.get('status'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time')
              };
              
              if (currentTask.id) {
                modifyTodo(currentTask.id, taskData);
              } else {
                addTask(taskData);
              }
              setIsModalOpen(false);
            }}>
              <div className="form-group">
                <label>Task Name</label>
                <input 
                  name="name"
                  defaultValue={currentTask.name || ''}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status"
                  defaultValue={currentTask.status || 'pending'}
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input 
                  type="datetime-local"
                  name="start_time"
                  defaultValue={currentTask.start_time?.slice(0, 16) || ''}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input 
                  type="datetime-local"
                  name="end_time"
                  defaultValue={currentTask.end_time?.slice(0, 16) || ''}
                />
              </div>
              <div className="action-buttons">
                <button type="button" className="btn btn-delete" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-add">
                  {currentTask.id ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfile && userDetails && (
        <UserProfile 
          user={userDetails} 
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
