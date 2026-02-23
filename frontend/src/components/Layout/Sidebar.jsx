import { NavLink, useNavigate } from 'react-router-dom';
import { isAdmin, canManageProjects } from '../../utils/auth';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();
  const canManageProj = canManageProjects();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return {
          name: parsed?.name || parsed?.email || 'User',
          role: parsed?.role || 'User',
          initial: (parsed?.name || parsed?.email || 'U')[0].toUpperCase(),
        };
      } catch {
        return { name: 'User', role: 'User', initial: 'U' };
      }
    }
    return { name: 'User', role: 'User', initial: 'U' };
  };

  const userInfo = getUserInfo();

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="logo" onClick={onClose}>
          <span className="logo-icon">PF</span>
          <span className="logo-text">PixelForge Nexus</span>
        </NavLink>
        <button className="sidebar-close" onClick={onClose}>
          <span>✕</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={onClose}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>

          {canManageProj && (
            <li className="nav-item">
              <NavLink
                to="/projects"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={onClose}
              >
                <span className="nav-icon">📁</span>
                <span className="nav-text">Projects</span>
              </NavLink>
            </li>
          )}

          {userIsAdmin && (
            <li className="nav-item">
              <NavLink
                to="/users"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                onClick={onClose}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Users</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{userInfo.initial}</div>
          <div className="user-details">
            <span className="user-name">{userInfo.name}</span>
            <span className="user-role">{userInfo.role}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
