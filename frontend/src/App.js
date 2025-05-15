import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import AddTask from './AddTask';
import ModifyTask from './ModifyTask';
import DeleteTask from './DeleteTask';

function App() {
  console.log('App is rendering');
  const [todos, setTodos] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // Default view is "List Tasks"

  const fetchTodos = () => {
    fetch('http://localhost:5000/api/tasks')
      .then(res => res.json())
      .then(data => setTodos(data));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = (text) => {
    const newTodo = { id: Date.now(), text };
    setTodos([...todos, newTodo]);
  };

  const modifyTodo = (id, newText) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, text: newText } : todo)));
  };

  const deleteTodo = (id) => {
    fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => fetchTodos());
  };

  const addTask = (newTask) => {
    fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
    .then(res => res.json())
    .then(data => {
      setTodos([...todos, data]); // assuming the API returns the new task
    });
  };

  const renderMainPane = () => {
    switch (currentView) {
      case 'add':
        return <AddTask onTaskAdded={fetchTodos} />;
      case 'modify':
        return <ModifyTask todos={todos} modifyTodo={modifyTodo} />;
      case 'delete':
        return <DeleteTask todos={todos} deleteTodo={deleteTodo} />;
      case 'list':
      default:
        return (
          <div className="add-task-card">
            <h2>List Tasks</h2>
            <ul>
              {todos.map(todo => (
                <li key={todo.id}>
                  <strong>{todo.name}</strong> <br />
                  {todo.description} <br />
                  Status: {todo.status} <br />
                  Start: {todo.start_time ? new Date(todo.start_time).toLocaleString() : 'N/A'} <br />
                  End: {todo.end_time ? new Date(todo.end_time).toLocaleString() : 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Sidebar setCurrentView={setCurrentView} todos={todos} />
      <div className="MainPane">
        {renderMainPane()}
      </div>
    </div>
  );
}

export default App;
