const { getCourse, getProgress, isEnrolled, markLectureViewed, resetProgress } = require("../../repositories/postgres-repository");

const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;
    const course = await getCourse(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    const progress = await markLectureViewed(userId, courseId, lectureId);
    res.status(200).json({ success: true, message: "Lecture marked as viewed", data: progress });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const courseDetails = await getCourse(courseId);
    if (!courseDetails) return res.status(404).json({ success: false, message: "Course not found" });

    if (Number(courseDetails.pricing) !== 0 && !(await isEnrolled(userId, courseId))) {
      return res.status(200).json({ success: true, data: { isPurchased: false }, message: "You need to purchase this course to access it." });
    }
    const currentProgress = await getProgress(userId, courseId);
    if (!currentProgress || currentProgress.lecturesProgress.length === 0) {
      return res.status(200).json({ success: true, message: "No progress found, you can start watching the course", data: { courseDetails, progress: [], isPurchased: true } });
    }
    res.status(200).json({ success: true, data: { courseDetails, progress: currentProgress.lecturesProgress, completed: currentProgress.completed, completionDate: currentProgress.completionDate, isPurchased: true } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

const resetCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const progress = await resetProgress(userId, courseId);
    if (!progress) return res.status(404).json({ success: false, message: "Progress not found!" });
    res.status(200).json({ success: true, message: "Course progress has been reset", data: progress });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Some error occured!" });
  }
};

module.exports = { markCurrentLectureAsViewed, getCurrentCourseProgress, resetCurrentCourseProgress };