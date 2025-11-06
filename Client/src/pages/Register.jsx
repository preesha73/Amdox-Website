import React, { useState } from 'react';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'jobseeker'
  });
  const [msg, setMsg] = useState(null);
  const [isError, setIsError] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setIsError(false);
    try {
      await api.post('/api/register', form);
      setMsg('Registered successfully! You can now log in.');
      setForm({ name: '', email: '', password: '' }); // Clear form on success
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
      setIsError(true);
    }
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="form-title">Create Account</h2>
        {msg && (
          <p className={`message ${isError ? 'error-msg' : 'success-msg'}`}>
            {msg}
          </p>
        )}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
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
          <div className="form-group">
            <label>Register as</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              <option value="jobseeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <button type="submit" className="btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}