import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16 }}>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '5rem', fontWeight: 700, color: 'var(--border-light)', lineHeight: 1 }}>404</div>
    <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Page Not Found</h1>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
  </div>
);

export default NotFound;
