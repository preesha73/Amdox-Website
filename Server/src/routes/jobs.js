const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const Job = require('../models/job');
const JobApplication = require('../models/jobApplication');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: './uploads/resumes',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('employer', 'name company.name')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single job by id (public)
// NOTE: single-job route is declared after more specific routes to avoid
// conflicting with literal routes like '/my' or '/applications/my'.

// Create a new job (employers only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can create jobs' });
    }

    const job = new Job({
      ...req.body,
      employer: req.user.id
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Apply for a job (job seekers only)
router.post('/:jobId/apply', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'closed') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    const application = new JobApplication({
      job: job._id,
      applicant: req.user.id,
      coverLetter: req.body.coverLetter,
      resume: req.file ? {
        fileName: req.file.filename,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
        uploadDate: new Date()
      } : undefined
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get job applications (employers only)
router.get('/:jobId/applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view applications' });
    }

    const job = await Job.findOne({ _id: req.params.jobId, employer: req.user.id });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const applications = await JobApplication.find({ job: job._id })
      .populate('applicant', 'name email profileDetails')
      .sort('-createdAt');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get jobs posted by current employer
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ error: 'Only employers can view their jobs' });
    const jobs = await Job.find({ employer: req.user.id }).sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get applications made by current jobseeker
router.get('/applications/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') return res.status(403).json({ error: 'Only job seekers can view their applications' });
    const applications = await JobApplication.find({ applicant: req.user.id }).populate('job').sort('-createdAt');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application status (employers only)
router.patch('/:jobId/applications/:applicationId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can update applications' });
    }

    const job = await Job.findOne({ _id: req.params.jobId, employer: req.user.id });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const application = await JobApplication.findById(req.params.applicationId);
    if (!application || application.job.toString() !== job._id.toString()) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = req.body.status;
    application.employerNotes = req.body.employerNotes;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single job by id (public) - placed after specific routes to avoid conflicts
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('employer', 'name company.name');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;