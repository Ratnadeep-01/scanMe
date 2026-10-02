"use client";

import React from "react";
import Link from "next/link";
import {
  QrCode,
  LayoutDashboard,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Terminal,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PlaceQRCodeCard } from "@/components/PlaceQRCodeCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1 w-full">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
            <span>Google Places Integration</span>
            <span>•</span>
            <span>Version 1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            QR Code Review Funnel & Hand-off Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Generates high-error-correction QR codes for physical counters or tables. Visitors draft authentic reviews with AI assistance, copy the text to clipboard, and deep-link directly into Google Maps' native review dialog.
          </p>
        </div>

        {/* Section 1: Interactive QR Generator */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
              <span>Generate Venue QR Code</span>
            </h2>
            <Link
              href="/admin"
              className="text-xs text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 font-medium"
            >
              <span>Manage Saved Locations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PlaceQRCodeCard />
        </section>

        {/* Section 2: Technical Architecture & Routing Specification */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
            <span>Endpoint & Hand-off Specification</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500">
                  <th className="py-2.5 font-medium">Component</th>
                  <th className="py-2.5 font-medium">Route / URI</th>
                  <th className="py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                    Customer QR Route
                  </td>
                  <td className="py-2.5 text-slate-700 dark:text-zinc-300">
                    /review?placeId=&lt;ID&gt;&amp;name=&lt;NAME&gt;
                  </td>
                  <td className="py-2.5 font-sans text-slate-500">
                    Dynamic landing page encoded in the physical QR code.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                    Review Generator API
                  </td>
                  <td className="py-2.5 text-slate-700 dark:text-zinc-300">
                    POST /api/generate-review
                  </td>
                  <td className="py-2.5 font-sans text-slate-500">
                    Accepts <code>{"{ businessName, rating, tags }"}</code> and returns drafted review.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                    Google Maps Hand-off
                  </td>
                  <td className="py-2.5 text-slate-700 dark:text-zinc-300">
                    https://search.google.com/local/writereview?placeid=&lt;ID&gt;
                  </td>
                  <td className="py-2.5 font-sans text-slate-500">
                    Direct write review dialog triggered after clipboard copy.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                    Feedback API
                  </td>
                  <td className="py-2.5 text-slate-700 dark:text-zinc-300">
                    POST /api/feedback
                  </td>
                  <td className="py-2.5 font-sans text-slate-500">
                    Captures private customer grievances from 1-3 star reviews.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Navigation Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin"
            className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between text-slate-900 dark:text-white font-semibold text-sm">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                <span>Admin Operations Console</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage Google Place IDs, view scan metrics, and review customer feedback submissions.
            </p>
          </Link>

          <Link
            href="/review"
            className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between text-slate-900 dark:text-white font-semibold text-sm">
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                <span>Customer Review View</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Test the mobile customer experience with star rating, AI drafting, and clipboard copy.
            </p>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 py-6 text-xs text-slate-500 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ReviewFlow • Google Maps Review Hand-off System</span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-slate-800 dark:hover:text-zinc-300">
              Admin Console
            </Link>
            <Link href="/review" className="hover:text-slate-800 dark:hover:text-zinc-300">
              Review Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
