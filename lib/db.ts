import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectToDatabase() {
  const mongoUri = MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: "houseofedtech_assignment",
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
