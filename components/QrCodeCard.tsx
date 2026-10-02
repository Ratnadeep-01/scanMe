"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Printer,
  Sparkles,
  Star,
  Copy,
  Check,
  Palette,
  Eye,
} from "lucide-react";
import { BusinessProfile, QrCardConfig } from "@/lib/types";
import { buildQrTargetUrl, copyTextToClipboard } from "@/lib/google-maps-utils";

interface QrCodeCardProps {
  business: BusinessProfile;
  appBaseUrl?: string;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  business,
  appBaseUrl = "https://reviewboost-ai.com",
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [config, setConfig] = useState<QrCardConfig>({
    headline: business.headline || "Loved your visit?",
    subheadline: "Scan with your phone camera to leave a quick Google review!",
    callToAction: "Scan for 15-Second Google Review",
    cardStyle: "counter-card",
    accentColor: business.brandColor || "#ea580c",
    includeLogo: true,
    showStarRating: true,
    qrSize: 180,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Compute the live target URL that the QR code points to
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : appBaseUrl;
  const targetUrl = buildQrTargetUrl(currentOrigin, business.placeId, business.name);

  // Download high-resolution PNG
  const handleDownloadPng = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create higher-res scaled version on off-screen canvas
    const downloadCanvas = document.createElement("canvas");
    const scale = 3; // 3x scale for print sharpness
    downloadCanvas.width = canvas.width * scale;
    downloadCanvas.height = canvas.height * scale;
    const ctx = downloadCanvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, downloadCanvas.width, downloadCanvas.height);
    }

    const pngUrl = downloadCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger standard browser print with print styles
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(targetUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Controls & Configuration Sidebar */}
      <div className="lg:col-span-5 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm print:hidden">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            Printable Card Studio
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Customize branded QR cards for tables, check-in desks, or receipts.
          </p>
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
            Card Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "counter-card", label: "Counter Stand (4x6)" },
              { id: "table-tent", label: "Table Tent (Folded)" },
              { id: "window-sticker", label: "Window / Door Decal" },
              { id: "business-card", label: "Receipt / Wallet Card" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setConfig({ ...config, cardStyle: fmt.id as QrCardConfig["cardStyle"] })}
                className={`text-xs p-2.5 rounded-xl border text-left font-medium transition-all ${
                  config.cardStyle === fmt.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-indigo-200"
                    : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Headline & Subhead Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={config.headline}
              onChange={(e) => setConfig({ ...config, headline: e.target.value })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1">
              Subheadline / Instructions
            </label>
            <input
              type="text"
              value={config.subheadline}
              onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1">
              Badge Call to Action
            </label>
            <input
              type="text"
              value={config.callToAction}
              onChange={(e) => setConfig({ ...config, callToAction: e.target.value })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Accent Color picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
            Accent Brand Color
          </label>
          <div className="flex items-center gap-2">
            {["#ea580c", "#0284c7", "#0d9488", "#7c3aed", "#dc2626", "#0f172a"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConfig({ ...config, accentColor: c })}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  config.accentColor === c ? "scale-115 border-indigo-600 ring-2 ring-indigo-200" : "border-white"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
              className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0"
              title="Custom Hex Color"
            />
          </div>
        </div>

        {/* Direct Link Copier */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
            Dynamic QR Target URL
          </label>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-xs text-slate-500 font-mono truncate flex-1">
              {targetUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 bg-white dark:bg-zinc-700 hover:bg-slate-100 rounded-lg text-slate-600 dark:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copiedLink ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Export Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors shadow-md shadow-indigo-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Stand Card</span>
          </button>
        </div>
      </div>

      {/* Hidden Offscreen Canvas for Crisp PNG Downloads */}
      <div className="hidden" ref={canvasRef}>
        <QRCodeCanvas
          value={targetUrl}
          size={500}
          level="H"
          fgColor="#0f172a"
          bgColor="#ffffff"
          marginSize={2}
        />
      </div>

      {/* Live Card Preview Area */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className="mb-3 text-xs text-slate-400 font-medium flex items-center gap-1.5 print:hidden">
          <Eye className="w-4 h-4" />
          <span>Real-time Card Preview ({config.cardStyle.replace("-", " ")})</span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* PRINTABLE CARD CONTAINER (Styled for on-screen & print page) */}
        {/* ---------------------------------------------------------------- */}
        <div
          ref={cardRef}
          id="printable-card"
          className={`w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 text-center transition-all duration-300 relative print:shadow-none print:border-2 print:max-w-none print:w-[4in] print:mx-auto`}
          style={{ borderColor: config.accentColor }}
        >
          {/* Top Brand Tag / Logo */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div
              className="w-14 h-14 rounded-2xl p-1 shadow-md border-2 border-white flex items-center justify-center overflow-hidden bg-slate-900"
              style={{ backgroundColor: config.accentColor }}
            >
              {business.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-white font-bold text-xl">{business.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {business.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {business.address}, {business.city}
              </p>
            </div>
          </div>

          {/* Headline & Star Graphic */}
          <div className="my-3">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
              {config.headline}
            </h3>
            {config.showStarRating && (
              <div className="flex items-center justify-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-5 h-5 fill-amber-400 text-amber-400 filter drop-shadow-xs"
                  />
                ))}
              </div>
            )}
            <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
              {config.subheadline}
            </p>
          </div>

          {/* Central High-Contrast QR Code Card */}
          <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block shadow-inner">
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <QRCodeSVG
                value={targetUrl}
                size={config.qrSize}
                level="H"
                fgColor="#0f172a"
                bgColor="#ffffff"
                imageSettings={
                  config.includeLogo && business.logoUrl
                    ? {
                        src: business.logoUrl,
                        x: undefined,
                        y: undefined,
                        height: 38,
                        width: 38,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI-Assisted 15-Second Review</span>
            </div>
          </div>

          {/* Bottom Badge CTA */}
          <div
            className="py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm tracking-wide shadow-md mx-auto inline-block"
            style={{ backgroundColor: config.accentColor }}
          >
            {config.callToAction}
          </div>

          {/* Micro Instructions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span>1. Open Camera</span>
            <span>•</span>
            <span>2. Tap Notification</span>
            <span>•</span>
            <span>3. Paste on Google</span>
          </div>

          {/* Table-tent fold instructions (only shown if table-tent format) */}
          {config.cardStyle === "table-tent" && (
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400 uppercase tracking-widest print:block">
              ✂ Fold along dashed centerline to form 3D table tent
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
