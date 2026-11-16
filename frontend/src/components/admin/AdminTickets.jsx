import React, { useEffect, useState } from 'react';
import { fetchAdminTickets, cancelTicket } from '../../api/api';

export default function AdminTickets({ onViewTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to load system tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm(`Administrator Action: Are you sure you want to cancel Ticket #${ticketId}?`)) {
      return;
    }

    try {
      setCancellingId(ticketId);
      setError('');
      setSuccess('');
      await cancelTicket(ticketId);
      setSuccess(`Ticket #${ticketId} status updated to CANCELLED.`);
      alert('Ticket cancelled successfully');
      await loadTickets();
    } catch (err) {
      setError(err.message || 'Failed to cancel ticket.');
      alert(err.message || 'Failed to cancel ticket.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading system ticket logs...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Ticket Management</h1>
          <p className="page-subtitle">View and audit all tickets issued across all passengers & counter operators</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Passenger</th>
                <th>User Account</th>
                <th>Route</th>
                <th>Type / Qty</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((t) => (
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
                      <strong>{t.source}</strong> ➔ <strong>{t.destination}</strong>
                    </td>
                    <td>
                      {t.ticket_type} (x{t.quantity})
                    </td>
                    <td>
                      <strong>₹{parseFloat(t.total_amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${t.payment_status === 'REFUNDED' ? 'badge-refunded' : 'badge-paid'}`}>
                        {t.payment_method} ({t.payment_status || 'PAID'})
                      </span>
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => onViewTicket(t.ticket_id)}
                        >
                          👁️ View
                        </button>
                        {t.status === 'BOOKED' && (
                          <button
                            className="btn btn-sm btn-danger"
                            disabled={cancellingId === t.ticket_id}
                            onClick={() => handleCancelTicket(t.ticket_id)}
                          >
                            {cancellingId === t.ticket_id ? 'Cancelling...' : '❌ Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No system tickets found.
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
