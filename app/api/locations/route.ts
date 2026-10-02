import { NextRequest, NextResponse } from "next/server";
import { getLocationsCollection, ensureDbIndexes, LocationDocument } from "@/lib/db/collections";
import { isMongoConfigured } from "@/lib/mongodb";
import { extractCleanPlaceId } from "@/lib/google-maps-utils";
import { BusinessProfile } from "@/lib/types";

let indexesEnsured = false;

export async function GET(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({
      connected: false,
      source: "unconfigured",
      locations: [],
      message: "MongoDB is not configured. Set MONGODB_URI in .env.local to enable cloud persistence.",
    });
  }

  try {
    const locationsColl = await getLocationsCollection();
    if (!locationsColl) {
      return NextResponse.json({ connected: false, locations: [] });
    }

    if (!indexesEnsured) {
      ensureDbIndexes().catch(() => {});
      indexesEnsured = true;
    }

    const { searchParams } = new URL(req.url);
    const placeIdParam = searchParams.get("placeId");
    const idParam = searchParams.get("id");

    if (placeIdParam) {
      const cleanId = extractCleanPlaceId(placeIdParam) || placeIdParam.trim();
      const location = await locationsColl.findOne({
        $or: [
          { placeId: cleanId },
          { id: cleanId },
        ],
      });
      return NextResponse.json({ connected: true, location });
    }

    if (idParam) {
      const location = await locationsColl.findOne({ id: idParam });
      return NextResponse.json({ connected: true, location });
    }

    const locations = await locationsColl
      .find({})
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      connected: true,
      count: locations.length,
      locations,
    });
  } catch (err: any) {
    console.error("GET /api/locations error:", err);
    return NextResponse.json(
      { error: "Failed to fetch locations", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      {
        connected: false,
        error: "MongoDB is not configured. Set MONGODB_URI in .env.local",
      },
      { status: 503 }
    );
  }

  try {
    const locationsColl = await getLocationsCollection();
    if (!locationsColl) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    // Check if body is an array or has a `locations` array (bulk import)
    const items: BusinessProfile[] = Array.isArray(body)
      ? body
      : Array.isArray(body.locations)
      ? body.locations
      : [body];

    const results: LocationDocument[] = [];

    for (const item of items) {
      const cleanPlaceId = extractCleanPlaceId(item.placeId) || item.placeId?.trim() || "";
      const doc: LocationDocument = {
        ...item,
        id: item.id || `biz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        placeId: cleanPlaceId,
        createdAt: item.createdAt || now,
        updatedAt: now,
      };

      await locationsColl.updateOne(
        { $or: [{ id: doc.id }, { placeId: doc.placeId }] },
        { $set: doc },
        { upsert: true }
      );
      results.push(doc);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      locations: results,
    });
  } catch (err: any) {
    console.error("POST /api/locations error:", err);
    return NextResponse.json(
      { error: "Failed to save location", details: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    const locationsColl = await getLocationsCollection();
    if (!locationsColl) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const placeId = searchParams.get("placeId");

    if (!id && !placeId) {
      return NextResponse.json({ error: "Location id or placeId required" }, { status: 400 });
    }

    const filter: any = {};
    if (id) filter.id = id;
    if (placeId) filter.placeId = extractCleanPlaceId(placeId) || placeId;

    const res = await locationsColl.deleteOne(filter);
    return NextResponse.json({ success: true, deletedCount: res.deletedCount });
  } catch (err: any) {
    console.error("DELETE /api/locations error:", err);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
