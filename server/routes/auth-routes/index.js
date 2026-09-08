const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../../controllers/auth-controller/index");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const { countOrdersByUser, countCoursesByInstructor } = require("../../repositories/postgres-repository");
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

    coursesPurchased = await countOrdersByUser(userId);

    if (user.role === "instructor") {
      coursesCreated = await countCoursesByInstructor(userId);
    }

    const joinedDate = null;

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
