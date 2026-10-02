import { BusinessProfile, PrivateFeedbackSubmission, AnalyticsMetrics, BusinessCategory } from "./types";

export const CATEGORY_TAG_PRESETS: Record<BusinessCategory, string[]> = {
  restaurant: [
    "Delicious cuisine",
    "Fast friendly service",
    "Vibrant ambiance",
    "Great cocktails & wine",
    "Spotless & clean",
    "Generous portions",
    "Great value",
    "Dietary friendly",
  ],
  cafe: [
    "Great artisanal coffee",
    "Fresh pastries",
    "Cozy study vibes",
    "Friendly baristas",
    "Quick takeaway",
    "Peaceful outdoor seating",
  ],
  hotel: [
    "Spotless clean rooms",
    "Super comfortable bed",
    "Attentive concierge",
    "Prime central location",
    "Delicious breakfast",
    "Fast smooth check-in",
    "Stunning views",
  ],
  dentist: [
    "Gentle & painless",
    "Friendly reassuring staff",
    "Modern tech & equipment",
    "Clear transparent pricing",
    "On-time appointment",
    "Spotless clinic",
  ],
  healthcare: [
    "Attentive compassionate care",
    "Knowledgeable doctor",
    "Short wait time",
    "Clear medical explanations",
    "Clean & calm facility",
  ],
  salon: [
    "Stunning haircut & styling",
    "Skilled attentive stylist",
    "Relaxing luxury atmosphere",
    "Great product recommendations",
    "Punctual appointment",
  ],
  automotive: [
    "Honest diagnosis",
    "Fast repair turnaround",
    "Fair transparent quote",
    "Skilled mechanics",
    "Clear explanation of issues",
    "Clean waiting lounge",
  ],
  retail: [
    "Curated quality selection",
    "Helpful friendly staff",
    "Easy checkout experience",
    "Fair pricing",
    "Beautiful store layout",
  ],
  gym: [
    "Top-tier equipment",
    "Spotless facilities & showers",
    "Motivating environment",
    "Expert helpful trainers",
    "Great community energy",
  ],
  professional: [
    "Highly professional & prompt",
    "Clear communication",
    "Exceptional attention to detail",
    "Delivered ahead of schedule",
    "Trustworthy advice",
  ],
  other: [
    "Outstanding customer service",
    "Friendly & welcoming team",
    "High quality standards",
    "Quick & efficient",
    "Fair & transparent pricing",
    "Will definitely return",
  ],
};

export const CATEGORY_GRIEVANCE_PRESETS: Record<string, string[]> = {
  restaurant: [
    "Excessive wait time",
    "Food quality / temperature",
    "Order mistake",
    "Inattentive server",
    "Atmosphere / noise level",
    "Billing or pricing issue",
  ],
  hotel: [
    "Room cleanliness",
    "Check-in delays",
    "Noise disturbance",
    "Amenities not working",
    "Staff interaction",
  ],
  dentist: [
    "Discomfort or pain",
    "Long wait past appointment",
    "Billing unexpected cost",
    "Communication gap",
  ],
  automotive: [
    "Repair took longer than quoted",
    "Pricing higher than estimate",
    "Issue not fully resolved",
    "Communication delay",
  ],
  default: [
    "Customer service issue",
    "Long wait or delay",
    "Quality below expectation",
    "Billing or pricing dispute",
    "Cleanliness or hygiene",
    "Communication gap",
  ],
};

