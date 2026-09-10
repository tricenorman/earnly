import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import api from '../api';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', { email, password, confirmPassword });
      // Store user ID for membership flow
      localStorage.setItem('pendingUserId', response.data.data.userId);
      navigate('/membership');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Create Account</h2>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="8"
              required
            />
          </div>

          <button className="btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <span className="loading"></span> : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;