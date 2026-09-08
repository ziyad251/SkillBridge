require("dotenv").config();

const mongoose = require("mongoose");
const { pool } = require("../config/postgres");
const User = require("../models/User");
const Course = require("../models/Course");
const StudentCourses = require("../models/StudentCourses");
const Order = require("../models/Order");
const Progress = require("../models/CourseProgress");
const Review = require("../models/Review");
const Certificate = require("../models/Certificate");

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  const source = {
    users: await User.countDocuments(),
    courses: await Course.countDocuments(),
    lectures: (await Course.find().select("curriculum").lean()).reduce((total, course) => total + (course.curriculum || []).length, 0),
    enrollments: (await StudentCourses.find().select("courses").lean()).reduce((total, record) => total + (record.courses || []).length, 0),
    orders: await Order.countDocuments(),
    progress: await Progress.countDocuments(),
    reviews: await Review.countDocuments(),
    certificates: await Certificate.countDocuments(),
  };
  const tableNames = Object.keys(source);
  const targetTables = { ...Object.fromEntries(tableNames.map((table) => [table, table])), progress: "course_progress" };
  const target = {};
  for (const table of tableNames) {
    const result = await pool.query(`SELECT COUNT(*)::int AS count FROM ${targetTables[table]}${table === "lectures" ? " WHERE is_legacy = FALSE" : ""}`);
    target[table] = result.rows[0].count;
  }
  const integrity = await pool.query(`SELECT COUNT(*)::int AS orphan_count FROM lecture_progress lp
    LEFT JOIN lectures l ON l.id = lp.lecture_id WHERE l.id IS NULL`);
  console.log(JSON.stringify({ source, target, activeEntityCountsMatch: tableNames.every((table) => source[table] === target[table]), orphanForeignKeys: integrity.rows[0].orphan_count }, null, 2));
}

verify()
  .catch((error) => {
    console.error("[verification] Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    await pool.end();
  });