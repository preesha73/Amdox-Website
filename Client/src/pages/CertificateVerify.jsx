import React, { useState } from 'react';
import api from '../api';

export default function CertificateVerify() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/certificates/${certId.trim()}`);
      setResult({ ...res.data });
    } catch (err) {
      console.error('Verify error:', err);
      setResult({ 
        verified: false, 
        error: err?.response?.data?.error || 'Certificate not found' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.certId) return;
    // Open PDF in new tab
    window.open(`${api.defaults.baseURL}/api/certificates/${result.certId}/pdf`, '_blank');
  };

  return (
    <div className="page-container">
      <div className="verify-container" style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
        <h2>Verify Certificate</h2>
        
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="certId" style={{ display: 'block', marginBottom: 8 }}>
              Enter Certificate ID
            </label>
            <input
              type="text"
              id="certId"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g., abc123-..."
              style={{ 
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #ccc'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 24, padding: 20, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            {result.verified ? (
              <>
                <div style={{ 
                  padding: '8px 12px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  borderRadius: 4,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>✓</span> Certificate Verified
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <strong>Name:</strong> {result.name}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Course:</strong> {result.course}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Issued:</strong> {new Date(result.issuedAt).toLocaleDateString()}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Certificate ID:</strong>
                  <code style={{ 
                    display: 'block',
                    padding: '4px 8px',
                    background: '#f3f4f6',
                    borderRadius: 4,
                    marginTop: 4
                  }}>
                    {result.certId}
                  </code>
                </div>
                
                <button 
                  onClick={handleDownload}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Download Certificate PDF
                </button>
              </>
            ) : (
              <div style={{ 
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>✕</span> {result.error || 'Certificate not found'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}