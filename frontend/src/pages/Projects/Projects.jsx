import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { canManageProjects, isAdmin } from '../../utils/auth';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import CreateProjectModal from '../../components/Modal/CreateProjectModal';
import EditProjectModal from '../../components/Modal/EditProjectModal';
import './Projects.css';

function Projects() {
  const toast = useToast();
  const canManageProj = canManageProjects();
  const isAdminUser = isAdmin();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load projects';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedProject) => {
    setProjects((prev) =>
      prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
    );
  };

  const handleMarkComplete = async (projectId) => {
    try {
      const response = await api.patch(`/projects/${projectId}/complete`);
      const updatedProject = response.data.data;
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
      toast.success('Project marked as completed');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to mark project as complete';
      toast.error(message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    return status === 'Active' ? 'status-active' : 'status-completed';
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage and track all your projects</p>
          </div>
          {canManageProj && (
            <button className="btn btn-primary" disabled>
              + New Project
            </button>
          )}
        </div>
        <div className="projects-table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Project Lead</th>
                <th>Team</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="skeleton-row">
                  <td><div className="skeleton-text"></div></td>
                  <td><div className="skeleton-badge"></div></td>
                  <td><div className="skeleton-text"></div></td>
                  <td><div className="skeleton-text-short"></div></td>
                  <td><div className="skeleton-text"></div></td>
                  <td><div className="skeleton-btn-group"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="projects-page">
        <div className="projects-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage and track all your projects</p>
          </div>
        </div>
        <div className="error-container">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <h3>Unable to load projects</h3>
            <p>{error}</p>
            <button onClick={fetchProjects} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div className="header-content">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
          </p>
        </div>
        {canManageProj && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="btn-icon">+</span>
            New Project
          </button>
        )}
      </div>

      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Project Lead</th>
              <th>Team</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <span className="empty-icon">📁</span>
                  <p>No projects found</p>
                  <span className="empty-hint">
                    {canManageProj ? 'Create your first project to get started' : 'No projects available'}
                  </span>
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <div className="project-info">
                      <span className="project-name">{project.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(project.status)}`}>
                      <span className="status-dot"></span>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="lead-info">
                      <div className="lead-avatar">
                        {project.projectLead?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="lead-details">
                        <span className="lead-name">{project.projectLead?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="team-count">
                      <span className="team-avatar-stack">
                        {project.assignedDevelopers?.slice(0, 3).map((dev, index) => (
                          <span key={index} className="mini-avatar">
                            {dev.name?.charAt(0) || 'D'}
                          </span>
                        ))}
                        {project.assignedDevelopers?.length > 3 && (
                          <span className="mini-avatar more">
                            +{project.assignedDevelopers.length - 3}
                          </span>
                        )}
                      </span>
                      <span className="count-text">
                        {project.assignedDevelopers?.length || 0} developers
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="deadline">
                      {formatDate(project.deadline)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/projects/${project._id}`}
                        className="btn-icon-table"
                        title="View"
                      >
                        View
                      </Link>
                      {canManageProj && (
                        <button
                          className="btn-icon-table btn-edit"
                          onClick={() => handleEditClick(project)}
                          title="Edit"
                        >
                          Edit
                        </button>
                      )}
                      {isAdminUser && project.status !== 'Completed' && (
                        <button
                          className="btn-icon-table btn-complete"
                          onClick={() => handleMarkComplete(project._id)}
                          title="Mark Complete"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchProjects();
        }}
      />

      <EditProjectModal
        isOpen={showEditModal}
        project={selectedProject}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

export default Projects;
