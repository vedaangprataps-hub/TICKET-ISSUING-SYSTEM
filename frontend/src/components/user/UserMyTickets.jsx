import React, { useEffect, useState } from 'react';
import { fetchUserTickets, cancelTicket } from '../../api/api';

export default function UserMyTickets({ onViewTicket, setActiveTab }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchUserTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm(`Are you sure you want to cancel Ticket #${ticketId}? This action cannot be undone.`)) {
      return;
    }

    try {
      setCancellingId(ticketId);
      setError('');
      setSuccess('');
      await cancelTicket(ticketId);
      setSuccess('Ticket cancelled successfully');
      alert('Ticket cancelled successfully');
      await loadTickets(); // Refresh user ticket list immediately
    } catch (err) {
      setError(err.message || 'Unable to cancel ticket. Please try again.');
      alert(err.message || 'Unable to cancel ticket. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your tickets from database...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Travel Tickets</h1>
          <p className="page-subtitle">View and manage all travel tickets booked under your account</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('book')}>
          ➕ Book Ticket
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Route</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Issue Date</th>
                <th>Status</th>
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
                      <strong>{t.source}</strong> ➔ <strong>{t.destination}</strong>
                    </td>
                    <td>{t.ticket_type}</td>
                    <td>{t.quantity}</td>
                    <td>
                      <strong>₹{parseFloat(t.total_amount).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${t.payment_status === 'REFUNDED' ? 'badge-refunded' : 'badge-paid'}`}>
                        {t.payment_method} ({t.payment_status || 'PAID'})
                      </span>
                    </td>
                    <td>
                      {new Date(t.issue_date).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-booked'}`}>
                        {t.status}
                      </span>
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
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No tickets found for your account. Click "Book Ticket" to get started.
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
