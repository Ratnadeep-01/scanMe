"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Send,
  AlertCircle,
  ShieldCheck,
  ThumbsUp,
  MapPin,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { StarRating } from "./StarRating";
import {
  BusinessProfile,
  ReviewGenerationRequest,
  ReviewGenerationResponse,
} from "@/lib/types";
import {
  CATEGORY_TAG_PRESETS,
  CATEGORY_GRIEVANCE_PRESETS,
  trackAnalyticsEvent,
  addPrivateFeedback,
} from "@/lib/business-store";
import {
  getGoogleReviewUrl,
  copyTextToClipboard,
} from "@/lib/google-maps-utils";

interface ReviewFlowProps {
  business: BusinessProfile;
  previewMode?: boolean;
}

export const ReviewFlow: React.FC<ReviewFlowProps> = ({
  business,
  previewMode = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState<string>("");
  const [tone, setTone] = useState<"casual" | "enthusiastic" | "professional" | "concise">("casual");
  const [reviewText, setReviewText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [generationCount, setGenerationCount] = useState<number>(0);

  // Hand-off Modal State
  const [showHandoffModal, setShowHandoffModal] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Private Grievance Flow State (1-3 stars)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [grievanceText, setGrievanceText] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerContact, setCustomerContact] = useState<string>("");
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<boolean>(false);
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState<boolean>(false);
  const [forcePublicReview, setForcePublicReview] = useState<boolean>(false);

  const availableTags =
    business.customTags && business.customTags.length > 0
      ? business.customTags
      : CATEGORY_TAG_PRESETS[business.category] || CATEGORY_TAG_PRESETS.other;

  const grievanceOptions =
    CATEGORY_GRIEVANCE_PRESETS[business.category] ||
    CATEGORY_GRIEVANCE_PRESETS.default;

  // Track scan on mount
  useEffect(() => {
    if (!previewMode && business.id) {
      trackAnalyticsEvent(business.id, "scan");
    }
  }, [business.id, previewMode]);

  // Initial review drafting trigger
  const handleGenerateReview = async (forcedTone?: typeof tone) => {
    setIsGenerating(true);
    const activeTone = forcedTone || tone;

    try {
      const payload: ReviewGenerationRequest = {
        businessName: business.name,
        category: business.categoryLabel || business.category,
        placeId: business.placeId,
        rating,
        tags: selectedTags,
        tone: activeTone,
        customNote: customNote.trim() ? customNote.trim() : undefined,
        length: activeTone === "concise" ? "short" : "medium",
      };

      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: ReviewGenerationResponse = await res.json();
        setReviewText(data.review);
        setAlternatives(data.alternativeVariations || []);
        setGenerationCount((prev) => prev + 1);

        if (!previewMode && business.id) {
          trackAnalyticsEvent(business.id, "ai_generate", rating);
        }
      }
    } catch (err) {
      console.error("Failed to generate review:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleRatingSelect = (newRating: number) => {
    setRating(newRating);
    if (newRating >= 4 && selectedTags.length === 0 && availableTags.length > 0) {
      setSelectedTags([availableTags[0], availableTags[1]].filter(Boolean));
    }
  };

  useEffect(() => {
    if (rating >= 4 && !reviewText && !isGenerating && generationCount === 0) {
      handleGenerateReview();
    }
  }, [rating]);

  const handlePostToGoogle = async () => {
    const textToCopy = reviewText.trim();
    const success = await copyTextToClipboard(textToCopy);
    setCopiedState(success);

    if (!previewMode && business.id) {
      trackAnalyticsEvent(business.id, "handoff", rating);
    }

    setShowHandoffModal(true);
    setTimeout(() => {
      openGoogleReviewDirectly();
    }, 1000);
  };

  const openGoogleReviewDirectly = () => {
    const url = getGoogleReviewUrl(business.placeId, business.name);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;

    setIsSubmittingGrievance(true);
    try {
      addPrivateFeedback({
        businessId: business.id || "default",
        businessName: business.name,
        rating,
        issues: selectedIssues,
        comment: grievanceText.trim(),
        customerName: customerName.trim() || undefined,
        customerContact: customerContact.trim() || undefined,
        preferredContactMethod: customerContact.includes("@") ? "email" : "phone",
      });

      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          businessName: business.name,
          rating,
          issues: selectedIssues,
          comment: grievanceText.trim(),
          customerName,
          customerContact,
        }),
      }).catch(() => {});

      setGrievanceSubmitted(true);
    } finally {
      setIsSubmittingGrievance(false);
    }
  };

  const isPositiveFlow = rating >= 4 || forcePublicReview;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Brand Header */}
      <div className="bg-slate-900 p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Maps Review</span>
          </span>
          {business.city && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {business.city}
            </span>
          )}
        </div>

        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
          {business.name}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {business.categoryLabel || business.category}
        </p>
      </div>

      {/* Main Review Section */}
      <div className="p-5 space-y-5">
        {/* Step 1: Star Rating */}
        <div className="text-center py-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
            {business.headline || "How was your experience today?"}
          </p>
          <StarRating rating={rating} onChange={handleRatingSelect} size="lg" />
        </div>

        {/* ---------------------------------------------------- */}
        {/* POSITIVE FLOW: 4 OR 5 STARS */}
        {/* ---------------------------------------------------- */}
        {isPositiveFlow && (
          <div className="space-y-4">
            {/* Quick-Tags Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Highlights
                </label>
                <span className="text-[11px] text-slate-400">Select to include</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
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

            {/* Optional Custom Note */}
            <div>
              <input
                type="text"
                placeholder="Optional detail to mention (e.g. staff member or service)..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Review Text Area Container */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  <span>Drafted Review</span>
                </div>

                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: "casual", label: "Casual" },
                      { id: "enthusiastic", label: "Enthusiastic" },
                      { id: "concise", label: "Short" },
                      { id: "professional", label: "Professional" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTone(t.id);
                        handleGenerateReview(t.id);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        tone === t.id
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Review text will be drafted automatically..."
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
                <span>{reviewText.split(/\s+/).filter(Boolean).length} words</span>
                <button
                  type="button"
                  onClick={() => handleGenerateReview()}
                  disabled={isGenerating}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>Regenerate Draft</span>
                </button>
              </div>
            </div>

            {/* Primary Action Button: Copy & Open Google Maps */}
            <div className="pt-2">
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
                <span>Copies text and opens Google Maps directly</span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* GRIEVANCE FLOW: 1 TO 3 STARS */}
        {/* ---------------------------------------------------- */}
        {!isPositiveFlow && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-600 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    We apologize that your experience did not meet expectations.
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Your feedback will be sent directly to venue management so we can investigate and address the matter.
                  </p>
                </div>
              </div>
            </div>

            {!grievanceSubmitted ? (
              <form onSubmit={handleSubmitGrievance} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                    What occurred?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {grievanceOptions.map((issue) => {
                      const isSelected = selectedIssues.includes(issue);
                      return (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => toggleIssue(issue)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 font-medium"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {issue}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Details for Management
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder="Please explain what happened..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-0.5">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-0.5">
                      Contact for Follow-up
                    </label>
                    <input
                      type="text"
                      placeholder="Email or phone"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!grievanceText.trim() || isSubmittingGrievance}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingGrievance ? "Sending..." : "Submit to Management"}</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-center space-y-1.5">
                <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Feedback Received
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Your feedback has been routed to the venue management team.
                </p>
              </div>
            )}

            <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setForcePublicReview(true)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Proceed to public Google Maps review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hand-off Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 text-center space-y-4 shadow-xl border border-slate-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto text-slate-800 dark:text-zinc-200">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Review Copied to Clipboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Tap 5 stars and paste your drafted review into Google Maps.
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
              <button
                type="button"
                onClick={openGoogleReviewDirectly}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
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
};
