import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { format } from 'date-fns';

/* ───────── Task Modal ───────── */
const TaskModal = ({ task, project, members, userRole, onClose, onSave, onDelete }) => {
  const isNew = !task._id;
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'To Do',
    priority: task.priority || 'Medium',
    dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    assignedTo: task.assignedTo?._id || task.assignedTo || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = userRole === 'Admin';

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      let saved;
      if (isNew) {
        const { data } = await taskService.create(project._id, payload);
        saved = data;
      } else {
        const { data } = await taskService.update(task._id, payload);
        saved = data;
      }
      onSave(saved, isNew);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.delete(task._id);
      onDelete(task._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'New Task' : isAdmin ? 'Edit Task' : 'Task Details'}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && isAdmin && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            )}
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" name="title" value={form.title} onChange={handleChange} required disabled={!isAdmin && !isNew} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} rows={3} disabled={!isAdmin && !isNew} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option>To Do</option><option>In Progress</option><option>Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange} disabled={!isAdmin && !isNew}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" name="dueDate" value={form.dueDate} onChange={handleChange} disabled={!isAdmin && !isNew} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" name="assignedTo" value={form.assignedTo} onChange={handleChange} disabled={!isAdmin && !isNew}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isNew ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ───────── Add Member Modal ───────── */
const AddMemberModal = ({ projectId, onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await projectService.addMember(projectId, email, role);
      onAdd(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ───────── Main Page ───────── */
const COLUMNS = ['To Do', 'In Progress', 'Done'];
const columnColors = { 'To Do': 'var(--text-muted)', 'In Progress': 'var(--blue)', 'Done': 'var(--green)' };

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);

  // ✅ Fixed — toString() comparison so ObjectId vs String mismatch na ho
  const userRole = useMemo(() => {
    if (!project || !user) return 'Member';
    const member = project.members?.find(
      m => (m.user?._id || m.user)?.toString() === user._id?.toString()
    );
    return member?.role || 'Member';
  }, [project, user]);

  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    Promise.all([
      projectService.getById(projectId),
      taskService.getByProject(projectId),
    ])
      .then(([pr, tr]) => { setProject(pr.data); setTasks(tr.data); })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const tasksByStatus = status => tasks.filter(t => t.status === status);

  const handleSaveTask = (task, isNew) => {
    if (isNew) setTasks(p => [task, ...p]);
    else setTasks(p => p.map(t => t._id === task._id ? task : t));
  };

  const handleDeleteTask = id => setTasks(p => p.filter(t => t._id !== id));

  const handleRemoveMember = async uid => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      const { data } = await projectService.removeMember(projectId, uid);
      setProject(data);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="loading"><span className="spinner" />Loading project...</div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={project?.name || 'Project'} />
        <div className="page-content">
          {/* Header */}
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: project?.color, flexShrink: 0 }} />
              <div>
                <h2>{project?.name}</h2>
                {project?.description && <p>{project.description}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAdmin && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    Add Member
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowNewTask(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Task
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {['board', 'list', 'members'].map(tab => (
              <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'members' && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 10 }}>{project?.members?.length}</span>}
              </button>
            ))}
          </div>

          {/* Board View */}
          {activeTab === 'board' && (
            <div className="kanban-board">
              {COLUMNS.map(col => (
                <div key={col} className="kanban-column">
                  <div className="kanban-header">
                    <span className="kanban-title" style={{ color: columnColors[col] }}>{col}</span>
                    <span className="kanban-count">{tasksByStatus(col).length}</span>
                  </div>
                  <div className="kanban-tasks">
                    {tasksByStatus(col).length > 0
                      ? tasksByStatus(col).map(t => (
                        <TaskCard key={t._id} task={t} onClick={() => setSelectedTask(t)} />
                      ))
                      : <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono)' }}>empty</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {activeTab === 'list' && (
            <div>
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <h3>No tasks yet</h3>
                  {isAdmin && <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>Create First Task</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 90px 120px', gap: 12, padding: '8px 14px', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <span>Task</span><span>Status</span><span>Priority</span><span>Due</span><span>Assignee</span>
                  </div>
                  {tasks.map(t => (
                    <div
                      key={t._id}
                      style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 90px 120px', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', alignItems: 'center', transition: 'border-color var(--transition)' }}
                      onClick={() => setSelectedTask(t)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.title}</span>
                      <span className={`badge badge-${t.status === 'Done' ? 'done' : t.status === 'In Progress' ? 'inprogress' : 'todo'}`}>{t.status}</span>
                      <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                      <span style={{ fontSize: '0.75rem', color: t.dueDate && new Date() > new Date(t.dueDate) && t.status !== 'Done' ? 'var(--red)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {t.dueDate ? format(new Date(t.dueDate), 'MMM d') : '—'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {t.assignedTo ? (
                          <>
                            <img src={t.assignedTo.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${t.assignedTo.name}`} alt={t.assignedTo.name} title={t.assignedTo.name} className="avatar avatar-sm" />
                            <span style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.assignedTo.name}</span>
                          </>
                        ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Unassigned</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members View */}
          {activeTab === 'members' && (
            <div style={{ maxWidth: 520 }}>
              <div className="members-list">
                {project?.members?.map(m => (
                  <div key={m.user._id} className="member-chip">
                    <img src={m.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user.name}`} alt={m.user.name} className="avatar" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.user.email}</div>
                    </div>
                    <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                    {isAdmin && m.user._id !== user._id && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleRemoveMember(m.user._id)} title="Remove member" style={{ color: 'var(--red)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isAdmin && (
                <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={() => setShowAddMember(true)}>
                  + Invite Member
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {(selectedTask || showNewTask) && (
        <TaskModal
          task={selectedTask || {}}
          project={project}
          members={project?.members || []}
          userRole={userRole}
          onClose={() => { setSelectedTask(null); setShowNewTask(false); }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddMember(false)}
          onAdd={p => setProject(p)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;