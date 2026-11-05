import { Star } from "lucide-react";
import { useState } from "react";

export default function RatingStars({
  rating,
  onRatingChange,
  interactive = true,
  size = "md",
  showLabel = true,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayRating = interactive ? hoverRating || rating : rating;

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          className={`transition-colors ${
            interactive
              ? "cursor-pointer hover:scale-110 active:scale-95"
              : "cursor-default"
          }`}
        >
          <Star
            className={`${sizeMap[size]} ${
              star <= displayRating
                ? "fill-[#0A0A0A] text-[#0A0A0A]"
                : "text-neutral-300"
            }`}
          />
        </button>
      ))}
      {showLabel ? (<span className="ml-2 text-sm font-medium text-neutral-500">
        {rating > 0 ? `${rating}.0` : "No rating"}
      </span>) : null}
    </div>
  );
}
