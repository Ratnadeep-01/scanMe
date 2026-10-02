/**
 * Google Maps Integration & Hand-Off Utilities
 *
 * Technical Reality:
 * Due to Google security constraints (CORS sandbox, cross-origin iframe security,
 * and native app sandboxing), external third-party web apps cannot programmatically
 * pre-fill the text input inside Google's native review form.
 *
 * Our Battle-Tested Handoff Strategy:
 * 1. Store the AI-generated review text into the device clipboard via `navigator.clipboard.writeText`
 *    (with graceful fallback for older in-app webviews).
 * 2. Display an intuitive HUD modal instructing the user: "Review copied! Tap 5 stars and paste."
 * 3. Deep-link directly into Google's official Local WriteReview dialog using the place ID.
 */

export function getGoogleReviewUrl(placeId: string, businessName?: string): string {
  // Direct Google local review trigger URL
  if (placeId && placeId.trim() && !placeId.startsWith("demo-")) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`;
  }
  
  // Fallback to Google Maps query search if Place ID is demo or placeholder
  const query = businessName || "Google Reviews";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getGooglePlaceProfileUrl(placeId: string, businessName?: string): string {
  if (placeId && placeId.trim() && !placeId.startsWith("demo-")) {
    return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId.trim())}`;
  }
  const query = businessName || "Google Maps";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getNativeAppIntentUrl(placeId: string): string {
  if (!placeId || placeId.startsWith("demo-")) {
    return `https://maps.google.com`;
  }
  // Android Intent URI scheme that directly launches Google Maps app write review
  return `intent://search.google.com/local/writereview?placeid=${encodeURIComponent(
    placeId
  )}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
}

/**
 * Universal clipboard copy helper with legacy fallback for restrictive webviews
 * (e.g., inside Instagram, Facebook, Line, or WeChat browsers).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Modern Async Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for older browsers / in-app browsers
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Failed to copy text using fallback:", err);
    return false;
  }
}

/**
 * Helper to generate the QR code landing page URL
 */
export function buildQrTargetUrl(baseUrl: string, placeId: string, businessName?: string): string {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const params = new URLSearchParams();
  if (businessName) {
    params.set("businessName", businessName);
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return `${cleanBase}/review/${encodeURIComponent(placeId)}${queryString}`;
}
