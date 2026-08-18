import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().catch(() => {});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB connection attempt on request if not yet established
app.use(async (req, res, next) => {
  try {
    connectDB().catch(() => {});
  } catch (e) {}
  next();
});

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Inisio - Greenfield Project Consultancy & Bank Funding API',
    documentation: '/api/health',
    status: 'active',
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Inisio Backend REST API Server is running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;

  .map((origin) => origin.trim())
  .filter(Boolean);

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., curl, server-to-server) with no Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Inisio - Greenfield Project Consultancy & Bank Funding API',
    documentation: '/api/health',
    status: 'active',
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Inisio Backend REST API Server is running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
