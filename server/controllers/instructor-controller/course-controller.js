const Course = require("../../models/Course");

const addNewCourse = async (req, res) => {
  try {
    console.log("🔘 [BACKEND] POST /instructor/course/add received");
    console.log("📦 [BACKEND] Request body:", JSON.stringify(req.body, null, 2));

    const courseData = req.body;
    const newlyCreatedCourse = new Course(courseData);

    console.log("💾 [BACKEND] Attempting to save course...");
    const saveCourse = await newlyCreatedCourse.save();
    console.log("✅ [BACKEND] Course saved successfully:", saveCourse._id);

    if (saveCourse) {
      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: saveCourse,
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
    const filter = instructorId ? { instructorId: String(instructorId) } : {};

    const coursesList = await Course.find(filter);

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
    const courseDetails = await Course.findById(id);

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
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updatedCourseData,
      { new: true }
    );

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
