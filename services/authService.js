import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(fullName, email, password) {
    const response = await api.post('/api/Accounts/register', {
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

  async login(email, password) {
    const response = await api.post('/api/Accounts/login', {
      Email: email,
      Password: password,
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await api.get('/api/accounts/me');
    return response.data;
  },

  async getStoredUser() {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};

