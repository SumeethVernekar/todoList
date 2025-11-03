const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5001; // Changed from 5000 (port was in use)

// CORS - Must be FIRST before any routes
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Parse JSON
app.use(express.json());

// MongoDB Connection - Add database name after .net/
mongoose.connect('mongodb+srv://abcd:123456789hshs@cluster0.uenah6g.mongodb.net/tododb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => console.log('❌ MongoDB Error:', err));

// Task Schema
const TaskSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);


// Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); //mongo db opertation
    res.json(tasks);// send tasks as json
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST new task
app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task({ text: req.body.text });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});