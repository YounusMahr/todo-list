import express from 'express';
import { TodoManager } from '../models/Todo.js';

const router = express.Router();

// GET all todos
router.get('/', async (req, res) => {
  try {
    const todos = await TodoManager.getAll();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos: ' + err.message });
  }
});

// POST a new todo
router.post('/', async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const todo = await TodoManager.create(req.body);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo: ' + err.message });
  }
});

// PUT (update) a todo
router.put('/:id', async (req, res) => {
  try {
    const updatedTodo = await TodoManager.update(req.params.id, req.body);
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo: ' + err.message });
  }
});

// DELETE a todo
router.delete('/:id', async (req, res) => {
  try {
    const deletedTodo = await TodoManager.delete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo: ' + err.message });
  }
});

export default router;
