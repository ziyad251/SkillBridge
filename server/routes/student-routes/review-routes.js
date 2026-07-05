const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
} = require("../../controllers/student-controller/review-controller");

const router = express.Router();

router.post("/create", authenticate, createReview);
router.get("/course/:courseId", getReviewsByCourse);
router.put("/update/:reviewId", authenticate, updateReview);
router.delete("/delete/:reviewId", authenticate, deleteReview);

module.exports = router;
