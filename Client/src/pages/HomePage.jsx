// In Client/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="welcome-container">
        <h1 className="welcome-title">Welcome to Our Job Portal!</h1>
        <p className="welcome-subtitle">
          Find your dream job or hire the perfect candidate
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <h2>For Job Seekers</h2>
            <ul>
              <li>Browse latest tech jobs</li>
              <li>Easy application process</li>
              <li>Track your applications</li>
              <li>Manage your profile</li>
            </ul>
            <Link to="/register" className="btn" state={{ defaultRole: 'jobseeker' }}>
              Register as Job Seeker
            </Link>
          </div>
          <div className="feature-card">
            <h2>For Employers</h2>
            <ul>
              <li>Post job openings</li>
              <li>Review applications</li>
              <li>Manage candidates</li>
              <li>Company profile</li>
            </ul>
            <Link to="/register" className="btn btn-secondary" state={{ defaultRole: 'employer' }}>
              Register as Employer
            </Link>
          </div>
        </div>
        <div className="job-search-section">
          <h2>Browse Available Positions</h2>
          <Link to="/jobs" className="btn btn-large">
            View All Jobs
          </Link>
        </div>
        <div className="login-section">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}