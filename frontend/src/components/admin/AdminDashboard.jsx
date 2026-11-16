import React, { useEffect, useState } from 'react';
import { fetchAdminDashboard } from '../../api/api';

export default function AdminDashboard({ setActiveTab, onViewTicket }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard stats.');
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
        <p style={{ color: 'var(--text-muted)' }}>Loading administrator dashboard statistics...</p>
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
          <h1 className="page-title">Administrator System Dashboard</h1>
          <p className="page-subtitle">Global system overview, revenue analytics, and recent transaction log</p>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Registered Users</h3>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Passengers</h3>
            <div className="stat-value">{stats?.totalPassengers || 0}</div>
          </div>
          <div className="stat-icon">🧍</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Tickets</h3>
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
            <h3>Active Revenue</h3>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              ₹{stats?.totalRevenue || '0.00'}
            </div>
          </div>
          <div className="stat-icon">💰</div>
        </div>
      </div>

      {/* Recent System Tickets Table */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent System Tickets</h2>
          <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('tickets')}>
            View All Tickets ➔
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Passenger</th>
                <th>Booked By User</th>
                <th>Route</th>
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
                      <strong>{t.passenger_name}</strong>
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>{t.passenger_phone}</small>
                    </td>
                    <td>
                      {t.user_name ? (
                        <div>
                          <span>{t.user_name}</span>
                          <br />
                          <small style={{ color: 'var(--text-muted)' }}>{t.user_email}</small>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Counter Operator</span>
                      )}
                    </td>
                    <td>
                      {t.source} ➔ {t.destination}
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
                        className="btn btn-sm btn-secondary"
                        onClick={() => onViewTicket(t.ticket_id)}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No system tickets issued yet.
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
