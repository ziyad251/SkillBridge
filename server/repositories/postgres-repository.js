const crypto = require("crypto");
const { pool } = require("../config/postgres");

const newId = () => crypto.randomBytes(12).toString("hex");

function courseFromRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    instructorId: row.instructor_id,
    instructorName: row.instructor_name,
    date: row.course_date,
    title: row.title,
    category: row.category,
    level: row.level,
    primaryLanguage: row.primary_language,
    subtitle: row.subtitle,
    description: row.description,
    image: row.image,
    welcomeMessage: row.welcome_message,
    pricing: row.pricing === null ? null : Number(row.pricing),
    objectives: row.objectives,
    students: row.students || [],
    curriculum: row.curriculum || [],
    isPublised: row.is_published,
  };
}

const courseSelect = `SELECT c.*, COALESCE((SELECT json_agg(json_build_object(
  '_id', l.id, 'title', l.title, 'videoUrl', l.video_url, 'public_id', l.public_id,
  'freePreview', l.free_preview) ORDER BY l.position) FROM lectures l
  WHERE l.course_id = c.id AND l.is_legacy = FALSE), '[]'::json) AS curriculum,
  COALESCE((SELECT json_agg(json_build_object('studentId', cs.student_id,
  'studentName', cs.student_name, 'studentEmail', cs.student_email, 'paidAmount', cs.paid_amount))
  FROM course_students cs WHERE cs.course_id = c.id), '[]'::json) AS students
  FROM courses c`;

async function findUserByEmail(userEmail) {
  const result = await pool.query("SELECT id AS \"_id\", user_name AS \"userName\", user_email AS \"userEmail\", password, role FROM users WHERE user_email = $1", [userEmail]);
  return result.rows[0] || null;
}

async function findUserByNameOrEmail(userName, userEmail) {
  const result = await pool.query("SELECT id FROM users WHERE user_email = $1 OR user_name = $2 LIMIT 1", [userEmail, userName]);
  return result.rows[0] || null;
}

async function createUser({ userName, userEmail, password, role }) {
  const result = await pool.query(`INSERT INTO users (id, user_name, user_email, password, role)
    VALUES ($1, $2, $3, $4, $5) RETURNING id AS "_id", user_name AS "userName", user_email AS "userEmail", role`,
  [newId(), userName, userEmail, password, role || "user"]);
  return result.rows[0];
}

async function listCourses({ instructorId, category = [], level = [], primaryLanguage = [], sortBy } = {}) {
  const clauses = [];
  const values = [];
  if (instructorId) { values.push(String(instructorId)); clauses.push(`c.instructor_id = $${values.length}`); }
  if (category.length) { values.push(category); clauses.push(`c.category = ANY($${values.length})`); }
  if (level.length) { values.push(level); clauses.push(`c.level = ANY($${values.length})`); }
  if (primaryLanguage.length) { values.push(primaryLanguage); clauses.push(`c.primary_language = ANY($${values.length})`); }
  const filters = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const order = { "price-hightolow": "c.pricing DESC", "title-atoz": "c.title ASC", "title-ztoa": "c.title DESC" }[sortBy] || "c.pricing ASC";
  const result = await pool.query(`${courseSelect}${filters} ORDER BY ${order}`, values);
  return result.rows.map(courseFromRow);
}

async function getCourse(courseId) {
  const result = await pool.query(`${courseSelect} WHERE c.id = $1`, [String(courseId)]);
  return courseFromRow(result.rows[0]);
}

