import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setResult({ error: 'Please select a file first' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/api/admin/import-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult({ success: true, data: res.data });
    } catch (err) {
      console.error('Upload error', err);
      const message = err?.response?.data?.error || err.message || 'Upload failed';
      setResult({ error: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Admin Import — Upload Students</h2>
      <form onSubmit={handleSubmit} className="admin-upload-form">
        <div>
          <label htmlFor="file">Excel file (.xlsx) with headers: name, course, email (optional)</label>
          <input id="file" type="file" accept=".xlsx,.csv" onChange={handleFile} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Uploading...' : 'Upload and Import'}
          </button>
          <button type="button" onClick={() => navigate('/home')} className="btn-muted" style={{ marginLeft: 8 }}>
            Back
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.error && <div className="error">Error: {result.error}</div>}
          {result.success && (
            <div className="import-result">
              <p>{result.data.message}</p>
              <p>Inserted: {result.data.inserted}</p>
              {result.data.insertedCertIds && (
                <details>
                  <summary>Inserted Certificate IDs ({result.data.insertedCertIds.length})</summary>
                  <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(result.data.insertedCertIds, null, 2)}</pre>
                </details>
              )}
              <p>Skipped: {result.data.skipped}</p>
              {result.data.skippedRows && result.data.skippedRows.length > 0 && (
                <details>
                  <summary>Skipped rows</summary>
                  <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(result.data.skippedRows, null, 2)}</pre>
                </details>
              )}
              {result.data.errors && result.data.errors.length > 0 && (
                <details>
                  <summary>Errors</summary>
                  <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(result.data.errors, null, 2)}</pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
