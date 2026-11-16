import React, { useEffect, useState } from 'react';
import { fetchUserDashboard } from '../../api/api';

export default function UserDashboard({ user, setActiveTab, onViewTicket }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchUserDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your passenger dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        ⚠️ <strong>Error:</strong> {error}
        <button className="btn btn-sm btn-secondary" onClick={loadDashboard} style={{ marginLeft: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name || 'Passenger'} 👋</h1>
          <p className="page-subtitle">Passenger Portal & Ticket Booking Dashboard</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('book')}>
          ➕ BOOK A TICKET
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <div className="stat-value">{stats?.totalTickets || 0}</div>
          </div>
          <div className="stat-icon">🎫</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Tickets</h3>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {stats?.activeTickets || 0}
            </div>
          </div>
          <div className="stat-icon">🟢</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Cancelled</h3>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>
              {stats?.cancelledTickets || 0}
            </div>
          </div>
          <div className="stat-icon">🚫</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Spent</h3>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              ₹{stats?.totalSpending || '0.00'}
            </div>
          </div>
          <div className="stat-icon">💳</div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Your Recent Tickets</h2>
          <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('tickets')}>
            View All My Tickets ➔
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Route</th>
                <th>Type / Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTickets && stats.recentTickets.length > 0 ? (
                stats.recentTickets.map((t) => (
                  <tr key={t.ticket_id}>
                    <td>
                      <span className="ticket-id-tag">#{t.ticket_id}</span>
                    </td>
                    <td>
                      <strong>{t.source}</strong> ➔ <strong>{t.destination}</strong>
                    </td>
                    <td>
                      {t.ticket_type} (x{t.quantity})
                    </td>
                    <td>
                      <strong>₹{parseFloat(t.total_amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-booked'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {new Date(t.issue_date).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onViewTicket(t.ticket_id)}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    You have not booked any tickets yet. Click "BOOK A TICKET" to reserve a journey.
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
