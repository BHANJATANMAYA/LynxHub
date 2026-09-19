import mongoose from 'mongoose';
import { env } from './env';

let mongoMemoryServer: any = null;

export async function connectDB(): Promise<typeof mongoose> {
  let uri = env.MONGODB_URI;

  if (!uri) {
    try {
      console.log('⚡ [Database] No MONGODB_URI provided. Initializing in-memory MongoDB engine...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'lynxhub_dev',
        },
      });
      uri = mongoMemoryServer.getUri();
      console.log(`✅ [Database] Embedded MongoDB instance started at: ${uri}`);
    } catch (err) {
      console.warn('⚠️ [Database] Failed to launch MongoMemoryServer. Falling back to default localhost URI.', err);
      uri = 'mongodb://127.0.0.1:27017/lynxhub_dev';
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log(`✅ [Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ [Database] MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('🔌 [Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('❌ [Database] Error during disconnect:', err);
  }
}
