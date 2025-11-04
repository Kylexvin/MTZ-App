// src/services/api.js

// Use environment-based URL with fallback
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.6:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log(`🔄 API Request: ${endpoint}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async loginWithPhone(phone, password) {
    return this.request('/auth/login-phone', {
      method: 'POST',
      body: { phone, password },
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async verifyPaymentPublic(phone, mpesaCode) {
    return this.request('/auth/verify-payment-public', {
      method: 'POST',
      body: { phone, mpesaCode },
    });
  }
  
  async getPaymentInstructionsPublic(phone) {
    return this.request('/auth/payment-instructions-public', {
      method: 'POST',
      body: { phone },
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
} 

export default new ApiService();