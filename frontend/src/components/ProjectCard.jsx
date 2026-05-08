import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userMember = project.members?.find(m => m.user?._id === user?._id || m.user === user?._id);
  const isAdmin = userMember?.role === 'Admin';
  const progress = project.taskCount > 0
    ? Math.round((project.completedCount / project.taskCount) * 100)
    : 0;

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', borderLeft: `3px solid ${project.color || '#6366f1'}` }}
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.name}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.description || 'No description'}
          </p>
        </div>
        <span className={`badge badge-${isAdmin ? 'admin' : 'member'}`} style={{ marginLeft: 8, flexShrink: 0 }}>
          {isAdmin ? 'Admin' : 'Member'}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          <span>{project.completedCount || 0}/{project.taskCount || 0} tasks</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: project.color || 'var(--accent)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
          {project.members?.slice(0, 4).map((m, i) => (
            <img
              key={i}
              src={m.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name || 'U'}`}
              alt={m.user?.name}
              title={m.user?.name}
              className="avatar avatar-sm"
              style={{ border: '2px solid var(--bg-card)', marginLeft: i > 0 ? -6 : 0 }}
            />
          ))}
          {(project.members?.length || 0) > 4 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>
              +{project.members.length - 4}
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={e => { e.stopPropagation(); onDelete && onDelete(project._id); }}
            title="Delete project"
            style={{ color: 'var(--red)', opacity: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
              <path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
