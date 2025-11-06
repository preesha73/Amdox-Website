import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CreateJob() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    type: 'Full-time',
    location: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR'
    },
    experience: {
      min: 0,
      max: ''
    },
    skills: '',
    applicationDeadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };

      await axios.post(
        'http://localhost:5000/api/jobs',
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      navigate('/jobs');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create job posting');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="create-job">
      <h1>Create New Job Posting</h1>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="company">Company Name</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Job Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salary.min">Minimum Salary</label>
            <input
              type="number"
              id="salary.min"
              name="salary.min"
              value={formData.salary.min}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="salary.max">Maximum Salary</label>
            <input
              type="number"
              id="salary.max"
              name="salary.max"
              value={formData.salary.max}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experience.min">Minimum Experience (years)</label>
            <input
              type="number"
              id="experience.min"
              name="experience.min"
              value={formData.experience.min}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="experience.max">Maximum Experience (years)</label>
            <input
              type="number"
              id="experience.max"
              name="experience.max"
              value={formData.experience.max}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Requirements (one per line)</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="applicationDeadline">Application Deadline</label>
          <input
            type="date"
            id="applicationDeadline"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Post Job
        </button>
      </form>
    </div>
  );
}