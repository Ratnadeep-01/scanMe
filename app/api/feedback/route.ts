import { NextRequest, NextResponse } from "next/server";
import { PrivateFeedbackSubmission } from "@/lib/types";

// In-memory feedback store on server instance
const serverFeedbacks: PrivateFeedbackSubmission[] = [];

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const submission: PrivateFeedbackSubmission = {
      ...data,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    serverFeedbacks.unshift(submission);
    return NextResponse.json({ success: true, submission });
  } catch (err) {
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ feedbacks: serverFeedbacks });
}
