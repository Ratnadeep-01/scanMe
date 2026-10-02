import { BusinessProfile, PrivateFeedbackSubmission, AnalyticsMetrics, BusinessCategory } from "./types";

export const CATEGORY_TAG_PRESETS: Record<BusinessCategory, string[]> = {
  restaurant: [
    "Prompt service",
    "Great food quality",
    "Clean environment",
    "Attentive staff",
    "Comfortable seating",
    "Fair pricing",
  ],
  cafe: [
    "Quality coffee",
    "Fast takeaway",
    "Friendly baristas",
    "Clean seating",
    "Good workspace atmosphere",
  ],
  hotel: [
    "Clean rooms",
    "Comfortable bed",
    "Smooth check-in",
    "Attentive staff",
    "Convenient location",
  ],
  dentist: [
    "Punctual appointment",
    "Gentle treatment",
    "Clean clinic",
    "Professional team",
    "Clear communication",
  ],
  healthcare: [
    "Attentive care",
    "Clear explanations",
    "Minimal wait time",
    "Clean facilities",
    "Professional staff",
  ],
  salon: [
    "Skilled stylist",
    "Clean salon",
    "Punctual service",
    "Great results",
    "Friendly staff",
  ],
  automotive: [
    "Honest diagnosis",
    "Fast turnaround",
    "Clear quote",
    "Professional mechanics",
    "Reliable service",
  ],
  retail: [
    "Helpful staff",
    "Organized layout",
    "Smooth checkout",
    "Good product selection",
  ],
  gym: [
    "Clean equipment",
    "Well-maintained facilities",
    "Helpful trainers",
    "Good atmosphere",
  ],
  professional: [
    "Prompt communication",
    "Attention to detail",
    "Reliable delivery",
    "Professional service",
  ],
  other: [
    "High quality service",
    "Professional team",
    "Prompt turnaround",
    "Clean premises",
    "Clear communication",
    "Fair pricing",
  ],
};

export const CATEGORY_GRIEVANCE_PRESETS: Record<string, string[]> = {
  restaurant: [
    "Long wait time",
    "Food temperature / quality",
    "Staff interaction",
    "Order inaccuracy",
    "Cleanliness",
    "Billing question",
  ],
  hotel: [
    "Room cleanliness",
    "Check-in delay",
    "Noise disturbance",
    "Facility issue",
    "Staff interaction",
  ],
  dentist: [
    "Wait time past appointment",
    "Discomfort during visit",
    "Billing or insurance question",
    "Communication gap",
  ],
  automotive: [
    "Repair timeline delay",
    "Quote discrepancy",
    "Issue recurring",
    "Communication delay",
  ],
  default: [
    "Service delay",
    "Staff interaction",
    "Quality below expectation",
    "Billing question",
    "Facility cleanliness",
    "Communication issue",
  ],
};

const STORAGE_KEYS = {
  BUSINESSES: "reviewboost_businesses",
  ANALYTICS: "reviewboost_analytics",
  FEEDBACKS: "reviewboost_feedbacks",
  ACTIVE_ID: "reviewboost_active_biz_id",
};

/**
 * Returns saved businesses. If none exist in storage, returns empty list.
 */
export function getStoredBusinesses(): BusinessProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBusiness(business: BusinessProfile): BusinessProfile[] {
  const current = getStoredBusinesses();
  const existingIdx = current.findIndex(
    (b) => b.id === business.id || (business.placeId && b.placeId === business.placeId)
  );

  let updated: BusinessProfile[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...business };
  } else {
    updated = [business, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, business.id);
  }
  return updated;
}

export function deleteBusiness(id: string): BusinessProfile[] {
  const current = getStoredBusinesses();
  const updated = current.filter((b) => b.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(updated));
  }
  return updated;
}

export function getActiveBusinessId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
}

export function setActiveBusinessId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
  }
}

/**
 * Clean zero-state analytics
 */
export function getStoredAnalytics(businessId: string): AnalyticsMetrics {
  const emptyMetrics: AnalyticsMetrics = {
    totalScans: 0,
    aiReviewsGenerated: 0,
    googleMapsHandoffs: 0,
    privateFeedbacksCaptured: 0,
    conversionRate: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  if (typeof window === "undefined" || !businessId) return emptyMetrics;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ANALYTICS}_${businessId}`);
    if (!raw) {
      return emptyMetrics;
    }
    return JSON.parse(raw);
  } catch {
    return emptyMetrics;
  }
}

export function trackAnalyticsEvent(
  businessId: string,
  event: "scan" | "ai_generate" | "handoff" | "private_feedback",
  rating?: number
) {
  if (typeof window === "undefined" || !businessId) return;
  try {
    const metrics = getStoredAnalytics(businessId);
    if (event === "scan") metrics.totalScans += 1;
    if (event === "ai_generate") metrics.aiReviewsGenerated += 1;
    if (event === "handoff") metrics.googleMapsHandoffs += 1;
    if (event === "private_feedback") metrics.privateFeedbacksCaptured += 1;

    if (rating && rating >= 1 && rating <= 5) {
      const r = rating as 1 | 2 | 3 | 4 | 5;
      metrics.ratingDistribution[r] = (metrics.ratingDistribution[r] || 0) + 1;
    }

    metrics.conversionRate =
      metrics.totalScans > 0
        ? Math.round((metrics.googleMapsHandoffs / metrics.totalScans) * 1000) / 10
        : 0;

    localStorage.setItem(
      `${STORAGE_KEYS.ANALYTICS}_${businessId}`,
      JSON.stringify(metrics)
    );
  } catch (e) {
    console.error("Failed to track analytics:", e);
  }
}

/**
 * Returns private feedback submissions. Empty array if none exist.
 */
export function getStoredFeedbacks(businessId?: string): PrivateFeedbackSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    if (!raw) return [];
    const all: PrivateFeedbackSubmission[] = JSON.parse(raw);
    return businessId ? all.filter((f) => f.businessId === businessId) : all;
  } catch {
    return [];
  }
}

export function addPrivateFeedback(
  submission: Omit<PrivateFeedbackSubmission, "id" | "createdAt" | "status">
): PrivateFeedbackSubmission {
  const current = getStoredFeedbacks();
  const newSubmission: PrivateFeedbackSubmission = {
    ...submission,
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const updated = [newSubmission, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(updated));
  }
  trackAnalyticsEvent(submission.businessId, "private_feedback", submission.rating);
  return newSubmission;
}

export function updateFeedbackStatus(
  id: string,
  status: "new" | "contacted" | "resolved"
): void {
  const current = getStoredFeedbacks();
  const updated = current.map((item) =>
    item.id === id ? { ...item, status } : item
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(updated));
  }
}
