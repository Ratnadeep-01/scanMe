"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, LayoutDashboard, ExternalLink } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">
            RF
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-none">
              ReviewFlow
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
              Google Places Review Engine
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/review"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              pathname?.startsWith("/review")
                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Customer View</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              pathname === "/admin"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
