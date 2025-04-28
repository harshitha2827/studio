"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  readOnly = false,
  size = 20,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating ?? rating);

        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "transition-colors duration-150",
              isFilled
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground fill-muted",
              !readOnly && "cursor-pointer"
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            aria-label={readOnly ? `${rating} out of ${maxRating} stars` : `Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            role={readOnly ? "img" : "button"}
          />
        );
      })}
    </div>
  );
}
