const { isEnrolled, getCourse, createReview: insertReview, getReviews, getReview, updateReview: editReview, deleteReview: removeReview } = require("../../repositories/postgres-repository");

const createReview = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.userName;
    if (!courseId || !rating || !review || review.trim().length === 0) return res.status(400).json({ success: false, message: "Please provide all required fields" });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    const course = await getCourse(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (Number(course.pricing) !== 0 && !(await isEnrolled(userId, courseId))) return res.status(403).json({ success: false, message: "You must be enrolled in this course to leave a review" });
    if (await getReviewByCourseAndUser(courseId, userId)) return res.status(400).json({ success: false, message: "You have already reviewed this course" });
    const savedReview = await insertReview({ courseId, userId, userName, rating, review: review.trim() });
    res.status(201).json({ success: true, message: "Review created successfully", data: savedReview });
  } catch (error) {
    if (error.code === "23505") return res.status(400).json({ success: false, message: "You have already reviewed this course" });
    console.log("[REVIEW]", error.message);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
};

const getReviewByCourseAndUser = async (courseId, userId) => {
  const reviews = await getReviews(courseId);
  return reviews.find((item) => String(item.userId) === String(userId));
};

const getReviewsByCourse = async (req, res) => {
  try {
    const reviews = await getReviews(req.params.courseId);
    const averageRating = reviews.length ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)) : 0;
    res.status(200).json({ success: true, data: { reviews, averageRating, totalReviews: reviews.length } });
  } catch (error) { console.log(error); res.status(500).json({ success: false, message: "Failed to fetch reviews" }); }
};

const updateReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || !review || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Please provide rating and review" });
    const existing = await getReview(req.params.reviewId);
    if (!existing) return res.status(404).json({ success: false, message: "Review not found" });
    if (String(existing.userId) !== String(req.user?._id)) return res.status(403).json({ success: false, message: "You can only update your own reviews" });
    const updated = await editReview(req.params.reviewId, req.user._id, rating, review.trim());
    res.status(200).json({ success: true, message: "Review updated successfully", data: updated });
  } catch (error) { console.log(error); res.status(500).json({ success: false, message: "Failed to update review" }); }
};

const deleteReview = async (req, res) => {
  try {
    const existing = await getReview(req.params.reviewId);
    if (!existing) return res.status(404).json({ success: false, message: "Review not found" });
    if (String(existing.userId) !== String(req.user?._id)) return res.status(403).json({ success: false, message: "You can only delete your own reviews" });
    await removeReview(req.params.reviewId, req.user._id);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) { console.log(error); res.status(500).json({ success: false, message: "Failed to delete review" }); }
};

module.exports = { createReview, getReviewsByCourse, updateReview, deleteReview };