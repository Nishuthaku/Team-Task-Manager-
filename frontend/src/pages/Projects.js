import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!projectName.trim()) return setFormError('Project name is required.');
    try {
      setSubmitting(true);
      const res = await api.post('/projects', { name: projectName });
      setProjects([res.data, ...projects]);
      setProjectName('');
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch {
      alert('Failed to delete project.');
    }
  };

  const colors = ['#7c6cff', '#20e5a0', '#fbbf24', '#5eb8ff', '#ff6b6b', '#f472b6'];
  const getColor = (i) => colors[i % colors.length];

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) return <div className="loading">Loading projects</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>No projects yet</p>
            <p className="empty-sub">{user?.role === 'admin' ? 'Create your first project to get started' : 'Projects will appear here once created'}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {projects.map((project, i) => (
            <div key={project._id} className="project-card" style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '1.5rem', transition: 'all 0.2s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: getColor(i), borderRadius: '14px 14px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: `${getColor(i)}18`, border: `1px solid ${getColor(i)}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                  📁
                </div>
                {user?.role === 'admin' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project._id)}
                    style={{ flexShrink: 0 }}>
                    Delete
                  </button>
                )}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  {project.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-soft)', border: '1px solid rgba(124,108,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'var(--accent2)' }}>
                    {getInitials(project.createdBy?.name)}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text2)' }}>{project.createdBy?.name}</span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                  {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getColor(i), background: `${getColor(i)}12`, padding: '0.2rem 0.6rem', borderRadius: '999px', border: `1px solid ${getColor(i)}25` }}>
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create new project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project name</label>
                <input
                  type="text" value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
