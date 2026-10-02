"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  QrCode,
  MessageSquareX,
  Plus,
  ExternalLink,
  Star,
  Settings,
  ChevronDown,
  Building,
  Trash2,
  AlertCircle,
  Upload,
  FileText,
  CheckCircle2,
  X,
  Copy,
  Check,
  Database,
  LogOut,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  BusinessProfile,
  AnalyticsMetrics,
  PrivateFeedbackSubmission,
  BusinessCategory,
} from "@/lib/types";

interface AdminDashboardProps {
  onLogout?: () => void;
}
import {
  getStoredBusinesses,
  saveBusiness,
  saveMultipleBusinesses,
  deleteBusiness,
  getStoredAnalytics,
  getStoredFeedbacks,
  updateFeedbackStatus,
  setActiveBusinessId,
  getActiveBusinessId,
  syncLocationsFromDb,
} from "@/lib/business-store";
import { PlaceQRCodeCard } from "./PlaceQRCodeCard";
import { getGoogleReviewUrl, extractCleanPlaceId } from "@/lib/google-maps-utils";

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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => {
    if (typeof window !== "undefined") {
      return getStoredBusinesses();
    }
    return [];
  });

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const list = getStoredBusinesses();
      if (list.length > 0) {
        const activeId = getActiveBusinessId();
        const initial = (activeId && list.find((b) => b.id === activeId)) || list[0];
        return initial.id;
      }
    }
    return "";
  });

  const [activeTab, setActiveTab] = useState<
    "analytics" | "qrcode" | "profile" | "feedback"
  >("analytics");

  const [feedbacks, setFeedbacks] = useState<PrivateFeedbackSubmission[]>(() => {
    if (typeof window !== "undefined") {
      const list = getStoredBusinesses();
      if (list.length > 0) {
        const activeId = getActiveBusinessId();
        const initial = (activeId && list.find((b) => b.id === activeId)) || list[0];
        return getStoredFeedbacks(initial.id);
      }
    }
    return [];
  });

  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "new" | "contacted" | "resolved">("all");

  // State for business edit form
  const [editingBusiness, setEditingBusiness] = useState<BusinessProfile | null>(() => {
    if (typeof window !== "undefined") {
      const list = getStoredBusinesses();
      if (list.length > 0) {
        const activeId = getActiveBusinessId();
        const initial = (activeId && list.find((b) => b.id === activeId)) || list[0];
        return initial;
      }
    }
    return null;
  });

  const [newTagInput, setNewTagInput] = useState<string>("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("");

  // New business modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // Ignore network errors
    }
    window.location.reload();
  };
  const [newBizName, setNewBizName] = useState("");
  const [newBizPlaceId, setNewBizPlaceId] = useState("");
  const [newBizCategory, setNewBizCategory] = useState<BusinessCategory>("college");
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const [copiedPlaceId, setCopiedPlaceId] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    connected: boolean;
    databaseName?: string;
    pingMs?: number;
    counts?: { locations: number; feedbacks: number; analytics: number };
    message?: string;
  } | null>(null);
  const [showDbModal, setShowDbModal] = useState<boolean>(false);

  const currentBusiness = businesses.find((b) => b.id === selectedBusinessId) || null;

  const analytics: AnalyticsMetrics | null = useMemo(() => {
    return currentBusiness ? getStoredAnalytics(currentBusiness.id) : null;
  }, [currentBusiness]);

  const handleSelectBusiness = (id: string) => {
    setSelectedBusinessId(id);
    setActiveBusinessId(id);
    setFeedbacks(getStoredFeedbacks(id));
    const found = businesses.find((b) => b.id === id);
    if (found) {
      setEditingBusiness(found);
    }
  };

  useEffect(() => {
    // Check MongoDB status and sync cloud locations if connected
    fetch("/api/db-status")
      .then((res) => res.json())
      .then((data) => {
        setDbStatus(data);
        if (data.connected) {
          syncLocationsFromDb().then((dbList) => {
            if (dbList.length > 0) {
              setBusinesses(dbList);
              const activeId = getActiveBusinessId();
              const initial = dbList.find((b) => b.id === activeId) || dbList[0];
              setSelectedBusinessId(initial.id);
              setEditingBusiness(initial);
              setFeedbacks(getStoredFeedbacks(initial.id));
            }
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateStatus = (id: string, status: "new" | "contacted" | "resolved") => {
    updateFeedbackStatus(id, status);
    if (currentBusiness) {
      setFeedbacks(getStoredFeedbacks(currentBusiness.id));
    }
  };

  const handleCopyPlaceId = () => {
    if (!currentBusiness) return;
    navigator.clipboard.writeText(currentBusiness.placeId);
    setCopiedPlaceId(true);
    setTimeout(() => setCopiedPlaceId(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    const cleanId = extractCleanPlaceId(editingBusiness.placeId) || editingBusiness.placeId.trim();
    const sanitizedBiz = { ...editingBusiness, placeId: cleanId };
    const updated = saveBusiness(sanitizedBiz);
    setBusinesses(updated);
    setEditingBusiness(sanitizedBiz);
    setSaveSuccessMessage("Settings saved successfully.");
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

    const cleanId = extractCleanPlaceId(newBizPlaceId);
    if (!cleanId) {
      alert("Please provide a valid Google Place ID (e.g. starting with ChIJ...)");
      return;
    }

    const catConfig =
      CATEGORY_OPTIONS.find((c) => c.id === newBizCategory) || CATEGORY_OPTIONS[0];

    const newBiz: BusinessProfile = {
      id: `biz-${Date.now()}`,
      name: newBizName.trim(),
      placeId: cleanId,
      category: newBizCategory,
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

  // Bulk import state & parser
  const [modalMode, setModalMode] = useState<"single" | "bulk">("single");
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkParsedBusinesses, setBulkParsedBusinesses] = useState<BusinessProfile[]>([]);
  const [bulkError, setBulkError] = useState("");

  const parseBulkInput = (rawText: string): BusinessProfile[] => {
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const results: BusinessProfile[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        i === 0 &&
        (line.toLowerCase().startsWith("name") ||
          line.toLowerCase().startsWith("business") ||
          line.toLowerCase().startsWith("#"))
      ) {
        continue;
      }
      if (line.startsWith("#") || line.startsWith("//")) continue;

      let parts: string[] = [];
      if (line.includes(",")) {
        parts = line.split(",").map((p) => p.trim());
      } else if (line.includes("\t")) {
        parts = line.split("\t").map((p) => p.trim());
      } else if (line.includes("|")) {
        parts = line.split("|").map((p) => p.trim());
      } else {
        parts = [line];
      }

      if (parts.length >= 2) {
        const name = parts[0];
        const rawPlaceId = parts[1];
        const cleanId = extractCleanPlaceId(rawPlaceId) || rawPlaceId;
        const rawCategory = parts[2]?.toLowerCase() as BusinessCategory | undefined;

        const matchedCategory: BusinessCategory = CATEGORY_OPTIONS.some(
          (c) => c.id === rawCategory
        )
          ? (rawCategory as BusinessCategory)
          : "college";

        const catConfig =
          CATEGORY_OPTIONS.find((c) => c.id === matchedCategory) || CATEGORY_OPTIONS[0];

        if (name && cleanId) {
          results.push({
            id: `biz-${Date.now()}-${i}`,
            name,
            placeId: cleanId,
            category: matchedCategory,
            categoryLabel: catConfig.label,
            address: "Verified Address",
            city: "Local Area",
            brandColor: "#0f172a",
            ratingAverage: 5.0,
            totalGoogleReviews: 0,
            headline: `How was your visit to ${name}?`,
            subheadline: "Scan with your camera to leave a quick Google review",
            customTags: catConfig.defaultTags,
          });
        }
      }
    }
    return results;
  };

  const handleBulkTextChange = (text: string) => {
    setBulkCsvText(text);
    const parsed = parseBulkInput(text);
    setBulkParsedBusinesses(parsed);
    if (parsed.length > 0) {
      setBulkError("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleBulkTextChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleLoadSample = () => {
    const sample = `NIT Patna Bihta Campus, ChIJC-eGOdGpkjkRQRsEQi4SbE0, college\nNIT Patna Main Campus, ChIJN1t_tDeuEmsRUsoyG83frY4, college\nCampus Cafeteria, ChIJ2eUgeAK6j4ARbm5G4_qR3v4, restaurant`;
    handleBulkTextChange(sample);
  };

  const handleExecuteBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkParsedBusinesses.length === 0) {
      setBulkError("No valid locations detected. Please enter at least one line with: Name, Google Place ID, [Category]");
      return;
    }
    const updated = saveMultipleBusinesses(bulkParsedBusinesses);
    setBusinesses(updated);
    setSelectedBusinessId(bulkParsedBusinesses[0].id);
    setShowAddModal(false);
    setBulkCsvText("");
    setBulkParsedBusinesses([]);
    setBulkError("");
    setSaveSuccessMessage(`Successfully imported ${bulkParsedBusinesses.length} locations.`);
    setTimeout(() => setSaveSuccessMessage(""), 4000);
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

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (feedbackFilter === "all") return true;
    return item.status === feedbackFilter;
  });

  const renderLocationModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Google Business Location
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Connect individual locations or bulk import multiple venue branches
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setModalMode("single")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modalMode === "single"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Single Venue</span>
            </button>

            <button
              type="button"
              onClick={() => setModalMode("bulk")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modalMode === "bulk"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk CSV / Text Import</span>
            </button>
          </div>

          {/* Tab 1: Single Location Form */}
          {modalMode === "single" && (
            <form onSubmit={handleCreateNewBusiness} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Business / Venue Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT Patna Bihta Campus"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Google Place ID
                  </label>
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Lookup Place ID</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. ChIJC-eGOdGpkjkRQRsEQi4SbE0"
                  value={newBizPlaceId}
                  onChange={(e) =>
                    setNewBizPlaceId(extractCleanPlaceId(e.target.value) || e.target.value)
                  }
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Category & Industry
                </label>
                <select
                  value={newBizCategory}
                  onChange={(e) => setNewBizCategory(e.target.value as BusinessCategory)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 px-4 py-2 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Bulk Import Form */}
          {modalMode === "bulk" && (
            <form onSubmit={handleExecuteBulkImport} className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 dark:text-zinc-400">
                  Format: <code className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-[11px]">Name, PlaceID, [Category]</code>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Load 3-Venue Sample</span>
                  </button>
                  <label className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium">
                    <Upload className="w-3 h-3" />
                    <span>Upload .CSV</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <textarea
                  rows={5}
                  value={bulkCsvText}
                  onChange={(e) => handleBulkTextChange(e.target.value)}
                  placeholder={"NIT Patna Bihta Campus, ChIJC-eGOdGpkjkRQRsEQi4SbE0, college\nNIT Patna Main Campus, ChIJN1t_tDeuEmsRUsoyG83frY4, college\nCampus Cafeteria, ChIJ2eUgeAK6j4ARbm5G4_qR3v4, restaurant"}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {bulkError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}

              {/* Parsed Live Preview */}
              {bulkParsedBusinesses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{bulkParsedBusinesses.length} valid location{bulkParsedBusinesses.length > 1 ? "s" : ""} parsed</span>
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 bg-slate-50 dark:bg-zinc-950">
                    {bulkParsedBusinesses.map((b, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[280px]">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {b.name}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 truncate">
                            {b.placeId}
                          </div>
                        </div>
                        <span className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium">
                          {b.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 px-4 py-2 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkParsedBusinesses.length === 0}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                >
                  Import {bulkParsedBusinesses.length > 0 ? `${bulkParsedBusinesses.length} Locations` : "Locations"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const renderDbModal = () => {
    if (!showDbModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                MongoDB Cloud Sync Status
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowDbModal(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              dbStatus?.connected
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            {dbStatus?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-xs sm:text-sm">
                {dbStatus?.connected
                  ? "MongoDB Cloud Database Connected"
                  : "Local Storage Fallback Mode Active"}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {dbStatus?.connected
                  ? `Connected to database "${dbStatus.databaseName}" (Ping: ${dbStatus.pingMs}ms). Locations, scan analytics, and customer grievances sync automatically across all devices.`
                  : "The console is currently running on browser LocalStorage. Data is stored safely on this machine. To share data across multiple devices or customer phones, connect MongoDB."}
              </p>
            </div>
          </div>

          {/* Connected Details */}
          {dbStatus?.connected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl text-center border border-slate-200 dark:border-zinc-700">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {dbStatus.counts?.locations ?? businesses.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Locations</div>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl text-center border border-slate-200 dark:border-zinc-700">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {dbStatus.counts?.feedbacks ?? feedbacks.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Feedbacks</div>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl text-center border border-slate-200 dark:border-zinc-700">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {dbStatus.counts?.analytics ?? 1}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Analytics</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5 text-slate-700 dark:text-zinc-300">
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  How to Connect Cloud MongoDB:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                  <li>
                    Add connection string to{" "}
                    <code className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      .env.local
                    </code>
                  </li>
                </ol>
              </div>

              <div className="bg-slate-950 text-slate-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{`MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/reviewboost\nMONGODB_DB=reviewboost`}</pre>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                fetch("/api/db-status")
                  .then((r) => r.json())
                  .then((data) => setDbStatus(data))
                  .catch(() => {});
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Re-check Connection</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDbModal(false)}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If no businesses are configured yet, display clean onboarding
  if (!currentBusiness) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Connect Your Google Business Location
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Add your Google Place ID to generate printable QR stand cards and track customer review handoffs in real time.
            </p>
          </div>

          <form onSubmit={handleCreateNewBusiness} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Business / Venue Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Coffee Roasters"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Google Place ID
                </label>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Place ID Finder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                value={newBizPlaceId}
                onChange={(e) =>
                  setNewBizPlaceId(extractCleanPlaceId(e.target.value) || e.target.value)
                }
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={newBizCategory}
                onChange={(e) => setNewBizCategory(e.target.value as BusinessCategory)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
            >
              Save & Generate QR Codes
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => {
                setModalMode("bulk");
                setShowAddModal(true);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-medium py-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Need to add multiple branches at once? Bulk CSV Import</span>
            </button>
          </div>
        </div>

        {renderLocationModal()}
        {renderDbModal()}
      </div>
    );
  }

  const directGoogleReviewUrl = getGoogleReviewUrl(
    currentBusiness.placeId,
    currentBusiness.name
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: Location Switcher & Venue Control Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentBusiness.name}
            </h2>

            <button
              type="button"
              onClick={handleCopyPlaceId}
              title="Click to copy Google Place ID"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <span>{currentBusiness.placeId}</span>
              {copiedPlaceId ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Category: <span className="font-semibold text-slate-700 dark:text-zinc-300">{currentBusiness.categoryLabel || currentBusiness.category}</span>
          </p>
        </div>

        {/* Location switcher & actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {businesses.length > 1 && (
            <div className="relative">
              <select
                value={selectedBusinessId}
                onChange={(e) => handleSelectBusiness(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
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
            onClick={() => {
              setModalMode("single");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Venue</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode("bulk");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDbModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              dbStatus?.connected
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
            }`}
            title="Database Connection Status"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{dbStatus?.connected ? "MongoDB Sync" : "Local Mode"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            title="Sign out of management console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "analytics", label: "Overview & Analytics", icon: BarChart3 },
          { id: "qrcode", label: "QR Stand Studio", icon: QrCode },
          {
            id: "feedback",
            label: `Feedback Inbox (${feedbacks.length})`,
            icon: MessageSquareX,
            badge: feedbacks.filter((f) => f.status === "new").length,
          },
          { id: "profile", label: "Venue Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REAL ANALYTICS */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total QR Scans</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.totalScans}
              </div>
              <p className="text-[11px] text-slate-400">Customer visits via QR code</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">AI Drafts Generated</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {analytics.aiReviewsGenerated}
              </div>
              <p className="text-[11px] text-slate-400">Personalized reviews drafted</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Google Maps Handoffs</span>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {analytics.googleMapsHandoffs}
              </div>
              <p className="text-[11px] text-slate-400">Copied & redirected to Google</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Shielded Grievances</span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {analytics.privateFeedbacksCaptured}
              </div>
              <p className="text-[11px] text-slate-400">Private 1-3 star feedbacks</p>
            </div>
          </div>

          {/* Funnel & Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Customer Review Conversion Funnel
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {analytics.conversionRate}% Conversion
                </span>
              </div>

              {analytics.totalScans === 0 ? (
                <div className="text-xs text-slate-400 py-10 text-center space-y-2">
                  <QrCode className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
                  <p>No scans recorded yet. Place QR codes on tables to begin capturing reviews.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-medium mb-1.5">
                      <span className="text-slate-700 dark:text-zinc-300">1. Scanned Stand QR Code</span>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">{analytics.totalScans} (100%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-900 dark:bg-white h-full rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium mb-1.5">
                      <span className="text-slate-700 dark:text-zinc-300">2. Generated AI Review Text</span>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">
                        {analytics.aiReviewsGenerated} (
                        {Math.round((analytics.aiReviewsGenerated / analytics.totalScans) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
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
                    <div className="flex justify-between font-medium mb-1.5">
                      <span className="text-slate-700 dark:text-zinc-300">3. Copied & Redirected to Google Maps</span>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">
                        {analytics.googleMapsHandoffs} ({analytics.conversionRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, analytics.conversionRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rating Sentiment Breakdown
              </h3>

              <div className="space-y-2.5 text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count =
                    (analytics.ratingDistribution as Record<number, number>)[stars] || 0;
                  const total =
                    Object.values(analytics.ratingDistribution).reduce((a, b) => a + b, 0) || 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-14 font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                        <span>{stars}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stars >= 4 ? "bg-amber-400" : "bg-slate-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-slate-600 dark:text-zinc-400 font-semibold">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <a
                  href={directGoogleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1.5"
                >
                  <span>Test Google Maps Write Review Dialog</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
            key={currentBusiness.id}
            initialName={currentBusiness.name}
            initialPlaceId={currentBusiness.placeId}
            initialCategory={currentBusiness.category}
          />

          {/* ALL LOCATIONS QR DIRECTORY */}
          {businesses.length > 1 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span>Venue Directory & Dedicated QR Cards ({businesses.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Each venue has an independent scannable QR code and dedicated review link. Click any venue to select it.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {businesses.map((biz) => {
                  const isSelected = biz.id === selectedBusinessId;
                  const bizCleanPlaceId = extractCleanPlaceId(biz.placeId) || biz.placeId;
                  const bizReviewUrl = `${origin}/review?placeId=${encodeURIComponent(
                    bizCleanPlaceId
                  )}&name=${encodeURIComponent(biz.name)}&category=${encodeURIComponent(biz.category)}`;
                  const isCopied = copiedLocationId === biz.id;

                  return (
                    <div
                      key={biz.id}
                      onClick={() => handleSelectBusiness(biz.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-zinc-800/60 ring-2 ring-slate-900 dark:ring-white shadow-sm"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {biz.name}
                            </span>
                            {isSelected && (
                              <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 truncate">
                            {bizCleanPlaceId}
                          </div>
                          <span className="inline-block bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold">
                            {biz.categoryLabel || biz.category}
                          </span>
                        </div>

                        {/* Individual mini QR code */}
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                          <QRCodeSVG
                            value={bizReviewUrl}
                            size={56}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      {/* URL & Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                        <div className="bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-600 dark:text-zinc-400 truncate">
                          {bizReviewUrl}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(bizReviewUrl);
                              setCopiedLocationId(biz.id);
                              setTimeout(() => setCopiedLocationId(null), 2000);
                            }}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={bizReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Open customer review portal for this venue"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEEDBACK INBOX */}
      {activeTab === "feedback" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Private Customer Feedback Shield
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Internal grievances submitted by visitors who selected 1-3 stars.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(["all", "new", "contacted", "resolved"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setFeedbackFilter(filterKey)}
                  className={`text-xs px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors cursor-pointer ${
                    feedbackFilter === filterKey
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-14 text-slate-400 text-xs space-y-2">
              <MessageSquareX className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p>No feedback submissions in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.customerName || "Anonymous Visitor"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <span>{item.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        • {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {(["new", "contacted", "resolved"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, st)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors cursor-pointer ${
                            item.status === st
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-600"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {item.issues && item.issues.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.issues.map((issue) => (
                        <span
                          key={issue}
                          className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 leading-relaxed font-medium">
                    &ldquo;{item.comment}&rdquo;
                  </p>

                  {item.customerContact && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold">Direct Contact:</span>
                      <a
                        href={item.customerContact.includes("@") ? `mailto:${item.customerContact}` : `tel:${item.customerContact}`}
                        className="font-mono text-indigo-600 dark:text-indigo-400 underline font-semibold"
                      >
                        {item.customerContact}
                      </a>
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
          className="bg-white dark:bg-zinc-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xs text-xs"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Venue Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Update venue name, Google Place ID, and custom review highlight tags.
              </p>
            </div>
            {saveSuccessMessage && (
              <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200">
                {saveSuccessMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                Business / Venue Name
              </label>
              <input
                type="text"
                required
                value={editingBusiness.name}
                onChange={(e) =>
                  setEditingBusiness({ ...editingBusiness, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
                Google Place ID
              </label>
              <input
                type="text"
                required
                value={editingBusiness.placeId}
                onChange={(e) =>
                  setEditingBusiness({
                    ...editingBusiness,
                    placeId: extractCleanPlaceId(e.target.value) || e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 cursor-pointer font-semibold"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Highlight Tags */}
          <div className="space-y-2">
            <label className="block text-slate-700 dark:text-zinc-300 font-bold">
              Review Highlight Tags (Used for AI generation)
            </label>
            <div className="flex flex-wrap gap-2">
              {editingBusiness.customTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium border border-slate-200 dark:border-zinc-700"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm pt-1">
              <input
                type="text"
                placeholder="New attribute tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 text-slate-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 py-2 rounded-xl font-bold cursor-pointer"
              >
                Add Tag
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Venue</span>
            </button>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer shadow-xs"
            >
              Save Settings
            </button>
          </div>
        </form>
      )}

      {/* Add / Bulk Import Location Modal */}
      {renderLocationModal()}

      {/* Database Status & Setup Modal */}
      {renderDbModal()}
    </div>
  );
};
