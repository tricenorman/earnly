import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', reward: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.data);
      } else if (activeTab === 'payouts') {
        const res = await api.get('/admin/payouts');
        setPayouts(res.data.data);
      } else if (activeTab === 'tasks') {
        const res = await api.get('/admin/tasks');
        setTasks(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.reward) {
      setError('Title and reward required');
      return;
    }

    setCreating(true);
    try {
      await api.post('/admin/tasks', {
        title: newTask.title,
        description: newTask.description,
        rewardAmount: parseFloat(newTask.reward),
      });
      setNewTask({ title: '', description: '', reward: '' });
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleApprovePayout = async (payoutId) => {
    try {
      await api.post(`/admin/payouts/${payoutId}/approve`);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve payout');
    }
  };

  const handleRejectPayout = async (payoutId) => {
    try {
      await api.post(`/admin/payouts/${payoutId}/reject`, { reason: 'Rejected by admin' });
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject payout');
    }
  };

  if (loading && !stats) return <LoadingSpinner />;

  return (
    <div className="page">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <h2 style={{ marginBottom: '20px' }}>Admin Dashboard</h2>

      <div className="flex" style={{ marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        {['overview', 'users', 'tasks', 'payouts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-2 gap-20">
          <div className="card-small">
            <p>Total Users</p>
            <h3 style={{ margin: '0' }}>{stats.totalUsers}</h3>
          </div>
          <div className="card-small">
            <p>Active Members</p>
            <h3 style={{ margin: '0' }}>{stats.activeMembers}</h3>
          </div>
          <div className="card-small">
            <p>Membership Revenue</p>
            <h3 style={{ margin: '0' }}>{stats.membershipRevenue}</h3>
          </div>
          <div className="card-small">
            <p>Total Rewards</p>
            <h3 style={{ margin: '0' }}>{stats.totalRewards}</h3>
          </div>
          <div className="card-small">
            <p>Pending Payouts</p>
            <h3 style={{ margin: '0' }}>{stats.pendingPayouts}</h3>
          </div>
          <div className="card-small">
            <p>Completed Payouts</p>
            <h3 style={{ margin: '0' }}>{stats.completedPayouts}</h3>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          {loading ? (
            <LoadingSpinner />
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--dark-muted)' }}>No users</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Membership</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Balance</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>{u.membership_active ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '10px' }}>{u.balance}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge badge-${u.account_status === 'active' ? 'success' : u.account_status === 'review' ? 'warning' : 'danger'}`}>
                        {u.account_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="desc">Description</label>
                <textarea
                  id="desc"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="reward">Reward (USD)</label>
                <input
                  id="reward"
                  type="number"
                  step="0.01"
                  value={newTask.reward}
                  onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                  required
                />
              </div>
              <button className="btn-primary" type="submit" disabled={creating}>
                {creating ? <span className="loading"></span> : 'CREATE TASK'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>All Tasks</h3>
            {loading ? (
              <LoadingSpinner />
            ) : tasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--dark-muted)' }}>No tasks</p>
            ) : (
              <div className="grid grid-2 gap-20">
                {tasks.map((task) => (
                  <div key={task.id} className="card-small">
                    <h4>{task.title}</h4>
                    <p style={{ color: 'var(--dark-muted)', fontSize: '0.9rem' }}>{task.description}</p>
                    <p>
                      Reward: <strong>{task.reward}</strong>
                    </p>
                    <span className={`badge ${task.active ? 'badge-success' : 'badge-danger'}`}>
                      {task.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="card">
          {loading ? (
            <LoadingSpinner />
          ) : payouts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--dark-muted)' }}>No payouts</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <td style={{ padding: '10px' }}>{p.email}</td>
                    <td style={{ padding: '10px' }}>{p.amount}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge badge-${p.status === 'completed' ? 'success' : 'warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {p.status === 'pending' && (
                        <div className="flex gap-10">
                          <button
                            className="btn-success btn-sm"
                            onClick={() => handleApprovePayout(p.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleRejectPayout(p.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;