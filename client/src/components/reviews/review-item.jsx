import { Button } from "@/components/ui/button";
import RatingStars from "@/components/ui/rating-stars";
import { deleteReviewService, updateReviewService } from "@/services";
import { Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewItem({
  review,
  currentUserId,
  onReviewUpdated,
  onReviewDeleted,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editReview, setEditReview] = useState(review.review);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = String(review.userId) === String(currentUserId);
  const createdAt = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setIsSubmitting(true);
      const response = await deleteReviewService(review._id);

      if (response?.success) {
        if (onReviewDeleted) onReviewDeleted(review._id);
      } else {
        setError(response?.message || "Failed to delete review");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error deleting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (editRating === 0 || editReview.trim().length === 0) {
      setError("Please provide both rating and review");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateReviewService(
        review._id,
        editRating,
        editReview
      );

      if (response?.success) {
        setIsEditing(false);
        if (onReviewUpdated) onReviewUpdated(response.data);
      } else {
        setError(response?.message || "Failed to update review");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error updating review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isOwner) {
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{review.userName}</p>
            <p className="text-sm text-gray-500">{createdAt}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <RatingStars
            rating={editRating}
            onRatingChange={setEditRating}
            interactive={true}
            size="md"
          />
        </div>

        <div>
          <label htmlFor={`edit-review-${review._id}`} className="block text-sm font-medium mb-2">
            Edit Review
          </label>
          <Textarea
            id={`edit-review-${review._id}`}
            value={editReview}
            onChange={(e) => setEditReview(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

        <div className="flex gap-2">
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="lms-btn-primary flex-1"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setEditRating(review.rating);
              setEditReview(review.review);
              setError("");
            }}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">{review.userName}</p>
          <div className="flex items-center gap-3 mt-1">
            <RatingStars rating={review.rating} interactive={false} size="sm" />
            <p className="text-sm text-gray-500">{createdAt}</p>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              disabled={isSubmitting}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700">{review.review}</p>
    </div>
  );
}
