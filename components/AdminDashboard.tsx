"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  QrCode,
  Store,
  MessageSquareX,
  Smartphone,
  Plus,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Users,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Search,
  Settings,
  Mail,
  Phone,
  Clock,
  ChevronDown,
} from "lucide-react";
import { BusinessProfile, AnalyticsMetrics, PrivateFeedbackSubmission } from "@/lib/types";
import {
  getStoredBusinesses,
  saveBusiness,
  getStoredAnalytics,
  getStoredFeedbacks,
  updateFeedbackStatus,
} from "@/lib/business-store";
import { QrCodeCard } from "./QrCodeCard";
import { PlaceQRCodeCard } from "./PlaceQRCodeCard";
import { ReviewFlow } from "./ReviewFlow";
import { getGoogleReviewUrl, getGooglePlaceProfileUrl } from "@/lib/google-maps-utils";

export const AdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "analytics" | "qrcode" | "profile" | "feedback" | "simulator"
  >("analytics");

  // State for analytics and feedback
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
  const [newBizCategory, setNewBizCategory] = useState("restaurant");

  // Load initial businesses
  useEffect(() => {
    const list = getStoredBusinesses();
    setBusinesses(list);
    if (list.length > 0) {
      setSelectedBusinessId(list[0].id);
    }
  }, []);

  const currentBusiness = businesses.find((b) => b.id === selectedBusinessId) || businesses[0];

  // Refresh analytics & feedbacks when business changes
  useEffect(() => {
    if (currentBusiness) {
      setAnalytics(getStoredAnalytics(currentBusiness.id));
      setFeedbacks(getStoredFeedbacks(currentBusiness.id));
      setEditingBusiness(currentBusiness);
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
    setSaveSuccessMessage("Settings saved successfully!");
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

    const newBiz: BusinessProfile = {
      id: `biz-${Date.now()}`,
      name: newBizName.trim(),
      placeId: newBizPlaceId.trim(),
      category: newBizCategory as any,
      categoryLabel: newBizCategory.charAt(0).toUpperCase() + newBizCategory.slice(1),
      address: "123 Main Street",
      city: "Your City",
      brandColor: "#0284c7",
      ratingAverage: 5.0,
      totalGoogleReviews: 1,
      headline: `Loved your experience at ${newBizName}?`,
      subheadline: "Scan with your camera to leave a quick Google review!",
      customTags: ["Fast friendly service", "High quality", "Clean & welcoming"],
    };

    const updated = saveBusiness(newBiz);
    setBusinesses(updated);
    setSelectedBusinessId(newBiz.id);
    setShowAddModal(false);
    setNewBizName("");
    setNewBizPlaceId("");
  };

  if (!currentBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-medium">Loading Business Profile...</div>
      </div>
    );
  }

  const directGoogleReviewUrl = getGoogleReviewUrl(
    currentBusiness.placeId,
    currentBusiness.name
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: Multi-Tenant Business Selector & Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl p-1 shadow-sm flex items-center justify-center overflow-hidden bg-slate-900 text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: currentBusiness.brandColor || "#0f172a" }}
          >
            {currentBusiness.logoUrl ? (
              <img
                src={currentBusiness.logoUrl}
                alt={currentBusiness.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              currentBusiness.name.charAt(0)
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentBusiness.name}
              </h2>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Active Location
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Place ID: <span className="font-mono text-slate-700 dark:text-zinc-300">{currentBusiness.placeId}</span> • {currentBusiness.city}
            </p>
          </div>
        </div>

        {/* Business Selector Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Location</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: "analytics", label: "Analytics & ROI", icon: BarChart3 },
          { id: "qrcode", label: "Printable QR Studio", icon: QrCode },
          { id: "simulator", label: "Customer Simulator", icon: Smartphone },
          { id: "feedback", label: `Grievances Inbox (${feedbacks.filter(f => f.status === 'new').length} New)`, icon: MessageSquareX },
          { id: "profile", label: "Google Place Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: ANALYTICS & PERFORMANCE METRICS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Total QR Scans</span>
                <QrCode className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.totalScans}
              </div>
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% from physical cards
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>AI Drafts Created</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.aiReviewsGenerated}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {Math.round((analytics.aiReviewsGenerated / (analytics.totalScans || 1)) * 100)}% engagement rate
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Google Handoffs</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.googleMapsHandoffs}
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {analytics.conversionRate}% overall conversion rate
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Bad Reviews Deflected</span>
                <ShieldCheck className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.privateFeedbacksCaptured}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Routed to private inbox instead of Google
              </p>
            </div>
          </div>

          {/* Review Funnel & Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Conversion Funnel */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Customer Review Conversion Funnel
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1">
                    <span>1. QR Code Scanned at Table / Counter</span>
                    <span className="font-bold">{analytics.totalScans} (100%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1">
                    <span>2. Rated 4 or 5 Stars</span>
                    <span className="font-bold">
                      {analytics.ratingDistribution[5] + analytics.ratingDistribution[4]} (
                      {Math.round(
                        ((analytics.ratingDistribution[5] + analytics.ratingDistribution[4]) /
                          (analytics.totalScans || 1)) *
                          100
                      )}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((analytics.ratingDistribution[5] + analytics.ratingDistribution[4]) /
                              (analytics.totalScans || 1)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1">
                    <span>3. Generated AI Review Text</span>
                    <span className="font-bold">
                      {analytics.aiReviewsGenerated} (
                      {Math.round((analytics.aiReviewsGenerated / (analytics.totalScans || 1)) * 100)}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((analytics.aiReviewsGenerated / (analytics.totalScans || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-300 mb-1">
                    <span>4. Copied & Redirected to Google Maps</span>
                    <span className="font-bold">
                      {analytics.googleMapsHandoffs} ({analytics.conversionRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, analytics.conversionRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  High conversion achieved by minimizing friction with 1-tap AI drafting and auto-clipboard handoff!
                </span>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Customer Rating Distribution
              </h3>

              <div className="space-y-2.5 pt-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = (analytics.ratingDistribution as any)[stars] || 0;
                  const total =
                    Object.values(analytics.ratingDistribution).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 w-14 font-medium text-slate-700 dark:text-zinc-300">
                        <span>{stars}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>

                      <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stars >= 4
                              ? "bg-amber-400"
                              : stars === 3
                              ? "bg-slate-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="w-16 text-right font-mono text-slate-500 dark:text-zinc-400">
                        {count} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Live Google Place Link:</span>
                <a
                  href={directGoogleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <span>Test Google Review Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: PRINTABLE QR CODE STUDIO */}
      {/* ---------------------------------------------------- */}
      {activeTab === "qrcode" && (
        <div className="space-y-8">
          <PlaceQRCodeCard
            initialName={currentBusiness.name}
            initialPlaceId={currentBusiness.placeId}
          />
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-8">
            <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-4">
              Advanced Print Templates (Table Tents & Counter Stands)
            </h4>
            <QrCodeCard business={currentBusiness} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: LIVE MOBILE SIMULATOR */}
      {/* ---------------------------------------------------- */}
      {activeTab === "simulator" && (
        <div className="bg-slate-100 dark:bg-zinc-950 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center">
          <div className="text-center max-w-md mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              Interactive Customer Smartphone Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Experience exactly what your customers see when scanning your QR code. Test star ratings, AI text generation, and the Google Maps handoff.
            </p>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[400px] bg-slate-900 p-3.5 rounded-[44px] shadow-2xl border-4 border-slate-700">
            {/* Phone Speaker & Dynamic Island */}
            <div className="w-28 h-4 bg-black rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800/80 mr-3" />
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden max-h-[720px] overflow-y-auto no-scrollbar">
              <ReviewFlow business={currentBusiness} previewMode={true} />
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: PRIVATE GRIEVANCE INBOX */}
      {/* ---------------------------------------------------- */}
      {activeTab === "feedback" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareX className="w-5 h-5 text-rose-500" />
                Customer Grievances & Private Feedback
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                These submissions were captured from 1-3 star ratings before they reached Google Maps.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">
              Total Deflected: {feedbacks.length}
            </div>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No negative customer grievances reported yet! Great job maintaining high satisfaction.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {feedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-xs bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-md">
                        {item.rating} <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.customerName || "Anonymous Customer"}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status Pill Switcher */}
                    <div className="flex items-center gap-1">
                      {(["new", "contacted", "resolved"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, st)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                            item.status === st
                              ? st === "resolved"
                                ? "bg-emerald-600 text-white font-semibold"
                                : st === "contacted"
                                ? "bg-amber-500 text-white font-semibold"
                                : "bg-rose-600 text-white font-semibold"
                              : "bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
                          }`}
                        >
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grievance Issues Tags */}
                  {item.issues && item.issues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.issues.map((iss) => (
                        <span
                          key={iss}
                          className="text-[11px] bg-white dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-600"
                        >
                          {iss}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Grievance Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-700">
                    "{item.comment}"
                  </p>

                  {/* Contact info for resolution */}
                  {item.customerContact && (
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 pt-1">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                        Contact:
                      </span>
                      {item.customerContact.includes("@") ? (
                        <a
                          href={`mailto:${item.customerContact}`}
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {item.customerContact}
                        </a>
                      ) : (
                        <a
                          href={`tel:${item.customerContact}`}
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {item.customerContact}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: GOOGLE PLACE SETTINGS & PROFILE */}
      {/* ---------------------------------------------------- */}
      {activeTab === "profile" && editingBusiness && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                Google Business Profile Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Configure your official Google Place ID and brand assets.
              </p>
            </div>

            {saveSuccessMessage && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                {saveSuccessMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={editingBusiness.name}
                onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span>Google Place ID</span>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Find Place ID</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                required
                value={editingBusiness.placeId}
                onChange={(e) => setEditingBusiness({ ...editingBusiness, placeId: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={editingBusiness.category}
                onChange={(e) =>
                  setEditingBusiness({
                    ...editingBusiness,
                    category: e.target.value as any,
                    categoryLabel: e.target.options[e.target.selectedIndex].text,
                  })
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="restaurant">Restaurant & Bistro</option>
                <option value="cafe">Cafe & Bakery</option>
                <option value="hotel">Hotel & Hospitality</option>
                <option value="dentist">Dentist & Clinic</option>
                <option value="healthcare">Healthcare & Doctor</option>
                <option value="salon">Salon & Spa</option>
                <option value="automotive">Auto Care & Repair</option>
                <option value="retail">Retail Boutique</option>
                <option value="gym">Gym & Fitness</option>
                <option value="professional">Professional Services</option>
                <option value="other">General Business</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={editingBusiness.city}
                onChange={(e) => setEditingBusiness({ ...editingBusiness, city: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Headline (For Review Prompt)
              </label>
              <input
                type="text"
                value={editingBusiness.headline || ""}
                onChange={(e) => setEditingBusiness({ ...editingBusiness, headline: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Logo Image URL
              </label>
              <input
                type="url"
                value={editingBusiness.logoUrl || ""}
                onChange={(e) => setEditingBusiness({ ...editingBusiness, logoUrl: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Quick-Tags Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Customer Highlight Tags (Used by AI Review Generator)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editingBusiness.customTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 font-bold ml-1 text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add custom tag (e.g. Roof Patio)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 text-slate-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-indigo-500/20 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD NEW BUSINESS LOCATION */}
      {/* ---------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateNewBusiness}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-zinc-800"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New Business Location
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Link any Google Maps business profile by providing its Place ID.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Blue Harbor Seafood"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Google Place ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                value={newBizPlaceId}
                onChange={(e) => setNewBizPlaceId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={newBizCategory}
                onChange={(e) => setNewBizCategory(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="restaurant">Restaurant & Dining</option>
                <option value="cafe">Cafe & Bakery</option>
                <option value="hotel">Hotel & Hospitality</option>
                <option value="dentist">Dentist & Clinic</option>
                <option value="salon">Salon & Spa</option>
                <option value="automotive">Automotive & Repair</option>
                <option value="retail">Retail Boutique</option>
                <option value="gym">Gym & Fitness</option>
                <option value="professional">Professional Services</option>
                <option value="other">General Business</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Create Location
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
