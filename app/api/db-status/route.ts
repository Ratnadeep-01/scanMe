import { NextResponse } from "next/server";
import { isMongoConfigured, getDatabase } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";

export async function GET() {
  const configured = isMongoConfigured();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      status: "unconfigured",
      message: "MongoDB connection string (MONGODB_URI) is not configured in .env.local.",
      instruction: "Add MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reviewboost to your .env.local file.",
    });
  }

  try {
    const startTime = Date.now();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        configured: true,
        connected: false,
        status: "error",
        message: "Failed to initialize database instance",
      }, { status: 500 });
    }

    // Ping the server to measure roundtrip latency
    await db.command({ ping: 1 });
    const pingMs = Date.now() - startTime;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Get document counts
    const locationCount = collectionNames.includes(COLLECTIONS.LOCATIONS)
      ? await db.collection(COLLECTIONS.LOCATIONS).countDocuments()
      : 0;

    const feedbackCount = collectionNames.includes(COLLECTIONS.FEEDBACKS)
      ? await db.collection(COLLECTIONS.FEEDBACKS).countDocuments()
      : 0;

    const analyticsCount = collectionNames.includes(COLLECTIONS.ANALYTICS)
      ? await db.collection(COLLECTIONS.ANALYTICS).countDocuments()
      : 0;

    return NextResponse.json({
      configured: true,
      connected: true,
      status: "connected",
      databaseName: db.databaseName,
      pingMs,
      collections: collectionNames,
      counts: {
        locations: locationCount,
        feedbacks: feedbackCount,
        analytics: analyticsCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/db-status ping failed:", err);
    return NextResponse.json({
      configured: true,
      connected: false,
      status: "connection_error",
      error: err?.message || "Failed to reach MongoDB cluster",
      instruction: "Check that your IP address is whitelisted in MongoDB Atlas (Network Access -> Allow Access from Anywhere: 0.0.0.0/0) and that credentials in MONGODB_URI are correct.",
    });
  }
}
