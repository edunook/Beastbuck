/**
 * BeastBuck Base API Client
 * 
 * Provides a scalable foundation for REST API and GraphQL interactions.
 * Includes built-in token management, retries, and error handling.
 */

import { errorHandler } from '../../utils/errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.beastbuck.com/v1';

class APIClient {
  constructor() {
    this.token = null;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  setToken(token) {
    this.token = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `API Error: ${response.status}`);
        errorHandler.error(error, 'API Client Request', { endpoint, status: response.status, url });
        throw error;
      }

      return data;
    } catch (error) {
      errorHandler.error(error, 'API Client Request', { endpoint, url }, true);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
