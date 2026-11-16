import React, { useEffect, useState } from 'react';
import { fetchAdminPassengers } from '../../api/api';

export default function AdminPassengers() {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPassengers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchAdminPassengers();
        setPassengers(data);
      } catch (err) {
        setError(err.message || 'Failed to load passengers database.');
      } finally {
        setLoading(false);
      }
    };
    loadPassengers();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading passenger records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Passenger Records</h1>
          <p className="page-subtitle">Master record of passengers registered in transport database</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Passenger ID</th>
                <th>Passenger Name</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length > 0 ? (
                passengers.map((p) => (
                  <tr key={p.passenger_id}>
                    <td>
                      <span className="ticket-id-tag">#{p.passenger_id}</span>
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.phone || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No passenger records found.
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
