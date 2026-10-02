"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Building,
} from "lucide-react";
import { getStoredBusinesses } from "@/lib/business-store";
import { StarRating } from "@/components/StarRating";

const DEFAULT_ATTRIBUTE_TAGS = [
  "Prompt service",
  "Quality experience",
  "Helpful staff",
  "Clean premises",
  "Attention to detail",
  "Fair pricing",
];

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryPlaceId = searchParams.get("placeId");
  const queryName = searchParams.get("name") || searchParams.get("businessName");

  const [businessName, setBusinessName] = useState<string>(queryName || "");
  const [placeId, setPlaceId] = useState<string>(queryPlaceId || "");
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Fallback setup form state if no placeId is provided
  const [manualName, setManualName] = useState("");
  const [manualPlaceId, setManualPlaceId] = useState("");

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Prompt service",
    "Quality experience",
  ]);
  const [reviewText, setReviewText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [showDirectModal, setShowDirectModal] = useState<boolean>(false);
  const [clipboardError, setClipboardError] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine initial business state
  useEffect(() => {
    if (queryPlaceId && queryName) {
      setPlaceId(queryPlaceId);
      setBusinessName(queryName);
      setIsConfigured(true);
    } else {
      // Check if an active business is saved in local storage
      const stored = getStoredBusinesses();
      if (stored.length > 0) {
        setPlaceId(stored[0].placeId);
        setBusinessName(stored[0].name);
        setIsConfigured(true);
      } else {
        setIsConfigured(false);
      }
    }
  }, [queryPlaceId, queryName]);

  const triggerReviewGeneration = async (
    currentRating: number,
    currentTags: string[]
  ) => {
    if (!businessName) return;

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

  useEffect(() => {
    if (isConfigured && businessName) {
      const timer = setTimeout(() => {
        triggerReviewGeneration(rating, selectedTags);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [rating, selectedTags, businessName, isConfigured]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const writeClipboardSafely = async (text: string): Promise<boolean> => {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Async clipboard API failed, attempting fallback:", err);
      }
    }

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

  const handlePostToGoogle = async () => {
    const textToCopy = reviewText.trim();
    const copiedSuccessfully = await writeClipboardSafely(textToCopy);

    const googleReviewUrl = placeId
      ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
          placeId.trim()
        )}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          businessName
        )}`;

    if (copiedSuccessfully) {
      setCopiedToast(true);
      setShowDirectModal(true);

      setTimeout(() => {
        window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
      }, 1000);
    } else {
      setClipboardError(true);
      setShowDirectModal(true);
    }
  };

  const handleManualSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPlaceId.trim()) return;

    router.push(
      `/review?placeId=${encodeURIComponent(
        manualPlaceId.trim()
      )}&name=${encodeURIComponent(manualName.trim())}`
    );
  };

  const directGoogleUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
    placeId.trim()
  )}`;

  // If no place is linked yet, show clean configuration prompt
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-slate-800 dark:text-zinc-200 mb-3">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Google Place Review Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Provide your Business Name and Google Place ID to launch your custom review page.
            </p>
          </div>

          <form onSubmit={handleManualSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Coffee Roasters"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                value={manualPlaceId}
                onChange={(e) => setManualPlaceId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Launch Review Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 sm:py-10 px-4 flex flex-col items-center justify-center">
      {/* Toast Feedback */}
      {copiedToast && (
        <div className="fixed top-5 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium border border-slate-700">
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            <span>Copied to clipboard. Opening Google Maps...</span>
          </div>
        </div>
      )}

      {/* Main Review Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-black p-5 text-white text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-md text-[11px] font-medium text-slate-300 mb-2">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Google Maps Review Assistant</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            {businessName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Share your experience on Google
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. Star Rating Selector */}
          <div className="text-center space-y-2 bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Select rating
            </label>
            <StarRating rating={rating} onChange={setRating} size="lg" />
          </div>

          {/* 2. Attribute Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Key Highlights
              </label>
              <span className="text-[11px] text-slate-400">Select to include in draft</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_ATTRIBUTE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Editable Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                <span>Drafted Review</span>
              </label>
              <button
                type="button"
                onClick={() => triggerReviewGeneration(rating, selectedTags)}
                disabled={isGenerating}
                className="text-[11px] text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Review draft will appear here..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xs rounded-xl flex items-center justify-center gap-2 text-slate-800 dark:text-zinc-200 text-xs font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting review...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>You may edit this review before posting.</span>
              <span>{reviewText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          {/* 4. Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handlePostToGoogle}
              disabled={!reviewText.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-40"
            >
              <Copy className="w-4 h-4" />
              <span>Copy & Post to Google Maps</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Copies review and redirects directly to Google's submission dialog</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hand-off Confirmation & Fallback */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 text-center space-y-4 shadow-xl border border-slate-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto text-slate-800 dark:text-zinc-200">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {clipboardError ? "Review Ready" : "Review Copied to Clipboard"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {clipboardError
                  ? "Copy your review below and proceed to Google Maps:"
                  : "Tap 5 stars and paste your text into the Google Maps review box."}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-lg text-left text-xs space-y-2 border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
                <span className="w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select 5 Stars on Google Maps</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
                <span className="w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Long-press & Paste your review</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={directGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDirectModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 py-1 cursor-pointer"
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
        <div className="min-h-screen flex items-center justify-center p-4 text-slate-500 text-xs">
          Loading review portal...
        </div>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}
