const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// In-memory token cache for single-page session authorization headers
let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => {
  return inMemoryToken;
};

export const clearAuthToken = () => {
  inMemoryToken = null;
};

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Ensure HttpOnly cookies are passed
  };

  try {
    const response = await fetch(url, config);

    // If 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (data && data.detail) || (data && data.message) || response.statusText || 'Request failed';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const authApi = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiRequest('/auth/me', { method: 'GET' }),
  changePassword: (payload) => apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
};

export const userApi = {
  updateProfile: (payload) => apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteAccount: () => apiRequest('/users/me', { method: 'DELETE' }),
};

export const scanApi = {
  analyze: (payload) => apiRequest('/scans/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  getScans: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.risk_category && params.risk_category !== 'all') query.append('risk_category', params.risk_category);
    if (params.scan_type && params.scan_type !== 'all') query.append('scan_type', params.scan_type);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size);
    const qs = query.toString();
    return apiRequest(`/scans${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  getScanById: (id) => apiRequest(`/scans/${id}`, { method: 'GET' }),
  deleteScan: (id) => apiRequest(`/scans/${id}`, { method: 'DELETE' }),
  clearAllScans: () => apiRequest('/scans', { method: 'DELETE' }),
};

export const dashboardApi = {
  getStats: () => apiRequest('/dashboard/stats', { method: 'GET' }),
  getAdminMetrics: () => apiRequest('/admin/metrics', { method: 'GET' }),
};
