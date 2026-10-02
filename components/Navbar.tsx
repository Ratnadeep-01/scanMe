"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, QrCode, LayoutDashboard, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Star className="w-5 h-5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-none">
              ReviewBoost<span className="text-orange-500">.ai</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
              Google Maps Review Acceleration
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/review/rustic-table"
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname?.startsWith("/review")
                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Customer Review View</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname === "/admin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
