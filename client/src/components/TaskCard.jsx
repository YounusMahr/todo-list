import React, { useState } from 'react';
import { 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Check
} from 'lucide-react';

export default function TaskCard({ 
  task, 
  onToggleComplete, 
  onDeleteTask, 
  onToggleSubtask, 
  onAddSubtask 
}) {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate + 'T00:00:00');
    return due < today;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    onAddSubtask(task._id, newSubtaskText.trim());
    setNewSubtaskText('');
  };

  return (
    <div className={`task-card glass-panel ${task.completed ? 'completed-card' : ''}`}>
      <div className="task-main-row">
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={() => onToggleComplete(task._id, !task.completed)}
          />
          <span className="checkmark"></span>
        </label>

        <div className="task-content">
          <div className="task-title-row">
            <h4 className={`task-title ${task.completed ? 'completed-title' : ''}`}>
              {task.title}
            </h4>
            <span className={`badge priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <span className="badge category-tag">
              {task.category}
            </span>
          </div>

          {task.notes && (
            <p className="task-notes">
              {task.notes}
            </p>
          )}

          <div className="task-meta">
            {task.dueDate && (
              <span className={`due-date-badge ${isOverdue() ? 'overdue' : ''}`}>
                <Calendar size={14} />
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue() && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                    <AlertCircle size={12} />
                    <span>Overdue</span>
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="task-actions">
          <button 
            type="button" 
            className="icon-btn delete-btn" 
            onClick={() => onDeleteTask(task._id)}
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="subtasks-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            SUBTASKS ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
          </span>
          <button 
            type="button" 
            className="icon-btn" 
            style={{ width: '20px', height: '20px' }}
            onClick={() => setShowSubtaskForm(!showSubtaskForm)}
            title="Add subtask"
          >
            <Plus size={14} />
          </button>
        </div>

        {task.subtasks.map((subtask) => (
          <div key={subtask.id} className="subtask-item">
            <input 
              type="checkbox" 
              className="subtask-checkbox" 
              checked={subtask.completed} 
              onChange={() => onToggleSubtask(task._id, subtask.id, !subtask.completed)}
            />
            <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
              {subtask.text}
            </span>
          </div>
        ))}

        {showSubtaskForm && (
          <form onSubmit={handleSubtaskSubmit} className="subtask-input-row">
            <input 
              type="text" 
              className="subtask-input" 
              placeholder="Add subtask item..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              autoFocus
            />
            <button type="submit" className="icon-btn" style={{ background: 'var(--bg-tertiary)', color: 'var(--color-primary)' }}>
              <Check size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
