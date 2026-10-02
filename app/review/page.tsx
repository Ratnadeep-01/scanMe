"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const ATTRIBUTE_TAGS = [
  "Great food",
  "Prompt service",
  "Cozy vibe",
  "Affordable",
  "Friendly staff",
  "Spotless clean",
  "Delicious drinks",
  "Great ambiance",
];

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId") || "ChIJ7xG9y22uEmsREK03gQx3Z3w";
  const businessName =
    searchParams.get("name") ||
    searchParams.get("businessName") ||
    "The Rustic Table Bistro";

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Prompt service",
    "Cozy vibe",
  ]);
  const [reviewText, setReviewText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [showDirectModal, setShowDirectModal] = useState<boolean>(false);
  const [clipboardError, setClipboardError] = useState<boolean>(false);

  // Debounce & in-flight request controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to call /api/generate-review
  const triggerReviewGeneration = async (
    currentRating: number,
    currentTags: string[]
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          name: businessName,
          rating: currentRating,
          tags: currentTags,
          category: "venue",
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.review) {
          setReviewText(data.review);
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Failed to generate review:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger review generation whenever rating or tags change
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerReviewGeneration(rating, selectedTags);
    }, 250);

    return () => clearTimeout(timer);
  }, [rating, selectedTags, businessName]);

  // Toggle attribute tag chips
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  /**
   * Universal resilient clipboard write with legacy fallback.
   */
  const writeClipboardSafely = async (text: string): Promise<boolean> => {
    if (!text) return false;

    // Modern asynchronous clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Async clipboard API failed, attempting fallback:", err);
      }
    }

    // Fallback for restricted in-app webviews (Instagram, WeChat, iOS Safari iframe)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error("Fallback clipboard failed:", fallbackErr);
      return false;
    }
  };

  /**
   * Google Maps Hand-Off Mechanism
   */
  const handlePostToGoogle = async () => {
    const textToCopy = reviewText.trim();
    const copiedSuccessfully = await writeClipboardSafely(textToCopy);

    const googleReviewUrl =
      placeId && !placeId.startsWith("demo-")
        ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
            placeId.trim()
          )}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            businessName
          )}`;

    if (copiedSuccessfully) {
      setCopiedToast(true);
      setShowDirectModal(true);

      // Brief delay so customer sees confirmation before deep link opens
      setTimeout(() => {
        window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
      }, 1200);
    } else {
      // If clipboard permission was strictly blocked, prompt user to copy manually
      setClipboardError(true);
      setShowDirectModal(true);
    }
  };

  const directGoogleUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
    placeId.trim()
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 sm:py-10 px-4 flex flex-col items-center justify-center">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-5 z-50 animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-slate-700">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Copied to clipboard! Opening Google Maps...</span>
          </div>
        </div>
      )}

      {/* Main Review Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Verified Google Review</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {businessName}
          </h1>
          <p className="text-xs text-orange-100 mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>15-Second Google Review Helper</span>
          </p>
        </div>

        {/* Interactive Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. Star Rating Selector */}
          <div className="text-center space-y-2 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Rate your experience
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3 touch-manipulation">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= rating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className="p-1.5 transition-transform duration-150 active:scale-125 focus:outline-none cursor-pointer"
                    aria-label={`${starValue} Stars`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-500 filter drop-shadow-sm"
                          : "fill-slate-100 text-slate-300 dark:fill-zinc-800 dark:text-zinc-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {rating === 5
                ? "Loved it! (5/5)"
                : rating === 4
                ? "Great visit! (4/5)"
                : rating === 3
                ? "Average / Okay (3/5)"
                : "Could be better"}
            </div>
          </div>

          {/* 2. Attribute / Category Tag Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                What did you enjoy?
              </label>
              <span className="text-[11px] text-slate-400">Tap to update draft</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ATTRIBUTE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-200 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    )}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Editable Draft Review Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Drafted Review</span>
              </label>
              <button
                type="button"
                onClick={() => triggerReviewGeneration(rating, selectedTags)}
                disabled={isGenerating}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`}
                />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Generating authentic review..."
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/70 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 transition-all resize-none shadow-inner"
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xs rounded-2xl flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Drafting review with AI...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>You can freely edit this text before posting.</span>
              <span>{reviewText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          {/* 4. Call to Action: Post on Google Maps */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePostToGoogle}
              disabled={!reviewText.trim()}
              className="w-full bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              <span>Post on Google Maps</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Copies text & opens Google Maps review box automatically</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Hand-off Modal & Manual Fallback */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100 dark:border-zinc-800">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {clipboardError ? "Review Ready" : "Review Copied to Clipboard!"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {clipboardError
                  ? "Please copy your review below and proceed to Google Maps:"
                  : "Due to Google security, tap 5 stars and paste your review inside the Google form."}
              </p>
            </div>

            {/* Instruction box */}
            <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl text-left text-xs space-y-2 border border-slate-100 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Select 5 Stars on Google</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Long-press & Paste review text</span>
              </div>
            </div>

            {/* Action button */}
            <div className="space-y-2 pt-1">
              <a
                href={directGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDirectModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 text-slate-500 text-sm font-medium">
          Loading review portal...
        </div>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}
