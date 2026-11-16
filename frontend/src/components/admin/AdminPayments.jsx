import React, { useEffect, useState } from 'react';
import { fetchAdminPayments } from '../../api/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchAdminPayments();
        setPayments(data);
      } catch (err) {
        setError(err.message || 'Failed to load payment logs.');
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading financial payment records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Payment Logs</h1>
          <p className="page-subtitle">Transaction receipts, payment methods, and refund status records</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Ticket ID</th>
                <th>Passenger</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Transaction Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td>
                      <span className="ticket-id-tag">#{p.payment_id}</span>
                    </td>
                    <td>
                      <strong>Ticket #{p.ticket_id}</strong>
                    </td>
                    <td>{p.passenger_name}</td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>
                        ₹{parseFloat(p.amount).toFixed(2)}
                      </strong>
                    </td>
                    <td>{p.payment_method}</td>
                    <td>
                      <span className={`badge ${p.payment_status === 'REFUNDED' ? 'badge-refunded' : 'badge-paid'}`}>
                        {p.payment_status || 'PAID'}
                      </span>
                    </td>
                    <td>
                      {new Date(p.issue_date).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No payment logs recorded yet.
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
