// In Server/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { configureSecurityMiddleware } = require('./middleware/security');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const certRoutes = require('./routes/certificates');
const jobRoutes = require('./routes/jobs');
const connectDB = require('./db');

connectDB();

const app = express();

// Configure security middleware first
configureSecurityMiddleware(app);

// Then other middleware
app.use(cors());
app.use(express.json());
const path = require('path');

// Serve uploaded files (resumes, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use(authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/jobs', jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));