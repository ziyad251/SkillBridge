const { getStudentEnrollments } = require("../../repositories/postgres-repository");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    return res.status(200).json({
      success: true,
      data: await getStudentEnrollments(studentId),
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
