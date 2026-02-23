import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import './Users.css';

function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Developer',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user) => {
    console.log('=== OPEN EDIT MODAL ===');
    console.log('user._id:', user._id);
    console.log('user.id:', user.id);
    console.log('user:', user);
    console.log('=======================');

    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Developer',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        const userId = editingUser._id;
        console.log('=== UPDATE USER ===');
        console.log('userId:', userId);

        const { password, ...updateData } = formData;
        await api.put(`/users/${userId}`, updateData);

        toast.success('User updated successfully');
      } else {
        // Create new user
        console.log('=== CREATE USER ===');
        console.log('payload:', formData);

        await api.post('/users', formData);

        toast.success('User created successfully');
      }

      handleCloseModal();
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save user';
      toast.error(message);
      console.error('Save user error:', err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    const userId = user._id;
    const userName = user.name;

    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    console.log('=== DELETE USER ===');
    console.log('userId:', userId);
    console.log('userName:', userName);

    if (!userId) {
      toast.error('User ID is missing');
      return;
    }

    try {
      setSubmitting(true);
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      console.error('Delete user error:', err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleClass = (role) => {
    return `role-${role.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="users-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">Manage system users and roles</p>
          </div>
          <button className="btn btn-primary" disabled>
            + Add User
          </button>
        </div>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="skeleton-row">
                  <td><div className="skeleton-avatar-text"></div></td>
                  <td><div className="skeleton-text"></div></td>
                  <td><div className="skeleton-badge"></div></td>
                  <td><div className="skeleton-text-short"></div></td>
                  <td><div className="skeleton-btn-group"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="users-page">
        <div className="users-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">Manage system users and roles</p>
          </div>
        </div>
        <div className="error-container">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <h3>Unable to load users</h3>
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="header-content">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            {users.length} {users.length === 1 ? 'user' : 'users'} in the system
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span className="btn-icon">+</span>
          Add User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <span className="empty-icon">👥</span>
                  <p>No users found</p>
                  <span className="empty-hint">Add your first user to get started</span>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="status-indicator active">
                      <span className="status-dot"></span>
                      Active
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon-table"
                        onClick={() => handleOpenModal(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-icon-table delete"
                        onClick={() => handleDelete(user)}
                        disabled={submitting}
                      >
                        {submitting ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingUser ? 'Edit User' : 'Create User'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <span>✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Enter name"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="Enter email"
                  required
                  disabled={submitting}
                />
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    placeholder="Enter password"
                    required
                    minLength={6}
                    disabled={submitting}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Role
                </label>
                <div className="select-wrapper">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                    disabled={submitting}
                  >
                    <option value="Developer">Developer</option>
                    <option value="ProjectLead">Project Lead</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-small"></span>
                      {editingUser ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingUser ? 'Update User' : 'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
