const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON payloads in request bodies
app.use(express.json());

// In-memory array acting as a temporary data store
let devLogs = [
  { id: 1, topic: 'VS Code Workstation Setup', status: 'Completed' },
  { id: 2, topic: 'Express.js Local API', status: 'In Progress' }
];

// 1. GET Request Handler: Fetch all development logs
app.get('/api/logs', (req, res) => {
  res.status(200).json({
    success: true,
    count: devLogs.length,
    data: devLogs
  });
});

// 2. POST Request Handler: Add a new log entry
app.post('/api/logs', (req, res) => {
  const { topic, status } = req.body;

  // Basic validation: verify required fields exist
  if (!topic) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "topic" field is required.'
    });
  }

  const newLog = {
    id: devLogs.length + 1,
    topic: topic,
    status: status || 'Pending'
  };

  devLogs.push(newLog);

  res.status(201).json({
    success: true,
    message: 'Log entry created successfully',
    data: newLog
  });
});

// Start the server listener on port 3000
app.listen(PORT, () => {
  console.log(`[SERVER RUNNING] API live on http://localhost:${PORT}`);
});