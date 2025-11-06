// In Client/src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setAuthToken(token);
    api
      .get('/api/me')
      .then((res) => setUser(res.data.user))
      .catch((error) => console.error('Auth fetch error:', error))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return <div className="loading-fullscreen">Loading...</div>;
  }

  if (!user) {
    // This can happen briefly or if the token is invalid.
    // We'll protect this page, so users shouldn't see this for long.
    return <div className="loading-fullscreen">Authenticating...</div>;
  }

  return (
    <div className="page-container">
      <div className="dashboard-container">
        <h2 className="dashboard-welcome-title">
          Welcome back, <span className="user-name">{user.name}</span>!
        </h2>
        <p className="dashboard-subtitle">We're glad to see you again.</p>
        <div className="dashboard-info">
          <p>Your registered email is: {user.email}</p>
          {user.role === 'admin' && (
            <div style={{ marginTop: 12 }}>
              <a href="/admin/upload" className="btn-primary">Admin: Upload Students</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}