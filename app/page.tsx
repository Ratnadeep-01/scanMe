"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Copy,
  ExternalLink,
  Smartphone,
  ChevronRight,
  TrendingUp,
  MessageSquareX,
  Printer,
  CheckCircle2,
  Layers,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { INITIAL_BUSINESSES } from "@/lib/business-store";

export default function HomePage() {
  const [customPlaceId, setCustomPlaceId] = useState("");
  const [customBizName, setCustomBizName] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>AI-Assisted Google Maps Review Acceleration</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Turn In-Person Customers Into{" "}
            <span className="bg-linear-to-r from-orange-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
              5-Star Google Reviews
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Eliminate customer friction. Physical QR codes trigger an AI review drafter, automatically copy authentic text to clipboard, hand off directly to Google Maps, and deflect 1-3 star complaints to private management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/review/rustic-table"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>Experience Customer Review Flow</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="w-full sm:w-auto bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 font-semibold py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-xs transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span>Open Business Admin & QR Studio</span>
            </Link>
          </div>

          {/* Social Proof / Key Stats */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9★ Average Rating Lift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>15-Second Completion Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Internal Grievance Shielding</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Business Selector */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Explore Industry Demo Experiences
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Tap any business to test its specialized tags, tone, and review prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_BUSINESSES.map((biz) => (
            <Link
              key={biz.id}
              href={`/review/${biz.id}`}
              className="group bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden shadow-xs flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: biz.brandColor || "#0f172a" }}
                  >
                    {biz.logoUrl ? (
                      <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                    ) : (
                      biz.name.charAt(0)
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{biz.ratingAverage}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {biz.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {biz.categoryLabel}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {biz.customTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Test Review Flow</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Test Any Custom Google Place ID URL Generator */}
      <section className="bg-slate-100 dark:bg-zinc-900/60 border-y border-slate-200 dark:border-zinc-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Universal Dynamic Link Support</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Test With Any Real Google Place ID
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto">
            Input any business name and Google Place ID to generate a dynamic review booster link instantly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 max-w-xl mx-auto pt-2">
            <input
              type="text"
              placeholder="Business Name (e.g. Blue Bottle Coffee)"
              value={customBizName}
              onChange={(e) => setCustomBizName(e.target.value)}
              className="sm:col-span-6 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <input
              type="text"
              placeholder="Google Place ID"
              value={customPlaceId}
              onChange={(e) => setCustomPlaceId(e.target.value)}
              className="sm:col-span-6 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <div className="sm:col-span-12">
              <Link
                href={`/review?placeId=${encodeURIComponent(
                  customPlaceId.trim() || "ChIJN1t_tDeuEmsRUsoyG83frY4"
                )}&businessName=${encodeURIComponent(
                  customBizName.trim() || "Google Sydney"
                )}`}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Launch Custom Review Flow</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineered For Frictionless Handoffs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            How we solve the native Google Maps security sandbox constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              1. Dynamic QR & Profile
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Customers scan printable table-tents or counter stands. The app dynamically pulls verified Google metadata, category tags, and rating averages.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              2. Anti-Robotic AI Drafting
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Customers pick 4 or 5 stars and quick-tags. AI crafts an authentic, conversational review free of clichés, customizable in tone (Casual, Enthusiastic, Pro).
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <Copy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              3. 1-Tap Clipboard Handoff
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Copies the drafted review into device clipboard and deep-links straight to Google's <code className="text-[10px] bg-slate-100 dark:bg-zinc-800 p-0.5 rounded font-mono">search.google.com/local/writereview</code> sheet.
            </p>
          </div>
        </div>

        {/* Protection Shield Banner */}
        <div className="bg-linear-to-r from-slate-900 via-zinc-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Negative Review Protection System</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Protect Your Public Google Rating
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              If a dissatisfied customer taps 1, 2, or 3 stars, they are seamlessly guided to a private feedback form routed directly to management, allowing swift recovery without harming your public score.
            </p>
          </div>

          <Link
            href="/admin"
            className="shrink-0 bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors text-xs sm:text-sm cursor-pointer shadow-md"
          >
            View Grievance Inbox
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-900 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800 dark:text-white">ReviewBoost AI</span>
            <span>• Google Maps Review Acceleration System</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:underline">Admin Dashboard</Link>
            <Link href="/review/rustic-table" className="hover:underline">Customer Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
