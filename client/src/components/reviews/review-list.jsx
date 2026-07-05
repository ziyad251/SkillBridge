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
    <div className="space-y-6">
      {/* Average Rating Section */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-yellow-600">
              {averageRating}
            </span>
            <div>
              <RatingStars rating={Math.round(averageRating)} interactive={false} size="md" />
              <p className="text-sm text-gray-600 mt-1">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            No reviews yet.
          </p>
          <p className="text-gray-600">
            Be the first student to review this course.
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
