const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  experience: {
    min: {
      type: Number,
      default: 0
    },
    max: Number
  },
  skills: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  applicationDeadline: Date
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;