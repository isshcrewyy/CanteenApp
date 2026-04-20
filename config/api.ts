import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================================
// NETWORK CONFIGURATION - UPDATE THIS IP ADDRESS!
// ============================================================
// To find your computer's IP address:
// - Windows: Open CMD and run: ipconfig (look for IPv4 Address)
// - Mac/Linux: Open terminal and run: ifconfig or ip addr
//
// Make sure:
// 1. Your phone and computer are on the SAME WiFi network
// 2. Your backend is running and accessible
// 3. Windows Firewall allows incoming connections on port 5151
// ============================================================

// Optional env vars (set in .env and load with Expo):
// EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5151
// EXPO_PUBLIC_API_LOCAL_IP=192.168.x.x
// EXPO_PUBLIC_API_PORT=5151
const ENV = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env) || {};
const ENV_BASE_URL = ENV.EXPO_PUBLIC_API_BASE_URL;
const ENV_LOCAL_IP = ENV.EXPO_PUBLIC_API_LOCAL_IP;
const ENV_PORT = ENV.EXPO_PUBLIC_API_PORT;

// Fallbacks for local development when env vars are not defined
const DEFAULT_LOCAL_IP = '192.168.18.9';
const DEFAULT_PORT = '5151';

const LOCAL_IP = ENV_LOCAL_IP || DEFAULT_LOCAL_IP;
const PORT = ENV_PORT || DEFAULT_PORT;

// Automatically select the right URL based on platform
const getBaseUrl = (): string => {
  // Highest priority: explicit full base URL from environment
  if (ENV_BASE_URL) {
    return ENV_BASE_URL;
  }

  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return `http://${LOCAL_IP}:${PORT}`;
    } else if (Platform.OS === 'ios') {
      return `http://${LOCAL_IP}:${PORT}`;
    }
  }
  // Production URL (update when deploying)
  return `http://${LOCAL_IP}:${PORT}`;
};

const API_BASE_URL: string = getBaseUrl();

console.log('🌐 API Base URL configured:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🧭 API source:', ENV_BASE_URL ? 'EXPO_PUBLIC_API_BASE_URL' : 'IP/PORT fallback');

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add JWT token and log requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const requestUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log('📤 REQUEST:', config.method?.toUpperCase(), requestUrl);
    console.log('📤 DATA:', JSON.stringify(config.data));
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<never> => {
    console.log(' REQUEST ERROR:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log(' RESPONSE:', response.status, response.config.url);
    console.log(' DATA:', JSON.stringify(response.data));
    return response;
  },
  async (error: AxiosError): Promise<never> => {
    console.log('❌ RESPONSE ERROR:', error.message);
    
    if (error.message === 'Network Error' || error.message.includes('Network request failed')) {
      console.log('');
      console.log('🔴 ========== NETWORK ERROR TROUBLESHOOTING ==========');
      console.log('🔴 The app cannot reach the backend server.');
      console.log('🔴 ');
      console.log('🔴 Please check:');
      console.log('🔴 1. Is your backend server running?');
      console.log('🔴 2. Are phone and computer on the SAME WiFi?');
      console.log('🔴 3. Is the IP address correct? Current:', LOCAL_IP);
      console.log('🔴    Tip: set EXPO_PUBLIC_API_BASE_URL to avoid hardcoding IPs');
      console.log('🔴 4. Is Windows Firewall blocking port', PORT, '?');
      console.log('🔴 5. Try: ping', LOCAL_IP, 'from your phone');
      console.log('🔴 ');
      console.log('🔴 To find your IP, run in CMD: ipconfig');
      console.log('🔴 Look for "IPv4 Address" under your WiFi adapter');
      console.log('🔴 ====================================================');
      console.log('');
    }
    
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.log('❌ No response received - Network Error');
      console.log('❌ Request was made to:', error.config?.url);
    }
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Test connection function
interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export const testConnection = async (): Promise<ConnectionTestResult> => {
  try {
    console.log('🔄 Testing connection to:', API_BASE_URL);
    await axios.get(`${API_BASE_URL}/api/menu`, { timeout: 5000 });
    console.log('✅ Connection successful!');
    return { success: true, message: 'Connected!' };
  } catch (error: any) {
    console.log('❌ Connection test failed:', error.message);
    return { success: false, message: error.message };
  }
};

export default api;
