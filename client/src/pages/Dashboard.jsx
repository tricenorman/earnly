import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user.membershipActive) {
      navigate('/membership');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [walletRes, tasksRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/tasks'),
      ]);
      setStats(walletRes.data.data);
      setTasks(tasksRes.data.data.slice(0, 3));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <h2 style={{ marginBottom: '10px' }}>Welcome back 👋</h2>
      <p style={{ color: 'var(--dark-muted)', marginBottom: '30px' }}>Here's your rewards summary</p>

      {stats && (
        <div className="grid grid-3 gap-20" style={{ marginBottom: '30px' }}>
          <div className="card-small">
            <p style={{ marginBottom: '8px' }}>Available Rewards</p>
            <h3 style={{ color: 'var(--success)', margin: '0' }}>{stats.available}</h3>
          </div>
          <div className="card-small">
            <p style={{ marginBottom: '8px' }}>Today's Earnings</p>
            <h3 style={{ color: 'var(--primary)', margin: '0' }}>+{stats.pending}</h3>
          </div>
          <div className="card-small">
            <p style={{ marginBottom: '8px' }}>Total Earned</p>
            <h3 style={{ color: 'var(--secondary)', margin: '0' }}>{stats.totalEarned}</h3>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="flex-between">
          <h3>Membership Status</h3>
          <span className="badge badge-success">✓ ACTIVE</span>
        </div>
      </div>

      <h3 style={{ marginBottom: '15px' }}>Available Activities</h3>
      <div className="grid grid-2 gap-20">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-card-header">
              <h4 className="task-card-title">{task.title}</h4>
              <span className="task-reward">{task.displayReward}</span>
            </div>
            <p className="task-card-description">{task.description}</p>
            <div className="task-card-footer">
              <span className="task-status">{task.completed ? '✓ Completed' : 'Available'}</span>
              {!task.completed && (
                <button className="btn-primary btn-sm" onClick={() => navigate('/tasks')}>
                  START
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;