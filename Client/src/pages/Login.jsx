import React, { useState } from 'react';
import api, { setAuthToken } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await api.post('/api/login', form);
      const { token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      login(token);
      navigate('/home');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="form-title">Login</h2>
        {msg && <p className="message error-msg">{msg}</p>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}