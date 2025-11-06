// In Client/src/App.jsx

import { Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminUpload from './pages/AdminUpload';
import CertificateVerify from './pages/CertificateVerify';
import PublicRoute from './pages/PublicRoute';
import ProtectedRoute from './pages/ProtectedRoute';
import JobListings from './pages/JobListings';
import JobApplication from './pages/JobApplication';
import CreateJob from './pages/CreateJob';
import JobApplications from './pages/JobApplications';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

function AppLayout() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="main-nav">
        {token ? (
          <>
            {/* --- Logged-in Links --- */}
            <NavLink
              to="/home"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Jobs
            </NavLink>
            {user?.role === 'employer' && (
              <NavLink
                to="/jobs/create"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Post Job
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Profile
            </NavLink>
            <button onClick={handleLogout} className="nav-link-button">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* --- Logged-out Links --- */}
            <NavLink to="/" className="nav-link">Home</NavLink>
            <NavLink to="/jobs" className="nav-link">
              Browse Jobs
            </NavLink>
            <NavLink to="/verify" className="nav-link">
              Verify Certificate
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Register
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Login
            </NavLink>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* --- Public Routes --- */}
        <Route index element={<HomePage />} />
        <Route path="verify" element={<CertificateVerify />} />
        <Route element={<PublicRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="admin/upload" element={<AdminUpload />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="jobs/:jobId/apply" element={<JobApplication />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="jobs" element={<JobListings />} />
      </Route>
    </Routes>
  );
}