// In Client/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
    }
  }, [token]);

  // Fetch current user when token changes
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await api.get('/api/me');
        if (mounted) setUser(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user', err);
        if (mounted) setUser(null);
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};