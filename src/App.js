import React, { useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import AddTask from './AddTask';
import ModifyTask from './ModifyTask';
import TodoList from './TodoList';
import DeleteTask from './DeleteTask';

function App() {
  console.log('App is rendering');
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a Todo App' },
  ]);
  const [currentView, setCurrentView] = useState('list'); // Default view is "List Tasks"

  const addTodo = (text) => {
    const newTodo = { id: Date.now(), text };
    setTodos([...todos, newTodo]);
  };

  const modifyTodo = (id, newText) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, text: newText } : todo)));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const renderMainPane = () => {
    switch (currentView) {
      case 'add':
        return <AddTask addTodo={addTodo} />;
      case 'modify':
        return <ModifyTask todos={todos} modifyTodo={modifyTodo} />;
      case 'delete':
        return <DeleteTask todos={todos} deleteTodo={deleteTodo} />;
      case 'list':
      default:
        return <TodoList todos={todos} />;
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
