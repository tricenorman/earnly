import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import api from '../api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      onLogin(response.data.data.token, response.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>EARNLY</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>Earn. Complete. Reward.</p>

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
              required
            />
          </div>

          <button className="btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <span className="loading"></span> : 'LOGIN'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '600' }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;