import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setCompleting(taskId);
    try {
      const response = await api.post(`/tasks/${taskId}/complete`);
      setSuccess(response.data.message);
      loadTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete task');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <h2 style={{ marginBottom: '20px' }}>Available Tasks</h2>

      <div className="grid grid-2 gap-20">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-card-header">
              <h4 className="task-card-title">{task.title}</h4>
              <span className="task-reward">{task.displayReward}</span>
            </div>
            <p className="task-card-description">{task.description}</p>
            <div className="task-card-footer">
              <span className="task-status" style={{ color: task.completed ? 'var(--success)' : 'var(--dark-muted)' }}>
                {task.completed ? '✓ Completed' : 'Available'}
              </span>
              {!task.completed && (
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={completing === task.id}
                >
                  {completing === task.id ? <span className="loading"></span> : 'COMPLETE'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;