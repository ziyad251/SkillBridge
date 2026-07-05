const mongoose = require("mongoose");
const crypto = require("crypto");

const CertificateSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      unique: true,
      default: () => `LMS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    downloadedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

CertificateSchema.index({ courseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", CertificateSchema);

