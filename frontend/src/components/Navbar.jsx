import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h2 className="navbar-title">{title}</h2>
      <div className="navbar-actions">
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {user?.name}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
