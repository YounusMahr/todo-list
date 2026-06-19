import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import todoRoutes from './routes/todoRoutes.js';
import { setDbConnected } from './models/Todo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

// Health Check / Info Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'MongoDB' : 'Local JSON Fallback',
    timestamp: new Date().toISOString()
  });
});

// Database connection logic with automatic timeout fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo-list';

console.log('Attempting to connect to MongoDB...');

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 2500, // Timeout after 2.5s
  };

  try {
    await mongoose.connect(MONGO_URI, options);
    setDbConnected(true);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.warn('\n======================================================');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn(`Reason: ${err.message}`);
    console.warn('Fallback activated: Running in local JSON database mode.');
    console.warn('======================================================\n');
    setDbConnected(false);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected.');
  setDbConnected(false);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected.');
  setDbConnected(true);
});

// Listen
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
