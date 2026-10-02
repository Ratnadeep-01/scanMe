"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check existing session on mount
  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(data.authenticated));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim(), rememberMe }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword("");
      } else {
        setError(data.error || "Incorrect management passkey. Customer access is restricted.");
      }
    } catch {
      setError("Network error while verifying credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state while checking session cookie
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-2">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Checking credentials...
        </p>
      </div>
    );
  }

  // If authenticated, render protected dashboard
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, render secure login gate
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center mx-auto">
            <Lock className="w-4 h-4" />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Admin Console Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Enter your password to manage venue settings and customer feedback.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Admin Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-xs sm:text-sm px-3 py-2 pr-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-colors"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-center text-xs">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to QR Studio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
