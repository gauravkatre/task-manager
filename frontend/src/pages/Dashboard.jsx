import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

const StatCard = ({ label, value, sub, color }) => (
  <div className="stat-card" style={{ '--accent-color': color }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/dashboard')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { 'To Do': 'var(--text-muted)', 'In Progress': 'var(--blue)', Done: 'var(--green)' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="page-content">
          {loading ? (
            <div className="loading"><span className="spinner" />Loading stats...</div>
          ) : stats ? (
            <>
              <div className="page-header">
                <div>
                  <h2>Overview</h2>
                  <p>Your workspace at a glance</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="stats-grid">
                <StatCard label="Total Tasks" value={stats.totalTasks} sub="across all projects" color="var(--accent)" />
                <StatCard label="Projects" value={stats.totalProjects} sub="active workspaces" color="var(--cyan)" />
                <StatCard label="Completed" value={stats.tasksByStatus?.Done || 0} sub="tasks done" color="var(--green)" />
                <StatCard label="Overdue" value={stats.overdueTasks} sub="need attention" color={stats.overdueTasks > 0 ? 'var(--red)' : 'var(--text-muted)'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Tasks by Status */}
                <div className="card">
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                    Tasks by Status
                  </h3>
                  {Object.entries(stats.tasksByStatus || {}).map(([status, count]) => {
                    const total = stats.totalTasks || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={status} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                          <span style={{ color: statusColors[status] }}>{status}</span>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: statusColors[status], borderRadius: 3, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tasks per User */}
                <div className="card">
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                    Tasks per Member
                  </h3>
                  {stats.tasksPerUser?.length > 0 ? stats.tasksPerUser.map(u => (
                    <div key={u._id || 'unassigned'} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                        alt={u.name}
                        className="avatar avatar-sm"
                      />
                      <span style={{ flex: 1, fontSize: '0.85rem' }}>{u.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: 10 }}>
                        {u.count}
                      </span>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No task assignments yet</p>
                  )}
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="card">
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                  Recent Tasks
                </h3>
                {stats.recentTasks?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stats.recentTasks.map(task => (
                      <div
                        key={task._id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'background var(--transition)' }}
                        onClick={() => task.project?._id && navigate(`/projects/${task.project._id}`)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      >
                        <div style={{ width: 3, height: 32, background: task.project?.color || 'var(--accent)', borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{task.project?.name}</p>
                        </div>
                        <span className={`badge badge-${task.status === 'Done' ? 'done' : task.status === 'In Progress' ? 'inprogress' : 'todo'}`}>
                          {task.status}
                        </span>
                        {task.assignedTo && (
                          <img src={task.assignedTo.avatar} alt={task.assignedTo.name} title={task.assignedTo.name} className="avatar avatar-sm" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks yet. Create a project to get started.</p>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>Could not load dashboard</h3>
              <p>Please refresh the page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
