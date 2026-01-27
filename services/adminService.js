import api from '../config/api';

export const adminService = {
  async getAllUsers() {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

