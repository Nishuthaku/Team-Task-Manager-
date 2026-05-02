import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', assignedTo: '', projectId: '', status: 'Pending' });

  const fetchAll = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      if (user?.role === 'admin') {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      }
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.assignedTo || !form.projectId)
      return setFormError('All fields are required.');
    try {
      setSubmitting(true);
      const res = await api.post('/tasks', form);
      setTasks([res.data, ...tasks]);
      setForm({ title: '', assignedTo: '', projectId: '', status: 'Pending' });
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch {
      alert('Failed to delete task.');
    }
  };

  const getBadgeClass = (s) => s === 'Done' ? 'badge badge-done' : s === 'In Progress' ? 'badge badge-inprogress' : 'badge badge-pending';
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const filteredTasks = tasks.filter(t => {
    if (filterProject && t.projectId?._id !== filterProject) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const counts = {
    all: tasks.length,
    Pending: tasks.filter(t => t.status === 'Pending').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Done: tasks.filter(t => t.status === 'Done').length,
  };

  if (loading) return <div className="loading">Loading tasks</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} {filterStatus || filterProject ? 'filtered' : 'total'}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick status filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: `All (${counts.all})`, value: '' },
          { label: `⏳ Pending (${counts.Pending})`, value: 'Pending' },
          { label: `🔄 In Progress (${counts['In Progress']})`, value: 'In Progress' },
          { label: `✅ Done (${counts.Done})`, value: 'Done' },
        ].map(opt => (
          <button key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '999px', border: '1px solid',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'var(--font)',
              borderColor: filterStatus === opt.value ? 'var(--accent)' : 'var(--border)',
              background: filterStatus === opt.value ? 'var(--accent-soft)' : 'transparent',
              color: filterStatus === opt.value ? 'var(--accent2)' : 'var(--text2)',
            }}>
            {opt.label}
          </button>
        ))}

        <select className="status-select" value={filterProject} onChange={e => setFilterProject(e.target.value)}
          style={{ marginLeft: 'auto', borderRadius: '999px' }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div className="card">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No tasks found</p>
            <p className="empty-sub">{user?.role === 'admin' ? 'Create a task to get started' : 'No tasks assigned to you yet'}</p>
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
                  <th>Update</th>
                  {user?.role === 'admin' && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task._id}>
                    <td className="primary-col" style={{ maxWidth: '220px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: task.status === 'Done' ? 'var(--green)' : task.status === 'In Progress' ? 'var(--blue)' : 'var(--yellow)' }} />
                        {task.title}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--accent2)', fontWeight: 500 }}>
                        {task.projectId?.name || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{getInitials(task.assignedTo?.name)}</div>
                        <span>{task.assignedTo?.name || '—'}</span>
                      </div>
                    </td>
                    <td><span className={getBadgeClass(task.status)}>{task.status}</span></td>
                    <td>
                      <select className="status-select" value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create new task</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Task title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Design the homepage" autoFocus />
              </div>
              <div className="form-group">
                <label>Project</label>
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assign to</label>
                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Select a team member</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.role}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Initial status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