async function saveCourse(courseData, courseId = newId()) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`INSERT INTO courses (id, instructor_id, instructor_name, course_date, title, category, level,
      primary_language, subtitle, description, image, welcome_message, pricing, objectives, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET instructor_id=EXCLUDED.instructor_id, instructor_name=EXCLUDED.instructor_name,
      title=EXCLUDED.title, category=EXCLUDED.category, level=EXCLUDED.level, primary_language=EXCLUDED.primary_language,
      subtitle=EXCLUDED.subtitle, description=EXCLUDED.description, image=EXCLUDED.image, welcome_message=EXCLUDED.welcome_message,
      pricing=EXCLUDED.pricing, objectives=EXCLUDED.objectives, is_published=EXCLUDED.is_published, updated_at=NOW()`,
    [courseId, courseData.instructorId, courseData.instructorName, courseData.date || new Date(), courseData.title,
      courseData.category, courseData.level, courseData.primaryLanguage, courseData.subtitle, courseData.description,
      courseData.image, courseData.welcomeMessage, courseData.pricing, courseData.objectives, Boolean(courseData.isPublised)]);
    await client.query("DELETE FROM lectures WHERE course_id = $1", [courseId]);
    for (let position = 0; position < (courseData.curriculum || []).length; position += 1) {
      const lecture = courseData.curriculum[position];
      await client.query(`INSERT INTO lectures (id, course_id, position, title, video_url, public_id, free_preview)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [String(lecture._id || newId()), courseId, position, lecture.title, lecture.videoUrl, lecture.public_id, Boolean(lecture.freePreview)]);
    }
    await client.query("COMMIT");
    return getCourse(courseId);
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

async function countCoursesByInstructor(instructorId) {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM courses WHERE instructor_id = $1", [String(instructorId)]);
  return result.rows[0].count;
}

async function countOrdersByUser(userId) {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE user_id = $1", [String(userId)]);
  return result.rows[0].count;
}

async function getStudentEnrollments(userId) {
  const result = await pool.query(`SELECT course_id AS "courseId", title, instructor_id AS "instructorId",
    instructor_name AS "instructorName", date_of_purchase AS "dateOfPurchase", course_image AS "courseImage"
    FROM enrollments WHERE user_id = $1 ORDER BY date_of_purchase DESC NULLS LAST`, [String(userId)]);
  return result.rows;
}

async function getProgress(userId, courseId) {
  const result = await pool.query(`SELECT cp.id, cp.completed, cp.completion_date AS "completionDate",
    COALESCE(json_agg(json_build_object('lectureId', lp.lecture_id, 'viewed', lp.viewed,
    'dateViewed', lp.date_viewed) ORDER BY lp.date_viewed) FILTER (WHERE lp.lecture_id IS NOT NULL), '[]'::json) AS "lecturesProgress"
    FROM course_progress cp LEFT JOIN lecture_progress lp ON lp.progress_id = cp.id
    WHERE cp.user_id = $1 AND cp.course_id = $2 GROUP BY cp.id`, [String(userId), String(courseId)]);
  return result.rows[0] || null;
}

async function isEnrolled(userId, courseId) {
  const result = await pool.query("SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2", [String(userId), String(courseId)]);
  return result.rowCount > 0;
}

async function markLectureViewed(userId, courseId, lectureId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const progress = await client.query(`INSERT INTO course_progress (user_id, course_id)
      VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO UPDATE SET user_id = EXCLUDED.user_id RETURNING id`,
    [String(userId), String(courseId)]);
    const progressId = progress.rows[0].id;
    await client.query(`INSERT INTO lecture_progress (progress_id, lecture_id, viewed, date_viewed)
      VALUES ($1, $2, TRUE, NOW()) ON CONFLICT (progress_id, lecture_id) DO UPDATE SET viewed = TRUE, date_viewed = NOW()`,
    [progressId, String(lectureId)]);
    const completion = await client.query(`SELECT COUNT(l.id)::int AS total,
      COUNT(lp.lecture_id) FILTER (WHERE lp.viewed = TRUE)::int AS viewed
      FROM lectures l LEFT JOIN lecture_progress lp ON lp.lecture_id = l.id AND lp.progress_id = $1
      WHERE l.course_id = $2 AND l.is_legacy = FALSE`, [progressId, String(courseId)]);
    const complete = completion.rows[0].total > 0 && completion.rows[0].total === completion.rows[0].viewed;
    await client.query("UPDATE course_progress SET completed = $1, completion_date = CASE WHEN $1 THEN COALESCE(completion_date, NOW()) ELSE NULL END WHERE id = $2", [complete, progressId]);
    await client.query("COMMIT");
    return getProgress(userId, courseId);
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

async function resetProgress(userId, courseId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const progress = await client.query("SELECT id FROM course_progress WHERE user_id = $1 AND course_id = $2", [String(userId), String(courseId)]);
    if (!progress.rowCount) { await client.query("ROLLBACK"); return null; }
    await client.query("DELETE FROM lecture_progress WHERE progress_id = $1", [progress.rows[0].id]);
    await client.query("UPDATE course_progress SET completed = FALSE, completion_date = NULL WHERE id = $1", [progress.rows[0].id]);
    await client.query("COMMIT");
    return getProgress(userId, courseId);
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

function reviewFromRow(row) {
  return { _id: row.id, courseId: row.course_id, userId: row.user_id, userName: row.user_name, rating: row.rating, review: row.review, createdAt: row.created_at, updatedAt: row.updated_at };
}

async function createReview({ courseId, userId, userName, rating, review }) {
  const result = await pool.query(`INSERT INTO reviews (id, course_id, user_id, user_name, rating, review)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [newId(), String(courseId), String(userId), userName, Number(rating), review]);
  return reviewFromRow(result.rows[0]);
}

