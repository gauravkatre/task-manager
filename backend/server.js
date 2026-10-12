const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS — allow localhost + Railway/Vercel domains + explicit FRONTEND_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (
        origin.endsWith('.railway.app') ||
        origin.endsWith('.up.railway.app') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (placed before the DB middleware so it always responds)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Team Task Manager API is running',
    env: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || 'not set',
    mongoUriSet: Boolean(process.env.MONGO_URI),
  });
});

// Ensure DB is connected before handling any other request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Database connection failed', error: err.message });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Standalone task routes
const taskRouter = express.Router();
const { protect } = require('./middleware/authMiddleware');
const {
  getTask,
  updateTask,
  deleteTask,
} = require('./controllers/taskController');
taskRouter.use(protect);
taskRouter.route('/:taskId').get(getTask).put(updateTask).delete(deleteTask);
app.use('/api/tasks', taskRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Only listen when running locally / on a normal server (not on Vercel)
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;