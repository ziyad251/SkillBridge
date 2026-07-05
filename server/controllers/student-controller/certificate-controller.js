const Certificate = require("../../models/Certificate");
const StudentCourses = require("../../models/StudentCourses");
const CourseProgress = require("../../models/CourseProgress");
const Course = require("../../models/Course");
const crypto = require("crypto");
const { generateCertificatePDF } = require("../../helpers/pdf-generator");

const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;
    const userName = req.user?.userName;

    console.log("🎓 [CERT] Certificate request for course:", courseId, "user:", userId);

    // Verify enrollment
    const studentPurchasedCourses = await StudentCourses.findOne({ userId });
    const isEnrolled = studentPurchasedCourses?.courses?.some(
      (item) => String(item.courseId) === String(courseId)
    );

    if (!isEnrolled) {
      console.log("❌ [CERT] User not enrolled");
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to download the certificate",
      });
    }

    // Check course completion
    const courseProgress = await CourseProgress.findOne({
      userId: String(userId),
      courseId: String(courseId),
    });

    if (!courseProgress || !courseProgress.completed) {
      console.log("❌ [CERT] Course not completed");
      return res.status(400).json({
        success: false,
        message: "You must complete the course 100% to download the certificate",
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check or create certificate record
    let certificate = await Certificate.findOne({
      courseId: String(courseId),
      userId: String(userId),
    });

    if (!certificate) {
      console.log("📝 [CERT] Creating new certificate record");

      // Generate certificateId explicitly
      const certificateId = `LMS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
      console.log("🔑 [CERT] Generated certificateId:", certificateId);

      certificate = new Certificate({
        courseId: String(courseId),
        userId: String(userId),
        certificateId: certificateId,
        completionDate: courseProgress.completionDate || new Date(),
      });

      try {
        await certificate.save();
        console.log("✅ [CERT] Certificate record created:", certificate.certificateId);
      } catch (saveError) {
        console.log("❌ [CERT] Save error:", saveError.message);
        if (saveError.code === 11000) {
          console.log("⚠️  [CERT] Certificate already exists, fetching existing...");
          certificate = await Certificate.findOne({
            courseId: String(courseId),
            userId: String(userId),
          });
        } else {
          throw saveError;
        }
      }
    } else {
      console.log("✅ [CERT] Using existing certificate:", certificate.certificateId);
    }

    // Update downloaded timestamp
    certificate.downloadedAt = new Date();
    await certificate.save();

    // Generate PDF
    console.log("📄 [CERT] Generating PDF...");
    const pdfBuffer = await generateCertificatePDF(
      userName,
      course.title,
      certificate.completionDate,
      course.instructorName,
      certificate.certificateId
    );

    // Send PDF response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Certificate-${course.title
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    console.log("✅ [CERT] Certificate downloaded");
    res.send(pdfBuffer);
  } catch (error) {
    console.log("❌ [CERT] Error:", error.message);
    console.error("📋 [CERT] Full error details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate certificate",
    });
  }
};

module.exports = {
  getCertificate,
};

