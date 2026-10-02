"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg" | "xl";
  readOnly?: boolean;
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "1 - Poor", color: "text-slate-600 dark:text-zinc-400" },
  2: { text: "2 - Fair", color: "text-slate-600 dark:text-zinc-400" },
  3: { text: "3 - Average", color: "text-slate-700 dark:text-zinc-300 font-medium" },
  4: { text: "4 - Good", color: "text-emerald-700 dark:text-emerald-400 font-medium" },
  5: { text: "5 - Excellent", color: "text-emerald-700 dark:text-emerald-400 font-semibold" },
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  size = "lg",
  readOnly = false,
  showLabel = true,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8 sm:w-9 sm:h-9",
    xl: "w-10 h-10 sm:w-11 sm:h-11",
  };

  const handleSelect = (val: number) => {
    if (!readOnly && onChange) {
      onChange(val);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-1.5 sm:gap-2"
        onMouseLeave={() => !readOnly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isFilled = starVal <= activeRating;

          return (
            <button
              key={starVal}
              type="button"
              disabled={readOnly}
              onClick={() => handleSelect(starVal)}
              onMouseEnter={() => !readOnly && setHoverRating(starVal)}
              className={`p-1 transition-transform duration-100 ${
                readOnly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-105 active:scale-95"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-md`}
              aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors duration-150 ${
                  isFilled
                    ? "fill-amber-400 text-amber-500"
                    : "fill-transparent text-slate-300 dark:text-zinc-700 hover:text-slate-400"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeRating > 0 && (
        <span
          className={`text-xs ${
            RATING_LABELS[activeRating]?.color || "text-slate-600"
          }`}
        >
          {RATING_LABELS[activeRating]?.text}
        </span>
      )}
    </div>
  );
};
