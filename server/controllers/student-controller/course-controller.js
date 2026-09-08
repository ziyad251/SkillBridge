const { getCourse, listCourses } = require("../../repositories/postgres-repository");
const { pool } = require("../../config/postgres");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
    } = req.query;

    console.log(req.query, "req.query");

    const coursesList = await listCourses({
      category: category.length ? category.split(",") : [],
      level: level.length ? level.split(",") : [],
      primaryLanguage: primaryLanguage.length ? primaryLanguage.split(",") : [],
      sortBy,
    });

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await getCourse(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const purchase = await pool.query("SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2", [String(studentId), String(id)]);
    const isPurchased = purchase.rowCount > 0;

    return res.status(200).json({
      success: true,
      data: isPurchased,
    });

  } catch (e) {
    console.log("Purchase Info Error:", e);
    return res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};


module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};
