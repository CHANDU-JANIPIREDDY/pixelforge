import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { isAdmin, isProjectLead, canManageProjects } from '../../utils/auth';
import { useToast } from '../../context/ToastContext';
import UploadDocumentModal from '../../components/Modal/UploadDocumentModal';
import AssignDeveloperModal from '../../components/Modal/AssignDeveloperModal';
import './ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [removingDevId, setRemovingDevId] = useState(null);

  const userIsAdmin = isAdmin();
  const userIsProjectLead = isProjectLead();
  const canManageProj = canManageProjects();

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load project details');
      console.error('Project fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownload = async (filename) => {
    try {
      const response = await api.get(`/projects/${id}/documents/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  const handleRemoveDeveloper = async (developerId) => {
    if (!confirm('Are you sure you want to remove this developer from the project?')) {
      return;
    }

    setRemovingDevId(developerId);
    try {
      await api.post(`/projects/${id}/remove-developer`, {
        developerId,
      });
      toast.success('Developer removed successfully');
      fetchProject();
    } catch (err) {
      console.error('Remove developer error:', err);
      toast.error(err.response?.data?.message || 'Failed to remove developer');
    } finally {
      setRemovingDevId(null);
    }
  };

  const isProjectLeadOfThisProject = () => {
    if (!project?.projectLead) return false;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return project.projectLead._id === currentUser?._id || project.projectLead._id === currentUser?.id;
  };

  const canAssignDevelopers = userIsProjectLead && isProjectLeadOfThisProject();
  const canUploadDocuments = userIsAdmin || isProjectLeadOfThisProject();
  const canEditProject = userIsAdmin;
  const canRemoveDevelopers = userIsAdmin || (userIsProjectLead && isProjectLeadOfThisProject());

  const getStatusClass = (status) => {
    return status === 'Active' ? 'status-active' : 'status-completed';
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        </div>
        <div className="detail-loading">
          <div className="skeleton-title"></div>
          <div className="skeleton-status"></div>
        </div>
        <div className="detail-grid">
          <div className="detail-card skeleton-card">
            <div className="skeleton-section-title"></div>
            <div className="skeleton-lines">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
          <div className="detail-card skeleton-card">
            <div className="skeleton-section-title"></div>
            <div className="skeleton-avatar-large"></div>
            <div className="skeleton-lines">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        </div>
        <div className="error-container">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <h3>Unable to load project</h3>
            <p>{error || 'Project not found'}</p>
            <div className="error-actions">
              <button onClick={fetchProject} className="btn btn-primary">
                Retry
              </button>
              <button onClick={() => navigate('/projects')} className="btn btn-secondary">
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <div className="header-actions">
          {canEditProject && (
            <button className="btn btn-secondary">Edit Project</button>
          )}
          {canEditProject && (
            <button className="btn btn-primary">Mark Complete</button>
          )}
        </div>
      </div>

      <div className="project-hero">
        <div className="hero-content">
          <h1 className="project-title">{project.name}</h1>
          <div className="project-meta">
            <span className={`status-badge ${getStatusClass(project.status)}`}>
              <span className="status-dot"></span>
              {project.status}
            </span>
            <span className="deadline-badge">
              <span className="meta-icon">📅</span>
              Deadline: {formatDate(project.deadline)}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card full-width">
          <div className="card-header">
            <h2 className="card-title">📋 Description</h2>
          </div>
          <div className="card-body">
            <p className="description-text">
              {project.description || 'No description provided for this project.'}
            </p>
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h2 className="card-title">👤 Project Lead</h2>
          </div>
          <div className="card-body">
            {project.projectLead ? (
              <div className="lead-profile">
                <div className="lead-avatar-large">
                  {project.projectLead.name.charAt(0).toUpperCase()}
                </div>
                <div className="lead-info">
                  <span className="lead-name">{project.projectLead.name}</span>
                  <span className="lead-email">{project.projectLead.email}</span>
                </div>
              </div>
            ) : (
              <p className="no-data">No project lead assigned</p>
            )}
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h2 className="card-title">👥 Team Members</h2>
            <span className="card-count">{project.assignedDevelopers?.length || 0}</span>
          </div>
          <div className="card-body">
            {project.assignedDevelopers && project.assignedDevelopers.length > 0 ? (
              <div className="developers-grid">
                {project.assignedDevelopers.map((developer) => (
                  <div key={developer._id} className="developer-card">
                    <div className="developer-avatar">
                      {developer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="developer-info">
                      <span className="developer-name">{developer.name}</span>
                      <span className="developer-email">{developer.email}</span>
                      <span className="developer-role">Developer</span>
                    </div>
                    {canRemoveDevelopers && (
                      <button
                        className="btn-remove-dev"
                        onClick={() => handleRemoveDeveloper(developer._id)}
                        disabled={removingDevId === developer._id}
                        title="Remove developer"
                      >
                        {removingDevId === developer._id ? '⏳' : '❌'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No developers assigned yet</p>
            )}
            {canAssignDevelopers && (
              <button
                className="btn btn-sm btn-secondary full-width"
                onClick={() => setIsAssignOpen(true)}
              >
                + Assign Developer
              </button>
            )}
          </div>
        </div>

        <div className="detail-card full-width">
          <div className="card-header">
            <h2 className="card-title">📎 Documents</h2>
            <span className="card-count">{project.documents?.length || 0}</span>
          </div>
          <div className="card-body">
            {project.documents && project.documents.length > 0 ? (
              <div className="documents-list">
                {project.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">📄</div>
                    <div className="document-info">
                      <span className="document-name">{doc.originalName}</span>
                      <span className="document-date">
                        Uploaded: {formatDate(doc.uploadDate)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(doc.filename)}
                      className="btn btn-sm btn-icon-only"
                      title="Download"
                    >
                      ⬇️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No documents uploaded yet</p>
            )}
            {canUploadDocuments && (
              <button
                className="btn btn-sm btn-secondary full-width"
                onClick={() => setShowUploadModal(true)}
              >
                📎 Upload Document
              </button>
            )}
          </div>
        </div>
      </div>

      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        projectId={id}
        onSuccess={() => {
          setShowUploadModal(false);
          fetchProject();
        }}
      />

      <AssignDeveloperModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        projectId={id}
        onSuccess={() => {
          setIsAssignOpen(false);
          fetchProject();
        }}
      />
    </div>
  );
}

export default ProjectDetail;
