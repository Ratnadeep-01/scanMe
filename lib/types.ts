export type BusinessCategory =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "dentist"
  | "healthcare"
  | "salon"
  | "automotive"
  | "retail"
  | "gym"
  | "college"
  | "education"
  | "professional"
  | "other";

export interface BusinessProfile {
  id: string;
  name: string;
  placeId: string;
  category: BusinessCategory;
  categoryLabel: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  coverImage?: string;
  brandColor: string;
  ratingAverage: number;
  totalGoogleReviews: number;
  headline?: string;
  subheadline?: string;
  customTags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewGenerationRequest {
  businessName: string;
  category: string;
  placeId?: string;
  rating: number;
  tags: string[];
  tone?: "casual" | "enthusiastic" | "professional" | "concise";
  customNote?: string;
  length?: "short" | "medium" | "detailed";
}

export interface ReviewGenerationResponse {
  review: string;
  alternativeVariations?: string[];
  sentimentScore?: number;
  generatedBy: "openai" | "fallback-engine";
}

export interface PrivateFeedbackSubmission {
  id: string;
  businessId: string;
  businessName: string;
  rating: number;
  issues: string[];
  comment: string;
  customerName?: string;
  customerContact?: string;
  preferredContactMethod?: "email" | "phone" | "none";
  createdAt: string;
  status: "new" | "contacted" | "resolved";
}

export interface AnalyticsMetrics {
  totalScans: number;
  aiReviewsGenerated: number;
  googleMapsHandoffs: number;
  privateFeedbacksCaptured: number;
  conversionRate: number; // handoffs / scans * 100
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface QrCardConfig {
  headline: string;
  subheadline: string;
  callToAction: string;
  cardStyle: "table-tent" | "counter-card" | "window-sticker" | "business-card";
  accentColor: string;
  includeLogo: boolean;
  showStarRating: boolean;
  qrSize: number;
}
