const crypto = require("crypto");
const { generateCertificatePDF } = require("../../helpers/pdf-generator");
const { getCourse, isEnrolled, getProgress, getCertificate, createOrUpdateCertificate } = require("../../repositories/postgres-repository");

const getCertificateFile = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;
    const userName = req.user?.userName;
    if (!(await isEnrolled(userId, courseId))) return res.status(403).json({ success: false, message: "You must be enrolled in this course to download the certificate" });
    const progress = await getProgress(userId, courseId);
    if (!progress || !progress.completed) return res.status(400).json({ success: false, message: "You must complete the course 100% to download the certificate" });
    const course = await getCourse(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    const existing = await getCertificate(courseId, userId);
    const certificate = await createOrUpdateCertificate({
      courseId,
      userId,
      certificateId: existing?.certificate_id || `LMS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
      completionDate: progress.completionDate || new Date(),
    });
    const pdfBuffer = await generateCertificatePDF(userName, course.title, certificate.completion_date, course.instructorName, certificate.certificate_id);
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Certificate-${course.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`, "Content-Length": pdfBuffer.length });
    res.send(pdfBuffer);
  } catch (error) {
    console.log("[CERT]", error.message);
    res.status(500).json({ success: false, message: "Failed to generate certificate" });
  }
};

module.exports = { getCertificate: getCertificateFile };