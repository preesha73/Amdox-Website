const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false, lowercase: true },
  course: { type: String, required: true },
  certId: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  meta: { type: Object },
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
