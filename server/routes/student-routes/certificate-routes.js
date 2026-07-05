const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const { getCertificate } = require("../../controllers/student-controller/certificate-controller");

const router = express.Router();

router.get("/:courseId", authenticate, getCertificate);

module.exports = router;
