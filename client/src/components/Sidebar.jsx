import React from 'react';
import { 
  ListTodo, 
  Inbox, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Briefcase, 
  User, 
  ShoppingCart, 
  Heart, 
  DollarSign, 
  Grid,
  Database,
  WifiOff
} from 'lucide-react';

export default function Sidebar({ 
  currentFilter, 
  setCurrentFilter, 
  currentCategory, 
  setCurrentCategory, 
  todos,
  dbStatus
}) {
  
  // Count helpers
  const getFilterCounts = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      all: todos.length,
      today: todos.filter(t => !t.completed && t.dueDate === todayStr).length,
      scheduled: todos.filter(t => !t.completed && t.dueDate).length,
      completed: todos.filter(t => t.completed).length,
    };
  };

  const getCategoryCount = (cat) => {
    return todos.filter(t => t.category.toLowerCase() === cat.toLowerCase() && !t.completed).length;
  };

  const counts = getFilterCounts();

  const categories = [
    { name: 'Work', icon: Briefcase, colorClass: 'work' },
    { name: 'Personal', icon: User, colorClass: 'personal' },
    { name: 'Shopping', icon: ShoppingCart, colorClass: 'shopping' },
    { name: 'Health', icon: Heart, colorClass: 'health' },
    { name: 'Finance', icon: DollarSign, colorClass: 'finance' },
    { name: 'Other', icon: Grid, colorClass: 'other' }
  ];

  const handleFilterClick = (filter) => {
    setCurrentFilter(filter);
    setCurrentCategory('all');
  };

  const handleCategoryClick = (categoryName) => {
    setCurrentCategory(categoryName);
    setCurrentFilter('all');
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <ListTodo size={24} />
        </div>
        <h1 className="logo-text">Task<span>Sphere</span></h1>
      </div>

      {/* Database connection badge */}
      <div className="db-status-bar">
        <span className={`db-dot ${dbStatus === 'MongoDB' ? 'mongo' : 'fallback'}`}></span>
        <span>{dbStatus === 'MongoDB' ? 'Cloud Connected' : 'Local Sandbox Mode'}</span>
      </div>

      <div className="menu-section">
        <h2 className="section-title">Overview</h2>
        
        <div 
          className={`nav-item ${currentFilter === 'all' && currentCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          <div className="nav-item-left">
            <Inbox size={18} />
            <span>All Tasks</span>
          </div>
          <span className="nav-badge">{counts.all}</span>
        </div>

        <div 
          className={`nav-item ${currentFilter === 'today' ? 'active' : ''}`}
          onClick={() => handleFilterClick('today')}
        >
          <div className="nav-item-left">
            <Clock size={18} />
            <span>Today</span>
          </div>
          <span className="nav-badge">{counts.today}</span>
        </div>

        <div 
          className={`nav-item ${currentFilter === 'scheduled' ? 'active' : ''}`}
          onClick={() => handleFilterClick('scheduled')}
        >
          <div className="nav-item-left">
            <Calendar size={18} />
            <span>Scheduled</span>
          </div>
          <span className="nav-badge">{counts.scheduled}</span>
        </div>

        <div 
          className={`nav-item ${currentFilter === 'completed' ? 'active' : ''}`}
          onClick={() => handleFilterClick('completed')}
        >
          <div className="nav-item-left">
            <CheckCircle size={18} />
            <span>Completed</span>
          </div>
          <span className="nav-badge">{counts.completed}</span>
        </div>
      </div>

      <div className="menu-section" style={{ flexGrow: 1 }}>
        <h2 className="section-title">Categories</h2>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <div 
              key={cat.name} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="nav-item-left">
                <span className={`category-dot ${cat.colorClass}`}></span>
                <span>{cat.name}</span>
              </div>
              <span className="nav-badge">{getCategoryCount(cat.name)}</span>
            </div>
          );
        })}
      </div>
      
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        TaskSphere v1.0.0
      </div>
    </aside>
  );
}
