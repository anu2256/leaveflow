const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed')
  }

  return data
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(token) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getLeaveRequests(token) {
  return request('/leave-requests', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getBalances(token, year) {
  return request(`/balances?year=${year}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createLeaveRequest(token, data) {
  return request('/leave-requests', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export function decideLeaveRequest(token, id, action, decision_note) {
  return request(`/leave-requests/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action,
      decision_note,
    }),
  })
}

export function cancelLeaveRequest(token, id) {
  return request(`/leave-requests/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getTeamRequests(token) {
  return request('/team/requests', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}