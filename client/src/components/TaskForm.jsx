import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

export default function TaskForm({ onAddTask, onClose }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      notes: notes.trim(),
      category,
      priority,
      dueDate,
      subtasks: [],
      completed: false
    });

    setTitle('');
    setNotes('');
    setCategory('Work');
    setPriority('Medium');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form-panel glass-panel">
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Task</h3>
        <button type="button" className="icon-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="title">Task Title *</label>
        <input
          type="text"
          id="title"
          className="form-input"
          placeholder="e.g. Design app interface mockups"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes / Details</label>
        <textarea
          id="notes"
          className="form-textarea"
          placeholder="Add some details about this task..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <div className="priority-selector">
            {['Low', 'Medium', 'High'].map((p) => (
              <button
                key={p}
                type="button"
                className={`priority-btn ${p.toLowerCase()} ${priority === p ? 'selected' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="primary-btn">
          <PlusCircle size={18} />
          <span>Add Task</span>
        </button>
      </div>
    </form>
  );
}
