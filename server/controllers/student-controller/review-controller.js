const Review = require("../../models/Review");
const StudentCourses = require("../../models/StudentCourses");

const createReview = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.userName;

    console.log("🔍 [REVIEW] Creating review for course:", courseId, "by user:", userId);

    // Validate input
    if (!courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (review.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Review cannot be empty",
      });
    }

    // Verify enrollment
    const studentPurchasedCourses = await StudentCourses.findOne({ userId });
    const isEnrolled = studentPurchasedCourses?.courses?.some(
      (item) => String(item.courseId) === String(courseId)
    );

    if (!isEnrolled) {
      console.log("❌ [REVIEW] User not enrolled in course");
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to leave a review",
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      courseId: String(courseId),
      userId: String(userId),
    });

    if (existingReview) {
      console.log("❌ [REVIEW] Duplicate review found");
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // Create review
    const newReview = new Review({
      courseId: String(courseId),
      userId: String(userId),
      userName,
      rating: Number(rating),
      review: review.trim(),
    });

    const savedReview = await newReview.save();
    console.log("✅ [REVIEW] Review created successfully:", savedReview._id);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: savedReview,
    });
  } catch (e) {
    console.log("❌ [REVIEW] Error creating review:", e.message);
    if (e.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log("🔍 [REVIEW] Fetching reviews for course:", courseId);

    const reviews = await Review.find({ courseId: String(courseId) }).sort({
      createdAt: -1,
    });

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
        },
      });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    console.log(
      "✅ [REVIEW] Found",
      reviews.length,
      "reviews with average rating:",
      averageRating
    );

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: Number(averageRating),
        totalReviews: reviews.length,
      },
    });
  } catch (e) {
    console.log("❌ [REVIEW] Error fetching reviews:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?._id;

    console.log("🔍 [REVIEW] Updating review:", reviewId);

    // Validate input
    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Please provide rating and review",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check ownership
    const existingReview = await Review.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (String(existingReview.userId) !== String(userId)) {
      console.log("❌ [REVIEW] User not authorized to update review");
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    // Update review
    existingReview.rating = Number(rating);
    existingReview.review = review.trim();
    const updatedReview = await existingReview.save();

    console.log("✅ [REVIEW] Review updated successfully");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (e) {
    console.log("❌ [REVIEW] Error updating review:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?._id;

    console.log("🔍 [REVIEW] Deleting review:", reviewId);

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (String(review.userId) !== String(userId)) {
      console.log("❌ [REVIEW] User not authorized to delete review");
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    await Review.findByIdAndDelete(reviewId);
    console.log("✅ [REVIEW] Review deleted successfully");

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (e) {
    console.log("❌ [REVIEW] Error deleting review:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

module.exports = {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
};
