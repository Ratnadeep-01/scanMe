"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
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
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
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
  const [generatedSource, setGeneratedSource] = useState<string>("");

  // Hand-off Modal State
  const [showHandoffModal, setShowHandoffModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Private Grievance Flow State (1-3 stars)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [grievanceText, setGrievanceText] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerContact, setCustomerContact] = useState<string>("");
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<boolean>(false);
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState<boolean>(false);
  const [forcePublicReview, setForcePublicReview] = useState<boolean>(false);

  // Available tag chips for this category
  const availableTags =
    business.customTags && business.customTags.length > 0
      ? business.customTags
      : CATEGORY_TAG_PRESETS[business.category] || CATEGORY_TAG_PRESETS.other;

  const grievanceOptions =
    CATEGORY_GRIEVANCE_PRESETS[business.category] ||
    CATEGORY_GRIEVANCE_PRESETS.default;

  // Track scan on mount
  useEffect(() => {
    if (!previewMode) {
      trackAnalyticsEvent(business.id, "scan");
    }
  }, [business.id, previewMode]);

  // Initial auto-generation trigger once user has selected 4 or 5 stars
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
        setGeneratedSource(data.generatedBy);
        setGenerationCount((prev) => prev + 1);

        if (!previewMode) {
          trackAnalyticsEvent(business.id, "ai_generate", rating);
        }
      }
    } catch (err) {
      console.error("Failed to generate review:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Toggle grievance issue selection
  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  // Handle star change
  const handleRatingSelect = (newRating: number) => {
    setRating(newRating);
    if (newRating >= 4) {
      // Pick 2 top tags by default if none selected to make AI generation super smooth
      if (selectedTags.length === 0 && availableTags.length > 0) {
        setSelectedTags([availableTags[0], availableTags[1]].filter(Boolean));
      }
    }
  };

  // Trigger review generation when 4-5 stars are selected and no review generated yet
  useEffect(() => {
    if (rating >= 4 && !reviewText && !isGenerating && generationCount === 0) {
      handleGenerateReview();
    }
  }, [rating]);

  // Handle Post to Google Maps Action
  const handlePostToGoogle = async () => {
    const textToCopy = reviewText.trim();
    const success = await copyTextToClipboard(textToCopy);
    setCopiedState(success);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#22c55e", "#eab308", "#3b82f6", "#ec4899"],
      });
    } catch {
      // Ignore in non-canvas environments
    }

    if (!previewMode) {
      trackAnalyticsEvent(business.id, "handoff", rating);
    }

    // Launch Handoff Guidance HUD
    setShowHandoffModal(true);
    setCountdown(2);
  };

  // Direct redirection to Google Maps
  const openGoogleReviewDirectly = () => {
    const url = getGoogleReviewUrl(business.placeId, business.name);
    window.open(url, "_blank", "noopener,noreferrer");
    setShowHandoffModal(false);
  };

  // Handle countdown in handoff modal
  useEffect(() => {
    if (showHandoffModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showHandoffModal && countdown === 0) {
      // Automatically trigger open when countdown hits 0
      openGoogleReviewDirectly();
    }
  }, [showHandoffModal, countdown]);

  // Handle Private Feedback Submission
  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;

    setIsSubmittingGrievance(true);
    try {
      addPrivateFeedback({
        businessId: business.id,
        businessName: business.name,
        rating,
        issues: selectedIssues,
        comment: grievanceText.trim(),
        customerName: customerName.trim() || undefined,
        customerContact: customerContact.trim() || undefined,
        preferredContactMethod: customerContact.includes("@") ? "email" : "phone",
      });

      // Also submit to server API
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
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden transition-all duration-300">
      {/* Top Banner / Brand Header */}
      <div
        className="relative h-28 sm:h-32 w-full bg-cover bg-center overflow-hidden flex items-end p-4"
        style={{
          backgroundColor: business.brandColor || "#0f172a",
          backgroundImage: business.coverImage
            ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.75)), url(${business.coverImage})`
            : undefined,
        }}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Google Business</span>
        </div>
      </div>

      {/* Business Meta Profile */}
      <div className="px-5 pt-0 pb-4 relative">
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-zinc-900 overflow-hidden bg-white shadow-md flex items-center justify-center">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: business.brandColor || "#0284c7" }}
              >
                {business.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{business.ratingAverage.toFixed(1)}</span>
              <span className="text-slate-400 text-xs font-normal">
                ({business.totalGoogleReviews} on Google)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-end gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {business.city}
            </p>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {business.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {business.categoryLabel || business.category}
          </p>
        </div>
      </div>

      {/* Main Review Section */}
      <div className="p-5 pt-2 border-t border-slate-100 dark:border-zinc-800">
        {/* Step 1: Star Rating */}
        <div className="text-center py-2 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-5 border border-slate-100 dark:border-zinc-800/80">
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-2">
            {business.headline || "How was your overall experience today?"}
          </p>
          <StarRating
            rating={rating}
            onChange={handleRatingSelect}
            size="lg"
            showLabel={true}
          />
        </div>

        {/* ---------------------------------------------------- */}
        {/* POSITIVE FLOW: 4 OR 5 STARS */}
        {/* ---------------------------------------------------- */}
        {isPositiveFlow && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick-Tags Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                  What stood out to you?
                </label>
                <span className="text-xs text-slate-400">Tap to include</span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-all duration-150 flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-xs dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-200"
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

            {/* Optional Custom Note / Detail */}
            <div>
              <input
                type="text"
                placeholder="Optional: Mention a staff member, dish, or detail..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Tone Selector & AI Review Generator Trigger */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                  Review Tone
                </div>

                {/* Tone Chips */}
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: "casual", label: "Casual" },
                      { id: "enthusiastic", label: "Enthusiastic" },
                      { id: "concise", label: "Short" },
                      { id: "professional", label: "Pro" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTone(t.id);
                        handleGenerateReview(t.id);
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                        tone === t.id
                          ? "bg-indigo-600 text-white font-medium shadow-xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text Area Container */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Click below to generate an authentic review with AI, or write your own..."
                  className="w-full text-sm sm:text-base p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 transition-all resize-none shadow-inner"
                />

                {isGenerating && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Crafting authentic review with AI...</span>
                  </div>
                )}
              </div>

              {/* Action Bar below text area */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {generatedSource === "openai" ? "AI Assisted (GPT-4o)" : "Instant Smart AI Draft"}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {reviewText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGenerateReview()}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Alternative variations quick pick */}
              {alternatives.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500">
                  <span className="shrink-0 text-[11px] font-medium text-slate-400">Variations:</span>
                  {alternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReviewText(alt)}
                      className="shrink-0 max-w-[200px] truncate px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-[11px]"
                      title={alt}
                    >
                      Option {idx + 2}: "{alt.substring(0, 24)}..."
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action Button: Copy & Open Google Maps */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePostToGoogle}
                disabled={!reviewText.trim()}
                className="w-full relative group overflow-hidden bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <Copy className="w-5 h-5 text-emerald-200" />
                <span>Copy & Open Google Maps</span>
                <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-center mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Takes only 15 seconds • Copies text & redirects directly</span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* GRIEVANCE FLOW: 1 TO 3 STARS (Private Feedback Flow) */}
        {/* ---------------------------------------------------- */}
        {!isPositiveFlow && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    We're so sorry we didn't meet your expectations.
                  </h3>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                    Your experience matters greatly to us. Your feedback below goes directly to our management team so we can investigate and make things right.
                  </p>
                </div>
              </div>
            </div>

            {!grievanceSubmitted ? (
              <form onSubmit={handleSubmitGrievance} className="space-y-3.5">
                {/* Issue tags */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    What went wrong?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {grievanceOptions.map((issue) => {
                      const isSelected = selectedIssues.includes(issue);
                      return (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => toggleIssue(issue)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-rose-50 border-rose-400 text-rose-700 font-semibold dark:bg-rose-950/60 dark:border-rose-600 dark:text-rose-200"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {issue}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grievance Details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                    Details for Management
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder="Please tell us what occurred so we can look into it and prevent it in the future..."
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                {/* Contact info for resolution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex M."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                      Email or Phone (For follow-up)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. alex@example.com"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Submit to Management */}
                <button
                  type="submit"
                  disabled={!grievanceText.trim() || isSubmittingGrievance}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmittingGrievance ? "Sending..." : "Submit Private Feedback to Owner"}
                  </span>
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-300">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Feedback Received
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-xs mx-auto">
                  Thank you for being candid. Your comments have been routed directly to management for immediate review.
                </p>
              </div>
            )}

            {/* Public review fallback button */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setForcePublicReview(true)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                I still wish to post a public review on Google Maps
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* HAND-OFF MODAL / OVERLAY: GOOGLE MAPS GUIDANCE */}
      {/* ---------------------------------------------------- */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 space-y-4">
            {/* Visual Success Icon */}
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Review Copied to Clipboard!
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Due to Google security rules, external apps cannot auto-type into Google Maps.
              </p>
            </div>

            {/* Visual Step-by-Step Instructions */}
            <div className="bg-slate-50 dark:bg-zinc-800/80 rounded-2xl p-4 text-left space-y-3 border border-slate-100 dark:border-zinc-700/60">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">Select 5 Stars: </span>
                  <span className="text-slate-600 dark:text-zinc-300">
                    Tap the 5th star on Google Maps.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">Tap & Paste: </span>
                  <span className="text-slate-600 dark:text-zinc-300">
                    Press & hold the review text area, then select <strong>"Paste"</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Snippet of copied review */}
            <div className="text-[11px] text-slate-400 bg-slate-100 dark:bg-zinc-800/50 p-2.5 rounded-xl truncate text-left italic">
              "{reviewText.substring(0, 90)}..."
            </div>

            {/* Countdown / Manual Launch Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={openGoogleReviewDirectly}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-4 h-4" />
                {countdown > 0 && (
                  <span className="bg-emerald-700 text-xs px-2 py-0.5 rounded-full font-mono">
                    {countdown}s
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 py-1"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
