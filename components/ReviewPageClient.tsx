"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewFlow } from "./ReviewFlow";
import { BusinessProfile } from "@/lib/types";
import { getStoredBusinesses } from "@/lib/business-store";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

interface ReviewPageClientProps {
  initialPlaceId?: string;
  initialBusinessName?: string;
}

export const ReviewPageClient: React.FC<ReviewPageClientProps> = ({
  initialPlaceId,
  initialBusinessName,
}) => {
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);

  const queryPlaceId = searchParams.get("placeId") || initialPlaceId || "";
  const queryBusinessName = searchParams.get("name") || searchParams.get("businessName") || initialBusinessName || "";

  useEffect(() => {
    const stored = getStoredBusinesses();

    if (queryPlaceId) {
      const found = stored.find(
        (b) =>
          b.id.toLowerCase() === queryPlaceId.toLowerCase() ||
          b.placeId.toLowerCase() === queryPlaceId.toLowerCase()
      );

      if (found) {
        if (queryBusinessName && found.name !== queryBusinessName) {
          setBusiness({ ...found, name: queryBusinessName });
        } else {
          setBusiness(found);
        }
        return;
      }

      // Dynamic business profile for arbitrary Google Place ID
      const dynamicBiz: BusinessProfile = {
        id: `dynamic-${queryPlaceId}`,
        name: queryBusinessName || "Google Verified Venue",
        placeId: queryPlaceId,
        category: "other",
        categoryLabel: "Verified Location",
        address: "Google Maps Verified Location",
        city: "Local Area",
        brandColor: "#0f172a",
        ratingAverage: 5.0,
        totalGoogleReviews: 0,
        headline: "How was your visit today?",
        subheadline: "Your review on Google Maps helps others find our venue",
        customTags: [
          "Prompt service",
          "Quality experience",
          "Helpful staff",
          "Clean premises",
          "Fair pricing",
        ],
      };
      setBusiness(dynamicBiz);
      return;
    }

    // If no placeId in params, check if user has an active saved business
    if (stored.length > 0) {
      setBusiness(stored[0]);
    }
  }, [queryPlaceId, queryBusinessName]);

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            No Location Linked
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Please scan a valid venue QR code or configure a Google Place ID in the admin console.
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-block bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-medium text-xs px-4 py-2 rounded-lg"
            >
              Open Admin Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 sm:py-10 px-4 flex flex-col justify-between">
      <div className="w-full max-w-lg mx-auto mb-4 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/"
          className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span className="flex items-center gap-1 text-slate-400">
          <Building2 className="w-3 h-3" />
          <span>Google Review Assistant</span>
        </span>
      </div>

      <main className="w-full flex-1 flex items-center justify-center">
        <ReviewFlow business={business} />
      </main>

      <footer className="w-full max-w-lg mx-auto mt-6 text-center text-[11px] text-slate-400 dark:text-zinc-500">
        Google Places Review Integration • Client Clipboard Buffer
      </footer>
    </div>
  );
};