async function getReviews(courseId) {
  const result = await pool.query("SELECT * FROM reviews WHERE course_id = $1 ORDER BY created_at DESC", [String(courseId)]);
  return result.rows.map(reviewFromRow);
}

async function getReview(reviewId) {
  const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [String(reviewId)]);
  return result.rows[0] ? reviewFromRow(result.rows[0]) : null;
}

async function updateReview(reviewId, userId, rating, review) {
  const result = await pool.query(`UPDATE reviews SET rating = $1, review = $2, updated_at = NOW()
    WHERE id = $3 AND user_id = $4 RETURNING *`, [Number(rating), review, String(reviewId), String(userId)]);
  return result.rows[0] ? reviewFromRow(result.rows[0]) : null;
}

async function deleteReview(reviewId, userId) {
  const result = await pool.query("DELETE FROM reviews WHERE id = $1 AND user_id = $2", [String(reviewId), String(userId)]);
  return result.rowCount > 0;
}

function orderFromRow(row) {
  return { _id: row.id, userId: row.user_id, userName: row.user_name, userEmail: row.user_email, orderStatus: row.order_status, paymentMethod: row.payment_method, paymentStatus: row.payment_status, orderDate: row.order_date, paymentId: row.payment_id, payerId: row.payer_id, instructorId: row.instructor_id, instructorName: row.instructor_name, courseImage: row.course_image, courseTitle: row.course_title, courseId: row.course_id, coursePricing: row.course_pricing };
}

async function createOrder(data) {
  const result = await pool.query(`INSERT INTO orders (id, user_id, user_name, user_email, order_status, payment_method,
    payment_status, order_date, payment_id, payer_id, instructor_id, instructor_name, course_image, course_title, course_id, course_pricing)
    VALUES ($1, $2, $3, $4, 'pending', 'razorpay', 'initiated', NOW(), '', '', $5, $6, $7, $8, $9, $10) RETURNING *`,
  [newId(), data.userId, data.userName, data.userEmail, data.instructorId, data.instructorName, data.courseImage, data.courseTitle, data.courseId, data.coursePricing]);
  return orderFromRow(result.rows[0]);
}

async function setOrderPaymentId(orderId, paymentId) {
  const result = await pool.query("UPDATE orders SET payment_id = $1 WHERE id = $2 RETURNING *", [paymentId, orderId]);
  return orderFromRow(result.rows[0]);
}

async function getOrderByPaymentId(paymentId) {
  const result = await pool.query("SELECT * FROM orders WHERE payment_id = $1", [paymentId]);
  return result.rows[0] ? orderFromRow(result.rows[0]) : null;
}

async function confirmOrder(orderId, paymentId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query("UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', payer_id = $1 WHERE id = $2 RETURNING *", [paymentId, orderId]);
    if (!orderResult.rowCount) { await client.query("ROLLBACK"); return null; }
    const order = orderResult.rows[0];
    await client.query(`INSERT INTO enrollments (user_id, course_id, title, instructor_id, instructor_name, date_of_purchase, course_image, paid_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (user_id, course_id) DO NOTHING`,
    [order.user_id, order.course_id, order.course_title, order.instructor_id, order.instructor_name, order.order_date, order.course_image, order.course_pricing]);
    await client.query(`INSERT INTO course_students (course_id, student_id, student_name, student_email, paid_amount)
      VALUES ($1, $2, $3, $4, $5) ON CONFLICT (course_id, student_id) DO NOTHING`,
    [order.course_id, order.user_id, order.user_name, order.user_email, order.course_pricing]);
    await client.query("COMMIT");
    return orderFromRow(order);
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

async function getCertificate(courseId, userId) {
  const result = await pool.query("SELECT * FROM certificates WHERE course_id = $1 AND user_id = $2", [String(courseId), String(userId)]);
  return result.rows[0] || null;
}

async function createOrUpdateCertificate({ courseId, userId, certificateId, completionDate }) {
  const result = await pool.query(`INSERT INTO certificates (id, course_id, user_id, certificate_id, completion_date, downloaded_at)
    VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (course_id, user_id) DO UPDATE SET downloaded_at = NOW()
    RETURNING *`, [newId(), String(courseId), String(userId), certificateId, completionDate]);
  return result.rows[0];
}

module.exports = { findUserByEmail, findUserByNameOrEmail, createUser, listCourses, getCourse, saveCourse, countCoursesByInstructor, countOrdersByUser, getStudentEnrollments, getProgress, isEnrolled, markLectureViewed, resetProgress, createReview, getReviews, getReview, updateReview, deleteReview, createOrder, setOrderPaymentId, getOrderByPaymentId, confirmOrder, getCertificate, createOrUpdateCertificate };