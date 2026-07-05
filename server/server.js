require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const paymentRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const reviewRoutes = require("./routes/student-routes/review-routes");
const certificateRoutes = require("./routes/student-routes/certificate-routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("[CORS] Blocked origin:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${req.method}] ${req.originalUrl} | Origin: ${req.headers.origin || "none"}`);
  }
  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "lms-api",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

if (!MONGO_URI) {
  console.error("[MongoDB] MONGO_URI is missing in .env");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("[MongoDB] Connected"))
    .catch((e) => console.error("[MongoDB] Connection error:", e.message));
}

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/certificate", certificateRoutes);

app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS not allowed" });
  }
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] LMS API running at http://127.0.0.1:${PORT}`);
  console.log(`[Server] Health check: http://127.0.0.1:${PORT}/health`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[Server] Port ${PORT} is already in use (often Python/Werkzeug on Windows).`,
      `Stop the other process or set PORT=5001 in server/.env and VITE_API_BASE_URL in client/.env`
    );
  } else {
    console.error("[Server] Failed to start:", err.message);
  }
  process.exit(1);
});
