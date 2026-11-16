import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../api/api';

export default function Dashboard({ setActiveTab, onViewTicket }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server.');
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
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard statistics from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        ⚠️ <strong>Database Error:</strong> {error}
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
          <h1 className="page-title">Operator Dashboard</h1>
          <p className="page-subtitle">Overview of ticket issuance & transaction revenue</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('issue')}>
          ➕ ISSUE NEW TICKET
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Tickets Issued</h3>
            <div className="stat-value">{stats?.totalTickets || 0}</div>
          </div>
          <div className="stat-icon">🎫</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              ₹{stats?.totalRevenue || '0.00'}
            </div>
          </div>
          <div className="stat-icon">💰</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>System Status</h3>
            <div className="stat-value" style={{ fontSize: '18px', color: 'var(--success)' }}>
              🟢 ACTIVE
            </div>
          </div>
          <div className="stat-icon">⚡</div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Tickets Issued</h2>
          <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('history')}>
            View All History ➔
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Passenger</th>
                <th>Route</th>
                <th>Type / Qty</th>
                <th>Amount</th>
                <th>Issue Date</th>
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
                      {t.source} ➔ {t.destination}
                    </td>
                    <td>
                      {t.ticket_type} (x{t.quantity})
                    </td>
                    <td>
                      <strong>₹{parseFloat(t.total_amount).toFixed(2)}</strong>
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
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No tickets issued yet. Click "ISSUE NEW TICKET" to create one.
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
