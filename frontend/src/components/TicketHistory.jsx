import React, { useEffect, useState } from 'react';
import { fetchAllTickets } from '../api/api';

export default function TicketHistory({ onViewTicket, setActiveTab }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to load ticket history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.ticket_id.toString().includes(term) ||
      t.passenger_name.toLowerCase().includes(term) ||
      t.passenger_phone.includes(term) ||
      t.source.toLowerCase().includes(term) ||
      t.destination.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading ticket history from database...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticket History Log</h1>
          <p className="page-subtitle">Complete records of all tickets issued in the system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('issue')}>
          ➕ Issue Ticket
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        {/* Search Bar */}
        <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by Ticket ID, Passenger Name, Phone, Station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* History Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Passenger</th>
                <th>Route</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Issue Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
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
                      <strong>{t.source}</strong> ➔ <strong>{t.destination}</strong>
                    </td>
                    <td>{t.ticket_type}</td>
                    <td>{t.quantity}</td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>
                        ₹{parseFloat(t.total_amount).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-paid">
                        {t.payment_method} - {t.payment_status || 'PAID'}
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
                        👁️ VIEW
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    {searchTerm ? 'No matching tickets found for your search query.' : 'No tickets stored in database.'}
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
