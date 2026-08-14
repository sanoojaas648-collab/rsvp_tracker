const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server. Please try again.');
    err.status = 0;
    throw err;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseErr) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && data.message) || `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: (token) => request('/api/auth/me', { token }),

  listEvents: (token) => request('/api/events', { token }),
  getEvent: (id, token) => request(`/api/events/${id}`, { token }),
  createEvent: (payload, token) => request('/api/events', { method: 'POST', body: payload, token }),
  updateEvent: (id, payload, token) => request(`/api/events/${id}`, { method: 'PUT', body: payload, token }),
  deleteEvent: (id, token) => request(`/api/events/${id}`, { method: 'DELETE', token }),

  rsvp: (id, status, token) => request(`/api/events/${id}/rsvp`, { method: 'POST', body: { status }, token }),
  listRsvps: (id, token) => request(`/api/events/${id}/rsvps`, { token })
};

export default api;
