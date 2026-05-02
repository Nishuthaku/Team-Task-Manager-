import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([api.get('/dashboard'), api.get('/tasks')]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBadgeClass = (status) => {
    if (status === 'Done') return 'badge badge-done';
    if (status === 'In Progress') return 'badge badge-inprogress';
    return 'badge badge-pending';
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="loading">Loading dashboard</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{greeting}, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's what's happening with your team today.</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card purple">
            <div className="stat-stripe" />
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card green">
            <div className="stat-stripe" />
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-stripe" />
            <div className="stat-icon">🔄</div>
            <div className="stat-value">{stats.inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-stripe" />
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pendingTasks}</div>
            <div className="stat-label">Pending</div>
          </div>
          {user?.role === 'admin' && (
            <>
              <div className="stat-card red">
                <div className="stat-stripe" />
                <div className="stat-icon">📁</div>
                <div className="stat-value">{stats.totalProjects}</div>
                <div className="stat-label">Projects</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-stripe" />
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Team Members</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress bar */}
      {stats && stats.totalTasks > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text2)' }}>Overall Progress</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green)' }}>
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{
              height: '100%',
              width: `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--green))',
              borderRadius: '999px',
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Recent Tasks</h3>
          <span className="card-count">{recentTasks.length}</span>
        </div>
        <div className="card-body">
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No tasks yet</p>
              <p className="empty-sub">Tasks will appear here once created</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr key={task._id}>
                      <td className="primary-col">{task.title}</td>
                      <td>
                        <span style={{ color: 'var(--accent2)', fontSize: '0.8125rem' }}>
                          {task.projectId?.name || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">{getInitials(task.assignedTo?.name)}</div>
                          {task.assignedTo?.name || '—'}
                        </div>
                      </td>
                      <td><span className={getBadgeClass(task.status)}>{task.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
