import { format, isPast, parseISO } from 'date-fns';

const priorityMap = { Low: 'low', Medium: 'medium', High: 'high' };
const statusMap = { 'To Do': 'todo', 'In Progress': 'inprogress', 'Done': 'done' };

const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.dueDate && task.status !== 'Done' && isPast(new Date(task.dueDate));

  return (
    <div className="task-card" onClick={() => onClick && onClick(task)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <p className="task-card-title" style={{ margin: 0 }}>{task.title}</p>
        <span className={`badge badge-${priorityMap[task.priority] || 'medium'}`} style={{ flexShrink: 0 }}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      <div className="task-card-meta">
        <span className={`badge badge-${statusMap[task.status] || 'todo'}`}>{task.status}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.dueDate && (
            <span className={`due-date${isOverdue ? ' overdue' : ''}`}>
              {isOverdue ? '⚠ ' : ''}
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.assignedTo ? (
            <div className="task-card-assignee">
              <img
                src={task.assignedTo.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignedTo.name}`}
                alt={task.assignedTo.name}
                title={task.assignedTo.name}
                className="avatar avatar-sm"
              />
            </div>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
