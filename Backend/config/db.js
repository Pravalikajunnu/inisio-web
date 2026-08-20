import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable buffering so queries fail-fast or fallback immediately instead of hanging for 10s
mongoose.set('bufferCommands', false);

let cachedConnection = null;

export const isDBConnected = () => {
  return Boolean(mongoose.connection && mongoose.connection.readyState === 1);
};

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI not provided. Running in resilient in-memory storage mode.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 4000,
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection not established (${error.message}). Resilient in-memory storage active.`);
    return null;
  }
};

export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

export default connectDB;

