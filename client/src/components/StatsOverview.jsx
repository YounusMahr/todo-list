import React from 'react';
import { CheckCircle2, ListTodo, AlertCircle } from 'lucide-react';

export default function StatsOverview({ todos }) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-container">
      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper total">
          <ListTodo size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper pending">
          <AlertCircle size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      <div className="stat-card glass-panel">
        <div className="stat-icon-wrapper completed">
          <CheckCircle2 size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="stat-card glass-panel progress-widget">
        <div className="progress-header">
          <span className="stat-label">Task Progress</span>
          <span className="progress-percentage">{percent}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  );
}
