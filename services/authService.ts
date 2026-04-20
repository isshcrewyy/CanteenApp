import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User } from '../types';

interface AuthService {
  register: (fullName: string, email: string, password: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
  getStoredUser: () => Promise<User | null>;
  isAuthenticated: () => Promise<boolean>;
}

export const authService: AuthService = {
  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/Accounts/register', {
      FullName: fullName,
      Email: email,
      Password: password,
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/Accounts/login', {
      Email: email,
      Password: password,
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/accounts/me');
    return response.data;
  },

  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
