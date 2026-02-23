import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderControls.css';

function HeaderControls() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <div className="header-controls">
      <div className="controls-right" ref={dropdownRef}>
        <button
          className="user-avatar"
          onClick={toggleDropdown}
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
          type="button"
        >
          {getUserInitial()}
        </button>
        <button
          className={`settings-btn ${isDropdownOpen ? 'active' : ''}`}
          onClick={toggleDropdown}
          aria-label="Settings"
          aria-expanded={isDropdownOpen}
          type="button"
        >
          <span>⚙️</span>
        </button>

        {isDropdownOpen && (
          <div className="controls-dropdown">
            <button className="dropdown-item" onClick={handleLogout}>
              <span className="dropdown-icon">👤</span>
              <span className="dropdown-label">Account Settings</span>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              <span className="dropdown-label">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeaderControls;
