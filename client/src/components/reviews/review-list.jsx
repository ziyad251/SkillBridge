import RatingStars from "@/components/ui/rating-stars";
import ReviewItem from "./review-item";

export default function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  currentUserId,
  onReviewUpdated,
  onReviewDeleted,
}) {
  return (
    <div className="space-y-4">
      {totalReviews > 0 ? (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5">
          <span className="text-4xl font-bold tracking-tight text-[#171717]">
            {Number(averageRating).toFixed(1)}
          </span>
          <div>
            <RatingStars rating={Math.round(averageRating)} interactive={false} size="sm" showLabel={false} />
            <p className="mt-1 text-sm text-neutral-500">
              Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      ) : null}

      {totalReviews === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center">
          <p className="font-semibold text-[#171717]">No reviews yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Enrolled students can be the first to review this course.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onReviewUpdated={onReviewUpdated}
              onReviewDeleted={onReviewDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
