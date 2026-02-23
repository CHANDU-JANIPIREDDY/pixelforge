import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/users', label: 'Users' },
];

function Header({ onMenuClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const getUserInitial = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return (parsed?.name || parsed?.email || 'U')[0].toUpperCase();
      } catch {
        return 'U';
      }
    }
    return 'U';
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          <span>☰</span>
        </button>
        <a href="/dashboard" className="logo-text">
          PixelForge Nexus
        </a>
      </div>

      <nav className="header-nav">
        {navLinks.map((link) => (
          <a
            key={link.path}
            href={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-right">
        <div className="user-section" ref={dropdownRef}>
          <button
            className={`user-avatar ${isDropdownOpen ? 'active' : ''}`}
            onClick={toggleDropdown}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
          >
            {getUserInitial()}
          </button>
          <button
            className={`btn-icon ${isDropdownOpen ? 'active' : ''}`}
            onClick={toggleDropdown}
            aria-label="Settings"
            aria-expanded={isDropdownOpen}
          >
            <span>⚙️</span>
          </button>

          {isDropdownOpen && (
            <div className="settings-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-title">Settings</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                <span className="dropdown-label">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
