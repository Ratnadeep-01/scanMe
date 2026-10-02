"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Send,
  AlertCircle,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react";
import { StarRating } from "./StarRating";
import {
  BusinessProfile,
  ReviewGenerationRequest,
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
  const availableTags =
    business.customTags && business.customTags.length > 0
      ? business.customTags
      : CATEGORY_TAG_PRESETS[business.category] || CATEGORY_TAG_PRESETS.other;

  const grievanceOptions =
    CATEGORY_GRIEVANCE_PRESETS[business.category] ||
    CATEGORY_GRIEVANCE_PRESETS.default;

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    availableTags.slice(0, 2)
  );
  const [customNote, setCustomNote] = useState<string>("");
  const [tone, setTone] = useState<"casual" | "enthusiastic" | "professional" | "concise">("casual");
  const [reviewText, setReviewText] = useState<string>(() =>
    `Great experience at ${business.name}. The service was attentive and the overall quality was excellent.`
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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

  // Track scan on mount
  useEffect(() => {
    if (!previewMode && business.id) {
      trackAnalyticsEvent(business.id, "scan");
    }
  }, [business.id, previewMode]);

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
        const data = await res.json();
        if (data.review) {
          setReviewText(data.review);
        }
      }
    } catch {
      // Keep existing draft if network issue
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

  const handlePostToGoogle = async () => {
    const textToCopy = reviewText.trim();
    const success = await copyTextToClipboard(textToCopy);
    setCopiedState(success);

    if (!previewMode && business.id) {
      trackAnalyticsEvent(business.id, "handoff", rating);
    }

    setShowHandoffModal(true);
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
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-zinc-800 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {business.name}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-500 dark:text-zinc-400">
          <span>{business.categoryLabel || business.category}</span>
          {business.city && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {business.city}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Review Body */}
      <div className="p-6 space-y-6">
        {/* Star Rating Section */}
        <div className="text-center py-3 bg-slate-50 dark:bg-zinc-800/40 rounded-lg border border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
            {business.headline || "How was your experience?"}
          </p>
          <StarRating rating={rating} onChange={handleRatingSelect} size="lg" />
        </div>

        {/* ---------------------------------------------------- */}
        {/* POSITIVE FLOW: 4 OR 5 STARS */}
        {/* ---------------------------------------------------- */}
        {isPositiveFlow && (
          <div className="space-y-4">
            {/* Highlights Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Key Highlights
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 font-medium"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Detail Input */}
            <div>
              <input
                type="text"
                placeholder="Add specific detail (optional)..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            {/* Review Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Review Draft (Editable)
                </span>

                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: "casual", label: "Casual" },
                      { id: "enthusiastic", label: "Friendly" },
                      { id: "concise", label: "Short" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTone(t.id);
                        handleGenerateReview(t.id);
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
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
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white resize-none leading-relaxed"
                />

                {isGenerating && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 rounded-lg flex items-center justify-center gap-2 text-slate-800 dark:text-zinc-200 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating draft...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{reviewText.split(/\s+/).filter(Boolean).length} words</span>
                <button
                  type="button"
                  onClick={() => handleGenerateReview()}
                  disabled={isGenerating}
                  className="text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Main Action: Copy & Open Google Maps */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePostToGoogle}
                disabled={!reviewText.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-40"
              >
                {copiedState ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>Copy Review & Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-1.5">
                Copies text to clipboard and opens Google Maps review dialog
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* GRIEVANCE FLOW: 1 TO 3 STARS */}
        {/* ---------------------------------------------------- */}
        {!isPositiveFlow && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-lg p-3.5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-slate-600 dark:text-zinc-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-zinc-200">
                  We apologize for not meeting expectations.
                </p>
                <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                  Your comments are sent directly to management so we can address your issue.
                </p>
              </div>
            </div>

            {!grievanceSubmitted ? (
              <form onSubmit={handleSubmitGrievance} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    What can we improve?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {grievanceOptions.map((issue) => {
                      const isSelected = selectedIssues.includes(issue);
                      return (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => toggleIssue(issue)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 font-medium"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {issue}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Details for Management
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder="Please explain what happened..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                      Contact for Follow-up
                    </label>
                    <input
                      type="text"
                      placeholder="Email or phone number"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!grievanceText.trim() || isSubmittingGrievance}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingGrievance ? "Sending..." : "Submit Private Feedback"}</span>
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center space-y-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Feedback Received
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Thank you for letting us know. Your comments have been routed directly to management.
                </p>
              </div>
            )}

            <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setForcePublicReview(true)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Proceed to public Google Maps review instead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Hand-off Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-5 space-y-4 border border-slate-200 dark:border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Review Text Copied
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Your drafted review is on your clipboard. Paste it into Google Maps:
            </p>

            <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-lg text-xs space-y-2 border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select 5 stars in Google Maps</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Paste clipboard text into the review box</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={openGoogleReviewDirectly}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Continue to Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 py-1 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
