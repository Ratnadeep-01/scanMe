import { Suspense } from "react";
import { ReviewPageClient } from "@/components/ReviewPageClient";

export default async function ReviewQueryPage({
  searchParams,
}: {
  searchParams: Promise<{ placeId?: string; businessName?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 text-slate-500">
          Loading review portal...
        </div>
      }
    >
      <ReviewPageClient
        initialPlaceId={resolvedSearchParams.placeId || "rustic-table"}
        initialBusinessName={resolvedSearchParams.businessName}
      />
    </Suspense>
  );
}
