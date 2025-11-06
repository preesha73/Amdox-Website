import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!token) {
        setError('Not authorized');
        setLoading(false);
        return;
      }
      try {
        // fetch job details (may be server-side or sample)
        try {
          const r = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
          setJob(r.data);
        } catch (e) {
          // no-op, maybe sample job
        }

        const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data || []);
      } catch (err) {
        console.error('Failed to fetch applications', err);
        setError(err.response?.data?.error || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [jobId, token]);

  const updateStatus = async (applicationId, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/jobs/${jobId}/applications/${applicationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(apps => apps.map(a => a._id === applicationId ? res.data : a));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update application');
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  // If user is not an employer, disallow access
  if (user?.role !== 'employer') {
    return <div className="error">Only employers can view applications.</div>;
  }

  return (
    <div className="applications-page">
      <h1>Applications for {job?.title || 'Job'}</h1>
      <p><strong>Company:</strong> {job?.company || '—'}</p>

      {applications.length === 0 && (
        <div className="muted">No applications yet.</div>
      )}

      <div className="applications-list">
        {applications.map(app => (
          <div key={app._id} className="application-card">
            <h3>{app.applicant?.name || 'Unnamed'}</h3>
            <p><strong>Email:</strong> {app.applicant?.email}</p>
            <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`status-${app.status}`}>{app.status}</span></p>
            {app.coverLetter && (
              <div>
                <strong>Cover Letter</strong>
                <p style={{ whiteSpace: 'pre-wrap' }}>{app.coverLetter}</p>
              </div>
            )}
            {app.resume?.fileUrl && (
              <div>
                <a
                  href={(app.resume.fileUrl.startsWith('http') ? app.resume.fileUrl : `http://localhost:5000${app.resume.fileUrl}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume
                </a>
              </div>
            )}

            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => updateStatus(app._id, 'under_review')}>Mark Under Review</button>
              <button className="btn" onClick={() => updateStatus(app._id, 'accepted')}>Accept</button>
              <button className="btn" onClick={() => updateStatus(app._id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => navigate('/jobs')}>Back to Jobs</button>
      </div>
    </div>
  );
}
