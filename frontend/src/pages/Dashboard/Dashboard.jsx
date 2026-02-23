import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    setUserRole(user.role);
  }, [navigate]);

  useEffect(() => {
    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (userRole === 'Admin') {
        const response = await api.get('/projects/admin/dashboard-stats');
        setStats(response.data.data);
      } else if (userRole === 'ProjectLead' || userRole === 'Developer') {
        const response = await api.get('/projects');
        setProjects(response.data.data || []);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === 'Admin';
  const isProjectLead = userRole === 'ProjectLead';
  const isDeveloper = userRole === 'Developer';
  const canManageProj = isAdmin || isProjectLead;

  const getProjectLeadName = (project) => {
    if (!project.projectLead) return 'N/A';
    return typeof project.projectLead === 'object' 
      ? project.projectLead.name 
      : 'Project Lead';
  };

  const getStatusClass = (status) => {
    return status === 'Active' ? 'status-active' : 'status-completed';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="stats-grid">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="stat-card stat-card-loading">
              <div className="stat-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-label"></div>
                <div className="skeleton-value"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="error-container">
          <div className="error-content">
            <span className="error-icon-large">⚠️</span>
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Track your project metrics and team performance</p>
          </div>
          <div className="header-actions">
            <span className="last-updated">
              <span className="refresh-dot"></span>
              Live data
            </span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                📁
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Projects</span>
                <span className="stat-value">{stats.totalProjects.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator positive">
                <span className="trend-arrow">↑</span>
                Active
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                🚀
              </div>
              <div className="stat-content">
                <span className="stat-label">Active Projects</span>
                <span className="stat-value">{stats.activeProjects.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator positive">
                <span className="trend-arrow">↑</span>
                Active
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                ✅
              </div>
              <div className="stat-content">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{stats.completedProjects.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator positive">
                <span className="trend-arrow">↑</span>
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <Link to="/projects" className="quick-action-btn">
                  <span className="action-icon">📁</span>
                  <span>View Projects</span>
                </Link>
                <Link to="/users" className="quick-action-btn">
                  <span className="action-icon">👥</span>
                  <span>Manage Users</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">System Status</h2>
            </div>
            <div className="card-body">
              <div className="status-list">
                <div className="status-item">
                  <span className="status-dot status-dot-success"></span>
                  <span className="status-label">API Server</span>
                  <span className="status-value">Operational</span>
                </div>
                <div className="status-item">
                  <span className="status-dot status-dot-success"></span>
                  <span className="status-label">Database</span>
                  <span className="status-value">Connected</span>
                </div>
                <div className="status-item">
                  <span className="status-dot status-dot-success"></span>
                  <span className="status-label">Authentication</span>
                  <span className="status-value">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">
            {isProjectLead ? 'Project Lead Dashboard' : 'Developer Dashboard'}
          </h1>
          <p className="page-subtitle">
            {isProjectLead 
              ? 'Manage your projects and team members' 
              : 'View your assigned projects and tasks'}
          </p>
        </div>
      </div>

      <div className="projects-overview">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              {isProjectLead ? 'Your Projects' : 'Assigned Projects'}
            </h2>
            <span className="card-count">{projects.length}</span>
          </div>
          <div className="card-body">
            {projects.length > 0 ? (
              <div className="projects-table">
                <table>
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Status</th>
                      <th>{isProjectLead ? 'Team Size' : 'Project Lead'}</th>
                      <th>Deadline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project._id}>
                        <td>
                          <span className="project-name">{project.name}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(project.status)}`}>
                            <span className="status-dot"></span>
                            {project.status}
                          </span>
                        </td>
                        <td>
                          {isProjectLead 
                            ? (project.assignedDevelopers?.length || 0) + ' developers'
                            : getProjectLeadName(project)}
                        </td>
                        <td>{new Date(project.deadline).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => navigate(`/projects/${project._id}`)}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-projects">
                <span className="no-projects-icon">📭</span>
                <p>No projects found</p>
                {isProjectLead && (
                  <p className="no-projects-hint">Create a project to get started</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/projects" className="quick-action-btn">
                <span className="action-icon">📁</span>
                <span>All Projects</span>
              </Link>
              {isProjectLead && (
                <Link to="/users" className="quick-action-btn">
                  <span className="action-icon">👥</span>
                  <span>Team Members</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Your Role</h2>
          </div>
          <div className="card-body">
            <div className="role-info">
              <span className="role-badge">{userRole}</span>
              <p className="role-description">
                {isProjectLead 
                  ? 'You can create and manage projects, assign developers, and track progress.'
                  : 'You can view assigned projects, access project documents, and update task status.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
