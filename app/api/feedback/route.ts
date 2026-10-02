import { NextRequest, NextResponse } from "next/server";
import { getFeedbacksCollection, FeedbackDocument } from "@/lib/db/collections";
import { isMongoConfigured } from "@/lib/mongodb";
import { PrivateFeedbackSubmission } from "@/lib/types";

// In-memory fallback if MongoDB is not configured
const inMemoryFeedbacks: PrivateFeedbackSubmission[] = [];

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const submission: PrivateFeedbackSubmission = {
      ...data,
      id: data.id || `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: data.createdAt || new Date().toISOString(),
      status: data.status || "new",
    };

    if (isMongoConfigured()) {
      const feedbacksColl = await getFeedbacksCollection();
      if (feedbacksColl) {
        await feedbacksColl.insertOne(submission as FeedbackDocument);
        return NextResponse.json({ success: true, submission, persistedTo: "mongodb" });
      }
    }

    // Fallback in-memory
    inMemoryFeedbacks.unshift(submission);
    return NextResponse.json({ success: true, submission, persistedTo: "in-memory" });
  } catch (err: any) {
    console.error("POST /api/feedback error:", err);
    return NextResponse.json(
      { error: "Failed to record feedback", details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (isMongoConfigured()) {
      const feedbacksColl = await getFeedbacksCollection();
      if (feedbacksColl) {
        const query: any = {};
        if (businessId) {
          query.businessId = businessId;
        }
        const feedbacks = await feedbacksColl
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        return NextResponse.json({ connected: true, feedbacks });
      }
    }

    const filtered = businessId
      ? inMemoryFeedbacks.filter((f) => f.businessId === businessId)
      : inMemoryFeedbacks;

    return NextResponse.json({ connected: false, feedbacks: filtered });
  } catch (err: any) {
    console.error("GET /api/feedback error:", err);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    if (isMongoConfigured()) {
      const feedbacksColl = await getFeedbacksCollection();
      if (feedbacksColl) {
        await feedbacksColl.updateOne({ id }, { $set: { status } });
        return NextResponse.json({ success: true, status });
      }
    }

    const item = inMemoryFeedbacks.find((f) => f.id === id);
    if (item) {
      item.status = status;
    }

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    console.error("PATCH /api/feedback error:", err);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
