import React, { useEffect, useState } from 'react';
import { fetchTicketById, cancelTicket } from '../api/api';

export default function TicketReceipt({ ticketId, user, setActiveTab, onIssueNew }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Failed to load ticket receipt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadReceipt();
    }
  }, [ticketId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelTicket = async () => {
    if (!window.confirm(`Are you sure you want to cancel Ticket #${ticketId}?`)) return;

    try {
      setCancelling(true);
      setError('');
      await cancelTicket(ticketId);
      alert('Ticket cancelled successfully');
      await loadReceipt(); // Reload ticket details immediately
    } catch (err) {
      alert(err.message || 'Unable to cancel ticket. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving ticket receipt from database...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="alert alert-error">
        ⚠️ <strong>Error:</strong> {error || 'Ticket record not found.'}
        <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('dashboard')} style={{ marginLeft: 'auto' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isCancelled = ticket.status === 'CANCELLED';
  const isUserOwnTicket = !user || user.role === 'ADMIN' || (ticket.user_id && ticket.user_id === user.user_id);

  return (
    <div className="ticket-receipt-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issued Ticket Voucher</h1>
          <p className="page-subtitle">Official passenger travel document stored in MySQL database</p>
        </div>
      </div>

      {isCancelled ? (
        <div className="alert alert-error">
          🚫 <strong>Status: CANCELLED</strong> — This ticket was cancelled and marked for refund. It is no longer valid for travel.
        </div>
      ) : (
        <div className="alert alert-success">
          ✅ <strong>Status: BOOKED</strong> — Ticket #{ticket.ticket_id} is active and verified in database!
        </div>
      )}

      {/* Printable Ticket Card */}
      <div className="ticket-card">
        <div className="ticket-header" style={{ background: isCancelled ? '#475569' : 'var(--nav-bg)' }}>
          <div>
            <div className="ticket-header-title">TRANSPORT TRAVEL TICKET</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
              State Transport Corporation
            </div>
          </div>
          <div className="ticket-id-tag">TICKET #{ticket.ticket_id}</div>
        </div>

        <div className="ticket-body">
          {/* Route Banner */}
          <div className="ticket-route-banner">
            <div className="route-stop">
              <div className="label">Origin</div>
              <div className="city">{ticket.source}</div>
            </div>
            <div className="route-arrow">➔</div>
            <div className="route-stop">
              <div className="label">Destination</div>
              <div className="city">{ticket.destination}</div>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="ticket-details-grid">
            <div className="detail-item">
              <label>Passenger Name</label>
              <span>{ticket.passenger_name}</span>
            </div>

            <div className="detail-item">
              <label>Phone Number</label>
              <span>{ticket.passenger_phone}</span>
            </div>

            <div className="detail-item">
              <label>Category / Type</label>
              <span>{ticket.ticket_type}</span>
            </div>

            <div className="detail-item">
              <label>Quantity</label>
              <span>{ticket.quantity} Person(s)</span>
            </div>

            <div className="detail-item">
              <label>Fare per Ticket</label>
              <span>₹{parseFloat(ticket.fare).toFixed(2)}</span>
            </div>

            <div className="detail-item">
              <label>Total Amount Paid</label>
              <span style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '700' }}>
                ₹{parseFloat(ticket.total_amount).toFixed(2)}
              </span>
            </div>

            <div className="detail-item">
              <label>Payment Method</label>
              <span>{ticket.payment_method}</span>
            </div>

            <div className="detail-item">
              <label>Payment Status</label>
              <span className={`badge ${isCancelled ? 'badge-refunded' : 'badge-paid'}`}>
                {ticket.payment_status || 'PAID'}
              </span>
            </div>

            <div className="detail-item">
              <label>Booking Status</label>
              <span className={`badge ${isCancelled ? 'badge-cancelled' : 'badge-booked'}`}>
                {ticket.status}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="ticket-footer">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
              ISSUE TIMESTAMP
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace' }}>
              {new Date(ticket.issue_date).toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'medium',
              })}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
              DATABASE STATUS
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: isCancelled ? 'var(--danger)' : 'var(--success)' }}>
              {isCancelled ? '❌ CANCELLED' : '✔ VALID FOR TRAVEL'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ticket-actions">
        <button className="btn btn-primary btn-lg" onClick={handlePrint}>
          🖨️ PRINT TICKET
        </button>

        {!isCancelled && isUserOwnTicket && (
          <button className="btn btn-danger btn-lg" disabled={cancelling} onClick={handleCancelTicket}>
            {cancelling ? 'Cancelling...' : '❌ CANCEL TICKET'}
          </button>
        )}

        {user?.role === 'USER' && (
          <button className="btn btn-secondary btn-lg" onClick={() => setActiveTab('tickets')}>
            📜 MY TICKETS
          </button>
        )}

        <button className="btn btn-secondary btn-lg" onClick={() => setActiveTab('dashboard')}>
          ⬅️ BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
}
