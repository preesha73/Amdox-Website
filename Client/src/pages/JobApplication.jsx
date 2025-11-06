import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function JobApplication() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        // If this is a sample job id used client-side, build a fallback
        console.warn('Failed to fetch job from API, falling back to sample if applicable', error);
        if (jobId && jobId.startsWith('sample-')) {
          const sampleMap = {
            'sample-1': {
              _id: 'sample-1',
              title: 'Junior Software Engineer',
              company: 'Amdox Labs',
              location: 'Remote / PAN India',
              type: 'Full-time',
              experience: { min: 0, max: 1 },
              skills: ['JavaScript', 'React', 'Node.js'],
              description: 'Entry-level role for BTech final year students or freshers. Work on web applications using MERN stack.'
            },
            'sample-2': {
              _id: 'sample-2',
              title: 'Intern - Software Development',
              company: 'TechStart',
              location: 'Bengaluru',
              type: 'Internship',
              experience: { min: 0, max: 0 },
              skills: ['HTML', 'CSS', 'JavaScript'],
              description: '3-6 month internship for students to learn and contribute to frontend and backend tasks.'
            },
            'sample-3': {
              _id: 'sample-3',
              title: 'Trainee Backend Developer',
              company: 'CloudWorks',
              location: 'Hyderabad',
              type: 'Full-time',
              experience: { min: 0, max: 2 },
              skills: ['Node.js', 'Express', 'MongoDB'],
              description: 'Backend-focused trainee role for new graduates interested in APIs and databases.'
            }
          };
          if (sampleMap[jobId]) setJob(sampleMap[jobId]);
          else setError('Failed to fetch job details');
        } else {
          setError('Failed to fetch job details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Do not attempt to POST to server for client-only sample jobs
    if (jobId && jobId.startsWith('sample-')) {
      setError('This is a demo job and cannot accept applications. Please apply to a real job or create an account to see live openings.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('coverLetter', formData.coverLetter);
    if (formData.resume) {
      formDataToSend.append('resume', formData.resume);
    }

    try {
      await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/apply`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit application');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || 
                 file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFormData({ ...formData, resume: file });
      setError('');
    } else {
      setError('Please upload a PDF or Word document');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!job) {
    return <div className="error">Job not found</div>;
  }

  return (
    <div className="job-application">
      <h1>Apply for {job.title}</h1>
      <div className="job-details">
        <h2>{job.company}</h2>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Type:</strong> {job.type}</p>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label htmlFor="resume">Resume (PDF or Word)</label>
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="coverLetter">Cover Letter</label>
          <textarea
            id="coverLetter"
            value={formData.coverLetter}
            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
            rows="6"
            placeholder="Tell us why you're interested in this position..."
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit Application
        </button>
      </form>
    </div>
  );
}