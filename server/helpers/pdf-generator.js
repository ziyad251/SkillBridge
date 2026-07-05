const puppeteer = require("puppeteer");

const generateCertificatePDF = async (
  studentName,
  courseName,
  completionDate,
  instructorName,
  certificateId
) => {
  try {
    console.log("📄 [PDF] Starting certificate generation for:", studentName);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const formattedDate = new Date(completionDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          .certificate {
            width: 100%;
            max-width: 900px;
            aspect-ratio: 1.414;
            background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
            border: 3px solid #d4a76a;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .certificate::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(212, 167, 106, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }

          .certificate::after {
            content: '';
            position: absolute;
            bottom: -50%;
            left: -50%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(212, 167, 106, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
          }

          .content {
            position: relative;
            z-index: 1;
          }

          .logo-area {
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: bold;
            color: #d4a76a;
            letter-spacing: 2px;
          }

          .header {
            margin-bottom: 40px;
          }

          .header-title {
            font-size: 48px;
            font-weight: 300;
            letter-spacing: 3px;
            color: #333;
            margin-bottom: 10px;
            text-transform: uppercase;
          }

          .header-subtitle {
            font-size: 18px;
            color: #d4a76a;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .body {
            margin: 40px 0;
            line-height: 1.8;
          }

          .body-text {
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
          }

          .student-name {
            font-size: 42px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 20px 0;
            text-decoration: underline;
            text-decoration-style: wavy;
            text-decoration-color: #d4a76a;
          }

          .course-name {
            font-size: 24px;
            color: #333;
            margin: 20px 0;
            font-style: italic;
            font-weight: 500;
          }

          .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin: 40px 0;
            padding: 20px 0;
          }

          .detail-item {
            border-top: 2px solid #d4a76a;
            padding-top: 15px;
          }

          .detail-label {
            font-size: 12px;
            color: #999;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .detail-value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
          }

          .certificate-id {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #d4a76a;
            letter-spacing: 2px;
            padding: 10px;
            background: rgba(212, 167, 106, 0.05);
            border-radius: 4px;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #999;
            line-height: 1.6;
          }

          .footer-text {
            margin-bottom: 8px;
          }

          @media print {
            body {
              padding: 0;
            }
            .certificate {
              box-shadow: none;
              border: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="content">
            <div class="logo-area">🏆 LMS LEARN 🏆</div>

            <div class="header">
              <div class="header-title">Certificate</div>
              <div class="header-subtitle">of Completion</div>
            </div>

            <div class="body">
              <p class="body-text">This certificate is proudly presented to</p>

              <div class="student-name">${studentName}</div>

              <p class="body-text">for successfully completing</p>

              <div class="course-name">"${courseName}"</div>

              <div class="details">
                <div class="detail-item">
                  <div class="detail-label">Issued By</div>
                  <div class="detail-value">LMS Platform</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Instructor</div>
                  <div class="detail-value">${instructorName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Completion Date</div>
                  <div class="detail-value">${formattedDate}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Certificate ID</div>
                  <div class="certificate-id">${certificateId}</div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p class="footer-text">This is a digitally generated certificate.</p>
              <p class="footer-text">This e-certificate certifies that <strong>${studentName}</strong> has successfully completed <strong>"${courseName}"</strong> through LMS Platform.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 1200, height: 1600 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      landscape: true,
    });

    await browser.close();
    console.log("✅ [PDF] Certificate generated successfully");

    return pdfBuffer;
  } catch (error) {
    console.log("❌ [PDF] Error generating certificate:", error.message);
    throw error;
  }
};

module.exports = { generateCertificatePDF };
