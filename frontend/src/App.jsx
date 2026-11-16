import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

// User Portal Components
import UserDashboard from './components/user/UserDashboard';
import UserBookTicket from './components/user/UserBookTicket';
import UserMyTickets from './components/user/UserMyTickets';

// Admin Portal Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoutes from './components/admin/AdminRoutes';
import AdminUsers from './components/admin/AdminUsers';
import AdminPassengers from './components/admin/AdminPassengers';
import AdminTickets from './components/admin/AdminTickets';
import AdminPayments from './components/admin/AdminPayments';

// Shared Components
import TicketReceipt from './components/TicketReceipt';
import { fetchMeApi } from './api/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('ticket_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ticket_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [verifying, setVerifying] = useState(true);

  // Validate session on startup
  useEffect(() => {
    const checkSession = async () => {
      if (token) {
        try {
          const me = await fetchMeApi();
          setUser(me);
          localStorage.setItem('ticket_user', JSON.stringify(me));
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          handleLogout();
        }
      }
      setVerifying(false);
    };
    checkSession();
  }, [token]);

  const handleLoginSuccess = (newToken, userObj) => {
    localStorage.setItem('ticket_token', newToken);
    localStorage.setItem('ticket_user', JSON.stringify(userObj));
    setToken(newToken);
    setUser(userObj);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('ticket_token');
    localStorage.removeItem('ticket_user');
    setToken('');
    setUser(null);
    setAuthView('login');
    setActiveTab('dashboard');
  };

  const handleTicketIssued = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('receipt');
  };

  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('receipt');
  };

  if (verifying) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying authentication session...</p>
      </div>
    );
  }

  // Unauthenticated State: Show Login or Register
  if (!token || !user) {
    return (
      <div className="app-container">
        {authView === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="app-container">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* SHARED TICKET RECEIPT VIEW */}
        {activeTab === 'receipt' && (
          <TicketReceipt
            ticketId={selectedTicketId}
            user={user}
            setActiveTab={setActiveTab}
            onIssueNew={() => setActiveTab(isAdmin ? 'tickets' : 'book')}
          />
        )}

        {/* ADMIN PORTAL VIEWS */}
        {isAdmin && activeTab === 'dashboard' && (
          <AdminDashboard setActiveTab={setActiveTab} onViewTicket={handleViewTicket} />
        )}
        {isAdmin && activeTab === 'routes' && <AdminRoutes />}
        {isAdmin && activeTab === 'users' && <AdminUsers />}
        {isAdmin && activeTab === 'passengers' && <AdminPassengers />}
        {isAdmin && activeTab === 'tickets' && (
          <AdminTickets onViewTicket={handleViewTicket} />
        )}
        {isAdmin && activeTab === 'payments' && <AdminPayments />}

        {/* USER PORTAL VIEWS */}
        {!isAdmin && activeTab === 'dashboard' && (
          <UserDashboard user={user} setActiveTab={setActiveTab} onViewTicket={handleViewTicket} />
        )}
        {!isAdmin && activeTab === 'book' && (
          <UserBookTicket user={user} onTicketIssued={handleTicketIssued} setActiveTab={setActiveTab} />
        )}
        {!isAdmin && activeTab === 'tickets' && (
          <UserMyTickets onViewTicket={handleViewTicket} setActiveTab={setActiveTab} />
        )}
      </main>

      <footer className="footer">
        <p>
          <strong>Ticket Issuing System</strong> — Full Stack Database Management System (DBMS) Project
        </p>
        <p style={{ fontSize: '11px', marginTop: '4px' }}>
          Logged in as: <strong>{user.name}</strong> ({user.email}) | Role: <strong>{user.role}</strong>
        </p>
      </footer>
    </div>
  );
}
