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

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
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
    if (readOnly || !onChange) return;
    onChange(val);
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-1.5"
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
              aria-label={`Rate ${starVal} out of 5 stars`}
              className={`p-1 transition-transform ${
                readOnly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-110 active:scale-95 focus:outline-none"
              }`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-300 dark:text-zinc-700"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeRating > 0 && (
        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
          {RATING_LABELS[activeRating] || `${activeRating} Stars`}
        </span>
      )}
    </div>
  );
};
