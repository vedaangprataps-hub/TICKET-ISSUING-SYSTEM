const API_BASE = 'http://localhost:5000/api';

// Helper to get Authorization Header
const getAuthHeaders = () => {
  const token = localStorage.getItem('ticket_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Authentication APIs
export const loginApi = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
  return data;
};

export const registerApi = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed');
  return data;
};

export const fetchMeApi = async () => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Session expired');
  return data.user;
};

// Common APIs
export const fetchRoutes = async () => {
  const res = await fetch(`${API_BASE}/routes`);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch routes');
  return data.data;
};

export const createTicketApi = async (ticketPayload) => {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ticketPayload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to issue ticket');
  return data.data;
};

export const fetchTicketById = async (id) => {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) throw new Error('Please login again.');
    if (res.status === 403) throw new Error('You are not authorized to view this ticket.');
    if (res.status === 404) throw new Error('Ticket not found.');
    throw new Error(data.message || 'Failed to fetch ticket receipt');
  }
  return data.data;
};

// Cancel Ticket Helper Function
export const cancelTicket = async (id) => {
  const res = await fetch(`${API_BASE}/tickets/${id}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {}

  if (!res.ok || !data.success) {
    if (res.status === 401) throw new Error('Please login again.');
    if (res.status === 403) throw new Error('You are not authorized to cancel this ticket.');
    if (res.status === 404) throw new Error('Ticket not found.');
    if (res.status === 400) throw new Error('Ticket cannot be cancelled.');
    if (res.status === 500) throw new Error('Unable to cancel ticket. Please try again.');
    throw new Error(data.message || 'Unable to cancel ticket. Please try again.');
  }
  return data;
};

// Alias export for backward compatibility
export const cancelTicketApi = cancelTicket;

// User Portal APIs
export const fetchUserDashboard = async () => {
  const res = await fetch(`${API_BASE}/user/dashboard`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load user dashboard');
  return data.data;
};

export const fetchUserTickets = async () => {
  const res = await fetch(`${API_BASE}/user/tickets`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load user tickets');
  return data.data;
};

// Admin Portal APIs
export const fetchAdminDashboard = async () => {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load admin stats');
  return data.data;
};

export const fetchAdminRoutes = async () => {
  const res = await fetch(`${API_BASE}/admin/routes`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch admin routes');
  return data.data;
};

export const createAdminRoute = async (routeData) => {
  const res = await fetch(`${API_BASE}/admin/routes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(routeData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create route');
  return data.data;
};

export const updateAdminRoute = async (id, routeData) => {
  const res = await fetch(`${API_BASE}/admin/routes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(routeData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update route');
  return data.data;
};

export const deleteAdminRoute = async (id) => {
  const res = await fetch(`${API_BASE}/admin/routes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete route');
  return data.data;
};

export const fetchAdminUsers = async () => {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch user accounts');
  return data.data;
};

export const updateUserRoleApi = async (id, role) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update user role');
  return data;
};

export const deleteAdminUserApi = async (id) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete user');
  return data;
};

export const fetchAdminPassengers = async () => {
  const res = await fetch(`${API_BASE}/admin/passengers`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch passengers');
  return data.data;
};

export const fetchAdminTickets = async () => {
  const res = await fetch(`${API_BASE}/admin/tickets`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch admin tickets');
  return data.data;
};

export const fetchAdminPayments = async () => {
  const res = await fetch(`${API_BASE}/admin/payments`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch payment records');
  return data.data;
};
