import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to match your API server
// For local development with emulator: use 'http://10.0.2.2:5151' (Android) or 'http://localhost:5151' (iOS)
// For physical device: use your computer's IP address, e.g., 'http://192.168.18.9:5151'
const API_BASE_URL = 'http://192.168.18.9:5151'; // Use actual IP for Expo Go

console.log('🌐 API Base URL configured:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token and log requests
api.interceptors.request.use(
  async (config) => {
    console.log('📤 REQUEST:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('📤 DATA:', JSON.stringify(config.data));
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('❌ REQUEST ERROR:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', response.status, response.config.url);
    console.log('✅ DATA:', JSON.stringify(response.data));
    return response;
  },
  async (error) => {
    console.log('❌ RESPONSE ERROR:', error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.log('❌ No response received - Network Error');
      console.log('❌ Request was made to:', error.config?.url);
    }
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;



