import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

// Global interface to maintain MongoDB connection cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add the mongoose cache to the global namespace to prevent reconnections
declare global {
  var mongooseCache: MongooseCache;
}

// Initialize the cached connection
let cached = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase() {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create new promise for connection
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    // Wait for connection to complete
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, clear the promise
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 