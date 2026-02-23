import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import './AssignDeveloperModal.css';

function AssignDeveloperModal({ isOpen, onClose, projectId, onSuccess }) {
  const toast = useToast();
  const [developers, setDevelopers] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDevelopers();
    }
  }, [isOpen]);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/developers');
      const devs = response.data.data || [];
      console.log('Fetched developers:', devs);
      setDevelopers(devs);
    } catch (err) {
      console.error('Fetch developers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDeveloper) {
      toast.error('Please select a developer');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/projects/${projectId}/assign`, {
        developerId: selectedDeveloper,
      });

      toast.success('Developer assigned successfully');
      onSuccess?.();
      handleClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to assign developer';
      toast.error(message);
      console.error('Assign developer error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDeveloper('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Developer</h2>
          <button className="modal-close" onClick={handleClose}>
            <span>✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading developers...</p>
            </div>
          ) : developers.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>No developers available</p>
              <span className="empty-hint">Add developers to assign them to projects</span>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="developer" className="form-label">
                Select Developer
              </label>
              <div className="select-wrapper">
                <select
                  id="developer"
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="form-select"
                  disabled={submitting}
                >
                  <option value="">Choose a developer...</option>
                  {developers.map((dev) => (
                    <option key={dev._id} value={dev._id}>
                      {dev.name} - {dev.email}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
              {selectedDeveloper && (
                <div className="selected-preview">
                  <div className="preview-avatar">
                    {developers
                      .find((d) => d._id === selectedDeveloper)
                      ?.name.charAt(0)
                      .toUpperCase()}
                  </div>
                  <span className="preview-name">
                    {developers.find((d) => d._id === selectedDeveloper)?.name}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loading || developers.length === 0}
            >
              {submitting ? (
                <>
                  <span className="spinner-small"></span>
                  Assigning...
                </>
              ) : (
                'Assign Developer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignDeveloperModal;
