import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsCollection,
  getEventsCollection,
  AnalyticsDocument,
} from "@/lib/db/collections";
import { isMongoConfigured } from "@/lib/mongodb";
import { AnalyticsMetrics } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({
      connected: false,
      message: "MongoDB not configured",
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId parameter required" }, { status: 400 });
    }

    const analyticsColl = await getAnalyticsCollection();
    if (!analyticsColl) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const doc = await analyticsColl.findOne({ businessId });

    if (!doc) {
      // Default zero metrics if no activity recorded yet
      const defaultMetrics: AnalyticsMetrics = {
        totalScans: 0,
        aiReviewsGenerated: 0,
        googleMapsHandoffs: 0,
        privateFeedbacksCaptured: 0,
        conversionRate: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
      return NextResponse.json({ businessId, metrics: defaultMetrics });
    }

    return NextResponse.json({ businessId, metrics: doc });
  } catch (err: any) {
    console.error("GET /api/analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ connected: false, recorded: false });
  }

  try {
    const body = await req.json();
    const { businessId, type, rating } = body;

    if (!businessId || !type) {
      return NextResponse.json({ error: "businessId and type are required" }, { status: 400 });
    }

    const analyticsColl = await getAnalyticsCollection();
    const eventsColl = await getEventsCollection();

    if (!analyticsColl) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const now = new Date().toISOString();

    // 1. Record granular event
    if (eventsColl) {
      eventsColl.insertOne({
        businessId,
        type,
        rating: typeof rating === "number" ? rating : undefined,
        timestamp: now,
      }).catch((e) => console.warn("Failed to log event:", e));
    }

    // 2. Prepare atomic increment
    const incUpdate: any = {};
    if (type === "scan") incUpdate.totalScans = 1;
    if (type === "ai_generate") incUpdate.aiReviewsGenerated = 1;
    if (type === "handoff") incUpdate.googleMapsHandoffs = 1;
    if (type === "feedback") incUpdate.privateFeedbacksCaptured = 1;

    if (typeof rating === "number" && rating >= 1 && rating <= 5) {
      incUpdate[`ratingDistribution.${rating}`] = 1;
    }

    // Atomically upsert analytics doc
    await analyticsColl.updateOne(
      { businessId },
      {
        $inc: incUpdate,
        $set: { lastUpdated: now },
        $setOnInsert: {
          businessId,
          // ensure initial 0 values for fields not incremented in this call
          ...(!incUpdate.totalScans && { totalScans: 0 }),
          ...(!incUpdate.aiReviewsGenerated && { aiReviewsGenerated: 0 }),
          ...(!incUpdate.googleMapsHandoffs && { googleMapsHandoffs: 0 }),
          ...(!incUpdate.privateFeedbacksCaptured && { privateFeedbacksCaptured: 0 }),
          ...(!rating && { ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }),
        },
      },
      { upsert: true }
    );

    // 3. Recalculate conversion rate
    const updated = await analyticsColl.findOne({ businessId });
    if (updated && updated.totalScans > 0) {
      const conversionRate = parseFloat(
        ((updated.googleMapsHandoffs / updated.totalScans) * 100).toFixed(1)
      );
      await analyticsColl.updateOne({ businessId }, { $set: { conversionRate } });
    }

    return NextResponse.json({ success: true, recorded: true });
  } catch (err: any) {
    console.error("POST /api/analytics error:", err);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
