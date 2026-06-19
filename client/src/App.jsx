import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsOverview from './components/StatsOverview';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import { PlusCircle, Search, Sparkles } from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [dbStatus, setDbStatus] = useState('Local JSON Fallback');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const statusRes = await fetch(`${API_BASE}/status`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setDbStatus(statusData.database);
        }
      } catch (err) {
        console.warn('Could not reach backend health check. Using default status.');
      }
      fetchTodos();
    };
    initApp();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_BASE}/todos`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else {
        addToast('Failed to load tasks from server', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      addToast('Cannot connect to backend server. Running offline.', 'error');
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const res = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTodos((prev) => [newTask, ...prev]);
        setShowForm(false);
        addToast('Task created successfully!');
      } else {
        addToast('Error creating task', 'error');
      }
    } catch (err) {
      addToast('Network error while adding task', 'error');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        addToast(completed ? 'Task marked as completed! 🎉' : 'Task marked as active');
      }
    } catch (err) {
      addToast('Network error updating task', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t._id !== id));
        addToast('Task deleted successfully');
      }
    } catch (err) {
      addToast('Network error deleting task', 'error');
    }
  };

  const handleAddSubtask = async (todoId, subtaskText) => {
    const todo = todos.find((t) => t._id === todoId);
    if (!todo) return;

    const newSubtask = {
      id: Math.random().toString(36).substring(2, 9),
      text: subtaskText,
      completed: false
    };

    const updatedSubtasks = [...todo.subtasks, newSubtask];

    try {
      const res = await fetch(`${API_BASE}/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === todoId ? updated : t)));
        addToast('Subtask added');
      }
    } catch (err) {
      addToast('Network error adding subtask', 'error');
    }
  };

  const handleToggleSubtask = async (todoId, subtaskId, completed) => {
    const todo = todos.find((t) => t._id === todoId);
    if (!todo) return;

    const updatedSubtasks = todo.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed } : s
    );

    try {
      const res = await fetch(`${API_BASE}/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === todoId ? updated : t)));
      }
    } catch (err) {
      addToast('Network error updating subtask', 'error');
    }
  };

  const processedTodos = todos
    .filter((todo) => {
      if (currentCategory !== 'all' && todo.category.toLowerCase() !== currentCategory.toLowerCase()) {
        return false;
      }

      if (currentFilter === 'completed') return todo.completed;
      if (currentFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        return !todo.completed && todo.dueDate === todayStr;
      }
      if (currentFilter === 'scheduled') {
        return !todo.completed && todo.dueDate;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          todo.title.toLowerCase().includes(query) ||
          todo.notes.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return 0;
    });

  return (
    <div className="app-container">
      <Sidebar
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
        todos={todos}
        dbStatus={dbStatus}
      />

      <main className="main-dashboard">
        <header className="dashboard-header">
          <div className="header-title-area">
            <h1>Workspace</h1>
            <p>Welcome back! Let's get things done today.</p>
          </div>

          <div className="search-sort-area">
            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>
        </header>

        <StatsOverview todos={todos} />

        <div className="create-btn-wrapper">
          {!showForm && (
            <button 
              className="primary-btn" 
              onClick={() => setShowForm(true)}
            >
              <PlusCircle size={18} />
              <span>Create Task</span>
            </button>
          )}
        </div>

        {showForm && (
          <TaskForm
            onAddTask={handleAddTask}
            onClose={() => setShowForm(false)}
          />
        )}

        <section className="tasks-grid">
          {processedTodos.length > 0 ? (
            processedTodos.map((todo) => (
              <TaskCard
                key={todo._id}
                task={todo}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
              />
            ))
          ) : (
            <div className="empty-state glass-panel">
              <div className="empty-icon">
                <Sparkles size={28} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>No tasks found</h4>
              <p style={{ fontSize: '0.85rem' }}>
                {searchQuery ? 'Try adjusting your search filters.' : 'Enjoy your day! Add a task to get started.'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Toast Alert System */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
