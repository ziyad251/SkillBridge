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

const id = (value) => String(value);
const valueOrNull = (value) => value === undefined ? null : value;
const date = (value) => value ? new Date(value) : null;
const dateOrNow = (value) => date(value) || new Date();

async function migrate() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required for the migration source");
  await mongoose.connect(process.env.MONGO_URI);
  const client = await pool.connect();
  const counts = {};

  try {
    await client.query("BEGIN");
    const [users, courses, studentCourseRecords, orders, progressRecords, reviews, certificates] = await Promise.all([
      User.find().lean(), Course.find().lean(), StudentCourses.find().lean(), Order.find().lean(),
      Progress.find().lean(), Review.find().lean(), Certificate.find().lean(),
    ]);

    for (const user of users) {
      await client.query(`INSERT INTO users (id, user_name, user_email, password, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET
        user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role`,
      [id(user._id), user.userName, user.userEmail, user.password, user.role || "user", dateOrNow(user.createdAt)]);
    }
    counts.users = users.length;

    for (const course of courses) {
      await client.query(`INSERT INTO courses (id, instructor_id, instructor_name, course_date, title, category, level,
        primary_language, subtitle, description, image, welcome_message, pricing, objectives, is_published, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET instructor_id = EXCLUDED.instructor_id, instructor_name = EXCLUDED.instructor_name,
        title = EXCLUDED.title, category = EXCLUDED.category, level = EXCLUDED.level, primary_language = EXCLUDED.primary_language,
        subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, image = EXCLUDED.image, welcome_message = EXCLUDED.welcome_message,
        pricing = EXCLUDED.pricing, objectives = EXCLUDED.objectives, is_published = EXCLUDED.is_published, updated_at = EXCLUDED.updated_at`,
      [id(course._id), id(course.instructorId), valueOrNull(course.instructorName), date(course.date), course.title,
        valueOrNull(course.category), valueOrNull(course.level), valueOrNull(course.primaryLanguage), valueOrNull(course.subtitle),
        valueOrNull(course.description), valueOrNull(course.image), valueOrNull(course.welcomeMessage), valueOrNull(course.pricing),
        valueOrNull(course.objectives), Boolean(course.isPublised), dateOrNow(course.createdAt), dateOrNow(course.updatedAt)]);

      for (let position = 0; position < (course.curriculum || []).length; position += 1) {
        const lecture = course.curriculum[position];
        await client.query(`INSERT INTO lectures (id, course_id, position, title, video_url, public_id, free_preview)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET
          course_id = EXCLUDED.course_id, position = EXCLUDED.position, title = EXCLUDED.title,
          video_url = EXCLUDED.video_url, public_id = EXCLUDED.public_id, free_preview = EXCLUDED.free_preview`,
        [id(lecture._id || `${course._id}-${position}`), id(course._id), position, valueOrNull(lecture.title),
          valueOrNull(lecture.videoUrl), valueOrNull(lecture.public_id), Boolean(lecture.freePreview)]);
      }

      for (const student of course.students || []) {
        await client.query(`INSERT INTO course_students (course_id, student_id, student_name, student_email, paid_amount)
          VALUES ($1, $2, $3, $4, $5) ON CONFLICT (course_id, student_id) DO UPDATE SET
          student_name = EXCLUDED.student_name, student_email = EXCLUDED.student_email, paid_amount = EXCLUDED.paid_amount`,
        [id(course._id), id(student.studentId), valueOrNull(student.studentName), valueOrNull(student.studentEmail), valueOrNull(student.paidAmount)]);
      }
    }
    counts.courses = courses.length;
    counts.lectures = courses.reduce((total, course) => total + (course.curriculum || []).length, 0);
    counts.courseStudents = courses.reduce((total, course) => total + (course.students || []).length, 0);

    const activeLectureIds = new Set(courses.flatMap((course) =>
      (course.curriculum || []).map((lecture, position) => id(lecture._id || `${course._id}-${position}`))
    ));
    let legacyLectureCount = 0;
    for (const record of progressRecords) {
      let position = 100000;
      for (const lecture of record.lecturesProgress || []) {
        if (!activeLectureIds.has(id(lecture.lectureId))) {
          await client.query(`INSERT INTO lectures (id, course_id, position, title, is_legacy)
            VALUES ($1, $2, $3, $4, TRUE) ON CONFLICT (id) DO NOTHING`,
          [id(lecture.lectureId), id(record.courseId), position, "Legacy lecture (historical progress)"]);
          position += 1;
          activeLectureIds.add(id(lecture.lectureId));
          legacyLectureCount += 1;
        }
      }
    }
    counts.legacyLectures = legacyLectureCount;

    for (const record of studentCourseRecords) {
      for (const enrollment of record.courses || []) {
        await client.query(`INSERT INTO enrollments (user_id, course_id, title, instructor_id, instructor_name, date_of_purchase, course_image)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_id, course_id) DO UPDATE SET
          title = EXCLUDED.title, instructor_id = EXCLUDED.instructor_id, instructor_name = EXCLUDED.instructor_name,
          date_of_purchase = EXCLUDED.date_of_purchase, course_image = EXCLUDED.course_image`,
        [id(record.userId), id(enrollment.courseId), valueOrNull(enrollment.title), valueOrNull(enrollment.instructorId),
          valueOrNull(enrollment.instructorName), date(enrollment.dateOfPurchase), valueOrNull(enrollment.courseImage)]);
      }
    }
    counts.enrollments = studentCourseRecords.reduce((total, record) => total + (record.courses || []).length, 0);

    for (const order of orders) {
      await client.query(`INSERT INTO orders (id, user_id, user_name, user_email, order_status, payment_method, payment_status,
        order_date, payment_id, payer_id, instructor_id, instructor_name, course_image, course_title, course_id, course_pricing, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET order_status = EXCLUDED.order_status, payment_status = EXCLUDED.payment_status,
        payment_id = EXCLUDED.payment_id, payer_id = EXCLUDED.payer_id`,
      [id(order._id), id(order.userId), valueOrNull(order.userName), valueOrNull(order.userEmail), valueOrNull(order.orderStatus),
        valueOrNull(order.paymentMethod), valueOrNull(order.paymentStatus), date(order.orderDate), valueOrNull(order.paymentId), valueOrNull(order.payerId),
        valueOrNull(order.instructorId), valueOrNull(order.instructorName), valueOrNull(order.courseImage), valueOrNull(order.courseTitle),
        valueOrNull(order.courseId), valueOrNull(order.coursePricing), dateOrNow(order.createdAt)]);
    }
    counts.orders = orders.length;

    for (const record of progressRecords) {
      const result = await client.query(`INSERT INTO course_progress (user_id, course_id, completed, completion_date)
        VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, course_id) DO UPDATE SET completed = EXCLUDED.completed,
        completion_date = EXCLUDED.completion_date RETURNING id`,
      [id(record.userId), id(record.courseId), Boolean(record.completed), date(record.completionDate)]);
      for (const lecture of record.lecturesProgress || []) {
        await client.query(`INSERT INTO lecture_progress (progress_id, lecture_id, viewed, date_viewed)
          VALUES ($1, $2, $3, $4) ON CONFLICT (progress_id, lecture_id) DO UPDATE SET
          viewed = EXCLUDED.viewed, date_viewed = EXCLUDED.date_viewed`,
        [result.rows[0].id, id(lecture.lectureId), Boolean(lecture.viewed), date(lecture.dateViewed)]);
      }
    }
    counts.progress = progressRecords.length;

    for (const review of reviews) {
      await client.query(`INSERT INTO reviews (id, course_id, user_id, user_name, rating, review, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET
        rating = EXCLUDED.rating, review = EXCLUDED.review, updated_at = EXCLUDED.updated_at`,
      [id(review._id), id(review.courseId), id(review.userId), review.userName, review.rating, review.review,
        dateOrNow(review.createdAt), dateOrNow(review.updatedAt)]);
    }
    counts.reviews = reviews.length;

    for (const certificate of certificates) {
      await client.query(`INSERT INTO certificates (id, course_id, user_id, certificate_id, completion_date, downloaded_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET
        downloaded_at = EXCLUDED.downloaded_at, updated_at = EXCLUDED.updated_at`,
      [id(certificate._id), id(certificate.courseId), id(certificate.userId), certificate.certificateId,
        dateOrNow(certificate.completionDate), date(certificate.downloadedAt), dateOrNow(certificate.createdAt), dateOrNow(certificate.updatedAt)]);
    }
    counts.certificates = certificates.length;

    await client.query("COMMIT");
    console.log(JSON.stringify({ migrated: counts }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await mongoose.disconnect();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("[migration] Failed:", error.message);
  process.exitCode = 1;
});