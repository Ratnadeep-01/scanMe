import { Suspense } from "react";
import { ReviewPageClient } from "@/components/ReviewPageClient";

export default async function ReviewByPlaceIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ placeId: string }>;
  searchParams: Promise<{ businessName?: string }>;
}) {
  const resolvedParams = await params;
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
        initialPlaceId={resolvedParams.placeId}
        initialBusinessName={resolvedSearchParams.businessName}
      />
    </Suspense>
  );
}
