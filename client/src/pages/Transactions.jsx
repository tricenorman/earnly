import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <h2 style={{ marginBottom: '20px' }}>Recent Transactions</h2>

      <div className="card">
        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-muted)' }}>No transactions yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: '600' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: '600' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <td style={{ padding: '10px' }}>{tx.type}</td>
                  <td style={{ padding: '10px', fontWeight: '600' }}>
                    <span style={{ color: tx.amountCents > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.amountCents > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge badge-${tx.status === 'completed' ? 'success' : 'warning'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--dark-muted)', fontSize: '0.875rem' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Transactions;