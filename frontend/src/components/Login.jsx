import React, { useState } from 'react';
import { loginApi } from '../api/api';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await loginApi(email, password);
      onLoginSuccess(response.token, response.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@ticket.com');
    setPassword('admin123');
  };

  const fillDemoUser = () => {
    setEmail('rahul@gmail.com');
    setPassword('user123');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon" style={{ margin: '0 auto 12px auto', width: '48px', height: '48px', fontSize: '24px' }}>
            🎫
          </div>
          <h2>TICKET ISSUING SYSTEM</h2>
          <p className="page-subtitle">Login to your Passenger or Administrator account</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="demo-credentials-box">
          <div className="demo-credentials-title">🔑 Quick Demo Credentials (Click to fill)</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="button" className="btn btn-sm btn-secondary" onClick={fillDemoAdmin} style={{ flex: 1 }}>
              🛡️ Fill Admin Login
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={fillDemoUser} style={{ flex: 1 }}>
              👤 Fill User Login
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. admin@ticket.com or rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {loading ? 'Authenticating...' : '🔐 LOGIN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            Register New Account
          </button>
        </div>
      </div>
    </div>
  );
}
