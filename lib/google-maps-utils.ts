/**
 * Google Maps Integration & Hand-Off Utilities
 */

/**
 * Robust sanitizer that extracts only the valid Place ID token.
 * Prevents errors when users inadvertently copy both the Place ID and the address text
 * from the Google Place ID Finder (e.g. "ChIJC-eGOdGpkjkRQRsEQi4SbE0 Opposite Side Of DMI...").
 */
export function extractCleanPlaceId(rawInput: string): string {
  if (!rawInput) return "";
  const trimmed = rawInput.trim();

  // If input contains full URL with placeid parameter (e.g. ...writereview?placeid=ChIJ...)
  const urlMatch = trimmed.match(/[?&]placeid=([^&]+)/i);
  if (urlMatch) {
    return extractCleanPlaceId(decodeURIComponent(urlMatch[1]));
  }

  // Google Place IDs almost always begin with "ChIJ" followed by alphanumeric chars, hyphens, underscores
  const chijMatch = trimmed.match(/(ChIJ[a-zA-Z0-9_-]+)/);
  if (chijMatch) {
    return chijMatch[1];
  }

  // Fallback: take the first continuous token and strip punctuation
  const firstToken = trimmed.split(/[\s,]+/)[0];
  return firstToken.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function getGoogleReviewUrl(placeId: string, businessName?: string): string {
  const cleanId = extractCleanPlaceId(placeId);

  // Direct Google local review trigger URL
  if (cleanId && !cleanId.startsWith("demo-")) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(cleanId)}`;
  }

  // Fallback to Google Maps query search if Place ID is invalid
  const query = businessName || "Google Reviews";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getGooglePlaceProfileUrl(placeId: string, businessName?: string): string {
  const cleanId = extractCleanPlaceId(placeId);

  if (cleanId && !cleanId.startsWith("demo-")) {
    return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(cleanId)}`;
  }
  const query = businessName || "Google Maps";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getNativeAppIntentUrl(placeId: string): string {
  const cleanId = extractCleanPlaceId(placeId);

  if (!cleanId || cleanId.startsWith("demo-")) {
    return `https://maps.google.com`;
  }
  // Android Intent URI scheme that directly launches Google Maps app write review
  return `intent://search.google.com/local/writereview?placeid=${encodeURIComponent(
    cleanId
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
  const cleanId = extractCleanPlaceId(placeId);
  const params = new URLSearchParams();
  if (cleanId) {
    params.set("placeId", cleanId);
  }
  if (businessName) {
    params.set("name", businessName);
  }
  return `${cleanBase}/review?${params.toString()}`;
}
