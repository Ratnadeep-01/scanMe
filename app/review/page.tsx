import { Suspense } from "react";
import { ReviewPageClient } from "@/components/ReviewPageClient";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 text-slate-500 text-xs">
          Loading review portal...
        </div>
      }
    >
      <ReviewPageClient />
    </Suspense>
  );
}
