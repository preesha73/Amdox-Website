const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: String,
  employerNotes: String
}, {
  timestamps: true
});

// Ensure one application per job per user
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;