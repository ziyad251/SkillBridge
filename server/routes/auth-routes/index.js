const express = require("express");
const mongoose = require("mongoose");
const {
  registerUser,
  loginUser,
} = require("../../controllers/auth-controller/index");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const Course = require("../../models/Course");
const Order = require("../../models/Order");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/check-auth", authenticateMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user: req.user,
    },
  });
});

router.get("/profile", authenticateMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    let coursesPurchased = 0;
    let coursesCreated = 0;

    const orders = await Order.find({ userId: String(userId) });
    coursesPurchased = orders.length;

    if (user.role === "instructor") {
      coursesCreated = await Course.countDocuments({ instructorId: userId });
    }

    const joinedDate = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId).getTimestamp()
      : null;

    res.status(200).json({
      success: true,
      data: {
        user,
        coursesPurchased,
        coursesCreated,
        joinedDate,
      },
    });
  } catch (error) {
    console.error("[auth/profile]", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
});

module.exports = router;
