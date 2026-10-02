"use client";

import React, { useSyncExternalStore, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewFlow } from "./ReviewFlow";
import { BusinessProfile, BusinessCategory } from "@/lib/types";
import {
  getStoredBusinesses,
  getActiveBusinessId,
  CATEGORY_TAG_PRESETS,
} from "@/lib/business-store";
import { extractCleanPlaceId } from "@/lib/google-maps-utils";
import { CATEGORY_OPTIONS } from "./AdminDashboard";
import { Building2 } from "lucide-react";

interface ReviewPageClientProps {
  initialPlaceId?: string;
  initialBusinessName?: string;
}

const emptySubscribe = () => () => {};

export const ReviewPageClient: React.FC<ReviewPageClientProps> = ({
  initialPlaceId,
  initialBusinessName,
}) => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const searchParams = useSearchParams();

  const rawPlaceId = searchParams.get("placeId") || searchParams.get("place_id") || initialPlaceId || "";
  const queryPlaceId = extractCleanPlaceId(rawPlaceId) || rawPlaceId.trim();
  const queryBusinessName =
    searchParams.get("name") ||
    searchParams.get("businessName") ||
    searchParams.get("business_name") ||
    initialBusinessName ||
    "";
  const queryCategory = searchParams.get("category") || "";
  const queryId = searchParams.get("id") || "";

  const business: BusinessProfile = useMemo(() => {
    const stored = getStoredBusinesses();

    // 1. If queryPlaceId or queryId is provided, try to find in stored businesses
    if (queryPlaceId || queryId) {
      const found = stored.find(
        (b) =>
          (queryId && b.id.toLowerCase() === queryId.toLowerCase()) ||
          (queryPlaceId && (
            b.placeId.toLowerCase() === queryPlaceId.toLowerCase() ||
            b.id.toLowerCase() === queryPlaceId.toLowerCase()
          ))
      );

      if (found) {
        if (queryBusinessName && found.name !== queryBusinessName) {
          return { ...found, name: queryBusinessName };
        }
        return found;
      }

      // If not in local storage, dynamically construct a complete BusinessProfile from the URL parameters!
      const catKey = (queryCategory.toLowerCase() as BusinessCategory) || "college";
      const catConfig = CATEGORY_OPTIONS.find((c) => c.id === catKey) || CATEGORY_OPTIONS[0];

      return {
        id: `venue-${queryPlaceId}`,
        name: queryBusinessName || "Google Verified Venue",
        placeId: queryPlaceId,
        category: catKey,
        categoryLabel: catConfig.label,
        address: "Google Maps Verified Location",
        city: "Local Area",
        brandColor: "#0f172a",
        ratingAverage: 5.0,
        totalGoogleReviews: 0,
        headline: `How was your visit to ${queryBusinessName || "our venue"}?`,
        subheadline: "Your review on Google Maps helps others discover our venue",
        customTags:
          (queryCategory && CATEGORY_TAG_PRESETS[catKey]) ||
          catConfig.defaultTags || [
            "Prompt service",
            "Quality experience",
            "Helpful staff",
            "Clean premises",
            "Fair pricing",
          ],
      };
    }

    // 2. If business name is provided without placeId, search by name in stored businesses
    if (queryBusinessName) {
      const foundByName = stored.find(
        (b) => b.name.toLowerCase() === queryBusinessName.toLowerCase()
      );
      if (foundByName) {
        return foundByName;
      }
    }

    // 3. Fallback: if user navigates to /review with no query parameters, pick active or first business
    if (stored.length > 0) {
      const activeId = getActiveBusinessId();
      const initial = (activeId && stored.find((b) => b.id === activeId)) || stored[0];
      return initial;
    }

    // 4. Default demonstration profile so page never renders a dead error state
    return {
      id: "demo-venue",
      name: "NIT Patna Bihta Campus",
      placeId: "ChIJC-eGOdGpkjkRQRsEQi4SbE0",
      category: "college",
      categoryLabel: "College / University / Higher Education",
      address: "Bihta Campus, Patna",
      city: "Patna",
      brandColor: "#0f172a",
      ratingAverage: 5.0,
      totalGoogleReviews: 0,
      headline: "How was your visit to NIT Patna Bihta Campus?",
      subheadline: "Your review on Google Maps helps future students & visitors",
      customTags: [
        "Knowledgeable faculty",
        "Great campus & facilities",
        "Modern labs & library",
        "Helpful administration",
        "Vibrant student life",
      ],
    };
  }, [queryPlaceId, queryId, queryBusinessName, queryCategory]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 text-slate-400 text-xs font-medium">
        Loading review portal...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-xl border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-sm">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            No Venue Linked
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Please scan the QR code located on your table or counter stand to leave a review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 sm:py-8 px-4 flex flex-col justify-between">
      {/* Top Bar Label */}
      <div className="w-full max-w-lg mx-auto mb-3 flex items-center justify-center text-xs text-slate-400 dark:text-zinc-500">
        <span className="text-[11px] font-medium tracking-tight">
          Customer Review Portal
        </span>
      </div>

      {/* Main Review Flow */}
      <main className="w-full flex-1 flex items-center justify-center">
        <ReviewFlow business={business} />
      </main>

      {/* Footer reassurance */}
      <footer className="w-full max-w-lg mx-auto mt-6 text-center text-xs text-slate-400 dark:text-zinc-500">
        <p className="text-[11px]">
          Reviews are submitted directly into Google Maps
        </p>
      </footer>
    </div>
  );
};
