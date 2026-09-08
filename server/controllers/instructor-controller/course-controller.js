const { getCourse, listCourses, saveCourse } = require("../../repositories/postgres-repository");

const addNewCourse = async (req, res) => {
  try {
    console.log("🔘 [BACKEND] POST /instructor/course/add received");
    console.log("📦 [BACKEND] Request body:", JSON.stringify(req.body, null, 2));

    const courseData = req.body;
    console.log("💾 [BACKEND] Attempting to save course...");
    const savedCourse = await saveCourse(courseData);
    console.log("✅ [BACKEND] Course saved successfully:", savedCourse._id);

    if (savedCourse) {
      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: savedCourse,
      });
    }
  } catch (e) {
    console.log("❌ [BACKEND] Error saving course:", e.message);
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { instructorId } = req.query;
    const coursesList = await listCourses({ instructorId });

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

const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await getCourse(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
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

const updateCourseByID = async (req, res) => {
  try {
    console.log("🔄 [BACKEND] PUT /instructor/course/update/:id received");
    const { id } = req.params;
    console.log(`📋 [BACKEND] Course ID: ${id}`);
    console.log("📦 [BACKEND] Request body:", JSON.stringify(req.body, null, 2));

    const updatedCourseData = req.body;

    console.log("💾 [BACKEND] Attempting to update course...");
    const updatedCourse = await getCourse(id) && await saveCourse(updatedCourseData, id);

    if (!updatedCourse) {
      console.log("❌ [BACKEND] Course not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    console.log("✅ [BACKEND] Course updated successfully:", updatedCourse._id);
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.log("❌ [BACKEND] Error updating course:", e.message);
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
};