export const INITIAL_BUSINESSES: BusinessProfile[] = [
  {
    id: "rustic-table",
    name: "The Rustic Table Bistro",
    placeId: "ChIJ7xG9y22uEmsREK03gQx3Z3w",
    category: "restaurant",
    categoryLabel: "Italian & Wood-Fired Bistro",
    address: "428 Market Street, Downtown",
    city: "San Francisco, CA",
    phone: "(415) 555-0192",
    website: "https://therustictable.example.com",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=400&q=80",
    brandColor: "#EA580C", // Amber/Orange
    ratingAverage: 4.8,
    totalGoogleReviews: 342,
    headline: "Enjoyed your meal?",
    subheadline: "Your 15-second review means the world to our kitchen and crew!",
    customTags: ["Truffle Pasta", "Wood-fired Pizza", "Craft Cocktails", "Cozy Patio", "Attentive Staff"],
  },
  {
    id: "lumina-dental",
    name: "Lumina Dental & Aesthetic Studio",
    placeId: "ChIJddq3ip2uEmsR0D_7w6G5b3Y",
    category: "dentist",
    categoryLabel: "Modern Dental Clinic",
    address: "1050 Tech Parkway, Suite 300",
    city: "Austin, TX",
    phone: "(512) 555-0841",
    website: "https://luminadental.example.com",
    logoUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=200&h=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&h=400&q=80",
    brandColor: "#0284C7", // Sky blue
    ratingAverage: 4.9,
    totalGoogleReviews: 189,
    headline: "How was your visit today?",
    subheadline: "Help other patients discover comfortable, gentle dental care.",
    customTags: ["Gentle Cleaning", "Painless Treatment", "Friendly Staff", "Modern Clinic", "Clear Pricing"],
  },
  {
    id: "serene-palms",
    name: "Serene Palms Boutique Hotel",
    placeId: "ChIJG4m_W16uEmsRPv02hZ6l1A8",
    category: "hotel",
    categoryLabel: "Boutique Resort & Spa",
    address: "880 Oceanfront Boulevard",
    city: "Miami Beach, FL",
    phone: "(305) 555-4920",
    website: "https://serenepalms.example.com",
    logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&h=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=400&q=80",
    brandColor: "#0D9488", // Teal
    ratingAverage: 4.7,
    totalGoogleReviews: 521,
    headline: "Did you enjoy your stay?",
    subheadline: "Share your experience and help future travelers find paradise!",
    customTags: ["Oceanfront Suite", "Rooftop Pool", "Exceptional Hospitality", "Delicious Breakfast", "Spotless Rooms"],
  },
  {
    id: "apex-auto",
    name: "Apex Precision Auto Care",
    placeId: "ChIJW7oV1KSuEmsRv6r2A9c-dEE",
    category: "automotive",
    categoryLabel: "Automotive Service & Repair",
    address: "240 Industrial Way",
    city: "Denver, CO",
    phone: "(303) 555-7281",
    website: "https://apexautocare.example.com",
    logoUrl: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=200&h=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&h=400&q=80",
    brandColor: "#DC2626", // Red
    ratingAverage: 4.8,
    totalGoogleReviews: 215,
    headline: "Got your ride running smooth?",
    subheadline: "We value honest reviews from our community drivers!",
    customTags: ["Honest Pricing", "Quick Brake Service", "Clear Explanations", "Clean Shop", "Reliable Diagnostics"],
  },
];

export const INITIAL_ANALYTICS: Record<string, AnalyticsMetrics> = {
  "rustic-table": {
    totalScans: 482,
    aiReviewsGenerated: 326,
    googleMapsHandoffs: 248,
    privateFeedbacksCaptured: 19,
    conversionRate: 51.4,
    ratingDistribution: { 5: 220, 4: 87, 3: 11, 2: 5, 1: 3 },
  },
  "lumina-dental": {
    totalScans: 230,
    aiReviewsGenerated: 165,
    googleMapsHandoffs: 142,
    privateFeedbacksCaptured: 6,
    conversionRate: 61.7,
    ratingDistribution: { 5: 135, 4: 24, 3: 4, 2: 1, 1: 1 },
  },
  "serene-palms": {
    totalScans: 690,
    aiReviewsGenerated: 440,
    googleMapsHandoffs: 312,
    privateFeedbacksCaptured: 28,
    conversionRate: 45.2,
    ratingDistribution: { 5: 270, 4: 138, 3: 18, 2: 6, 1: 4 },
  },
  "apex-auto": {
    totalScans: 195,
    aiReviewsGenerated: 138,
    googleMapsHandoffs: 110,
    privateFeedbacksCaptured: 12,
    conversionRate: 56.4,
    ratingDistribution: { 5: 98, 4: 31, 3: 8, 2: 3, 1: 1 },
  },
};

