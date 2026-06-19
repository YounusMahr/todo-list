import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/todos.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Mongoose Schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  notes: { type: String, default: '' },
  category: { type: String, default: 'Work' },
  priority: { type: String, default: 'Medium' },
  dueDate: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  subtasks: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

const TodoMongoose = mongoose.model('Todo', todoSchema);

// Connection Status Flag
let dbConnected = false;

export function setDbConnected(status) {
  dbConnected = status;
  console.log(`[Database Manager] Mode switched to: ${status ? 'MongoDB Mongoose' : 'Local JSON Fallback'}`);
}

export function isDbConnected() {
  return dbConnected;
}

// Helper functions for Local File DB
function readLocalTodos() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading local db file:', err);
    return [];
  }
}

function writeLocalTodos(todos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error writing local db file:', err);
  }
}

// Unified CRUD Interface
export const TodoManager = {
  async getAll() {
    if (dbConnected) {
      try {
        return await TodoMongoose.find().sort({ createdAt: -1 });
      } catch (err) {
        console.error('MongoDB find failed, falling back to local store:', err.message);
      }
    }
    const todos = readLocalTodos();
    return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(data) {
    if (dbConnected) {
      try {
        const todo = new TodoMongoose(data);
        return await todo.save();
      } catch (err) {
        console.error('MongoDB save failed, falling back to local store:', err.message);
      }
    }
    const todos = readLocalTodos();
    const newTodo = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      title: data.title || '',
      notes: data.notes || '',
      category: data.category || 'Work',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate || '',
      completed: data.completed || false,
      subtasks: data.subtasks || [],
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    writeLocalTodos(todos);
    return newTodo;
  },

  async update(id, updateData) {
    if (dbConnected) {
      try {
        const updated = await TodoMongoose.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) return updated;
      } catch (err) {
        console.error('MongoDB update failed, falling back to local store:', err.message);
      }
    }
    const todos = readLocalTodos();
    const index = todos.findIndex(t => t._id.toString() === id.toString());
    if (index !== -1) {
      todos[index] = {
        ...todos[index],
        ...updateData,
        _id: todos[index]._id,
        createdAt: todos[index].createdAt
      };
      writeLocalTodos(todos);
      return todos[index];
    }
    return null;
  },

  async delete(id) {
    if (dbConnected) {
      try {
        const deleted = await TodoMongoose.findByIdAndDelete(id);
        if (deleted) return deleted;
      } catch (err) {
        console.error('MongoDB delete failed, falling back to local store:', err.message);
      }
    }
    const todos = readLocalTodos();
    const index = todos.findIndex(t => t._id.toString() === id.toString());
    if (index !== -1) {
      const deleted = todos[index];
      const filtered = todos.filter(t => t._id.toString() !== id.toString());
      writeLocalTodos(filtered);
      return deleted;
    }
    return null;
  }
};
