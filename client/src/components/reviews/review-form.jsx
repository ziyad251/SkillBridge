import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "@/components/ui/rating-stars";
import { createReviewService } from "@/services";
import { useState } from "react";

export default function ReviewForm({ courseId, auth, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (review.trim().length === 0) {
      setError("Please write a review");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createReviewService(courseId, rating, review);

      if (response?.success) {
        setSuccess("Review submitted successfully!");
        setRating(0);
        setReview("");
        setTimeout(() => {
          setSuccess("");
          if (onReviewSubmitted) onReviewSubmitted();
        }, 2000);
      } else {
        setError(response?.message || "Failed to submit review");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Write Your Review</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <RatingStars
          rating={rating}
          onRatingChange={setRating}
          interactive={true}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="review" className="block text-sm font-medium mb-2">
          Your Review
        </label>
        <Textarea
          id="review"
          placeholder="Share your thoughts about this course..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-sm text-green-500 bg-green-50 p-2 rounded">{success}</div>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full lms-btn-primary"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
