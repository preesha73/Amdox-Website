const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Student = require('../models/student');

const router = express.Router();

// GET /api/certificates/:certId
// Public verification endpoint returning non-sensitive certificate details
router.get('/:certId', async (req, res) => {
  try {
    const { certId } = req.params;
    const student = await Student.findOne({ certId }).lean();
    if (!student) return res.status(404).json({ verified: false, error: 'Certificate not found' });

    return res.json({
      verified: true,
      certId: student.certId,
      name: student.name,
      course: student.course,
      issuedAt: student.issuedAt,
    });
  } catch (err) {
    console.error('Certificate verify error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/certificates/:certId/pdf
// Generate and return certificate PDF. Caches generated PDFs under ./certs
router.get('/:certId/pdf', async (req, res) => {
  try {
    const { certId } = req.params;
    const student = await Student.findOne({ certId }).lean();
    if (!student) return res.status(404).json({ error: 'Certificate not found' });

    const certsDir = path.join(__dirname, '..', '..', 'certs');
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

    const pdfPath = path.join(certsDir, `${certId}.pdf`);
    // Serve cached PDF if available
    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="certificate_${certId}.pdf"`);
      const stream = fs.createReadStream(pdfPath);
      return stream.pipe(res);
    }

    // Render HTML template
    const html = renderCertificateHtml(student);

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Save to disk for caching
    fs.writeFileSync(pdfPath, pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificate_${certId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Certificate PDF error:', err);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

function renderCertificateHtml(student) {
  const issued = new Date(student.issuedAt || Date.now()).toLocaleDateString();
  // Simple inline-styled certificate HTML. Replace with a nicer template later.
  return (`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px; }
          .card { width: 100%; max-width: 900px; margin: 0 auto; background: white; padding: 48px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); text-align: center; }
          .title { font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
          .subtitle { color: #374151; margin-bottom: 24px; }
          .name { font-size: 36px; font-weight: 700; color: #0b3a53; margin: 16px 0; }
          .course { font-size: 20px; color: #111827; margin-bottom: 28px; }
          .footer { margin-top: 36px; color: #6b7280; }
          .cert-id { font-family: monospace; background: #f3f4f6; padding: 6px 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">Certificate of Completion</div>
          <div class="subtitle">This certifies that</div>
          <div class="name">${escapeHtml(student.name)}</div>
          <div class="course">has completed the course: <strong>${escapeHtml(student.course)}</strong></div>
          <div class="subtitle">Issued on ${issued}</div>
          <div class="footer">Certificate ID: <span class="cert-id">${escapeHtml(student.certId)}</span></div>
        </div>
      </body>
    </html>
  `);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[s];
  });
}

module.exports = router;
