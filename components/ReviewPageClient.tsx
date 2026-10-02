"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewFlow } from "./ReviewFlow";
import { BusinessProfile } from "@/lib/types";
import { getStoredBusinesses, INITIAL_BUSINESSES } from "@/lib/business-store";
import { ArrowLeft, Sparkles, Building2 } from "lucide-react";
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

  const queryPlaceId = searchParams.get("placeId") || initialPlaceId || "rustic-table";
  const queryBusinessName = searchParams.get("businessName") || initialBusinessName;

  useEffect(() => {
    const stored = getStoredBusinesses();

    // Match either by internal ID or by Google placeId
    const found = stored.find(
      (b) =>
        b.id.toLowerCase() === queryPlaceId.toLowerCase() ||
        b.placeId.toLowerCase() === queryPlaceId.toLowerCase()
    );

    if (found) {
      // If a custom business name was passed in query, override if needed
      if (queryBusinessName && found.name !== queryBusinessName) {
        setBusiness({ ...found, name: queryBusinessName });
      } else {
        setBusiness(found);
      }
    } else {
      // Dynamic on-the-fly business profile creation for ANY arbitrary Google Place ID
      const dynamicBiz: BusinessProfile = {
        id: `dynamic-${queryPlaceId}`,
        name: queryBusinessName || "Local Business",
        placeId: queryPlaceId,
        category: "other",
        categoryLabel: "Verified Google Business",
        address: "Google Maps Verified Location",
        city: "Local Area",
        brandColor: "#0284c7",
        ratingAverage: 4.9,
        totalGoogleReviews: 128,
        headline: "How was your experience with us today?",
        subheadline: "Your feedback helps others discover great local services!",
        customTags: [
          "Great service",
          "Friendly staff",
          "High quality",
          "Quick turnaround",
          "Fair pricing",
          "Highly recommended",
        ],
      };
      setBusiness(dynamicBiz);
    }
  }, [queryPlaceId, queryBusinessName]);

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-slate-500 font-medium animate-pulse flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Loading Review Experience...</span>
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
          <span>Back to Home</span>
        </Link>
        <span className="flex items-center gap-1 text-slate-400">
          <Building2 className="w-3 h-3" />
          <span>Google Review Portal</span>
        </span>
      </div>

      <main className="w-full flex-1 flex items-center justify-center">
        <ReviewFlow business={business} />
      </main>

      <footer className="w-full max-w-lg mx-auto mt-6 text-center text-[11px] text-slate-400 dark:text-zinc-500">
        Powered by ReviewBoost AI • Fast, authentic Google Maps customer feedback
      </footer>
    </div>
  );
};
