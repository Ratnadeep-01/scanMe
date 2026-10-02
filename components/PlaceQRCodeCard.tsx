"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  QrCode,
  Building,
  MapPin,
  Star,
} from "lucide-react";
import { getStoredBusinesses } from "@/lib/business-store";
import { extractCleanPlaceId } from "@/lib/google-maps-utils";
import { CATEGORY_OPTIONS } from "./AdminDashboard";

interface PlaceQRCodeCardProps {
  initialName?: string;
  initialPlaceId?: string;
  initialCategory?: string;
  className?: string;
}

const PRESET_SAMPLES = [
  {
    name: "NIT Patna Bihta Campus",
    placeId: "ChIJC-eGOdGpkjkRQRsEQi4SbE0",
    category: "college",
  },
  {
    name: "Artisan Coffee Roasters",
    placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    category: "cafe",
  },
  {
    name: "Apex Dental Clinic",
    placeId: "ChIJ2eUgeAK6j4ARbm5G4_qR3v4",
    category: "dentist",
  },
];

export const PlaceQRCodeCard: React.FC<PlaceQRCodeCardProps> = ({
  initialName = "",
  initialPlaceId = "",
  initialCategory = "",
  className = "",
}) => {
  const [businessName, setBusinessName] = useState(() => {
    if (initialName) return initialName;
    if (typeof window !== "undefined") {
      const stored = getStoredBusinesses();
      if (stored.length > 0) return stored[0].name;
    }
    return PRESET_SAMPLES[0].name;
  });

  const [placeId, setPlaceId] = useState(() => {
    if (initialPlaceId) return extractCleanPlaceId(initialPlaceId) || initialPlaceId;
    if (typeof window !== "undefined") {
      const stored = getStoredBusinesses();
      if (stored.length > 0) return stored[0].placeId;
    }
    return PRESET_SAMPLES[0].placeId;
  });

  const [category, setCategory] = useState(() => {
    if (initialCategory) return initialCategory;
    if (typeof window !== "undefined") {
      const stored = getStoredBusinesses();
      if (stored.length > 0) return stored[0].category;
    }
    return PRESET_SAMPLES[0].category;
  });

  const [copied, setCopied] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );
  const [isExporting, setIsExporting] = useState(false);

  const cleanPlaceId = extractCleanPlaceId(placeId);
  const hasValidInputs = businessName.trim().length > 0 && cleanPlaceId.length > 0;

  // Compute dynamic target review URL
  const targetUrl = hasValidInputs
    ? `${origin}/review?placeId=${encodeURIComponent(cleanPlaceId)}&name=${encodeURIComponent(
        businessName.trim()
      )}${category ? `&category=${encodeURIComponent(category)}` : ""}`
    : `${origin}/review`;

  const handleCopyLink = async () => {
    if (!hasValidInputs) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    if (!hasValidInputs || isExporting) return;
    setIsExporting(true);

    try {
      const width = 800;
      const height = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Clean background & border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Subtle framing border
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#0f172a";
      ctx.strokeRect(36, 36, width - 72, height - 72);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#e2e8f0";
      ctx.strokeRect(48, 48, width - 96, height - 96);

      // Header: Review Us on Google
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Review Us on Google", width / 2, 130);

      // 5 Gold Stars
      const starCount = 5;
      const starSpacing = 42;
      const startX = width / 2 - ((starCount - 1) * starSpacing) / 2;
      const starY = 180;

      const drawStar = (cx: number, cy: number, spikes = 5, outerRadius = 16, innerRadius = 8) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = "#f59e0b";
        ctx.fill();
      };

      for (let i = 0; i < starCount; i++) {
        drawStar(startX + i * starSpacing, starY);
      }

      // Venue Name
      ctx.fillStyle = "#334155";
      ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const displayName =
        businessName.length > 32 ? `${businessName.substring(0, 30)}...` : businessName;
      ctx.fillText(displayName, width / 2, 235);

      // Render QR Code from SVG
      const qrSvgElement = document.getElementById("place-qr-svg");
      if (qrSvgElement) {
        const svgXml = new XMLSerializer().serializeToString(qrSvgElement);
        const svg64 = btoa(unescape(encodeURIComponent(svgXml)));
        const image64 = "data:image/svg+xml;base64," + svg64;

        const qrImg = new Image();
        qrImg.src = image64;

        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
        });

        const qrSize = 490;
        const qrX = (width - qrSize) / 2;
        const qrY = 300;

        // Quiet zone container
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }

      // Scan instruction
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Scan with phone camera to review", width / 2, 890);

      ctx.fillStyle = "#64748b";
      ctx.font = "400 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("No app download required", width / 2, 930);

      // Divider
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(120, 980);
      ctx.lineTo(width - 120, 980);
      ctx.stroke();

      // Footer
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px monospace";
      ctx.fillText(`Google Place ID: ${cleanPlaceId}`, width / 2, 1025);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Thank you for your visit and feedback", width / 2, 1070);

      // Trigger download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const sanitizedFilename = businessName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      downloadLink.download = `${sanitizedFilename}-google-review-stand.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Failed to generate printable QR card:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden ${className}`}
    >
      {/* Studio Header Bar */}
      <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <span>Venue Configuration & Stand Proof</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Set venue details to generate a 4&quot; × 6&quot; printable counter stand and direct customer review link.
          </p>
        </div>

        {/* Quick sample presets */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400">Presets:</span>
          {PRESET_SAMPLES.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => {
                setBusinessName(sample.name);
                setPlaceId(sample.placeId);
                setCategory(sample.category);
              }}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {sample.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Venue Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Business / Venue Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. NIT Patna Campus / Artisan Cafe"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-colors"
              />
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Google Place ID */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Google Place ID
              </label>
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1"
              >
                <span>Find Place ID</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="text"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                placeholder="ChIJ... or paste Google Maps URL"
                className="w-full text-xs sm:text-sm font-mono pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-colors"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Business Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-colors cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Destination URL */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Encoded QR Target URL
            </label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-slate-200 dark:border-zinc-700">
              <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono truncate flex-1">
                {targetUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-white dark:bg-zinc-700 hover:bg-slate-100 rounded text-slate-700 dark:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 dark:border-zinc-600"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Export Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!hasValidInputs || isExporting}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? "Generating..." : "Download 300 DPI PNG"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!hasValidInputs}
              className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-medium py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sign</span>
            </button>
          </div>
        </div>

        {/* Right Column: Physical Print Proof */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs text-center space-y-1 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Print Proof Preview (4&quot; × 6&quot; Portrait)
            </span>
          </div>

          {/* Physical Sign Mockup */}
          <div
            id="printable-card"
            className="w-full max-w-xs bg-white text-slate-900 rounded-lg p-6 border-2 border-slate-800 text-center shadow-sm relative print:shadow-none print:max-w-none print:w-[4in] print:mx-auto"
          >
            {/* Header */}
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Review Us on Google
            </h4>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Venue name */}
            <p className="text-xs font-semibold text-slate-700 truncate max-w-full px-2 mb-3">
              {businessName || "Your Venue Name"}
            </p>

            {/* QR Code */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 inline-block">
              <QRCodeSVG
                id="place-qr-svg"
                value={targetUrl}
                size={160}
                level="H"
                includeMargin={true}
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
            </div>

            {/* Scan prompt */}
            <p className="text-xs font-semibold text-slate-900 mt-3">
              Scan with phone camera to review
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Takes 15 seconds • No app needed
            </p>

            {/* Footer reference */}
            {cleanPlaceId && (
              <div className="mt-3 pt-2 border-t border-slate-100 text-[9px] font-mono text-slate-400 truncate">
                Place ID: {cleanPlaceId}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
