import { Collection, Document } from "mongodb";
import { getDatabase } from "../mongodb";
import { BusinessProfile, AnalyticsMetrics, PrivateFeedbackSubmission } from "../types";

export const COLLECTIONS = {
  LOCATIONS: "locations",
  ANALYTICS: "analytics",
  FEEDBACKS: "feedbacks",
  EVENTS: "events",
} as const;

export interface LocationDocument extends BusinessProfile, Document {
  _id?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsDocument extends AnalyticsMetrics, Document {
  _id?: any;
  businessId: string;
  lastUpdated: string;
}

export interface FeedbackDocument extends PrivateFeedbackSubmission, Document {
  _id?: any;
}

export interface EventDocument extends Document {
  _id?: any;
  businessId: string;
  type: "scan" | "ai_generate" | "handoff";
  rating?: number;
  timestamp: string;
}

/**
 * Access the locations collection.
 */
export async function getLocationsCollection(): Promise<Collection<LocationDocument> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<LocationDocument>(COLLECTIONS.LOCATIONS);
}

/**
 * Access the analytics collection.
 */
export async function getAnalyticsCollection(): Promise<Collection<AnalyticsDocument> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<AnalyticsDocument>(COLLECTIONS.ANALYTICS);
}

/**
 * Access the feedbacks collection.
 */
export async function getFeedbacksCollection(): Promise<Collection<FeedbackDocument> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<FeedbackDocument>(COLLECTIONS.FEEDBACKS);
}

/**
 * Access the granular event telemetry collection.
 */
export async function getEventsCollection(): Promise<Collection<EventDocument> | null> {
  const db = await getDatabase();
  if (!db) return null;
  return db.collection<EventDocument>(COLLECTIONS.EVENTS);
}

/**
 * Ensures optimal database performance and uniqueness constraints.
 */
export async function ensureDbIndexes(): Promise<boolean> {
  try {
    const locations = await getLocationsCollection();
    if (locations) {
      await locations.createIndex({ id: 1 }, { unique: true });
      await locations.createIndex({ placeId: 1 });
    }

    const analytics = await getAnalyticsCollection();
    if (analytics) {
      await analytics.createIndex({ businessId: 1 }, { unique: true });
    }

    const feedbacks = await getFeedbacksCollection();
    if (feedbacks) {
      await feedbacks.createIndex({ businessId: 1 });
      await feedbacks.createIndex({ createdAt: -1 });
    }

    const events = await getEventsCollection();
    if (events) {
      await events.createIndex({ businessId: 1, timestamp: -1 });
    }

    return true;
  } catch (err) {
    console.warn("MongoDB index creation warning:", err);
    return false;
  }
}
