import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '',
    location: '',
    about: '',
    skills: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'jobseeker') {
          const response = await axios.get('http://localhost:5000/api/jobs/applications/my', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApplications(response.data);
        } else if (user.role === 'employer') {
          const response = await axios.get('http://localhost:5000/api/jobs/my', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPostedJobs(response.data);
        }
        // populate profile form from user profileDetails if present
        if (user) {
          setProfileForm(prev => ({
            ...prev,
            phone: user.profileDetails?.phone || '',
            location: user.profileDetails?.location || '',
            about: user.profileDetails?.about || '',
            skills: (user.profileDetails?.skills || []).join(', ')
          }));
        }
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Wait for user to be available. If not logged in, show an error.
    if (!user) {
      if (!token) {
        setError('Not logged in');
        setLoading(false);
      }
      return; // user not yet loaded, wait
    }

    fetchData();
  }, [user, token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Phone:</strong> {user.profileDetails?.phone || '-'}</p>
          <p><strong>Location:</strong> {user.profileDetails?.location || '-'}</p>
          <p><strong>About:</strong> {user.profileDetails?.about || '-'}</p>
          <p><strong>Skills:</strong> {(user.profileDetails?.skills || []).join(', ') || '-'}</p>
        </div>
      </div>

      <div className="profile-edit">
        <h2>Update Profile</h2>
        <p className="muted">Add phone, location, about and skills (comma-separated). Upload resume below.</p>
        <div className="job-form">
          <div className="form-group">
            <label>Phone</label>
            <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={profileForm.location} onChange={e => setProfileForm({ ...profileForm, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label>About</label>
            <textarea value={profileForm.about} onChange={e => setProfileForm({ ...profileForm, about: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input value={profileForm.skills} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Upload Resume (PDF/DOC)</label>
            <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={async () => {
              // update profile
              try {
                const payload = {
                  profileDetails: {
                    phone: profileForm.phone,
                    location: profileForm.location,
                    about: profileForm.about,
                    skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean)
                  }
                };
                await api.put('/api/me', payload);
                // refresh page to fetch updated user
                window.location.reload();
              } catch (err) {
                alert(err.response?.data?.error || 'Failed to update profile');
              }
            }}>Save Profile</button>
            <button className="btn" onClick={() => window.location.reload()}>Cancel</button>
          </div>
        </div>
      </div>

      {user.role === 'jobseeker' && (
        <div className="jobseeker-profile">
          <h2>My Applications</h2>
          <div className="applications-list">
            {applications.map(app => (
              <div key={app._id} className="application-card">
                <h3>{app.job.title}</h3>
                <p><strong>Company:</strong> {app.job.company}</p>
                <p><strong>Status:</strong> <span className={`status-${app.status}`}>{app.status}</span></p>
                <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {applications.length === 0 && (
              <p>You haven't applied to any jobs yet.</p>
            )}
          </div>
        </div>
      )}

      {user.role === 'employer' && (
        <div className="employer-profile">
          <h2>Posted Jobs</h2>
          <div className="posted-jobs-list">
            {postedJobs.map(job => (
              <div key={job._id} className="job-card">
                <h3>{job.title}</h3>
                <p><strong>Posted on:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                <p><strong>Applications:</strong> {job.applicationCount || 0}</p>
                <p><strong>Status:</strong> {job.status}</p>
                <button 
                  onClick={() => window.location.href = `/jobs/${job._id}/applications`}
                  className="view-applications-btn"
                >
                  View Applications
                </button>
              </div>
            ))}
            {postedJobs.length === 0 && (
              <p>You haven't posted any jobs yet.</p>
            )}
          </div>
          <button 
            onClick={() => window.location.href = '/jobs/create'}
            className="create-job-btn"
          >
            Post New Job
          </button>
        </div>
      )}
    </div>
  );
}