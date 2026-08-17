import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedConnection = null;

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://pravalikajunnu14_db_user:neEAtLI68mw0aUAP@cluster0.t7kby6b.mongodb.net/inisio?retryWrites=true&w=majority';

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not terminate process immediately in dev/preview mode, allow graceful retry
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
