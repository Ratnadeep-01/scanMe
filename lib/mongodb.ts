import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Returns true if the MONGODB_URI environment variable has been set.
 */
export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

/**
 * Singleton connection manager for MongoDB.
 * In development, utilizes a global variable so the connection is preserved
 * across HMR (Hot Module Replacement) and Fast Refresh reloads.
 */
export async function getMongoClientPromise(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      return global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
      }
      return clientPromise;
    }
  } catch (err) {
    console.error("Failed to connect to MongoDB client:", err);
    return null;
  }
}

/**
 * Helper to obtain the active MongoDB Database instance.
 */
export async function getDatabase(dbName?: string) {
  const promise = await getMongoClientPromise();
  if (!promise) return null;
  try {
    const resolvedClient = await promise;
    const targetDb = dbName || process.env.MONGODB_DB || "reviewboost";
    return resolvedClient.db(targetDb);
  } catch (err) {
    console.error("Failed to obtain MongoDB database:", err);
    return null;
  }
}
