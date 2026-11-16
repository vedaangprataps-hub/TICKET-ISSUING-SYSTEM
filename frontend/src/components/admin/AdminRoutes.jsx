import React, { useEffect, useState } from 'react';
import { fetchAdminRoutes, createAdminRoute, updateAdminRoute, deleteAdminRoute } from '../../api/api';

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err.message || 'Failed to load routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    setSource('');
    setDestination('');
    setFare('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    setSource(route.source);
    setDestination(route.destination);
    setFare(route.fare);
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!source.trim() || !destination.trim() || !fare) {
      setError('All fields are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingRoute) {
        await updateAdminRoute(editingRoute.route_id, { source, destination, fare });
        setSuccess(`Route #${editingRoute.route_id} updated successfully!`);
      } else {
        await createAdminRoute({ source, destination, fare });
        setSuccess('New transport route added successfully!');
      }
      setShowModal(false);
      await loadRoutes();
    } catch (err) {
      setError(err.message || 'Failed to save route.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm(`Are you sure you want to delete Route #${routeId}?`)) return;

    try {
      setError('');
      setSuccess('');
      await deleteAdminRoute(routeId);
      setSuccess(`Route #${routeId} deleted successfully!`);
      await loadRoutes();
    } catch (err) {
      setError(err.message || 'Failed to delete route.');
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading routes database...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Route Management</h1>
          <p className="page-subtitle">Configure available transport origin, destination & fare rates</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          ➕ ADD NEW ROUTE
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Source Station</th>
                <th>Destination Station</th>
                <th>Fare (INR)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.length > 0 ? (
                routes.map((r) => (
                  <tr key={r.route_id}>
                    <td>
                      <span className="ticket-id-tag">#{r.route_id}</span>
                    </td>
                    <td>
                      <strong>{r.source}</strong>
                    </td>
                    <td>
                      <strong>{r.destination}</strong>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>₹{parseFloat(r.fare).toFixed(2)}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(r)}>
                          ✏️ Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.route_id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No routes found. Click "Add New Route" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup for Add / Edit Route */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              {editingRoute ? `Edit Route #${editingRoute.route_id}` : 'Add New Transport Route'}
            </h2>

            {error && <div className="alert alert-error" style={{ fontSize: '13px' }}>⚠️ {error}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Source Station *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Chennai Central"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination Station *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Tambaram"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fare per Ticket (₹) *</label>
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 40.00"
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
