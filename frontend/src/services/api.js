/**
 * Campus Coin - Unified API Client
 */

const BASE_URL = 'https://slimy-dragons-spend.loca.lt/api';

const getHeaders = (isUpload = false) => {
  const token = localStorage.getItem('campus_coin_token');
  const headers = {};
  if (!isUpload) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // If not on login or home, notify auth change
    if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
      localStorage.removeItem('campus_coin_token');
      localStorage.removeItem('campus_coin_user');
      window.dispatchEvent(new Event('auth_logout'));
    }
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred with your request.');
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response;
};

export const api = {
  get: async (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${BASE_URL}${endpoint}?${query}` : `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  post: async (endpoint, body = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  put: async (endpoint, body = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  upload: async (endpoint, formData) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  downloadBlob: async (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${BASE_URL}${endpoint}?${query}` : `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error(`Failed to download: status ${res.status}`);
    }
    return res.blob();
  }
};

export default api;
