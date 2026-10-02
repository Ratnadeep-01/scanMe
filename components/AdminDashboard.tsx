"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  QrCode,
  Store,
  MessageSquareX,
  Plus,
  ExternalLink,
  ShieldCheck,
  Star,
  Settings,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  Building,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { BusinessProfile, AnalyticsMetrics, PrivateFeedbackSubmission, BusinessCategory } from "@/lib/types";
import {
  getStoredBusinesses,
  saveBusiness,
  deleteBusiness,
  getStoredAnalytics,
  getStoredFeedbacks,
  updateFeedbackStatus,
  setActiveBusinessId,
  getActiveBusinessId,
} from "@/lib/business-store";
import { PlaceQRCodeCard } from "./PlaceQRCodeCard";
import { getGoogleReviewUrl } from "@/lib/google-maps-utils";

export const CATEGORY_OPTIONS: { id: BusinessCategory; label: string; defaultTags: string[] }[] = [
  {
    id: "college",
    label: "College / University / Higher Education",
    defaultTags: [
      "Knowledgeable faculty",
      "Great campus & facilities",
      "Modern labs & library",
      "Helpful administration",
      "Vibrant student life",
    ],
  },
  {
    id: "education",
    label: "School / Education / Training Institute",
    defaultTags: [
      "Expert instructors",
      "Structured curriculum",
      "Great learning environment",
      "Helpful staff",
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant / Dining",
    defaultTags: ["Prompt service", "Great food quality", "Clean environment", "Attentive staff"],
  },
  {
    id: "cafe",
    label: "Cafe / Bakery",
    defaultTags: ["Quality coffee", "Fast takeaway", "Friendly baristas", "Clean seating"],
  },
  {
    id: "dentist",
    label: "Dental Clinic",
    defaultTags: ["Punctual appointment", "Gentle treatment", "Clean clinic", "Professional team"],
  },
  {
    id: "healthcare",
    label: "Healthcare / Hospital / Clinic",
    defaultTags: ["Attentive care", "Clear explanations", "Minimal wait time", "Clean facilities"],
  },
  {
    id: "hotel",
    label: "Hotel / Hospitality",
    defaultTags: ["Clean rooms", "Comfortable bed", "Smooth check-in", "Attentive staff"],
  },
  {
    id: "salon",
    label: "Salon / Barber / Spa",
    defaultTags: ["Skilled stylist", "Clean salon", "Punctual service", "Great results"],
  },
  {
    id: "automotive",
    label: "Automotive Service / Repair",
    defaultTags: ["Honest diagnosis", "Fast turnaround", "Clear quote", "Professional mechanics"],
  },
  {
    id: "retail",
    label: "Retail Store / Shop",
    defaultTags: ["Helpful staff", "Organized layout", "Smooth checkout", "Good selection"],
  },
  {
    id: "gym",
    label: "Gym / Fitness Center",
    defaultTags: ["Clean equipment", "Well-maintained facilities", "Helpful trainers"],
  },
  {
    id: "professional",
    label: "Professional Services",
    defaultTags: ["Prompt communication", "Attention to detail", "Reliable delivery"],
  },
  {
    id: "other",
    label: "Other Business / Venue",
    defaultTags: ["High quality service", "Professional team", "Prompt turnaround", "Clean premises"],
  },
];

export const AdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "analytics" | "qrcode" | "profile" | "feedback"
  >("analytics");

  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [feedbacks, setFeedbacks] = useState<PrivateFeedbackSubmission[]>([]);

  // State for business edit form
  const [editingBusiness, setEditingBusiness] = useState<BusinessProfile | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("");

  // New business modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizPlaceId, setNewBizPlaceId] = useState("");
  const [newBizCategory, setNewBizCategory] = useState<BusinessCategory>("college");

  // Load saved businesses
  useEffect(() => {
    const list = getStoredBusinesses();
    setBusinesses(list);

    if (list.length > 0) {
      const activeId = getActiveBusinessId();
      const initial = list.find((b) => b.id === activeId) || list[0];
      setSelectedBusinessId(initial.id);
    }
  }, []);

  const currentBusiness = businesses.find((b) => b.id === selectedBusinessId) || null;

  useEffect(() => {
    if (currentBusiness) {
      setAnalytics(getStoredAnalytics(currentBusiness.id));
      setFeedbacks(getStoredFeedbacks(currentBusiness.id));
      setEditingBusiness(currentBusiness);
      setActiveBusinessId(currentBusiness.id);
    } else {
      setAnalytics(null);
      setFeedbacks([]);
      setEditingBusiness(null);
    }
  }, [currentBusiness?.id]);

  const handleUpdateStatus = (id: string, status: "new" | "contacted" | "resolved") => {
    updateFeedbackStatus(id, status);
    if (currentBusiness) {
      setFeedbacks(getStoredFeedbacks(currentBusiness.id));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    const updated = saveBusiness(editingBusiness);
    setBusinesses(updated);
    setSaveSuccessMessage("Profile saved successfully.");
    setTimeout(() => setSaveSuccessMessage(""), 3000);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim() || !editingBusiness) return;
    if (!editingBusiness.customTags.includes(newTagInput.trim())) {
      setEditingBusiness({
        ...editingBusiness,
        customTags: [...editingBusiness.customTags, newTagInput.trim()],
      });
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingBusiness) return;
    setEditingBusiness({
      ...editingBusiness,
      customTags: editingBusiness.customTags.filter((t) => t !== tagToRemove),
    });
  };

  const handleCreateNewBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newBizPlaceId.trim()) return;

    const catConfig =
      CATEGORY_OPTIONS.find((c) => c.id === newBizCategory) || CATEGORY_OPTIONS[0];

    const newBiz: BusinessProfile = {
      id: `biz-${Date.now()}`,
      name: newBizName.trim(),
      placeId: newBizPlaceId.trim(),
      category: newBizCategory as any,
      categoryLabel: catConfig.label,
      address: "Verified Address",
      city: "Local Area",
      brandColor: "#0f172a",
      ratingAverage: 5.0,
      totalGoogleReviews: 0,
      headline: `How was your visit to ${newBizName.trim()}?`,
      subheadline: "Scan with your camera to leave a quick Google review",
      customTags: catConfig.defaultTags,
    };

    const updated = saveBusiness(newBiz);
    setBusinesses(updated);
    setSelectedBusinessId(newBiz.id);
    setShowAddModal(false);
    setNewBizName("");
    setNewBizPlaceId("");
    setNewBizCategory("college");
  };

  const handleDeleteCurrent = () => {
    if (!currentBusiness) return;
    if (confirm(`Remove location "${currentBusiness.name}" from dashboard?`)) {
      const remaining = deleteBusiness(currentBusiness.id);
      setBusinesses(remaining);
      if (remaining.length > 0) {
        setSelectedBusinessId(remaining[0].id);
      } else {
        setSelectedBusinessId("");
      }
    }
  };

  // If no businesses are configured yet, display clean onboarding
  if (!currentBusiness) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Connect Google Business Location
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Add your Google Place ID to generate printable QR codes and track customer review handoffs.
            </p>
          </div>

          <form onSubmit={handleCreateNewBusiness} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Coffee Roasters"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span>Google Place ID</span>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
                >
                  <span>Place ID Finder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                value={newBizPlaceId}
                onChange={(e) => setNewBizPlaceId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={newBizCategory}
                onChange={(e) => setNewBizCategory(e.target.value as any)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Save & Generate QR Codes
            </button>
          </form>
        </div>
      </div>
    );
  }

  const directGoogleReviewUrl = getGoogleReviewUrl(
    currentBusiness.placeId,
    currentBusiness.name
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: Location Switcher & Place ID Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentBusiness.name}
            </h2>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              {currentBusiness.placeId}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Category: {currentBusiness.categoryLabel || currentBusiness.category}
          </p>
        </div>

        {/* Location selector switcher & actions */}
        <div className="flex items-center gap-2">
          {businesses.length > 1 && (
            <div className="relative">
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        {[
          { id: "analytics", label: "Overview & Analytics", icon: BarChart3 },
          { id: "qrcode", label: "QR Code Generator", icon: QrCode },
          {
            id: "feedback",
            label: `Feedback Inbox (${feedbacks.length})`,
            icon: MessageSquareX,
          },
          { id: "profile", label: "Place Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REAL ANALYTICS */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-slate-500">QR Code Scans</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.totalScans}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Total page visits via QR URL
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-slate-500">AI Drafts Generated</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.aiReviewsGenerated}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Reviews drafted by visitors
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-slate-500">Google Maps Handoffs</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.googleMapsHandoffs}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Redirects to Google review dialog
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-slate-500">Private Feedbacks</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.privateFeedbacksCaptured}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Internal grievances submitted
              </p>
            </div>
          </div>

          {/* Funnel & Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Review Funnel
              </h3>

              {analytics.totalScans === 0 ? (
                <div className="text-xs text-slate-400 py-8 text-center">
                  No scans recorded yet. Place QR codes on tables or counters to begin capturing reviews.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>1. Scanned QR Code</span>
                      <span className="font-mono">{analytics.totalScans} (100%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-900 dark:bg-white h-full" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>2. Generated AI Review Text</span>
                      <span className="font-mono">
                        {analytics.aiReviewsGenerated} (
                        {Math.round((analytics.aiReviewsGenerated / analytics.totalScans) * 100)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-700 dark:bg-zinc-300 h-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((analytics.aiReviewsGenerated / analytics.totalScans) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>3. Copied & Redirected to Google Maps</span>
                      <span className="font-mono">
                        {analytics.googleMapsHandoffs} ({analytics.conversionRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${Math.min(100, analytics.conversionRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Rating Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = (analytics.ratingDistribution as any)[stars] || 0;
                  const total =
                    Object.values(analytics.ratingDistribution).reduce((a, b) => a + b, 0) || 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-12 text-slate-600 dark:text-zinc-400">
                        {stars} Stars
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            stars >= 4 ? "bg-amber-400" : "bg-slate-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-slate-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <a
                  href={directGoogleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1"
                >
                  <span>Test Google Place Review Dialog</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QR CODE STUDIO */}
      {activeTab === "qrcode" && (
        <div className="space-y-6">
          <PlaceQRCodeCard
            initialName={currentBusiness.name}
            initialPlaceId={currentBusiness.placeId}
          />
        </div>
      )}

      {/* TAB 3: FEEDBACK INBOX */}
      {activeTab === "feedback" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Private Customer Grievances
            </h3>
            <span className="text-xs text-slate-400">
              Total Submissions: {feedbacks.length}
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No private feedback submissions recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.customerName || "Anonymous Customer"}
                      </span>
                      <span className="text-slate-400">
                        {item.rating} Stars • {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {(["new", "contacted", "resolved"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, st)}
                          className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                            item.status === st
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium"
                              : "bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-600"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded border border-slate-200 dark:border-zinc-700">
                    "{item.comment}"
                  </p>

                  {item.customerContact && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>Contact:</span>
                      <span className="font-mono text-slate-800 dark:text-zinc-200">
                        {item.customerContact}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PLACE SETTINGS */}
      {activeTab === "profile" && editingBusiness && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Location Settings
            </h3>
            {saveSuccessMessage && (
              <span className="text-emerald-600 font-medium">{saveSuccessMessage}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={editingBusiness.name}
                onChange={(e) =>
                  setEditingBusiness({ ...editingBusiness, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                required
                value={editingBusiness.placeId}
                onChange={(e) =>
                  setEditingBusiness({ ...editingBusiness, placeId: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Category
              </label>
              <select
                value={editingBusiness.category}
                onChange={(e) => {
                  const catId = e.target.value as BusinessCategory;
                  const catConfig = CATEGORY_OPTIONS.find((c) => c.id === catId);
                  setEditingBusiness({
                    ...editingBusiness,
                    category: catId,
                    categoryLabel: catConfig?.label || catId,
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
              Highlight Attribute Chips (Used for Review Generation)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {editingBusiness.customTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2 py-1 rounded flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="New attribute tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="px-3 py-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 text-slate-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-3 py-1.5 rounded font-medium cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Location</span>
            </button>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2 px-4 rounded-lg cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewBusiness}
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-5 space-y-4 border border-slate-200 dark:border-zinc-800 text-xs"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Add Business Location
            </h3>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Coffee Roasters"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                value={newBizPlaceId}
                onChange={(e) => setNewBizPlaceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Category
              </label>
              <select
                value={newBizCategory}
                onChange={(e) => setNewBizCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-700 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium px-4 py-1.5 rounded-lg"
              >
                Save Location
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
