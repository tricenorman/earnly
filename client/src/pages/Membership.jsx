import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import api from '../api';

function Membership({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('pendingUserId') || user?.id;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create PayPal order
      const orderRes = await api.post('/membership/create', { userId });
      const { orderId, links } = orderRes.data.data;

      // In demo mode, directly capture
      if (process.env.NODE_ENV === 'development') {
        const captureRes = await api.post('/membership/capture', { orderId, userId });
        if (captureRes.data.success) {
          localStorage.removeItem('pendingUserId');
          localStorage.setItem('token', captureRes.data.data.token);
          localStorage.setItem('user', JSON.stringify(captureRes.data.data));
          navigate('/');
          return;
        }
      }

      // Find approve link
      const approveLink = links.find(l => l.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Unlock Earnly</h2>
        <p style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px', fontSize: '1.125rem' }}>Access all rewards & tasks</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>$1</div>
          <p style={{ color: 'var(--dark-muted)' }}>One-time membership fee</p>
        </div>

        <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '15px' }}>Unlock includes:</h4>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '8px' }}>✓ Access to available tasks</li>
            <li style={{ marginBottom: '8px' }}>✓ Rewards tracking</li>
            <li style={{ marginBottom: '8px' }}>✓ Wallet management</li>
            <li style={{ marginBottom: '8px' }}>✓ Eligible payout requests</li>
            <li>✓ Account dashboard</li>
          </ul>
        </div>

        <button className="btn-primary btn-block" onClick={handlePayment} disabled={loading}>
          {loading ? <span className="loading"></span> : 'JOIN FOR $1'}
        </button>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--warning)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--warning)', margin: '0' }}>
            ⚠️ Membership does not guarantee earnings. Rewards depend on completing eligible activities and meeting applicable requirements.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Membership;