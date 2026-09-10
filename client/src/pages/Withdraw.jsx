import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Withdraw({ user }) {
  const [paypalEmail, setPaypalEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await api.get('/wallet');
      setBalance(response.data.data.availableCents / 100);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!paypalEmail || !amount) {
      setError('PayPal email and amount required');
      return;
    }

    if (parseFloat(amount) < 5) {
      setError('Minimum withdrawal is $5.00');
      return;
    }

    if (parseFloat(amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/payouts', {
        paypalEmail,
        amount: parseFloat(amount),
      });
      setSuccess(response.data.message);
      setPaypalEmail('');
      setAmount('');
      loadBalance();
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page" style={{ maxWidth: '500px', margin: '0 auto' }}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="card">
        <h2>Withdraw Rewards</h2>

        <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius)', padding: '15px', marginBottom: '20px' }}>
          <p style={{ margin: '0' }}>Available: <strong>{`$${balance.toFixed(2)}`}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">PayPal Email</label>
            <input
              id="email"
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Withdrawal Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="5.00"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <p style={{ color: 'var(--dark-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>Minimum withdrawal: $5.00</p>

          <button className="btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? <span className="loading"></span> : 'REQUEST PAYOUT'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Withdraw;