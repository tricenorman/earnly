import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Wallet({ user }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const response = await api.get('/wallet');
      setWallet(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <h2 style={{ marginBottom: '20px' }}>My Wallet</h2>

      {wallet && (
        <>
          <div className="grid grid-3 gap-20" style={{ marginBottom: '30px' }}>
            <div className="card-small">
              <p style={{ marginBottom: '8px' }}>Available</p>
              <h3 style={{ margin: '0', color: 'var(--success)' }}>{wallet.available}</h3>
            </div>
            <div className="card-small">
              <p style={{ marginBottom: '8px' }}>Pending</p>
              <h3 style={{ margin: '0', color: 'var(--warning)' }}>{wallet.pending}</h3>
            </div>
            <div className="card-small">
              <p style={{ marginBottom: '8px' }}>Total Earned</p>
              <h3 style={{ margin: '0', color: 'var(--primary)' }}>{wallet.totalEarned}</h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Wallet;