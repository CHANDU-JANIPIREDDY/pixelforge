import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import './CreateProjectModal.css';

function EditProjectModal({ isOpen, project, onClose, onSuccess }) {
  const toast = useToast();
  const [projectLeads, setProjectLeads] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    projectLead: '',
    assignedDevelopers: [],
    status: 'Active',
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (project) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
          projectLead: project.projectLead?._id || project.projectLead || '',
          assignedDevelopers: project.assignedDevelopers?.map((dev) => dev._id || dev) || [],
          status: project.status || 'Active',
        });
      }
    }
  }, [isOpen, project]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const allUsers = response.data.data || [];
      setProjectLeads(allUsers.filter((user) =>
        user.role === 'Admin' || user.role === 'ProjectLead'
      ));
      setDevelopers(allUsers.filter((user) => user.role === 'Developer'));
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectLead) {
      toast.error('Please select a project lead');
      return;
    }

    if (!project?._id) {
      toast.error('Invalid project ID');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        deadline: formData.deadline,
        projectLead: formData.projectLead,
        assignedDevelopers: formData.assignedDevelopers,
        status: formData.status,
      };

      const response = await api.put(`/projects/${project._id}`, payload);
      toast.success('Project updated successfully');
      onSuccess?.(response.data.data);
      handleClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update project';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      deadline: '',
      projectLead: '',
      assignedDevelopers: [],
      status: 'Active',
    });
    onClose?.();
  };

  const handleDeveloperToggle = (devId) => {
    setFormData((prev) => ({
      ...prev,
      assignedDevelopers: prev.assignedDevelopers.includes(devId)
        ? prev.assignedDevelopers.filter((id) => id !== devId)
        : [...prev.assignedDevelopers, devId],
    }));
  };

  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container create-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Project</h2>
          <button className="modal-close" onClick={handleClose}>
            <span>✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="Enter project name"
              required
              disabled={submitting || loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              placeholder="Enter project description"
              rows={3}
              required
              disabled={submitting || loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline" className="form-label">
              Deadline *
            </label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="form-input"
              required
              disabled={submitting || loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status *
            </label>
            <div className="select-wrapper">
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
                required
                disabled={submitting || loading}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="projectLead" className="form-label">
              Project Lead *
            </label>
            <div className="select-wrapper">
              <select
                id="projectLead"
                value={formData.projectLead}
                onChange={(e) => setFormData({ ...formData, projectLead: e.target.value })}
                className="form-select"
                required
                disabled={submitting || loading}
              >
                <option value="">Select a project lead...</option>
                {projectLeads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.name} - {lead.email} ({lead.role})
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
            {projectLeads.length === 0 && !loading && (
              <p className="form-hint">No Admin or Project Lead available.</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Developers</label>
            <div className="developers-list">
              {developers.length === 0 ? (
                <p className="empty-hint">No developers available</p>
              ) : (
                developers.map((dev) => (
                  <label key={dev._id} className="developer-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.assignedDevelopers.includes(dev._id)}
                      onChange={() => handleDeveloperToggle(dev._id)}
                      disabled={submitting || loading}
                    />
                    <span className="checkbox-label">
                      <span className="dev-avatar">{dev.name.charAt(0).toUpperCase()}</span>
                      <span className="dev-name">{dev.name}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loading || projectLeads.length === 0}
            >
              {submitting ? (
                <>
                  <span className="spinner-small"></span>
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;
