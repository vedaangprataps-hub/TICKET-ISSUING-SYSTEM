import React, { useEffect, useState } from 'react';
import { fetchAdminUsers, updateUserRoleApi, deleteAdminUserApi } from '../../api/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change role of User #${userId} to ${newRole}?`)) return;

    try {
      setError('');
      setSuccess('');
      await updateUserRoleApi(userId, newRole);
      setSuccess(`Role of User #${userId} updated to ${newRole}!`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete User account #${userId}?`)) return;

    try {
      setError('');
      setSuccess('');
      await deleteAdminUserApi(userId);
      setSuccess(`User account #${userId} deleted successfully!`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading user directory...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account Management</h1>
          <p className="page-subtitle">View system users, change roles, and manage administrator access</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.user_id}>
                    <td>
                      <span className="ticket-id-tag">#{u.user_id}</span>
                    </td>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {new Date(u.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleRoleToggle(u.user_id, u.role)}
                        >
                          🔄 Toggle Role
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(u.user_id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No registered user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
