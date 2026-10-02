"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Building,
  MapPin,
  Star,
  AlertCircle,
} from "lucide-react";
import { getStoredBusinesses } from "@/lib/business-store";

interface PlaceQRCodeCardProps {
  initialName?: string;
  initialPlaceId?: string;
  className?: string;
}

export const PlaceQRCodeCard: React.FC<PlaceQRCodeCardProps> = ({
  initialName = "",
  initialPlaceId = "",
  className = "",
}) => {
  const [businessName, setBusinessName] = useState(initialName);
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      if (!initialName && !initialPlaceId) {
        const stored = getStoredBusinesses();
        if (stored.length > 0) {
          setBusinessName(stored[0].name);
          setPlaceId(stored[0].placeId);
        }
      }
    }
  }, [initialName, initialPlaceId]);

  const hasValidInputs = businessName.trim().length > 0 && placeId.trim().length > 0;

  // Compute dynamic target review URL
  const targetUrl = hasValidInputs
    ? `${origin}/review?placeId=${encodeURIComponent(
        placeId.trim()
      )}&name=${encodeURIComponent(businessName.trim())}`
    : `${origin}/review`;

  // Copy target review link to clipboard
  const handleCopyLink = async () => {
    if (!hasValidInputs) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = targetUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  /**
   * Export high-resolution, print-ready branded card PNG (300 DPI layout).
   */
  const handleDownloadPng = async () => {
    if (!hasValidInputs) return;
    setIsExporting(true);
    try {
      const width = 800;
      const height = 1100;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Card border
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#0f172a";
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // Inner divider line
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#cbd5e1";
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // 2. Header
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";

      const displayName =
        businessName.length > 28
          ? `${businessName.substring(0, 26)}...`
          : businessName;
      ctx.fillText(displayName, width / 2, 130);

      // Subheader
      ctx.fillStyle = "#64748b";
      ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Google Maps Verified Venue", width / 2, 175);

      // 3. 5-Star Graphic
      ctx.fillStyle = "#f59e0b";
      ctx.font = "34px sans-serif";
      ctx.fillText("★ ★ ★ ★ ★", width / 2, 230);

      // 4. Headline
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("How was your experience today?", width / 2, 295);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Scan with your phone camera to review on Google", width / 2, 335);

      // 5. Draw QR code
      const svgElement = document.getElementById("place-qr-svg");
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const qrSize = 400;
            const qrX = (width - qrSize) / 2;
            const qrY = 380;

            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#e2e8f0";
            ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            URL.revokeObjectURL(blobURL);
            resolve(true);
          };
          img.onerror = reject;
          img.src = blobURL;
        });
      }

      // 6. Pill CTA Button
      const btnY = 880;
      const btnW = 540;
      const btnH = 70;
      const btnX = (width - btnW) / 2;

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 35);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Scan to Review on Google Maps", width / 2, btnY + 44);

      // 7. Micro Instructions
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("1. Open Camera  •  2. Tap Link  •  3. Paste & Submit", width / 2, 1010);

      // Download file
      const link = document.createElement("a");
      const safeName = businessName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `${safeName}-google-review-qr.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate PNG:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-6 ${className}`}
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
          <span>Google Place QR Code Generator</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Generates a high error-correction QR code linking to your venue's Google review workflow.
        </p>
      </div>

      {/* Input Configuration Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Business Name</span>
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Acme Coffee Roasters"
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Place ID</span>
          </label>
          <input
            type="text"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* QR Code Preview Card */}
      {hasValidInputs ? (
        <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {businessName}
            </h4>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Scan to review on Google Maps
            </p>
          </div>

          {/* High Error Correction QR Code */}
          <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
            <QRCodeSVG
              id="place-qr-svg"
              value={targetUrl}
              size={170}
              level="H"
              includeMargin={true}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>

          {/* Dynamic URL badge */}
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="truncate font-mono text-[11px] text-slate-600 dark:text-zinc-400 mr-2">
              {targetUrl}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-600 dark:text-zinc-300 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
          <AlertCircle className="w-5 h-5 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
            Enter a Business Name and Google Place ID above to preview and download the QR card.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!hasValidInputs || isExporting}
          className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "Rendering PNG..." : "Download High-Res QR Card (PNG)"}</span>
        </button>

        {hasValidInputs && (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Preview Review Flow</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
