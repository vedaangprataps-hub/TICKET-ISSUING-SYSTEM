import React, { useState, useEffect } from 'react';
import { fetchRoutes, createTicketApi } from '../../api/api';

export default function UserBookTicket({ user, onTicketIssued, setActiveTab }) {
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State - Pre-fill passenger name and phone from logged in user
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [ticketType, setTicketType] = useState('Adult');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const data = await fetchRoutes();
        setRoutes(data);
        if (data.length > 0) {
          setSelectedSource(data[0].source);
        }
      } catch (err) {
        setError('Failed to load available transport routes.');
      } finally {
        setLoadingRoutes(false);
      }
    };
    loadRoutes();
  }, []);

  const availableSources = Array.from(new Set(routes.map((r) => r.source)));
  const availableDestinations = routes.filter((r) => r.source === selectedSource);

  useEffect(() => {
    if (availableDestinations.length > 0) {
      if (!availableDestinations.some((r) => r.destination === selectedDestination)) {
        setSelectedDestination(availableDestinations[0].destination);
      }
    } else {
      setSelectedDestination('');
    }
  }, [selectedSource, routes]);

  const currentRoute = routes.find(
    (r) => r.source === selectedSource && r.destination === selectedDestination
  );

  const farePerTicket = currentRoute ? parseFloat(currentRoute.fare) : 0;
  const totalAmount = (farePerTicket * Math.max(1, parseInt(quantity || 1, 10))).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentRoute) {
      setError('Please select a valid route.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim() || user?.name,
        phone: phone.trim() || user?.phone,
        route_id: currentRoute.route_id,
        ticket_type: ticketType,
        quantity: parseInt(quantity, 10),
        payment_method: paymentMethod,
      };

      const newTicket = await createTicketApi(payload);
      onTicketIssued(newTicket.ticket_id);
    } catch (err) {
      setError(err.message || 'Error booking ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRoutes) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading transport routes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Book a Travel Ticket</h1>
          <p className="page-subtitle">Select destination route and confirm your booking</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>
          ✖ Cancel
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ <strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Form Controls */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
              Passenger & Journey Details
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label>Passenger Name (Auto-filled)</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number (Auto-filled)</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Source Station *</label>
                <select
                  className="form-control"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  {availableSources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Destination Station *</label>
                <select
                  className="form-control"
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                >
                  {availableDestinations.map((r) => (
                    <option key={r.route_id} value={r.destination}>
                      {r.destination} (₹{r.fare})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ticket Category</label>
                <select
                  className="form-control"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                >
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Senior">Senior Citizen</option>
                  <option value="Student">Student Concession</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || 1, 10)))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <div className="radio-group">
                {['UPI', 'Cash', 'Card'].map((method) => (
                  <div
                    key={method}
                    className={`radio-card ${paymentMethod === method ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span>
                      {method === 'UPI' && '📱 UPI / QR'}
                      {method === 'Cash' && '💵 Cash'}
                      {method === 'Card' && '💳 Card'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fare Summary Box */}
          <div className="fare-summary-card">
            <div>
              <div className="fare-summary-title">
                <span>🧾 Booking Fare Summary</span>
              </div>

              <div className="summary-row">
                <span>Route:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                  {selectedSource} ➔ {selectedDestination}
                </span>
              </div>

              <div className="summary-row">
                <span>Passenger:</span>
                <span>{name}</span>
              </div>

              <div className="summary-row">
                <span>Fare per Ticket:</span>
                <span>₹{farePerTicket.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Quantity:</span>
                <span>x {quantity}</span>
              </div>

              <div className="summary-row total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              style={{ width: '100%', marginTop: '24px' }}
            >
              {submitting ? 'Confirming Ticket...' : '🎟️ BOOK TICKET NOW'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
