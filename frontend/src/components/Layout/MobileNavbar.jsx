import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileNavbar.css';

function MobileNavbar({ onMenuClick }) {
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
        const name = parsed?.name || parsed?.email || 'User';
        return name.charAt(0).toUpperCase();
      } catch {
        return 'U';
      }
    }
    return 'U';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path === '/users') return 'Users';
    return 'PixelForge Nexus';
  };

  return (
    <header className="mobile-navbar">
      <div className="mobile-nav-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <span>☰</span>
        </button>
        <h1 className="mobile-page-title">{getPageTitle()}</h1>
      </div>
      <div className="mobile-nav-right" ref={dropdownRef}>
        <button
          className="mobile-user-avatar"
          onClick={toggleDropdown}
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
        >
          {getUserInitial()}
        </button>
        {isDropdownOpen && (
          <div className="mobile-dropdown">
            <button className="mobile-dropdown-item" onClick={handleLogout}>
              <span className="mobile-dropdown-icon">👤</span>
              <span className="mobile-dropdown-label">Account</span>
            </button>
            <div className="mobile-dropdown-divider"></div>
            <button className="mobile-dropdown-item logout" onClick={handleLogout}>
              <span className="mobile-dropdown-icon">🚪</span>
              <span className="mobile-dropdown-label">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default MobileNavbar;
