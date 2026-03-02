const StudentCourses = require("../../models/StudentCourses");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentBoughtCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    // If user has never bought anything
    if (!studentBoughtCourses) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: studentBoughtCourses.courses || [],
    });

  } catch (error) {
    console.log("Get Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { getCoursesByStudentId };
