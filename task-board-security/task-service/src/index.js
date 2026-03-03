require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const { initDB } = require('./db/db');
const taskRoutes = require('./routes/tasks');
const { requireAuth } = require('./middleware/authMiddleware');

const app  = express();
const PORT = process.env.PORT || 3002;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(cors());
app.use(express.json());
app.use(morgan('combined', {
  stream: { write: (msg) => console.log(msg.trim()) }
}));

app.use('/api/tasks', requireAuth, taskRoutes);
app.use((req, res) => {
  console.error("[ERROR] Route not found:", req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});
async function start() {
  let retries = 10;

  while (retries > 0) {
    try {
      await initDB();
      console.log("[task-service] DB connected");
      break;
    } catch (err) {
      console.error("[ERROR] DB init failed:", err.message);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  app.listen(PORT, () =>
    console.log(`[task-service] Running on port ${PORT}`)
  );
}

start();