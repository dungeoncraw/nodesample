import { MongoClient } from 'mongodb';
// Connection string to the database
const uri = process.env.MONGODB_URI;
// Validate that the database connection string has been configured.
if (!uri) {
  throw new Error('MONGODB_URI environment variable must be configured.');
}
// Cached connection promise
let cachedPromise = null;

export const connectToDatabase = async (): Promise<MongoClient> => {
  if (!cachedPromise) {
    cachedPromise =
      MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  const client = await cachedPromise;
  return client;
}