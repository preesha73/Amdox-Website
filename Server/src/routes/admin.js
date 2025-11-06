const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');
const Student = require('../models/student');

const router = express.Router();

// Use memory storage for now; we'll parse buffer with exceljs later
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Admin-only endpoint to upload student data (Excel/CSV)
// POST /api/admin/import-students
router.post('/import-students', authMiddleware, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ error: 'Uploaded file contains no worksheets' });
    }

    // Normalize header row to map columns
    const headerRow = worksheet.getRow(1);
    const headerMap = {};
    headerRow.eachCell((cell, colNumber) => {
      if (!cell) return;
      const key = String(cell.value || '').trim().toLowerCase();
      headerMap[key] = colNumber;
    });

    // Acceptable headers: name, email, course
    const requiredHeaders = ['name', 'course'];
    for (const h of requiredHeaders) {
      if (!headerMap[h]) {
        return res.status(400).json({ error: `Missing required column: ${h}` });
      }
    }

    const inserted = [];
    const skipped = [];
    const errors = [];

    const docs = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const get = (name) => {
        const idx = headerMap[name];
        if (!idx) return undefined;
        const cell = row.getCell(idx);
        return (cell && cell.value) ? String(cell.value).trim() : undefined;
      };

      const name = get('name');
      const email = get('email');
      const course = get('course');

      if (!name || !course) {
        skipped.push({ row: rowNumber, reason: 'Missing required fields (name or course)' });
        return;
      }

      // simple email validation
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        skipped.push({ row: rowNumber, reason: 'Invalid email format', email });
        return;
      }

      const certId = uuidv4();
      const doc = {
        name,
        email,
        course,
        certId,
        issuedAt: new Date(),
      };
      docs.push(doc);
    });

    if (docs.length === 0) {
      return res.json({ inserted: 0, skipped: skipped.length, errors, message: 'No valid rows found' });
    }

    try {
      const result = await Student.insertMany(docs, { ordered: false });
      result.forEach(r => inserted.push(r.certId));
    } catch (insertErr) {
      // ordered:false will try to insert all; if some fail, others succeed.
      if (insertErr && insertErr.insertedDocs) {
        insertErr.insertedDocs.forEach(d => inserted.push(d.certId));
      }
      // Collect write errors if present
      if (insertErr && insertErr.writeErrors) {
        insertErr.writeErrors.forEach(e => {
          errors.push({ index: e.index, errmsg: e.errmsg });
        });
      } else if (insertErr && insertErr.code && insertErr.code === 11000) {
        errors.push({ errmsg: 'Duplicate key error during insert' });
      } else if (insertErr) {
        console.error('InsertMany error:', insertErr);
        errors.push({ errmsg: 'Unknown insert error' });
      }
    }

    const summary = {
      inserted: inserted.length,
      insertedCertIds: inserted,
      skipped: skipped.length,
      skippedRows: skipped,
      errors,
      message: 'Import complete',
    };

    return res.json(summary);
  } catch (error) {
    console.error('Admin import error:', error);
    return res.status(500).json({ error: 'Server error during import' });
  }
});

module.exports = router;