export const INITIAL_FEEDBACKS: PrivateFeedbackSubmission[] = [
  {
    id: "fb-1",
    businessId: "rustic-table",
    businessName: "The Rustic Table Bistro",
    rating: 2,
    issues: ["Excessive wait time", "Inattentive server"],
    comment: "Waited 45 minutes for our mains on Friday night without any update from the staff. Usually love this place, but service felt completely overwhelmed.",
    customerName: "David Miller",
    customerContact: "david.m@example.com",
    preferredContactMethod: "email",
    createdAt: "2026-09-28T19:40:00Z",
    status: "new",
  },
  {
    id: "fb-2",
    businessId: "rustic-table",
    businessName: "The Rustic Table Bistro",
    rating: 3,
    issues: ["Food quality / temperature"],
    comment: "The pizza crust was a bit burnt on the bottom today. Server was polite and offered extra water, but food was not quite up to regular standard.",
    customerName: "Elena R.",
    customerContact: "555-0144",
    preferredContactMethod: "phone",
    createdAt: "2026-09-29T14:15:00Z",
    status: "contacted",
  },
  {
    id: "fb-3",
    businessId: "lumina-dental",
    businessName: "Lumina Dental & Aesthetic Studio",
    rating: 3,
    issues: ["Long wait past appointment"],
    comment: "Appointment was at 10 AM, had to wait in waiting room until 10:35 AM before being seated.",
    customerName: "Marcus Vance",
    customerContact: "m.vance@example.com",
    preferredContactMethod: "email",
    createdAt: "2026-09-27T11:00:00Z",
    status: "resolved",
  },
];

// Helper to safely access localStorage on the client
const STORAGE_KEYS = {
  BUSINESSES: "reviewboost_businesses",
  ANALYTICS: "reviewboost_analytics",
  FEEDBACKS: "reviewboost_feedbacks",
};

export function getStoredBusinesses(): BusinessProfile[] {
  if (typeof window === "undefined") return INITIAL_BUSINESSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
      return INITIAL_BUSINESSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BUSINESSES;
  }
}

export function saveBusiness(business: BusinessProfile): BusinessProfile[] {
  const current = getStoredBusinesses();
  const existingIdx = current.findIndex(b => b.id === business.id || b.placeId === business.placeId);
  let updated: BusinessProfile[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...business };
  } else {
    updated = [business, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredAnalytics(businessId: string): AnalyticsMetrics {
  const fallback = INITIAL_ANALYTICS[businessId] || {
    totalScans: 42,
    aiReviewsGenerated: 31,
    googleMapsHandoffs: 26,
    privateFeedbacksCaptured: 3,
    conversionRate: 61.9,
    ratingDistribution: { 5: 22, 4: 7, 3: 2, 1: 1, 2: 0 },
  };

  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ANALYTICS}_${businessId}`);
    if (!raw) {
      localStorage.setItem(`${STORAGE_KEYS.ANALYTICS}_${businessId}`, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function trackAnalyticsEvent(
  businessId: string,
  event: "scan" | "ai_generate" | "handoff" | "private_feedback",
  rating?: number
) {
  if (typeof window === "undefined") return;
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
    metrics.conversionRate = metrics.totalScans > 0 
      ? Math.round((metrics.googleMapsHandoffs / metrics.totalScans) * 1000) / 10 
      : 0;

    localStorage.setItem(`${STORAGE_KEYS.ANALYTICS}_${businessId}`, JSON.stringify(metrics));
  } catch (e) {
    console.error("Failed to track analytics:", e);
  }
}

export function getStoredFeedbacks(businessId?: string): PrivateFeedbackSubmission[] {
  if (typeof window === "undefined") {
    return businessId ? INITIAL_FEEDBACKS.filter(f => f.businessId === businessId) : INITIAL_FEEDBACKS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    const all: PrivateFeedbackSubmission[] = raw ? JSON.parse(raw) : INITIAL_FEEDBACKS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(INITIAL_FEEDBACKS));
    }
    return businessId ? all.filter(f => f.businessId === businessId) : all;
  } catch {
    return INITIAL_FEEDBACKS;
  }
}

export function addPrivateFeedback(submission: Omit<PrivateFeedbackSubmission, "id" | "createdAt" | "status">): PrivateFeedbackSubmission {
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

export function updateFeedbackStatus(id: string, status: "new" | "contacted" | "resolved"): void {
  const current = getStoredFeedbacks();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(updated));
  }
}
