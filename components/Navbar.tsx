"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Menu,
  X,
  Lock,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/admin",
      label: "Management Console",
      icon: Lock,
      active: pathname === "/admin",
      target: undefined,
    },
    {
      href: "/review",
      label: "Customer Flow Preview",
      icon: ExternalLink,
      active: false,
      target: "_blank",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 print:hidden transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-mono font-bold text-xs tracking-tight">
            RF
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
              ReviewFlow
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
              Admin Console
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                rel={link.target ? "noopener noreferrer" : undefined}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
                  link.active
                    ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                rel={link.target ? "noopener noreferrer" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  link.active
                    ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
