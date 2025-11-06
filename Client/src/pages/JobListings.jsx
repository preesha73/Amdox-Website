import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        const remoteJobs = response.data || [];
        // If server has no jobs, show a few default starter positions for CS freshers
        if (!remoteJobs.length) {
          const sample = [
            {
              _id: 'sample-1',
              title: 'Junior Software Engineer',
              company: 'Amdox Labs',
              location: 'Remote / PAN India',
              type: 'Full-time',
              experience: { min: 0, max: 1 },
              skills: ['JavaScript', 'React', 'Node.js'],
              description: 'Entry-level role for BTech final year students or freshers. Work on web applications using MERN stack.'
            },
            {
              _id: 'sample-2',
              title: 'Intern - Software Development',
              company: 'TechStart',
              location: 'Bengaluru',
              type: 'Internship',
              experience: { min: 0, max: 0 },
              skills: ['HTML', 'CSS', 'JavaScript'],
              description: '3-6 month internship for students to learn and contribute to frontend and backend tasks.'
            },
            {
              _id: 'sample-3',
              title: 'Trainee Backend Developer',
              company: 'CloudWorks',
              location: 'Hyderabad',
              type: 'Full-time',
              experience: { min: 0, max: 2 },
              skills: ['Node.js', 'Express', 'MongoDB'],
              description: 'Backend-focused trainee role for new graduates interested in APIs and databases.'
            }
          ];
          setJobs(sample);
        } else {
          setJobs(remoteJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = (jobId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div className="job-listings">
      <h1>Available Positions</h1>
      {user?.role === 'employer' && (
        <button
          onClick={() => navigate('/jobs/create')}
          className="create-job-btn"
        >
          Post New Job
        </button>
      )}
      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job._id} className="job-card">
            <h2>{job.title}</h2>
            <h3>{job.company}</h3>
            <div className="job-details">
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Type:</strong> {job.type}</p>
              <p><strong>Experience:</strong> {job.experience.min}-{job.experience.max} years</p>
            </div>
            <div className="skills">
              <strong>Required Skills:</strong>
              <div className="skill-tags">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            <p className="job-description">{job.description}</p>
            {user?.role === 'jobseeker' && (
              <button
                onClick={() => handleApply(job._id)}
                className="apply-btn"
              >
                Apply Now
              </button>
            )}
            {user?.role === 'employer' && user.id === job.employer && (
              <button
                onClick={() => navigate(`/jobs/${job._id}/applications`)}
                className="view-applications-btn"
              >
                View Applications
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}