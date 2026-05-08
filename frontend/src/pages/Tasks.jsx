import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: projects } = await projectService.getAll();
        const taskArrays = await Promise.all(
          projects.map(p => taskService.getByProject(p._id).then(r => r.data.map(t => ({ ...t, projectName: p.name, projectColor: p.color, projectId: p._id }))))
        );
        const flat = taskArrays.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllTasks(flat);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = allTasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });

  const overdue = filtered.filter(t => t.dueDate && new Date() > new Date(t.dueDate) && t.status !== 'Done');
  const active = filtered.filter(t => !overdue.includes(t));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Tasks" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>My Tasks</h2>
              <p>{filtered.length} task{filtered.length !== 1 ? 's' : ''} visible</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-select" style={{ width: 140 }} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                <option value="">All Statuses</option>
                <option>To Do</option><option>In Progress</option><option>Done</option>
              </select>
              <select className="form-select" style={{ width: 140 }} value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
                <option value="">All Priorities</option>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading"><span className="spinner" />Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <h3>No tasks found</h3>
              <p>Join a project or adjust your filters.</p>
            </div>
          ) : (
            <>
              {overdue.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠</span> Overdue ({overdue.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                    {overdue.map(t => (
                      <div key={t._id}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.projectColor, flexShrink: 0 }} />
                          {t.projectName}
                        </div>
                        <TaskCard task={t} onClick={() => navigate(`/projects/${t.projectId}`)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {overdue.length > 0 && (
                  <h3 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Active ({active.length})
                  </h3>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {active.map(t => (
                    <div key={t._id}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.projectColor, flexShrink: 0 }} />
                        {t.projectName}
                      </div>
                      <TaskCard task={t} onClick={() => navigate(`/projects/${t.projectId}`)} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
