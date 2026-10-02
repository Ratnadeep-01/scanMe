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

const RATING_LABELS: Record<number, { text: string; color: string; emoji: string }> = {
  1: { text: "Disappointing", color: "text-rose-500", emoji: "😞" },
  2: { text: "Needs Improvement", color: "text-amber-500", emoji: "😐" },
  3: { text: "Average / Okay", color: "text-yellow-600", emoji: "🙂" },
  4: { text: "Great Experience!", color: "text-emerald-500", emoji: "😊" },
  5: { text: "Exceptional / Loved it!", color: "text-emerald-600 font-bold", emoji: "🎉" },
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
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10 sm:w-11 sm:h-11",
    xl: "w-12 h-12 sm:w-14 sm:h-14",
  };

  const handleSelect = (val: number) => {
    if (!readOnly && onChange) {
      onChange(val);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div 
        className="flex items-center gap-2 sm:gap-3 touch-manipulation"
        onMouseLeave={() => !readOnly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isFilled = starVal <= activeRating;
          const isHighRating = activeRating >= 4;

          return (
            <button
              key={starVal}
              type="button"
              disabled={readOnly}
              onClick={() => handleSelect(starVal)}
              onMouseEnter={() => !readOnly && setHoverRating(starVal)}
              className={`p-1.5 transition-transform duration-150 active:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full ${
                readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
              }`}
              aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
            >
              <Star
                className={`${sizeClasses[size]} transition-all duration-200 ${
                  isFilled
                    ? isHighRating
                      ? "fill-amber-400 text-amber-500 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                      : "fill-amber-300 text-amber-400"
                    : "fill-slate-100 text-slate-300 hover:text-slate-400 dark:fill-zinc-800 dark:text-zinc-600"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeRating > 0 && (
        <div className="flex items-center gap-1.5 text-sm sm:text-base animate-in fade-in zoom-in-95 duration-200">
          <span className="text-lg">{RATING_LABELS[activeRating]?.emoji}</span>
          <span className={`font-semibold ${RATING_LABELS[activeRating]?.color || "text-slate-700"}`}>
            {RATING_LABELS[activeRating]?.text}
          </span>
        </div>
      )}
    </div>
  );
};
