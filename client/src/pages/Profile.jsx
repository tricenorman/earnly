import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const response = await api.get('/me');
      setUserInfo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Profile Settings</h2>

        {userInfo && (
          <div>
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--dark-border)' }}>
              <p style={{ marginBottom: '5px', color: 'var(--dark-muted)' }}>Email</p>
              <h4 style={{ margin: '0' }}>{userInfo.email}</h4>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--dark-border)' }}>
              <p style={{ marginBottom: '5px', color: 'var(--dark-muted)' }}>Membership Status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: userInfo.membershipActive ? 'var(--success)' : 'var(--danger)',
                  }}
                ></span>
                <span>{userInfo.membershipActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--dark-border)' }}>
              <p style={{ marginBottom: '5px', color: 'var(--dark-muted)' }}>Account Status</p>
              <h4 style={{ margin: '0', textTransform: 'uppercase' }}>{userInfo.accountStatus}</h4>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Security</h3>

        <div className="form-group">
          <label htmlFor="current">Current Password</label>
          <input
            id="current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="new">New Password</label>
          <input
            id="new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="btn-secondary btn-block" disabled>
          Change Password (Coming Soon)
        </button>
      </div>

      <button className="btn-danger btn-block" onClick={handleLogout}>
        LOG OUT
      </button>
    </div>
  );
}

export default Profile;