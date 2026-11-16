import React from 'react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">🎫</div>
        <div>
          <span>TICKET ISSUING SYSTEM</span>
          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>
            {isAdmin ? '🛡️ ADMIN PANEL' : '👤 PASSENGER PORTAL'}
          </span>
        </div>
      </div>

      <nav className="nav-links">
        {/* User Pill Badge */}
        {user && (
          <div className="user-pill">
            <span>👋 {user.name}</span>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
              {user.role}
            </span>
          </div>
        )}

        {/* ADMIN NAV LINKS */}
        {isAdmin ? (
          <>
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-item ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              🗺️ Routes
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button
              className={`nav-item ${activeTab === 'passengers' ? 'active' : ''}`}
              onClick={() => setActiveTab('passengers')}
            >
              🧍 Passengers
            </button>
            <button
              className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              🎫 Tickets
            </button>
            <button
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              💳 Payments
            </button>
          </>
        ) : (
          /* USER NAV LINKS */
          <>
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-item ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
            >
              🎟️ Book Ticket
            </button>
            <button
              className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              📜 My Tickets
            </button>
          </>
        )}

        {/* LOGOUT BUTTON */}
        <button className="nav-item" onClick={onLogout} style={{ color: '#f87171' }}>
          🚪 Logout
        </button>
      </nav>
    </header>
  );
}
